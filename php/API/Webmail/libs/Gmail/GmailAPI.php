<?php

function peticionGmailAPI ($token_acceso, $metodo, $url, $parametros = NULL) {

  $respuesta = new stdClass();
  $respuesta->estado = true;
  $respuesta->contenido = null;

  $encabezados = array(
    "Authorization: Bearer ".$token_acceso,
    "Accept: application/json"
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


function anidarFoldersGmail(&$folders, $nivel, $caracter)
{

  for ($f=1; $f < count($folders); $f++) {

    $nombre_mdf = ( '/' === substr($folders[$f-1]->nombre, -1) ) ? $folders[$f-1]->nombre : $folders[$f-1]->nombre.'/';
    $pos = strpos($folders[$f]->nombre, $nombre_mdf);

    if ( ( (0 === $pos) || ( ('/' === $folders[$f-1]->nombre) && ($nivel>0) && ('/' != $caracter) ) ) && (('system' != $folders[$f]->tipo) && ('system' != $folders[$f-1]->tipo)) ) {

      if (0 === $pos) {
        $folders[$f]->nombre = substr($folders[$f]->nombre, strlen($nombre_mdf));
      }

      if (0 == strlen($folders[$f]->nombre)) {
        $folders[$f]->nombre = '/';
      }

      array_push($folders[$f-1]->folders, $folders[$f]);
      array_splice($folders,$f,1);
      $f = $f-1;

    }
    else {
      if ( 0 == count($folders[$f-1]->folders) ) {
        $folders[$f-1]->subfolders = false;
        unset($folders[$f-1]->folders);
        unset($folders[$f-1]->abierto);
      }
      else {
        anidarFoldersGmail($folders[$f-1]->folders, $nivel+1, substr($folders[$f-1]->nombre, -1));
      }
    }

  }

  $ultimo_folder = count($folders)-1;
  if ( 0 == count($folders[$ultimo_folder]->folders) ) {
    $folders[$ultimo_folder]->$nivel = $nivel;
    $folders[$ultimo_folder]->subfolders = false;
    unset($folders[$ultimo_folder]->folders);
    unset($folders[$ultimo_folder]->abierto);
  }
  else {
    anidarFoldersGmail($folders[$ultimo_folder]->folders, $nivel+1, substr($folders[$ultimo_folder]->nombre, -1));
  }

}

function obtenerFoldersGmail($correo_id, $token_acceso, $folders_especiales) {

  $respuesta = new stdClass();
  $respuesta->folders = array();
  $respuesta->num_errores = 0;
  $folders = null;
  $indice_categories = -1;

  $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/labels?alt=json&prettyPrint=false&fields=labels(id)");

  if ($respuesta_api->estado) {

    $folders = $respuesta_api->contenido->labels;

    for ($f=0; $f < count($folders); $f++) {

      $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/labels/".$folders[$f]->id."?alt=json&prettyPrint=false&fields=id,name,messagesUnread,type");

      if ($respuesta_api->estado) {

        $tmp = new stdClass();
        $tmp->seleccionable = true;
        $tmp->ruta = $respuesta_api->contenido->name;
        $tmp->nombre = $respuesta_api->contenido->name;
        $tmp->id = $respuesta_api->contenido->id;
        $tmp->peticion = null;
        $tmp->mensajes = array();
        $tmp->mensajes_novistos = $respuesta_api->contenido->messagesUnread;
        $tmp->pagina = 1;
        $tmp->paginas = 0;
        $tmp->numero_mensajes = 0;
        $tmp->nivel = 0;
        $tmp->subfolders = true;
        $tmp->folders = array();
        $tmp->abierto = false;
        $tmp->tipo = $respuesta_api->contenido->type;

        foreach ($folders_especiales as $n => $v) {
          if (!isset($v->id)) {
            if ($v->palabras_gmail == $respuesta_api->contenido->id) {
              $tmp->{"es_".$n} = true;
              $v->nombre = $tmp->nombre;
              $v->id = $tmp->id;
              $v->ruta = $tmp->ruta;
              unset($v->palabras);
              unset($v->palabras_gmail);
              unset($v->palabras_outlook);
              break;
            }
          }
        }

        array_push($respuesta->folders, $tmp);
      }
      else {
        $respuesta->num_errores ++;
      }

    }


    if (count($respuesta->folders)>0) {
      $tmp = new stdClass();
      $tmp->seleccionable = false;
      $tmp->ruta = 'CATEGORIES';
      $tmp->nombre = 'CATEGORIES';
      $tmp->id = $correo_id.'/'.$tmp->ruta;
      $tmp->nivel = 0;
      $tmp->subfolders = true;
      $tmp->folders = array();
      $tmp->abierto = false;
      $tmp->tipo = 'user';

      array_push($respuesta->folders, $tmp);
    }


    usort(
      $respuesta->folders,
      function($a, $b)
      {
        return strcmp($a->nombre, $b->nombre);
      }
    );

    anidarFoldersGmail($respuesta->folders, 0, '');

    for ($f=0; $f < count($respuesta->folders); $f++) {
      if ( ('CATEGORIES' === $respuesta->folders[$f]->nombre) && ($correo_id.'/CATEGORIES' === $respuesta->folders[$f]->id) ) {
        $indice_categories = $f;
        break;
      }
    }


    if ($indice_categories>-1) {

      $respuesta->folders[$indice_categories]->subfolders = true;
      $respuesta->folders[$indice_categories]->folders = array();
      $respuesta->folders[$indice_categories]->abierto = false;

      for ($f=0; $f < count($respuesta->folders); $f++) {
        if (0 === strpos($respuesta->folders[$f]->nombre, 'CATEGORY_')) {
          $respuesta->folders[$f]->nombre = substr($respuesta->folders[$f]->nombre, 9);
          array_push($respuesta->folders[$indice_categories]->folders, $respuesta->folders[$f]);
          array_splice($respuesta->folders,$f,1);
          $f = $f-1;
        }
      }

    }

    return $respuesta;

  }
  else {
    throw new Exception($respuesta_api->mensaje_error);
  }

}


function obtenerEstadoFoldersGmail($token_acceso) {

  $respuesta = new stdClass();

  $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/labels?alt=json&prettyPrint=false&fields=labels(id)");

  if ($respuesta_api->estado) {

    $folders = $respuesta_api->contenido->labels;

    for ($f=0; $f < count($folders); $f++) {

      $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/labels/".$folders[$f]->id."?alt=json&prettyPrint=false&fields=id,messagesUnread");

      if ($respuesta_api->estado) {
        $respuesta->{$respuesta_api->contenido->id} = $respuesta_api->contenido->messagesUnread;
      }

    }

  }
  else {
    throw new Exception($respuesta_api->mensaje_error);
  }

  return $respuesta;

}


function modificarEstructuraDatosMensajeGmail($datos)
{
  $carpetas = new stdClass();
  $encabezados = new stdClass();

  for ($e=0; $e < count($datos->payload->headers); $e++) {
    $encabezados->{$datos->payload->headers[$e]->name} = $datos->payload->headers[$e]->value;
  }

  $datos->payload->headers = $encabezados;

  for ($c=0; $c < count($datos->labelIds); $c++) {
    $carpetas->{$datos->labelIds[$c]} = "";
  }

  $datos->labelIds = $carpetas;

  return $datos;
}

function obtenerMensajesGmail($folder_id, $correo, $token_acceso, $pagina, $busqueda) {

  $respuesta = new stdClass();
  $respuesta->mensajes = array();
  $respuesta->num_errores = 0;
  $respuesta->mensajes_novistos = 0;
  $respuesta->numero_mensajes = 0;
  $respuesta->paginas = 0;
  $mensajes = null;
  $max_num_msj = 12;
  $fecha = array();
  $hora = array();
  $partes_hora = array();
  $partes_fecha = array();
  $cont_pagina = 1;

  $parametros = array(
    "alt" => "json",
    "prettyPrint" => "false",
    "includeSpamTrash" => "false",
    "labelIds" => "$folder_id",
    "maxResults" => "$max_num_msj",
    "fields" => "messages(id),nextPageToken"
  );


  if ($busqueda->estado) {
    $parametros['q'] = "subject:".strtolower($busqueda->entrada);
  }


  $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/labels/".$folder_id."?alt=json&prettyPrint=false&fields=messagesUnread,messagesTotal");

  if ($respuesta_api->estado) {

    $respuesta->mensajes_novistos = $respuesta_api->contenido->messagesUnread;

    if ($busqueda->estado) {

      $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/messages?".http_build_query($parametros));

      if ($respuesta_api->estado) {

        if (isset($respuesta_api->contenido->messages)) {
          $respuesta->numero_mensajes += count($respuesta_api->contenido->messages);
        }

        while (isset($respuesta_api->contenido->nextPageToken)) {

          $parametros['pageToken'] = $respuesta_api->contenido->nextPageToken;
          $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/messages?".http_build_query($parametros));

          if ($respuesta_api->estado) {

            if (isset($respuesta_api->contenido->messages)) {
              $respuesta->numero_mensajes += count($respuesta_api->contenido->messages);
            }

          }
          else {
            throw new Exception($respuesta_api->mensaje_error);
          }

        }

        unset($parametros['pageToken']);

      }
      else {
        throw new Exception($respuesta_api->mensaje_error);
      }
    }
    else {
      $respuesta->numero_mensajes = $respuesta_api->contenido->messagesTotal;
    }

    $respuesta->paginas = ceil($respuesta->numero_mensajes/$max_num_msj);

    if ($pagina > 1 && $respuesta->paginas < $pagina) {
      throw new Exception("fueraderango/".$respuesta->paginas);
    }

  }
  else {
    throw new Exception($respuesta_api->mensaje_error);
  }



  $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/messages?".http_build_query($parametros));

  if ($pagina>1) {

    if ($respuesta_api->estado) {

      while (isset($respuesta_api->contenido->nextPageToken)) {

        $cont_pagina++;

        $parametros['fields'] = ($cont_pagina==$pagina) ? "messages(id),nextPageToken" : "nextPageToken";
        $parametros['pageToken'] = $respuesta_api->contenido->nextPageToken;
        $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/messages?".http_build_query($parametros));

        if ($respuesta_api->estado) {

          if ($cont_pagina==$pagina) {
            if (isset($respuesta_api->contenido->messages)) {
              $mensajes = $respuesta_api->contenido->messages;
              break;
            }
            else {
              $respuesta->paginas = $cont_pagina-1;
              throw new Exception("fueraderango/".$respuesta->paginas);
            }
          }

        }
        else {
          throw new Exception($respuesta_api->mensaje_error);
        }

      }

      unset($parametros['fields']);
      unset($parametros['pageToken']);

      if ($cont_pagina<$pagina) {
        $respuesta->paginas = $cont_pagina;
        throw new Exception("fueraderango/".$respuesta->paginas);
      }

    }
    else {
      throw new Exception($respuesta_api->mensaje_error);
    }


  }
  else {
    if ($respuesta_api->estado) {
      if (isset($respuesta_api->contenido->messages)) {
        $mensajes = $respuesta_api->contenido->messages;
      }
      else {
        $mensajes = array();
      }
    }
    else {
      throw new Exception($respuesta_api->mensaje_error);
    }
  }


  for ($m=0; $m < count($mensajes); $m++) {

    try {

      $fecha = array();
      $hora = array();
      $partes_hora = array();
      $partes_fecha = array();
      $remitente_destinatario = false;

      $tmp = new stdClass();

      $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/messages/".$mensajes[$m]->id."?alt=json&prettyPrint=false&format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Cc&metadataHeaders=Date&metadataHeaders=Reply-To");

      if (!$respuesta_api->estado) {
        throw new Exception($respuesta_api->mensaje_error);
      }

      $respuesta_api->contenido = modificarEstructuraDatosMensajeGmail($respuesta_api->contenido);

      $tmp->id = $respuesta_api->contenido->id;

      $tmp->adjuntos = ("multipart/mixed"==$respuesta_api->contenido->payload->mimeType) ? true : false;

      try {
        $tmp->remitente = preg_replace('/>.*/',"", preg_replace('/.*</',"", $respuesta_api->contenido->payload->headers->From));
      }
      catch (Exception $e) {
        $tmp->remitente = "";
      }
      try {
        $tmp->nombre_remitente = preg_replace('/ <.*>/',"", $respuesta_api->contenido->payload->headers->From);
      }
      catch (Exception $e) {
        $tmp->nombre_remitente = "";
      }

      $lista_correos = explode(", ",$respuesta_api->contenido->payload->headers->To);
      $tmp->destinatarios = array();
      $tmp->nombres_destinatarios = array();

      for ($d=0; $d < count($lista_correos); $d++) {
        array_push($tmp->destinatarios, preg_replace('/>.*/',"", preg_replace('/.*</',"", $lista_correos[$d])));
        array_push($tmp->nombres_destinatarios, preg_replace('/ <.*>/',"", $lista_correos[$d]));
      }

      if (isset($respuesta_api->contenido->payload->headers->CC)) {
        $tmp->cc = array();
        $tmp->nombres_cc = array();
        $lista_correos = array();
        $lista_correos = explode(", ",$respuesta_api->contenido->payload->headers->CC);

        for ($d=0; $d < count($lista_correos); $d++) {
          array_push($tmp->cc, preg_replace('/>.*/',"", preg_replace('/.*</',"", $lista_correos[$d])));
          array_push($tmp->nombres_cc, preg_replace('/ <.*>/',"", $lista_correos[$d]));
        }
      }

      if (isset($respuesta_api->contenido->payload->headers->{'Reply-To'})) {
        $tmp->responder_a = array();
        $tmp->nombres_responder_a = array();
        $lista_correos = array();
        $lista_correos = explode(", ",$respuesta_api->contenido->payload->headers->{'Reply-To'});

        for ($d=0; $d < count($lista_correos); $d++) {
          array_push($tmp->responder_a, preg_replace('/>.*/',"", preg_replace('/.*</',"", $lista_correos[$d])));
          array_push($tmp->nombres_responder_a, preg_replace('/ <.*>/',"", $lista_correos[$d]));
        }
      }

      $tmp->asunto = $respuesta_api->contenido->payload->headers->Subject;

      $fecha_hora = DateTime::createFromFormat('U', $respuesta_api->contenido->internalDate/1000);

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

      $tmp->visto = (isset($respuesta_api->contenido->labelIds->UNREAD)) ? false : true;

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


function modificarEstructuraContenidoMensajeGmail(&$parte_mensaje)
{

  $cp_encabezados = new stdClass();

  if (isset($parte_mensaje->headers)) {

    for ($e=0; $e < count($parte_mensaje->headers); $e++) {
      $cp_encabezados->{$parte_mensaje->headers[$e]->name} = $parte_mensaje->headers[$e]->value;
    }

    $parte_mensaje->headers = $cp_encabezados;

  }

  if (isset($parte_mensaje->parts)) {
    for ($p=0; $p < count($parte_mensaje->parts); $p++) {
      modificarEstructuraContenidoMensajeGmail($parte_mensaje->parts[$p]);
    }
  }

}


function buscarContenidoCuerpoMensaje(&$contenido, &$respuesta, $parte, $mensaje_id, $token_acceso)
{

  if (isset($parte->headers->{'Content-Disposition'})) {

    $contenido->codificacion = 'base64';

    $contenido->id = $parte->body->attachmentId;
    $contenido->disposicion = strtolower(explode(';', $parte->headers->{'Content-Disposition'})[0]);
    $contenido->nombre = urldecode($parte->filename);
    $contenido->cid = (isset($parte->headers->{'Content-ID'})) ? str_replace(array("<",">"), array("",""), $parte->headers->{'Content-ID'}) : '';

    if ('inline'==$contenido->disposicion || ''!=$contenido->cid) {

      $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/messages/".$mensaje_id."/attachments/".$contenido->id."?alt=json&prettyPrint=false&fields=data");

      if ($respuesta_api->estado) {
        $contenido->datos = strtr($respuesta_api->contenido->data, '-_', '+/');
      }else {
        throw new Exception($respuesta_api->mensaje_error);
      }

      if('text'==$contenido->tipo_des[0]) {
        $contenido->datos = base64_decode(strtr($contenido->datos, '-_', '+/'));
      }

      array_push($respuesta->adjunto_enlinea, $contenido);

    }
    else {
      unset($contenido->cid);
      unset($contenido->disposicion);
      array_push($respuesta->adjunto, $contenido);
    }

  }
  else {

    switch (strtolower($contenido->tipo)) {

      case 'text/plain':

      if (isset($respuesta->cuerpo->datos)) {
        break;
      }

      case 'text/html':

      // $contenido->codificacion = (isset($parte->headers->{'Content-Transfer-Encoding'})) ? $parte->headers->{'Content-Transfer-Encoding'} : '';

      // $contenido->caracteres = strtoupper(preg_replace('/".*/',"", preg_replace('/.*="/',"", explode(';', $parte->headers->{'Content-Type'})[1])));

      $contenido->datos = base64_decode(strtr($parte->body->data, '-_', '+/'));

      // if (''!=$contenido->codificacion) {
      //   $contenido->datos = decodificarCadena($contenido->datos, $contenido->codificacion);
      // }

      // if('UTF-8' != $contenido->caracteres) {
      //   $contenido->datos = mb_convert_encoding($contenido->datos, "UTF-8", $contenido->caracteres);
      // }

      $respuesta->cuerpo = $contenido;

      break;

      default:

      if ('multipart'==$contenido->tipo_des[0]) {
        if (isset($parte->parts)) {
          for ($p=0; $p < count($parte->parts); $p++) {
            if (isset($parte->parts[$p]->headers->{'Content-Type'})) {
              $contenido = new stdClass();
              $contenido->tipo = explode(';', $parte->parts[$p]->headers->{'Content-Type'})[0];
              $contenido->tipo_des = explode('/',$contenido->tipo);
              buscarContenidoCuerpoMensaje($contenido, $respuesta, $parte->parts[$p], $mensaje_id, $token_acceso);
            }
          }
        }
      }

    }

  }

}


function obtenerContenidoMensajeGmail($mensaje_id, $token_acceso) {

  $respuesta = new stdClass();
  $respuesta->cuerpo = null;
  $respuesta->adjunto = array();
  $respuesta->adjunto_enlinea = array();
  $mensaje = null;

  $folder = new stdClass();
  $folder->removeLabelIds = array("UNREAD");
  $respuesta_api = peticionGmailAPI($token_acceso, 'POST', GMAIL_API_URL."/me/messages/".$mensaje_id."/modify?alt=json&prettyPrint=false&fields=id",json_encode($folder));

  $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/messages/".$mensaje_id."?alt=json&prettyPrint=false&format=full&fields=payload/body,payload/filename,payload/mimeType,payload/parts");

  if ($respuesta_api->estado) {

    $mensaje = $respuesta_api->contenido->payload;

    if (0!=$mensaje->body->size) {
      $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/messages/".$mensaje_id."?alt=json&prettyPrint=false&format=metadata&metadataHeaders=Content-Type&metadataHeaders=Content-Transfer-Encoding&metadataHeaders=Content-Description&metadataHeaders=Content-Disposition&fields=payload/headers");

      if ($respuesta_api->estado) {
        if (isset($respuesta_api->contenido->payload)) {
          $mensaje->headers = $respuesta_api->contenido->payload->headers;
        }
      }else {
        throw new Exception($respuesta_api->mensaje_error);
      }
    }

  }else {
    throw new Exception($respuesta_api->mensaje_error);
  }

  modificarEstructuraContenidoMensajeGmail($mensaje);

  // print_r($mensaje);exit;

  if (false===strpos($mensaje->mimeType, 'multipart')) {

    $contenido = new stdClass();

    // if (isset($mensaje->headers->{'Content-Transfer-Encoding'})) {
    //   $contenido->codificacion = $mensaje->headers->{'Content-Transfer-Encoding'};
    // }
    // else {
    //   $contenido->codificacion = '';
    // }

    // if (isset($mensaje->headers->{'Content-Type'})) {
    //   $contenido->caracteres = preg_replace('/".*/',"", preg_replace('/.*="/',"", explode(';', $mensaje->headers->{'Content-Type'})[1]));
    // }
    // else {
    //   $contenido->caracteres = 'UTF-8';
    // }

    $contenido->datos = base64_decode(strtr($mensaje->body->data, '-_', '+/'));

    // if ('' != $contenido->codificacion) {
    //   $contenido->datos = decodificarCadena($contenido->datos, $contenido->codificacion);
    // }

    // if ('UTF-8' != $contenido->caracteres) {
    //   $contenido->datos = mb_convert_encoding($contenido->datos, "UTF-8", $contenido->caracteres);
    // }

    $contenido->datos = "<span style=\"white-space: pre-line\">" .$contenido->datos. "</span>";

    $respuesta->datos_originales = $contenido->datos;

    $respuesta->cuerpo = $contenido;

  }
  else {

    for ($p=0; $p < count($mensaje->parts); $p++) {

      $contenido = new stdClass();
      $contenido->tipo = explode(';', $mensaje->parts[$p]->headers->{'Content-Type'})[0];
      $contenido->tipo_des = explode('/',$contenido->tipo);

      buscarContenidoCuerpoMensaje($contenido, $respuesta, $mensaje->parts[$p], $mensaje_id, $token_acceso);

    }

    if (!isset($respuesta->cuerpo->datos)) {
      $respuesta->cuerpo = new stdClass();
      $respuesta->cuerpo->datos = "";
    }

    $respuesta->cuerpo->datos_originales = $respuesta->cuerpo->datos;

    for ($i=0; $i < count($respuesta->adjunto_enlinea) ; $i++) {
      if (!integrarCuerpoMensaje($respuesta->cuerpo->datos, $respuesta->adjunto_enlinea[$i])) {
        unset($respuesta->adjunto_enlinea[$i]);
      }
    }

  }
  // print_r($respuesta);exit;

  return $respuesta;

}


function descargarArchivoAdjuntoGmail($mensaje_id, $token_acceso, $adjunto_id, $nombre_archivo, $tipo_archivo) {

  $adjunto = null;
  $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/messages/".$mensaje_id."/attachments/".$adjunto_id."?alt=json&prettyPrint=false&fields=data");

  if ($respuesta_api->estado) {
    $adjunto = strtr($respuesta_api->contenido->data, '-_', '+/');
  }else {
    throw new Exception($respuesta_api->mensaje_error);
  }


  $blob = base64_decode($adjunto);

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

function eliminarMensajeGmail($mensaje_id, $token_acceso, $papelera_id) {

  if (null==$papelera_id) {
    $respuesta_api = peticionGmailAPI($token_acceso, 'DELETE', GMAIL_API_URL."/me/messages/".$mensaje_id."?alt=json&prettyPrint=false");
  }
  else {
    $respuesta_api = peticionGmailAPI($token_acceso, 'POST', GMAIL_API_URL."/me/messages/".$mensaje_id."/trash?alt=json&prettyPrint=false&fields=id");
  }

  if (!$respuesta_api->estado) {
    throw new Exception($respuesta_api->mensaje_error);
  }

}

function moverMensajeGmail($mensaje_id, $token_acceso, $ruta_folder, $destino_id) {

  $folder = new stdClass();
  $folder->addLabelIds = array($destino_id);
  $respuesta_api = peticionGmailAPI($token_acceso, 'POST', GMAIL_API_URL."/me/messages/".$mensaje_id."/modify?alt=json&prettyPrint=false&fields=id",json_encode($folder));


  if (!$respuesta_api->estado) {
    if ('TRASH'===strtoupper($ruta_folder) && 400 == $respuesta_api->mensaje_error) {
      $respuesta_api = peticionGmailAPI($token_acceso, 'POST', GMAIL_API_URL."/me/messages/".$mensaje_id."/untrash?alt=json&prettyPrint=false&fields=id");

      if (!$respuesta_api->estado) {
        throw new Exception($respuesta_api->mensaje_error);
      }
    }
    else {
      throw new Exception($respuesta_api->mensaje_error);
    }
  }

}


function marcarMensajesComoLeidosGmail($mensajes_id, $token_acceso) {

  $respuesta = new stdClass();
  $respuesta->correctos = array();
  $respuesta->incorrectos = array();

  $parametros = new stdClass();
  $parametros->ids = $mensajes_id;
  $parametros->removeLabelIds = array('UNREAD');

  $respuesta_api = peticionGmailAPI($token_acceso, 'POST', GMAIL_API_URL."/me/messages/batchModify?alt=json&prettyPrint=false",json_encode($parametros));

  if ($respuesta_api->estado) {
    $respuesta->correctos = $mensajes_id;
  }
  else {
    $respuesta->incorrectos = $mensajes_id;
    throw new Exception($respuesta_api->mensaje_error);
  }

  return $respuesta;

}


function eliminarMensajesGmail($mensajes_id, $token_acceso, $papelera_id) {

  $respuesta = new stdClass();
  $respuesta->correctos = array();
  $respuesta->incorrectos = array();

  $parametros = new stdClass();
  $parametros->ids = $mensajes_id;

  if (null==$papelera_id) {
    $respuesta_api = peticionGmailAPI($token_acceso, 'POST', GMAIL_API_URL."/me/messages/batchDelete?alt=json&prettyPrint=false",json_encode($parametros));
  }
  else {
    $parametros->addLabelIds = array('TRASH');
    $respuesta_api = peticionGmailAPI($token_acceso, 'POST', GMAIL_API_URL."/me/messages/batchModify?alt=json&prettyPrint=false",json_encode($parametros));
  }

  if ($respuesta_api->estado) {
    $respuesta->correctos = $mensajes_id;
  }
  else {
    $respuesta->incorrectos = $mensajes_id;
    throw new Exception($respuesta_api->mensaje_error);
  }

  return $respuesta;

}


function obtenerArchivoAdjuntoDeMensajeGmail($mensaje_id, $token_acceso, $adjuntos, $adjuntos_enlinea) {

  $respuesta = new stdClass();

  for ($i=0; $i < count($adjuntos); $i++) {

    if (isset($adjuntos[$i]->noalmacenado)) {

      $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/messages/".$mensaje_id."/attachments/".$adjuntos[$i]->id."?alt=json&prettyPrint=false&fields=data");

      if ($respuesta_api->estado) {
        $respuesta->{$adjuntos[$i]->id} = strtr($respuesta_api->contenido->data, '-_', '+/');
      }
      else {
        throw new Exception($respuesta_api->mensaje_error);
      }

    }

  }


  for ($i=0; $i < count($adjuntos_enlinea); $i++) {

    if (isset($adjuntos_enlinea[$i]->noalmacenado)) {

      $respuesta_api = peticionGmailAPI($token_acceso, 'GET', GMAIL_API_URL."/me/messages/".$mensaje_id."/attachments/".$adjuntos_enlinea[$i]->id."?alt=json&prettyPrint=false&fields=data");

      if ($respuesta_api->estado) {
        $respuesta->{$adjuntos_enlinea[$i]->id} = strtr($respuesta_api->contenido->data, '-_', '+/');
      }
      else {
        throw new Exception($respuesta_api->mensaje_error);
      }

    }

  }

  return $respuesta;

}


function enviarMensajeGmail($correo, $nombre, $token_acceso, $datos)
{

  $mensaje = "From: ".$nombre." <".$correo.">\r\n";
  $mensaje .= "Reply-To: ".$nombre." <".$correo.">\r\n";

  $mensaje .= "To: ";
  for ($i=0; $i < count($datos->destinatarios); $i++) {
    $mensaje .=$datos->destinatarios[$i].", ";
  }
  $mensaje = trim($mensaje, ', ');
  $mensaje .= "\r\n";
  $mensaje .= "Subject: "."=?utf-8?B?".base64_encode($datos->asunto)."?=\r\n";
  $mensaje .= "Date: ".date("D, d M Y H:i:s O")."\r\n";
  $mensaje .= "MIME-Version: 1.0\r\n";
  $mensaje .= "X-Mailer: PHP/".phpversion()."\r\n";

  $boundary[0] = "=_".md5(microtime());
  $boundary[1] = "=_".md5(microtime());
  $boundary[2] = "=_".md5(microtime());
  $num_adjuntos = count($datos->adjuntos);
  $num_adjuntos_enlinea = count($datos->adjuntos_enlinea);

  if ($num_adjuntos>0) {
    $mensaje .= "Content-Type: multipart/mixed; boundary=\"".$boundary[0]."\"\r\n\r\n";
    $mensaje .= "--".$boundary[0]."\r\n";
  }

  if ($num_adjuntos_enlinea>0) {
    $mensaje .= "Content-Type: multipart/related; boundary=\"".$boundary[1]."\"\r\n\r\n";
    $mensaje .= "--".$boundary[1]."\r\n";
  }

  $mensaje .= "Content-Type: multipart/alternative; boundary=\"".$boundary[2]."\"\r\n\r\n";
  $mensaje .= "--".$boundary[2]."\r\n";

  $mensaje .= "Content-Type: text/plain; charset=UTF-8\r\n";
  $mensaje .= "Content-Transfer-Encoding: quoted-printable\r\n\r\n";
  $mensaje .= quoted_printable_encode(strip_tags($datos->cuerpo))."\r\n\r\n";
  $mensaje .= "--".$boundary[2]."\r\n";

  $mensaje .= "Content-Type: text/html; charset=UTF-8\r\n";
  $mensaje .= "Content-Transfer-Encoding: quoted-printable\r\n\r\n";
  $mensaje .= quoted_printable_encode($datos->cuerpo)."\r\n\r\n";
  $mensaje .= "--".$boundary[2]."--\r\n\r\n";


  if ($num_adjuntos_enlinea>0) {

    for ($i=0; $i < count($datos->adjuntos_enlinea); $i++) {

      $mensaje .= "--".$boundary[1]."\r\n";
      $mensaje .= "Content-Type: ".$datos->adjuntos_enlinea[$i]->tipo."\r\n";
      $mensaje .= "Content-Transfer-Encoding: base64\r\n";
      $mensaje .= "Content-Disposition: inline; filename=\"".$datos->adjuntos_enlinea[$i]->nombre."\"\r\n";
      $mensaje .= "Content-ID: <".$datos->adjuntos_enlinea[$i]->cid.">\r\n\r\n";
      $mensaje .= base64_encode($datos->adjuntos_enlinea[$i]->contenido)."\r\n";

    }

    $mensaje .= "--".$boundary[1]."--\r\n\r\n";

  }


  if ($num_adjuntos>0) {

    for ($i=0; $i < count($datos->adjuntos); $i++) {

      $mensaje .= "--".$boundary[0]."\r\n";
      $mensaje .= "Content-Type: ".$datos->adjuntos[$i]->tipo."\r\n";
      $mensaje .= "Content-Transfer-Encoding: base64\r\n";
      $mensaje .= "Content-Disposition: attachment; filename=\"".$datos->adjuntos[$i]->nombre."\"\r\n\r\n";
      $mensaje .= base64_encode($datos->adjuntos[$i]->contenido)."\r\n";

    }

    $mensaje .= "--".$boundary[0]."--\r\n\r\n";

  }


  $parametros = new stdClass();
  $parametros->raw = strtr(base64_encode($mensaje), '+/', '-_');

  $respuesta_api = peticionGmailAPI($token_acceso, 'POST', GMAIL_API_URL."/me/messages/send?alt=json&prettyPrint=false&fields=id",json_encode($parametros));

  if (!$respuesta_api->estado) {
    throw new Exception($respuesta_api->mensaje_error);
  }

}


?>
