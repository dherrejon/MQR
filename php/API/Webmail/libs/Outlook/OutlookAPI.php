<?php

function peticionOutlookAPI ($token_acceso, $correo, $metodo, $url, $parametros = NULL) {

  $respuesta = new stdClass();
  $respuesta->estado = true;
  $respuesta->contenido = null;

  $encabezados = array(
    "Authorization: Bearer ".$token_acceso,
    "Accept: application/json",
    "X-AnchorMailbox: ".$correo,
    "Prefer: outlook.allow-unsafe-html"
  );

  $curl = curl_init($url);

  switch(strtoupper($metodo)) {
    case "GET":
    //  error_log("Realizando GET");
    break;
    case "POST":
    $encabezados[] = "Content-Type: application/json";
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $parametros);
    break;
    case "PATCH":
    $encabezados[] = "Content-Type: application/json";
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PATCH");
    curl_setopt($curl, CURLOPT_POSTFIELDS, $parametros);
    break;
    case "DELETE":
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
    break;
    default:
    $respuesta->estado = false;
    $respuesta->mensaje_error = "Método de petición no válido";
    return $respuesta;
    exit;
  }


  curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($curl, CURLOPT_HTTPHEADER, $encabezados);
  $respuesta->contenido = curl_exec($curl);

  $codigo_http = curl_getinfo($curl, CURLINFO_HTTP_CODE);

  if ($codigo_http >= 400) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = $codigo_http;
    return $respuesta;
  }

  $curl_errno = curl_errno($curl);
  $curl_err = curl_error($curl);

  if ($curl_errno) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = $curl_errno.": ".$curl_err;
    curl_close($curl);
  }
  else {
    curl_close($curl);
    $respuesta->contenido =  json_decode($respuesta->contenido);
  }

  return $respuesta;
}

function obtenerFoldersOutlook($correo_id, $correo, $token_acceso, $folders_especiales, $nivel=0, $id_folder=NULL, $ruta="") {

  $respuesta = array();
  $folders = null;

  if ($nivel>0) {
    $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'GET', OUTLOOK_API_URL."/me/MailFolders/".$id_folder."/childfolders");
  }
  else {
    $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'GET', OUTLOOK_API_URL."/me/MailFolders");
  }

  if ($respuesta_api->estado) {
    $folders = $respuesta_api->contenido->value;
  }
  else {
    throw new Exception($respuesta_api->mensaje_error);
  }

  for ($f=0; $f < count($folders); $f++) {

    $tmp = new stdClass();
    $tmp->seleccionable = true;
    $tmp->ruta = $ruta.$folders[$f]->DisplayName;
    $tmp->nivel = $nivel;
    $tmp->nombre = $folders[$f]->DisplayName;
    $tmp->id = $folders[$f]->Id;
    $tmp->peticion = null;
    $tmp->mensajes = array();
    $tmp->mensajes_novistos = $folders[$f]->UnreadItemCount;
    $tmp->pagina = 1;
    $tmp->paginas = 0;
    $tmp->numero_mensajes = 0;


    $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'GET', "https://outlook.office.com/api/beta/me/MailFolders/".$tmp->id."?\$select=WellKnownName");

    if ($respuesta_api->estado) {
      foreach ($folders_especiales as $n => $v) {
        if (!isset($v->id)) {
          if ($v->palabras_outlook == $respuesta_api->contenido->WellKnownName) {
            $tmp->{"es_".$n} = true;
            $v->nombre = $tmp->nombre;
            $v->id = $tmp->id;
            $v->ruta = $tmp->ruta;
            unset($v->palabras);
            unset($v->palabras_outlook);
            break;
          }
        }
      }
    }
    else {
      throw new Exception($respuesta_api->mensaje_error);
      break;
    }


    if ($folders[$f]->ChildFolderCount>0) {
      $tmp->subfolders=true;
      $tmp->folders = obtenerFoldersOutlook($correo_id, $correo, $token_acceso, $folders_especiales, $tmp->nivel+1, $tmp->id, $tmp->ruta."/");
      $tmp->abierto = false;
    }
    else {
      $tmp->subfolders=false;
    }

    array_push($respuesta, $tmp);

  }

  return $respuesta;

}

function obtenerEstadoFoldersOutlook($correo_id, $correo, $token_acceso, $nivel=0, $id_folder=NULL) {

  $respuesta = new stdClass();
  $folders = null;

  if ($nivel>0) {
    $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'GET', OUTLOOK_API_URL."/me/MailFolders/".$id_folder."/childfolders");
  }
  else {
    $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'GET', OUTLOOK_API_URL."/me/MailFolders");
  }

  if ($respuesta_api->estado) {
    $folders = $respuesta_api->contenido->value;
  }
  else {
    throw new Exception($respuesta_api->mensaje_error);
  }

  for ($f=0; $f < count($folders); $f++) {

    $tmp = new stdClass();
    $tmp->nivel = $nivel;
    $tmp->id = $folders[$f]->Id;

    $respuesta->{$tmp->id} = $folders[$f]->UnreadItemCount;

    if ($folders[$f]->ChildFolderCount>0) {
      $estado = obtenerEstadoFoldersOutlook($correo_id, $correo, $token_acceso, $tmp->nivel+1, $tmp->id);
      foreach ($estado as $key => $value) {
        $respuesta->$key = $value;
      }
    }

  }

  return $respuesta;

}

function obtenerMensajesOutlook($folder_id, $correo, $token_acceso, $pagina, $busqueda) {

  $respuesta = new stdClass();
  $respuesta->mensajes = array();
  $respuesta->num_errores = 0;
  $respuesta->mensajes_novistos = 0;
  $respuesta->numero_mensajes = 0;
  $respuesta->paginas = 0;
  $mensajes = null;
  $max_num_msj = 50;
  $inicio = ($pagina-1)*$max_num_msj;
  $fecha = array();
  $hora = array();
  $partes_hora = array();
  $partes_fecha = array();
  $cont_pagina = 1;

  if ($busqueda->estado) {
    $parametros = array(
      "\$select" => "From,HasAttachments,ToRecipients,CcRecipients,ReplyTo,Subject,ReceivedDateTime,IsRead",
      "\$top" => "$max_num_msj",
      "\$search" => "\"subject:".strtolower($busqueda->entrada)."\""
    );
  }
  else {
    $parametros = array(
      "\$select" => "From,HasAttachments,ToRecipients,CcRecipients,ReplyTo,Subject,ReceivedDateTime,IsRead",
      "\$top" => "$max_num_msj",
      "\$skip" => "$inicio"
    );
  }



  $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'GET', OUTLOOK_API_URL."/me/MailFolders/".$folder_id);

  if ($respuesta_api->estado) {
    $respuesta->mensajes_novistos = $respuesta_api->contenido->UnreadItemCount;

    if (!$busqueda->estado) {
      $respuesta->numero_mensajes = $respuesta_api->contenido->TotalItemCount;
      $respuesta->paginas = ceil($respuesta->numero_mensajes/$max_num_msj);

      if ($pagina > 1 && $respuesta->paginas < $pagina) {
        throw new Exception("fueraderango/".$respuesta->paginas);
      }
    }

  }
  else {
    throw new Exception($respuesta_api->mensaje_error);
  }

  $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'GET', OUTLOOK_API_URL."/me/MailFolders/".$folder_id."/messages?".http_build_query($parametros));

  if ($respuesta_api->estado) {

    $mensajes = $respuesta_api->contenido->value;

    if ($busqueda->estado) {

      $respuesta->numero_mensajes = count($mensajes);

      while (isset($respuesta_api->contenido->{"@odata.nextLink"})) {

        $cont_pagina++;

        $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'GET', $respuesta_api->contenido->{"@odata.nextLink"});
        $respuesta->numero_mensajes += count($respuesta_api->contenido->value);

        if ($cont_pagina==$pagina) {
          $mensajes = $respuesta_api->contenido->value;
        }

      }

      $respuesta->paginas = ceil($respuesta->numero_mensajes/$max_num_msj);

      if ($pagina > 1 && $respuesta->paginas < $pagina) {
        throw new Exception("fueraderango/".$respuesta->paginas);
      }
    }

  }
  else {
    throw new Exception($respuesta_api->mensaje_error);
  }


  for ($m=0; $m < count($mensajes); $m++) {

    try {

      $fecha = array();
      $hora = array();
      $partes_hora = array();
      $partes_fecha = array();
      $remitente_destinatario = false;

      $tmp = new stdClass();
      $tmp->id = $mensajes[$m]->Id;

      $tmp->adjuntos = $mensajes[$m]->HasAttachments;

      try {
        $tmp->remitente = $mensajes[$m]->From->EmailAddress->Address;
      }
      catch (Exception $e) {
        $tmp->remitente = "";
      }
      try {
        $tmp->nombre_remitente = $mensajes[$m]->From->EmailAddress->Name;
      }
      catch (Exception $e) {
        $tmp->nombre_remitente = "";
      }

      $tmp->destinatarios = array();

      $tmp->nombres_destinatarios = array();

      for ($t=0; $t < count($mensajes[$m]->ToRecipients); $t++) {
        array_push($tmp->destinatarios, $mensajes[$m]->ToRecipients[$t]->EmailAddress->Address);
        array_push($tmp->nombres_destinatarios, $mensajes[$m]->ToRecipients[$t]->EmailAddress->Name);
      }

      if (count($mensajes[$m]->CcRecipients)>0) {
        $tmp->cc = array();
        $tmp->nombres_cc = array();
        for ($t=0; $t < count($mensajes[$m]->CcRecipients); $t++) {
          array_push($tmp->cc, $mensajes[$m]->CcRecipients[$t]->EmailAddress->Address);
          array_push($tmp->nombres_cc, $mensajes[$m]->CcRecipients[$t]->EmailAddress->Name);
        }
      }

      if (count($mensajes[$m]->ReplyTo)>0) {
        $tmp->responder_a = array();
        $tmp->nombres_responder_a = array();
        for ($t=0; $t < count($mensajes[$m]->ReplyTo); $t++) {
          array_push($tmp->responder_a, $mensajes[$m]->ReplyTo[$t]->EmailAddress->Address);
          array_push($tmp->nombres_responder_a, $mensajes[$m]->ReplyTo[$t]->EmailAddress->Name);
        }
      }

      $tmp->asunto = $mensajes[$m]->Subject;

      $fecha_hora = preg_replace('/T/', " ", $mensajes[$m]->ReceivedDateTime);

      $fecha_hora = DateTime::createFromFormat('Y-m-d H:i:sO', $fecha_hora);

      if ($fecha_hora instanceof DateTime){
        $fecha_hora->setTimezone(new DateTimeZone('America/Mexico_City'));
        $tmp->fecha = $fecha_hora->format('d/m/Y');
        $tmp->hora = $fecha_hora->format('H:i:s');
        $tmp->hora_corta = $fecha_hora->format('H:i');
        $tmp->fecha_unix = (string)$fecha_hora->getTimestamp();
      }
      else {
        throw new Exception("Error procesando fecha");
      }

      $tmp->visto = $mensajes[$m]->IsRead;

      $tmp->contenido = null;

      $tmp->seleccionado = false;

      if (strtolower($tmp->remitente) == strtolower($correo)) {

        for ($d=0; $d < count($tmp->destinatarios); $d++) {
          if ( strtolower($tmp->destinatarios[$d]) ==  strtolower($correo) ) {
            $remitente_destinatario = true;
            break;
          }
        }

        $tmp->recibido = $remitente_destinatario;
      }
      else {
        $tmp->recibido = true;
      }

      array_push($respuesta->mensajes, $tmp);

    }
    catch (Exception $e) {
      $respuesta->num_errores++;
    }

  }

  return $respuesta;
}

function obtenerArchivoAdjuntoDeMensajeOutlook($mensaje_id, $correo, $token_acceso) {

  $respuesta = new stdClass();
  $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'GET', OUTLOOK_API_URL."/me/messages/".$mensaje_id."/attachments");

  if ($respuesta_api->estado) {
    $adjuntos = $respuesta_api->contenido->value;
  }else {
    throw new Exception($respuesta_api->mensaje_error);
  }

  for ($i=0; $i < count($adjuntos); $i++) {
    try {
      $respuesta->{$adjuntos[$i]->Id} = $adjuntos[$i]->ContentBytes;
    } catch (Exception $e) {
      try {
        $respuesta->{$adjuntos[$i]->Id} = $adjuntos[$i]->Item;
      } catch (Exception $e) {
        throw new Exception($respuesta_api->mensaje_error);
      }
    }
  }

  return $respuesta;

}

function descargarArchivoAdjuntoOutlook($mensaje_id, $correo, $token_acceso, $adjunto_id, $nombre_archivo, $tipo_archivo) {

  $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'GET', OUTLOOK_API_URL."/me/messages/".$mensaje_id."/attachments/".$adjunto_id);

  if ($respuesta_api->estado) {
    $adjunto = $respuesta_api->contenido;
  }else {
    throw new Exception($respuesta_api->mensaje_error);
  }

  try {
    $blob = base64_decode($adjunto->ContentBytes);
  } catch (Exception $e) {
    try {
      $blob = base64_decode($adjunto->Item);
    } catch (Exception $e) {
      throw new Exception($respuesta_api->mensaje_error);
    }
  }

  header("Pragma: public");
  header("Expires: 0");
  header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
  header("Cache-Control: private",false);
  header("Content-Type: $tipo_archivo");
  header("Content-Transfer-Encoding: binary");
  header("Content-disposition: attachment; filename=\"$nombre_archivo\"");
  header("Content-Length: " . mb_strlen($blob, '8bit'));

  echo $blob;

  exit();

}

function obtenerAdjuntoOutlook($mensaje_id, $correo, $token_acceso, $adjunto_id, &$contenido) {

  $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'GET', OUTLOOK_API_URL."/me/messages/".$mensaje_id."/attachments/".$adjunto_id);

  if ($respuesta_api->estado) {
    $adjunto = $respuesta_api->contenido;
  }else {
    throw new Exception($respuesta_api->mensaje_error);
  }

  try {
    $contenido->cid = $adjunto->ContentId;
  } catch (Exception $e) {
  }


  try {
    $contenido->datos = $adjunto->ContentBytes;
    $contenido->codificacion = "base64";
  } catch (Exception $e) {
    try {
      $contenido->datos = $adjunto->Item;
    } catch (Exception $e) {
      $contenido->datos = null;
    }
    $contenido->codificacion = "";
  }

}

function obtenerContenidoMensajeOutlook($mensaje_id, $correo, $token_acceso) {

  $contenido = new stdClass();
  $respuesta = new stdClass();
  $respuesta->cuerpo = array();
  $respuesta->adjunto = array();
  $respuesta->adjunto_enlinea = array();

  $parametros = array(
    "\$select" => "Body"
  );

  $leido = new stdClass();
  $leido->IsRead = true;
  $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'PATCH', OUTLOOK_API_URL."/me/messages/".$mensaje_id, json_encode($leido));

  $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'GET', OUTLOOK_API_URL."/me/messages/".$mensaje_id."?".http_build_query($parametros));

  if ($respuesta_api->estado) {
    $mensaje = $respuesta_api->contenido;
  }else {
    throw new Exception($respuesta_api->mensaje_error);
  }

  switch (strtoupper($mensaje->Body->ContentType)) {
    case 'HTML':
    $contenido->datos = $mensaje->Body->Content;
    break;

    case 'TEXT':
    $contenido->datos = "<span style=\"white-space: pre-line\">" . $mensaje->Body->Content . "</span>";
    break;
    default:
    break;
  }

  $contenido->datos_originales = $contenido->datos;
  $respuesta->cuerpo = $contenido;



  $parametros = array(
    "\$select" => "ContentType,IsInline,Name,Size"
  );

  $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'GET', OUTLOOK_API_URL."/me/messages/".$mensaje_id."/attachments?".http_build_query($parametros));

  if ($respuesta_api->estado) {
    $adjuntos = $respuesta_api->contenido->value;
  }else {
    throw new Exception($respuesta_api->mensaje_error);
  }

  for ($a=0; $a < count($adjuntos); $a++) {

    $contenido = new stdClass();
    $datos = null;

    $contenido->id = $adjuntos[$a]->Id;
    $contenido->tipo = $adjuntos[$a]->ContentType;
    $contenido->tipo_des = explode('/',$adjuntos[$a]->ContentType);
    $contenido->es_enlinea = $adjuntos[$a]->IsInline;
    $contenido->nombre = $adjuntos[$a]->Name;
    $contenido->tamano = $adjuntos[$a]->Size;

    if ($contenido->es_enlinea) {
      obtenerAdjuntoOutlook($mensaje_id, $correo, $token_acceso, $contenido->id, $contenido);
      if (integrarCuerpoMensaje($respuesta->cuerpo->datos, $contenido)) {
        array_push($respuesta->adjunto_enlinea, $contenido);
      }
    }else {
      unset($contenido->es_enlinea);
      array_push($respuesta->adjunto, $contenido);
    }

  }

  return $respuesta;

}

function enviarMensajeOutlook($correo, $token_acceso, $datos) {

  $contenido = new stdClass();
  $contenido->Message=new stdClass();
  $contenido->Message->Subject = $datos->asunto;
  $contenido->Message->Body = new stdClass();
  $contenido->Message->Body->ContentType = "HTML";
  $contenido->Message->Body->Content = $datos->cuerpo;
  $contenido->Message->ToRecipients = array();
  $contenido->Message->Attachments = array();

  for ($i=0; $i < count($datos->destinatarios) ; $i++) {
    $destinatario = new stdClass();
    $destinatario->EmailAddress = new stdClass();
    $destinatario->EmailAddress->Address = $datos->destinatarios[$i];
    array_push($contenido->Message->ToRecipients, $destinatario);
  }

  for ($i=0; $i < count($datos->adjuntos_enlinea) ; $i++) {
    $adjunto = new stdClass();
    $adjunto->{"@odata.type"} = "#Microsoft.OutlookServices.FileAttachment";
    $adjunto->ContentType = $datos->adjuntos_enlinea[$i]->tipo;
    $adjunto->Name = $datos->adjuntos_enlinea[$i]->nombre;
    $adjunto->ContentBytes = base64_encode($datos->adjuntos_enlinea[$i]->contenido);
    $adjunto->ContentId = $datos->adjuntos_enlinea[$i]->cid;
    $adjunto->IsInline = true;

    array_push($contenido->Message->Attachments, $adjunto);
  }

  for ($i=0; $i < count($datos->adjuntos) ; $i++) {
    $adjunto = new stdClass();
    $adjunto->{"@odata.type"} = "#Microsoft.OutlookServices.FileAttachment";
    $adjunto->ContentType = $datos->adjuntos[$i]->tipo;
    $adjunto->Name = $datos->adjuntos[$i]->nombre;
    $adjunto->ContentBytes = base64_encode($datos->adjuntos[$i]->contenido);

    array_push($contenido->Message->Attachments, $adjunto);
  }


  $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'POST', OUTLOOK_API_URL."/me/sendmail", json_encode($contenido));

  if (!$respuesta_api->estado) {
    throw new Exception($respuesta_api->mensaje_error);
  }
}

function eliminarMensajeOutlook($mensaje_id, $correo, $token_acceso, $papelera_id) {

  if (null==$papelera_id) {
    $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'DELETE', OUTLOOK_API_URL."/me/messages/".$mensaje_id);
  }
  else {
    $destino = new stdClass();
    $destino->DestinationId = "DeletedItems";
    $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'POST', OUTLOOK_API_URL."/me/messages/".$mensaje_id."/move", json_encode($destino));
  }

  if (!$respuesta_api->estado) {
    throw new Exception($respuesta_api->mensaje_error);
  }

}

function moverMensajeOutlook($mensaje_id, $correo, $token_acceso, $destino_id) {

  $destino = new stdClass();
  $destino->DestinationId = $destino_id;
  $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'POST', OUTLOOK_API_URL."/me/messages/".$mensaje_id."/move", json_encode($destino));

  if (!$respuesta_api->estado) {
    throw new Exception($respuesta_api->mensaje_error);
  }

}


function marcarMensajesComoLeidosOutlook($mensajes_id, $correo, $token_acceso) {

  $respuesta = new stdClass();
  $respuesta->correctos = array();
  $respuesta->incorrectos = array();

  $leido = new stdClass();
  $leido->IsRead = true;
  $parametros = json_encode($leido);

  for ($i=0; $i < count($mensajes_id); $i++) {

    try {

      $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'PATCH', OUTLOOK_API_URL."/me/messages/".$mensajes_id[$i], $parametros);

      if ($respuesta_api->estado) {
        array_push($respuesta->correctos, $mensajes_id[$i]);
      }
      else {
        throw new Exception($respuesta_api->mensaje_error);
      }

    } catch (Exception $e) {

      array_push($respuesta->incorrectos, $mensajes_id[$i]);

    }

  }

  return $respuesta;

}


function eliminarMensajesOutlook($mensajes_id, $correo, $token_acceso, $papelera_id) {

  $respuesta = new stdClass();
  $respuesta->correctos = array();
  $respuesta->incorrectos = array();

  $destino = new stdClass();
  $destino->DestinationId = "DeletedItems";
  $parametros = json_encode($destino);

  for ($i=0; $i < count($mensajes_id); $i++) {

    try {

      if (null==$papelera_id) {
        $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'DELETE', OUTLOOK_API_URL."/me/messages/".$mensajes_id[$i]);
      }
      else {
        $respuesta_api = peticionOutlookAPI($token_acceso, $correo, 'POST', OUTLOOK_API_URL."/me/messages/".$mensajes_id[$i]."/move", $parametros);
      }

      if ($respuesta_api->estado) {
        array_push($respuesta->correctos, $mensajes_id[$i]);
      }
      else {
        throw new Exception($respuesta_api->mensaje_error);
      }

    } catch (Exception $e) {

      array_push($respuesta->incorrectos, $mensajes_id[$i]);

    }

  }

  return $respuesta;

}


?>
