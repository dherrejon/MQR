<?php

function integrarCuerpoMensaje(&$cuerpo, $adjunto) {

  $utilizado = false;

  switch (strtolower($adjunto->tipo_des[0])) {

    case 'image':
    $cuerpo = str_replace(
      "cid:".$adjunto->cid,
      "data:".$adjunto->tipo.";".$adjunto->codificacion.", ".$adjunto->datos,
      $cuerpo
    );
    unset($adjunto->datos);
    $utilizado = true;
    break;

    case 'text':
    if ('html'==strtolower($adjunto->tipo_des[1])) {
      if (''!=$adjunto->cid) {
        $cuerpo = str_replace("cid:".$adjunto->cid, $adjunto->datos, $cuerpo);
      }
      else {
        $cuerpo .= "<br />".$adjunto->datos."<br />";
      }
      unset($adjunto->datos);
      $utilizado = true;
    }
    break;

    default:
    $cuerpo .= "<br /><br /><b>Se ha omitido una parte del mensaje con contenido de tipo ".$adjunto->tipo."</b><br /><br />";
    break;
  }

  return $utilizado;
}

function iniciarSesionImap($correo, $password, $servidor, $puerto){
  $respuesta = new stdClass();

  try {
    $respuesta->imap = new Zend_Mail_Protocol_Imap($servidor, $puerto, true);
    $respuesta->estado = $respuesta->imap->login($correo, $password);
  }
  catch (Exception $e) {
    $respuesta->imap = null;
    $respuesta->estado = false;
  }

  if (!$respuesta->estado) {
    $respuesta->mensaje_error = "No se pudo establecer una conexion con el servidor IMAP";
  }

  return $respuesta;
}

function obtenerFolders($correo_id, $imap, $folders_especiales) {

  $respuesta = new stdClass();
  $respuesta->folders = array();

  $respuesta->num_errores = 0;
  $folder_actual = null;
  $buzon = new Zend_Mail_Storage_Imap($imap);

  $folders = new RecursiveIteratorIterator(
    $buzon->getFolders(),
    RecursiveIteratorIterator::SELF_FIRST
  );

  foreach ($folders as $nombre_local => $folder) {

    try {
      $tmp = new stdClass();
      $indice = null;
      $numero_folders = 0;
      $tmp->seleccionable = $folder->isSelectable();
      $tmp->nivel = intval($folders->getDepth());
      $tmp->ruta = $folder->getGlobalName();
      $tmp->nombre = imap_utf8($nombre_local);
      $tmp->id = $correo_id.'/'.$tmp->ruta;

      foreach ($folders_especiales as $f => $v) {
        if (!isset($v->id)) {
          if (preg_match("/".$v->palabras."/i", $tmp->nombre)) {
            $tmp->{"es_".$f} = true;
            $v->nombre = $tmp->nombre;
            $v->id = $tmp->ruta;
            $v->ruta = $tmp->ruta;
            unset($v->palabras);
            unset($v->palabras_gmail);
            unset($v->palabras_outlook);
            break;
          }
        }
      }


      if ($tmp->seleccionable) {
        $tmp->peticion = null;
        $tmp->mensajes = array();
        $buzon->selectFolder($tmp->ruta);
        $tmp->mensajes_novistos = $buzon->countMessages('UNSEEN');
        $tmp->pagina = 1;
        $tmp->paginas = 0;
        $tmp->numero_mensajes = 0;
      }

      if ($folder->isLeaf()) {
        $tmp->subfolders=false;
      } else {
        $tmp->folders = array();
        $tmp->abierto = false;
        $tmp->subfolders=true;
      }

      if($tmp->nivel){
        $indice = count($respuesta->folders)-1;
        $mostrar = false;
      }else {
        $indice = count($respuesta->folders);
      }

      $folder_actual = & $respuesta->folders[$indice];

      for ($l=0; $l < $tmp->nivel; $l++) {

        $numero_folders = count($folder_actual->folders);

        if(!$numero_folders){
          $indice = 0;
        } else if ( $tmp->nivel > intval($folder_actual->folders[$numero_folders-1]->nivel) ) {
          $indice = $numero_folders-1;
        }else {
          $indice = $numero_folders;
        }

        $folder_actual = & $folder_actual->folders[$indice];

      }

      $folder_actual = $tmp;

    }
    catch (Exception $e) {
      $respuesta->num_errores++;
    }

  }

  return $respuesta;

}

function obtenerEstadoFolders($correo_id, $imap) {

  $respuesta = new stdClass();
  $buzon = new Zend_Mail_Storage_Imap($imap);

  $folders = new RecursiveIteratorIterator(
    $buzon->getFolders(),
    RecursiveIteratorIterator::SELF_FIRST
  );

  foreach ($folders as $nombre_local => $folder) {

    try {

      if ($folder->isSelectable()) {
        $buzon->selectFolder($folder->getGlobalName());
        $respuesta->{$correo_id.'/'.$folder->getGlobalName()} = $buzon->countMessages('UNSEEN');
      }

    }
    catch (Exception $e) {
    }

  }

  return $respuesta;

}

function obtenerMensajes($imap, $ruta_folder, $correo, $pagina, $busqueda) {

  $respuesta = new stdClass();
  $respuesta->mensajes = array();
  $respuesta->num_errores = 0;
  $respuesta->mensajes_novistos = 0;
  $respuesta->numero_mensajes = 0;
  $respuesta->paginas = 0;
  $mensajes_filtrados = array();
  $max_num_msj = 12;
  $fecha_hora = null;

  $buzon = new Zend_Mail_Storage_Imap($imap);
  $buzon->selectFolder(urldecode($ruta_folder));

  $respuesta->mensajes_novistos = $buzon->countMessages('UNSEEN');

  if (!$busqueda->estado) {

    $respuesta->numero_mensajes = $buzon->countMessages();
    $respuesta->paginas = ceil($respuesta->numero_mensajes/$max_num_msj);

    if (($pagina > 1) && ($respuesta->paginas < $pagina)) {
      throw new Exception("fueraderango/".$respuesta->paginas);
    }

  }


  foreach ($buzon as $numero_mensaje => $mensaje) {

    $tmp = new stdClass();

    $tmp->id = $buzon->getUniqueId($numero_mensaje);

    try {

      $tmp->asunto = imap_utf8($mensaje->subject);

      $fecha_hora = ($mensaje->headerExists('date')) ? $mensaje->date : $mensaje->xApparentlyTo;

      $fecha_hora = preg_replace('/ \(.*/', "", preg_replace('/.*, /', "", $fecha_hora));

      $fecha_hora = DateTime::createFromFormat('d M Y H:i:s O', $fecha_hora);

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

    }
    catch (Exception $e) {
      $tmp->fecha_unix = (string)"000000";
      $tmp->error = true;
    }

    if ($busqueda->estado) {
      if (preg_match("/".$busqueda->entrada."/i", $tmp->asunto)) {
        array_push($mensajes_filtrados, $tmp);
      }
    }else {
      array_push($mensajes_filtrados, $tmp);
    }


  }


  if ($busqueda->estado) {

    $respuesta->numero_mensajes = count($mensajes_filtrados);
    $respuesta->paginas = ceil($respuesta->numero_mensajes/$max_num_msj);

    if (($pagina > 1) && ($respuesta->paginas < $pagina)) {
      throw new Exception("fueraderango/".$respuesta->paginas);
    }

  }

  usort(
    $mensajes_filtrados,
    function ($a, $b)
    {
      if ($a->fecha_unix == $b->fecha_unix) {
        return 0;
      }
      return ($a->fecha_unix < $b->fecha_unix) ? 1 : -1;
    }
  );


  $inicio = ($pagina-1)*$max_num_msj;

  $mensajes_filtrados = array_slice($mensajes_filtrados, $inicio, $max_num_msj);


  for ($m=0; $m < count($mensajes_filtrados); $m++) {

    try {

      $remitente_destinatario = false;

      if (isset($mensajes_filtrados[$m]->error)) {
        throw new Exception("Error procesando mensaje");
      }

      $mensaje = $buzon->getMessage($buzon->getNumberByUniqueId($mensajes_filtrados[$m]->id));

      $lista_correos = array();

      $mensajes_filtrados[$m]->adjuntos = false;

      if ($mensaje->isMultipart()) {
        if (preg_match("/multipart\/mixed/i", $mensaje->getHeader('Content-Type'))) {
          $mensajes_filtrados[$m]->adjuntos = true;
        }
      }

      $mensajes_filtrados[$m]->remitente = preg_replace('/>.*/',"", preg_replace('/.*</',"", $mensaje->from));

      $mensajes_filtrados[$m]->nombre_remitente = preg_replace('/ <.*>/',"",$mensaje->from);

      $lista_correos = explode(", ",$mensaje->to);

      $mensajes_filtrados[$m]->destinatarios = array();

      $mensajes_filtrados[$m]->nombres_destinatarios = array();

      for ($d=0; $d < count($lista_correos); $d++) {
        array_push($mensajes_filtrados[$m]->destinatarios, preg_replace('/>.*/',"", preg_replace('/.*</',"", $lista_correos[$d])));
        array_push($mensajes_filtrados[$m]->nombres_destinatarios, preg_replace('/ <.*>/',"", $lista_correos[$d]));
      }

      if ($mensaje->headerExists('cc')) {

        $mensajes_filtrados[$m]->cc = array();

        $mensajes_filtrados[$m]->nombres_cc = array();

        $lista_correos = array();

        $lista_correos = explode(", ",$mensaje->cc);

        for ($d=0; $d < count($lista_correos); $d++) {
          array_push($mensajes_filtrados[$m]->cc, preg_replace('/>.*/',"", preg_replace('/.*</',"", $lista_correos[$d])));
          array_push($mensajes_filtrados[$m]->nombres_cc, preg_replace('/ <.*>/',"", $lista_correos[$d]));
        }

      }


      if ($mensaje->headerExists('Reply-To')) {

        $mensajes_filtrados[$m]->responder_a = array();

        $mensajes_filtrados[$m]->nombres_responder_a = array();

        $lista_correos = array();

        $lista_correos = explode(", ",$mensaje->replyTo);

        for ($d=0; $d < count($lista_correos); $d++) {
          array_push($mensajes_filtrados[$m]->responder_a, preg_replace('/>.*/',"", preg_replace('/.*</',"", $lista_correos[$d])));
          array_push($mensajes_filtrados[$m]->nombres_responder_a, preg_replace('/ <.*>/',"", $lista_correos[$d]));
        }

      }


      // $mensajes_filtrados[$m]->asunto = ("UTF-8"==mb_detect_encoding($mensaje->subject)) ? $mensaje->subject : mb_convert_encoding($mensaje->subject, "UTF-8", mb_detect_encoding($mensaje->subject));

      if ( strtolower($mensajes_filtrados[$m]->remitente) ==  strtolower($correo) ) {

        for ($d=0; $d < count($mensajes_filtrados[$m]->destinatarios); $d++) {
          if ( strtolower($mensajes_filtrados[$m]->destinatarios[$d]) ==  strtolower($correo) ) {
            $remitente_destinatario = true;
            break;
          }
        }

        $mensajes_filtrados[$m]->recibido = $remitente_destinatario;
        // $fecha_hora = ($mensaje->headerExists('date')) ? $mensaje->date : $mensaje->xApparentlyTo;
      }
      else {
        $mensajes_filtrados[$m]->recibido = true;
        // $fecha_hora = $mensaje->getHeader('received', 'array')[0];
      }

      $mensajes_filtrados[$m]->visto = ($mensaje->hasFlag(Zend_Mail_Storage::FLAG_SEEN))?true:false;

      // $mensajes_filtrados[$m]->banderas = $mensaje->getFlags();

      $mensajes_filtrados[$m]->contenido = null;

      $mensajes_filtrados[$m]->seleccionado = false;

      array_push($respuesta->mensajes, $mensajes_filtrados[$m]);
    }
    catch (Exception $e) {
      $respuesta->num_errores++;
    }

  }

  return $respuesta;
}

function decodificarCadena($cadena_codificada, $codificacion) {

  $cadena_decodificada = null;

  switch (strtolower($codificacion)) {
    case 'quoted-printable':
    $cadena_decodificada = quoted_printable_decode($cadena_codificada);
    break;
    case 'base64':
    $cadena_decodificada = base64_decode($cadena_codificada);
    break;
    case '8bit':
    $cadena_decodificada = quoted_printable_decode(imap_8bit($cadena_codificada));
    break;
    case '7bit':
    $cadena_decodificada = base64_decode(mb_convert_encoding($cadena_codificada, 'BASE64', '7bit'));
    break;
    case 'binary':
    $cadena_decodificada = base64_decode(imap_binary($cadena_codificada));
    break;
    case '':
    $cadena_decodificada = $cadena_codificada;
    break;
    default:
    $cadena_decodificada = "No se pudo decodificar esta parte del mensaje codificada con ".$codificacion;
    break;
  }

  return $cadena_decodificada;
}

function obtenerContenidoMensaje($imap, $ruta_folder, $mensaje_id) {

  $respuesta = new stdClass();
  $respuesta->cuerpo = array();
  $respuesta->adjunto = array();
  $respuesta->adjunto_enlinea = array();
  $codificacion = null;
  $numero_parte = 1;

  $buzon = new Zend_Mail_Storage_Imap($imap);
  $buzon->selectFolder(urldecode($ruta_folder));

  $numero_mensaje = $buzon->getNumberByUniqueId($mensaje_id);
  $mensaje = $buzon->getMessage($numero_mensaje);

  // print_r($mensaje->getHeaders());

  if ($mensaje->isMultipart()) {

    foreach (new RecursiveIteratorIterator($mensaje) as $parte) {
      // print_r($parte->getHeaders());
      $contenido = new stdClass();
      $contenido->tipo = $parte->getHeaderField('Content-Type');
      $contenido->tipo_des = explode('/', $contenido->tipo);
      $contenido->codificacion = ($parte->headerExists('Content-Transfer-Encoding')) ? $parte->getHeaderField('Content-Transfer-Encoding'):'';

      if ($parte->headerExists('Content-Disposition')) {
        $contenido->id = $numero_parte;
        $contenido->disposicion = $parte->getHeaderField('Content-Disposition');
        $contenido->nombre = $parte->getHeaderField('Content-Disposition', 'filename');
        $contenido->cid = ($parte->headerExists('Content-Id')) ? str_replace(array("<",">"), array("",""), $parte->getHeaderField('Content-Id')) : '';

        if ('inline'==$contenido->disposicion || ''!=$contenido->cid) {

          $contenido->datos = $parte->getContent();

          if('text'==$contenido->tipo_des[0]) {

            $contenido->caracteres = strtoupper($parte->getHeaderField('Content-Type', 'charset'));

            $contenido->datos = decodificarCadena($contenido->datos, $contenido->codificacion);

            if('UTF-8' != $contenido->caracteres) {
              $contenido->datos = mb_convert_encoding($contenido->datos, "UTF-8", $contenido->caracteres);
            }

          }

          array_push($respuesta->adjunto_enlinea, $contenido);

        }
        else {
          unset($contenido->cid);
          unset($contenido->disposicion);
          array_push($respuesta->adjunto, $contenido);
        }
      }
      else if('html'==$contenido->tipo_des[1]) {
        $contenido->caracteres = strtoupper($parte->getHeaderField('Content-Type', 'charset'));
        $contenido->datos = decodificarCadena($parte->getContent(), $contenido->codificacion);
        if('UTF-8' != $contenido->caracteres) {
          $contenido->datos = mb_convert_encoding($contenido->datos, "UTF-8", $contenido->caracteres);
        }
        $respuesta->cuerpo = $contenido;
      }

      $numero_parte ++;

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
  else {

    $contenido = new stdClass();

    $contenido->codificacion = ($mensaje->headerExists('Content-Transfer-Encoding')) ? $mensaje->getHeaderField('Content-Transfer-Encoding'):'';

    $contenido->caracteres = strtoupper($mensaje->getHeaderField('Content-Type', 'charset'));

    $contenido->datos = decodificarCadena($mensaje->getContent(), $contenido->codificacion);

    if ('UTF-8' != $contenido->caracteres) {
      $contenido->datos = mb_convert_encoding($contenido->datos, "UTF-8", $contenido->caracteres);
    }

    $contenido->datos = "<span style=\"white-space: pre-line\">" .$contenido->datos. "</span>";

    $respuesta->datos_originales = $respuesta->datos;

    $respuesta->cuerpo = $contenido;

  }

  return $respuesta;

}

function almacenarMensajeEnServidor($correo, $nombre, $password, $servidor, $puerto, $datos) {

  $respuesta = new stdClass();

  $folder_enviados = null;

  $boundary = array();

  $respuesta_sesion = iniciarSesionImap($correo, $password, $servidor, $puerto);

  if (!$respuesta_sesion->estado) {
    $respuesta->estado = false;
    return $respuesta;
  }

  try {
    $buzon = new Zend_Mail_Storage_Imap($respuesta_sesion->imap);

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

    $buzon->appendMessage($mensaje, $datos->enviados_id);
    $respuesta->estado = true;

  }
  catch (Exception $e) {
    $respuesta->estado = false;
  }

  return $respuesta;

}

function descargarArchivoAdjunto($imap, $ruta_folder, $mensaje_id, $adjunto_id, $nombre_archivo, $tipo_archivo) {

  $numero_parte = 1;

  $contenido = null;

  $buzon = new Zend_Mail_Storage_Imap($imap);

  $buzon->selectFolder(urldecode($ruta_folder));

  $numero_mensaje = $buzon->getNumberByUniqueId($mensaje_id);

  $mensaje = $buzon->getMessage($numero_mensaje);

  foreach (new RecursiveIteratorIterator($mensaje) as $parte) {
    if ($numero_parte == $adjunto_id) {
      $contenido = $parte->getContent();
      break;
    }
    $numero_parte++;
  }

  $blob = base64_decode($contenido);

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

function obtenerArchivoAdjuntoDeMensaje($imap, $ruta_folder, $mensaje_id) {

  $numero_parte = 1;

  $respuesta = new stdClass();

  $buzon = new Zend_Mail_Storage_Imap($imap);

  $buzon->selectFolder(urldecode($ruta_folder));

  $numero_mensaje = $buzon->getNumberByUniqueId($mensaje_id);

  $mensaje = $buzon->getMessage($numero_mensaje);

  foreach (new RecursiveIteratorIterator($mensaje) as $parte) {

    $respuesta->{$numero_parte} = $parte->getContent();

    $numero_parte++;
  }

  return $respuesta;

}

function eliminarMensaje($imap, $ruta_folder, $mensaje_id, $papelera_id) {

  $buzon = new Zend_Mail_Storage_Imap($imap);

  $buzon->selectFolder(urldecode($ruta_folder));
  $numero_mensaje = $buzon->getNumberByUniqueId($mensaje_id);

  if (null==$papelera_id) {
    $buzon->removeMessage($numero_mensaje);
  }
  else {
    $buzon->moveMessage($numero_mensaje, urldecode($papelera_id));
  }

}

function moverMensaje($imap, $ruta_folder, $mensaje_id, $destino_id) {

  $buzon = new Zend_Mail_Storage_Imap($imap);

  $buzon->selectFolder(urldecode($ruta_folder));
  $numero_mensaje = $buzon->getNumberByUniqueId($mensaje_id);

  $buzon->moveMessage($numero_mensaje, urldecode($destino_id));

}

function marcarMensajesComoLeidos($imap, $ruta_folder, $mensajes_id) {

  $buzon = new Zend_Mail_Storage_Imap($imap);
  $buzon->selectFolder(urldecode($ruta_folder));
  $respuesta = new stdClass();
  $respuesta->correctos = array();
  $respuesta->incorrectos = array();

  for ($i=0; $i < count($mensajes_id); $i++) {

    try {

      $numero_mensaje = $buzon->getNumberByUniqueId($mensajes_id[$i]);
      $mensaje = $buzon->getMessage($numero_mensaje);

      if (!$mensaje->hasFlag(Zend_Mail_Storage::FLAG_SEEN)) {
        foreach (new RecursiveIteratorIterator($mensaje) as $parte) {
          break;
        }
      }

      array_push($respuesta->correctos, $mensajes_id[$i]);

    } catch (Exception $e) {

      array_push($respuesta->incorrectos, $mensajes_id[$i]);

    }

  }

  return $respuesta;

}

function eliminarMensajes($imap, $ruta_folder, $mensajes_id, $papelera_id) {

  $buzon = new Zend_Mail_Storage_Imap($imap);
  $buzon->selectFolder(urldecode($ruta_folder));
  $respuesta = new stdClass();
  $respuesta->correctos = array();
  $respuesta->incorrectos = array();

  for ($i=0; $i < count($mensajes_id); $i++) {

    try {

      $numero_mensaje = $buzon->getNumberByUniqueId($mensajes_id[$i]);

      if (null==$papelera_id) {
        $buzon->removeMessage($numero_mensaje);
      }
      else {
        $buzon->moveMessage($numero_mensaje, urldecode($papelera_id));
      }

      array_push($respuesta->correctos, $mensajes_id[$i]);

    } catch (Exception $e) {

      array_push($respuesta->incorrectos, $mensajes_id[$i]);

    }

  }

  return $respuesta;

}

?>
