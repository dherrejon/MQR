<?php

$TIPO_CONTENIDO_MSG = array('text','multipart','message','application','audio','image','video','model','other');
$CODIFICACIONES_MSG = array('7bit','8bit','binary','base64','quoted-printable','other');

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
  $respuesta->imap = null;
  $respuesta->estado = false;

  $ruta_servidor = "{".$servidor.":".$puerto."/imap/ssl}";

  try {

    $respuesta->imap = @imap_open($ruta_servidor, $correo, $password);
    imap_errors();
    imap_alerts();

    if (false===$respuesta->imap) {
      $respuesta->imap = null;
      $respuesta->estado = false;
    }
    else {
      $respuesta->estado = true;
    }

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

function decodificarAtributosFolder($entero) {

  $atributos = new stdClass();
  $binario = decbin($entero);
  $l = strlen($binario)-1;
  $n = 0;
  $p = 1;

  for ($d=$l; $d > -1; $d--) {

    if ($binario[$d]) {
      switch ($p) {
        case 1:
        $atributos->{'LATT_NOINFERIORS'} = '';
        break;
        case 2:
        $atributos->{'LATT_NOSELECT'} = '';
        break;
        case 4:
        $atributos->{'LATT_MARKED'} = '';
        break;
        case 8:
        $atributos->{'LATT_UNMARKED'} = '';
        break;
        case 16:
        $atributos->{'LATT_REFERRAL'} = '';
        break;
        case 32:
        $atributos->{'LATT_HASCHILDREN'} = '';
        break;
        case 64:
        $atributos->{'LATT_HASNOCHILDREN'} = '';
        break;
        default:
        break;
      }
    }

    $n++;
    $p = pow(2, $n);

  }

  return $atributos;
}

function anidarFolders(&$folders, $nivel, $caracter) {

  for ($f=1; $f < count($folders); $f++) {

    $nombre_mdf = ( $folders[$f-1]->delimitador === substr($folders[$f-1]->nombre, -1) ) ? $folders[$f-1]->nombre : $folders[$f-1]->nombre.$folders[$f-1]->delimitador;
    $pos = strpos($folders[$f]->nombre, $nombre_mdf);

    if (
      ( (0 === $pos) || ( ($folders[$f-1]->delimitador === $folders[$f-1]->nombre) && ($nivel>0) && ($folders[$f-1]->delimitador != $caracter) ) ) &&
      ( !isset($folders[$f-1]->atributos->{'LATT_NOINFERIORS'}) && !isset($folders[$f-1]->atributos->{'LATT_HASNOCHILDREN'}) )
    ) {

      if (0 === $pos) {
        $folders[$f]->nombre = substr($folders[$f]->nombre, strlen($nombre_mdf));
      }

      if (0 == strlen($folders[$f]->nombre)) {
        $folders[$f]->nombre = $folders[$f]->delimitador;
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
        anidarFolders($folders[$f-1]->folders, $nivel+1, substr($folders[$f-1]->nombre, -1));
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
    anidarFolders($folders[$ultimo_folder]->folders, $nivel+1, substr($folders[$ultimo_folder]->nombre, -1));
  }

}

function obtenerFolders($correo_id, $imap, $servidor_imap, $puerto_imap, $folders_especiales) {

  $respuesta = new stdClass();
  $respuesta->folders = array();
  $respuesta->num_errores = 0;
  $n_folders = 0;


  $folders = @imap_getmailboxes($imap, "{".$servidor_imap.":".$puerto_imap."/imap/ssl}", "*");
  imap_errors();
  imap_alerts();

  if (is_array($folders)) {

    $n_folders = count($folders);

    for ($f=0; $f < $n_folders; $f++) {

      try {

        $tmp = new stdClass();
        $tmp->atributos = decodificarAtributosFolder($folders[$f]->attributes);
        $tmp->seleccionable = (isset($tmp->atributos->{'LATT_NOSELECT'})) ? false : true;
        $tmp->ruta = preg_replace('/^.*}/', "", $folders[$f]->name);
        $tmp->nombre = imap_utf8($tmp->ruta); imap_errors();imap_alerts();
        $tmp->id = $correo_id.'/'.$tmp->ruta;

        if ($tmp->seleccionable) {
          $tmp->peticion = null;
          $tmp->mensajes = array();
          $tmp->mensajes_novistos = imap_status($imap, "{".$servidor_imap.":".$puerto_imap."/imap/ssl}".$tmp->ruta, SA_UNSEEN)->unseen; imap_errors();imap_alerts();
          $tmp->pagina = 1;
          $tmp->paginas = 0;
          $tmp->numero_mensajes = 0;
        }

        $tmp->nivel = 0;
        $tmp->subfolders = true;
        $tmp->folders = array();
        $tmp->abierto = false;
        $tmp->delimitador = $folders[$f]->delimiter;

        foreach ($folders_especiales as $n => $v) {
          if (!isset($v->id)) {
            if (preg_match("/".$v->palabras."/i", $tmp->nombre)) {
              $tmp->{"es_".$n} = true;
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

        array_push($respuesta->folders, $tmp);

      }
      catch (Exception $e) {
        $respuesta->num_errores ++;
      }

    }

    usort(
      $respuesta->folders,
      function($a, $b)
      {
        return strcmp($a->ruta, $b->ruta);
      }
    );

    anidarFolders($respuesta->folders, 0, '');

  }

  imap_close($imap); imap_errors();imap_alerts();

  return $respuesta;

}

function obtenerEstadoFolders($correo_id, $imap, $servidor_imap, $puerto_imap) {

  $respuesta = new stdClass();
  $n_folders = 0;
  $folders = @imap_getmailboxes($imap, "{".$servidor_imap.":".$puerto_imap."/imap/ssl}", "*"); imap_errors();imap_alerts();

  if (is_array($folders)) {

    $n_folders = count($folders);

    for ($f=0; $f < $n_folders; $f++) {

      try {

        $tmp = new stdClass();
        $tmp->atributos = decodificarAtributosFolder($folders[$f]->attributes);
        $tmp->seleccionable = (isset($tmp->atributos->{'LATT_NOSELECT'})) ? false : true;

        if ($tmp->seleccionable) {
          $tmp->ruta = preg_replace('/^.*}/', "", $folders[$f]->name);
          $tmp->id = $correo_id.'/'.$tmp->ruta;
          $respuesta->{$tmp->id} = imap_status($imap, "{".$servidor_imap.":".$puerto_imap."/imap/ssl}".$tmp->ruta, SA_UNSEEN)->unseen; imap_errors();imap_alerts();
        }

      }
      catch (Exception $e) {
      }

    }

  }

  imap_close($imap); imap_errors();imap_alerts();

  return $respuesta;

}

function obtenerMensajes($imap, $servidor_imap, $puerto_imap, $ruta_folder, $correo, $pagina, $busqueda) {

  $respuesta = new stdClass();
  $respuesta->mensajes = array();
  $respuesta->num_errores = 0;
  $respuesta->mensajes_novistos = 0;
  $respuesta->numero_mensajes = 0;
  $respuesta->paginas = 0;
  $mensajes_filtrados = array();
  $max_num_msj = 12;

  $estado_folder = imap_status($imap, "{".$servidor_imap.":".$puerto_imap."/imap/ssl}".urldecode($ruta_folder), SA_MESSAGES+SA_UNSEEN); imap_errors();imap_alerts();
  $respuesta->mensajes_novistos = $estado_folder->unseen;

  $folder_cambiado = imap_reopen($imap, "{".$servidor_imap.":".$puerto_imap."/imap/ssl}".urldecode($ruta_folder));

  if (!$folder_cambiado) {
    throw new Exception("Error al abrir folder");
  }

  if ($busqueda->estado) {
    $ids_mensajes = imap_sort($imap, SORTARRIVAL, 1, SE_UID, 'SUBJECT "'.strtolower($busqueda->entrada).'"'); imap_errors();imap_alerts();
    $respuesta->numero_mensajes = count($ids_mensajes);
  }
  else {
    $ids_mensajes = imap_sort($imap, SORTARRIVAL, 1, SE_UID); imap_errors();imap_alerts();
    $respuesta->numero_mensajes = $estado_folder->messages;
  }

  $respuesta->paginas = ceil($respuesta->numero_mensajes/$max_num_msj);

  if (($pagina > 1) && ($respuesta->paginas < $pagina)) {
    throw new Exception("fueraderango/".$respuesta->paginas);
  }

  $inicio = ($pagina-1)*$max_num_msj;

  $ids_mensajes_filtrados = array_slice($ids_mensajes, $inicio, $max_num_msj);
  $n_mensajes = count($ids_mensajes_filtrados);

  for ($m = 0; $m < $n_mensajes; $m++) {
    try {

      $fecha = array();
      $hora = array();
      $partes_hora = array();
      $partes_fecha = array();
      $remitente_destinatario = false;

      $tmp = new stdClass();

      $numero_mensaje = imap_msgno($imap, $ids_mensajes_filtrados[$m]);

      $encabezados = imap_headerinfo($imap, $numero_mensaje); imap_errors();imap_alerts();

      $estructura = imap_fetchstructure($imap, $numero_mensaje); imap_errors();imap_alerts();

      $tmp->id = $ids_mensajes_filtrados[$m];

      if ($estructura->ifsubtype) {
        $tmp->adjuntos = ('MIXED'==$estructura->subtype) ? true : false;
      }
      else {
        $tmp->adjuntos = false;
      }

      try {
        $tmp->remitente = preg_replace('/>.*/',"", preg_replace('/.*</',"", $encabezados->fromaddress));
      }
      catch (Exception $e) {
        $tmp->remitente = "";
      }
      try {
        $tmp->nombre_remitente = preg_replace('/ <.*>/',"", $encabezados->fromaddress);
      }
      catch (Exception $e) {
        $tmp->nombre_remitente = "";
      }

      $lista_correos = explode(", ", $encabezados->toaddress);
      $tmp->destinatarios = array();
      $tmp->nombres_destinatarios = array();

      for ($d=0; $d < count($lista_correos); $d++) {
        array_push($tmp->destinatarios, preg_replace('/>.*/',"", preg_replace('/.*</',"", $lista_correos[$d])));
        array_push($tmp->nombres_destinatarios, preg_replace('/ <.*>/',"", $lista_correos[$d]));
      }

      if (isset($encabezados->ccaddress)) {
        $tmp->cc = array();
        $tmp->nombres_cc = array();
        $lista_correos = array();
        $lista_correos = explode(", ",$encabezados->ccaddress);

        for ($d=0; $d < count($lista_correos); $d++) {
          array_push($tmp->cc, preg_replace('/>.*/',"", preg_replace('/.*</',"", $lista_correos[$d])));
          array_push($tmp->nombres_cc, preg_replace('/ <.*>/',"", $lista_correos[$d]));
        }
      }

      if (isset($encabezados->reply_toaddress)) {
        $tmp->responder_a = array();
        $tmp->nombres_responder_a = array();
        $lista_correos = array();
        $lista_correos = explode(", ",$encabezados->reply_toaddress);

        for ($d=0; $d < count($lista_correos); $d++) {
          array_push($tmp->responder_a, preg_replace('/>.*/',"", preg_replace('/.*</',"", $lista_correos[$d])));
          array_push($tmp->nombres_responder_a, preg_replace('/ <.*>/',"", $lista_correos[$d]));
        }
      }

      if (isset($encabezados->subject)) {
        if (false!==strpos($encabezados->subject, "=?utf-8?B?")) {
          $encabezados->subject = base64_decode(str_replace(array("=?utf-8?B?","?="), array("",""), $encabezados->subject));
        }

        $tmp->asunto = imap_utf8($encabezados->subject);
      }
      else {
        $tmp->asunto = '';
      }

      $fecha_hora = DateTime::createFromFormat('U', $encabezados->udate);

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

      $tmp->visto = ('N'==$encabezados->Recent || 'U'==$encabezados->Unseen) ? false : true;

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

  imap_close($imap);imap_errors();imap_alerts();

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

function modificarEstructuraContenidoMensaje(&$parte_mensaje) {

  global $TIPO_CONTENIDO_MSG;
  global $CODIFICACIONES_MSG;
  $cp_parametros = new stdClass();
  $cp_dparametros = new stdClass();

  $parte_mensaje->type = $TIPO_CONTENIDO_MSG[$parte_mensaje->type];
  $parte_mensaje->encoding = $CODIFICACIONES_MSG[$parte_mensaje->encoding];

  if ($parte_mensaje->ifparameters) {

    for ($p=0; $p < count($parte_mensaje->parameters); $p++) {
      $cp_parametros->{$parte_mensaje->parameters[$p]->attribute} = $parte_mensaje->parameters[$p]->value;
    }

    $parte_mensaje->parameters = $cp_parametros;

  }

  if ($parte_mensaje->ifdparameters) {

    for ($p=0; $p < count($parte_mensaje->dparameters); $p++) {
      $cp_dparametros->{$parte_mensaje->dparameters[$p]->attribute} = $parte_mensaje->dparameters[$p]->value;
    }

    $parte_mensaje->dparameters = $cp_dparametros;

  }

  if (isset($parte_mensaje->parts)) {
    for ($p=0; $p < count($parte_mensaje->parts); $p++) {
      modificarEstructuraContenidoMensaje($parte_mensaje->parts[$p]);
    }
  }

}

function buscarContenidoCuerpoMensaje(&$contenido, &$respuesta, $parte, $imap, $numero_mensaje, $seccion_mensaje) {

  if ($parte->ifdisposition) {

    $contenido->codificacion = $parte->encoding;

    $contenido->id = $seccion_mensaje;
    $contenido->disposicion = $parte->disposition;
    $contenido->nombre = (isset($parte->dparameters->filename)) ? urldecode($parte->dparameters->filename) : 'sin_nombre';
    $contenido->cid = (isset($parte->id)) ? str_replace(array("<",">"), array("",""), $parte->id) : '';


    if ('inline'==$contenido->disposicion || ''!=$contenido->cid) {

      $contenido->datos = imap_fetchbody($imap, $numero_mensaje, $seccion_mensaje); imap_errors();imap_alerts();

      if('text'==$contenido->tipo_des[0]) {
        $contenido->caracteres = (isset($parte->parameters->charset)) ? strtoupper($parte->parameters->charset) : 'ASCII';
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
  else {

    switch ($contenido->tipo) {

      case 'text/plain':

      if (isset($respuesta->cuerpo->datos)) {
        break;
      }

      case 'text/html':

      $contenido->codificacion = $parte->encoding;
      $contenido->caracteres = (isset($parte->parameters->charset)) ? strtoupper($parte->parameters->charset) : 'ASCII';
      $contenido->datos = imap_fetchbody($imap, $numero_mensaje, $seccion_mensaje); imap_errors();imap_alerts();
      $contenido->datos = decodificarCadena($contenido->datos, $contenido->codificacion);

      if('UTF-8' != $contenido->caracteres) {
        $contenido->datos = mb_convert_encoding($contenido->datos, "UTF-8", $contenido->caracteres);
      }

      if ('text/html'==$contenido->tipo) {
        $contenido->datos = "<span style=\"white-space: pre-line\">" .$contenido->datos. "</span>";
      }

      $respuesta->cuerpo = $contenido;

      break;

      default:

      if ('multipart'==$contenido->tipo_des[0]) {
        if (isset($parte->parts)) {
          for ($p=0; $p < count($parte->parts); $p++) {
            $contenido = new stdClass();
            $contenido->tipo = $parte->parts[$p]->type;
            $contenido->tipo_des = array($parte->parts[$p]->type);

            if ($parte->parts[$p]->ifsubtype) {
              $tmp_subtipo = strtolower($parte->parts[$p]->subtype);
              $contenido->tipo .= '/'.$tmp_subtipo;
              array_push($contenido->tipo_des, $tmp_subtipo);
            }

            buscarContenidoCuerpoMensaje($contenido, $respuesta, $parte->parts[$p], $imap, $numero_mensaje, $seccion_mensaje.".".($p+1));
          }
        }
      }

    }

  }

}

function obtenerContenidoMensaje($imap, $servidor_imap, $puerto_imap, $ruta_folder, $mensaje_id) {

  $respuesta = new stdClass();
  $respuesta->cuerpo = array();
  $respuesta->adjunto = array();
  $respuesta->adjunto_enlinea = array();
  $codificacion = null;
  $numero_parte = 1;

  $folder_cambiado = imap_reopen($imap, "{".$servidor_imap.":".$puerto_imap."/imap/ssl}".urldecode($ruta_folder));

  if (!$folder_cambiado) {
    throw new Exception("Error al abrir folder");
  }

  $numero_mensaje = imap_msgno($imap, $mensaje_id); imap_errors();imap_alerts();

  try {
    $estado_bandera = imap_setflag_full($imap, "$numero_mensaje", "\\Seen"); imap_errors();imap_alerts();
  }
  catch (Exception $e) {}

  $estructura = imap_fetchstructure($imap, $numero_mensaje); imap_errors();imap_alerts();

  modificarEstructuraContenidoMensaje($estructura);

  if (isset($estructura->parts)) {

    for ($p=0; $p < count($estructura->parts); $p++) {

      $contenido = new stdClass();
      $contenido->tipo = $estructura->parts[$p]->type;
      $contenido->tipo_des = array($estructura->parts[$p]->type);

      if ($estructura->parts[$p]->ifsubtype) {
        $tmp_subtipo = strtolower($estructura->parts[$p]->subtype);
        $contenido->tipo .= '/'.$tmp_subtipo;
        array_push($contenido->tipo_des, $tmp_subtipo);
      }

      buscarContenidoCuerpoMensaje($contenido, $respuesta, $estructura->parts[$p], $imap, $numero_mensaje, (string)($p+1));

    }

    if (!isset($respuesta->cuerpo->datos)) {
      $respuesta->cuerpo = new stdClass();
      $respuesta->cuerpo->datos = "";
    }

    $respuesta->cuerpo->datos_originales = $respuesta->cuerpo->datos;

    for ($i=0; $i < count($respuesta->adjunto_enlinea); $i++) {
      if (!integrarCuerpoMensaje($respuesta->cuerpo->datos, $respuesta->adjunto_enlinea[$i])) {
        unset($respuesta->adjunto_enlinea[$i]);
      }
    }

  }
  else {
    $contenido = new stdClass();
    $contenido->codificacion = $estructura->encoding;

    switch ($estructura->type) {

      case 'application':
      case 'audio':
      case 'image':
      case 'video':

      $contenido->id = "0";
      $contenido->nombre = (isset($estructura->parameters->name)) ? $estructura->parameters->name: $estructura->type;
      $contenido->tipo = $estructura->type;
      if ($estructura->ifsubtype) {
        $contenido->tipo .= '/'.strtolower($estructura->subtype);
      }
      array_push($respuesta->adjunto, $contenido);

      break;
      case 'text':

      $contenido->caracteres = (isset($estructura->parameters->charset)) ? strtoupper($estructura->parameters->charset) : 'ASCII';
      $contenido->datos = imap_body($imap, $numero_mensaje); imap_errors();imap_alerts();
      $contenido->datos = decodificarCadena($contenido->datos, $contenido->codificacion);

      if ('UTF-8' != $contenido->caracteres) {
        $contenido->datos = mb_convert_encoding($contenido->datos, "UTF-8", $contenido->caracteres);
      }

      if ($estructura->ifsubtype) {
        if ('PLAIN'==$estructura->subtype) {
          $contenido->datos = "<span style=\"white-space: pre-line\">" .$contenido->datos. "</span>";
        }
      }

      break;
      default:
      $contenido->datos = "<span style=\"white-space: pre-line\">EL MENSAJE TIENE CONTENIDO DE TIPO '".$estructura->type."' Y NO FUE POSIBLE DECODIFICARLO.</span>";
      break;
    }

    $contenido->datos_originales = $contenido->datos;
    $respuesta->cuerpo = $contenido;

  }


  imap_close($imap);imap_errors();imap_alerts();

  return $respuesta;

}

function almacenarMensajeEnServidor($correo, $nombre, $password, $servidor_imap, $puerto_imap, $contenido_mensaje, $ruta_folder) {

  $respuesta = new stdClass();
  $respuesta_sesion = iniciarSesionImap($correo, $password, $servidor_imap, $puerto_imap);

  if (!$respuesta_sesion->estado) {
    $respuesta->estado = false;
    return $respuesta;
  }

  try {

    $insertado = imap_append($respuesta_sesion->imap, "{".$servidor_imap.":".$puerto_imap."/imap/ssl}".urldecode($ruta_folder), $contenido_mensaje, "\\Seen");

    $respuesta->estado = $insertado;

  }
  catch (Exception $e) {
    $respuesta->estado = false;
  }

  return $respuesta;

}

function descargarArchivoAdjunto($imap, $servidor_imap, $puerto_imap, $ruta_folder, $mensaje_id, $adjunto_id, $nombre_archivo, $tipo_archivo) {

  $contenido = null;

  $folder_cambiado = imap_reopen($imap, "{".$servidor_imap.":".$puerto_imap."/imap/ssl}".urldecode($ruta_folder));

  if (!$folder_cambiado) {
    throw new Exception("Error al abrir folder");
  }

  $contenido = imap_fetchbody($imap, $mensaje_id, $adjunto_id, FT_UID); imap_errors();imap_alerts();

  imap_close($imap);imap_errors();imap_alerts();

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

function obtenerArchivoAdjuntoDeMensaje($imap, $servidor_imap, $puerto_imap, $adjuntos, $adjuntos_enlinea, $ruta_folder, $mensaje_id) {

  $respuesta = new stdClass();

  $folder_cambiado = imap_reopen($imap, "{".$servidor_imap.":".$puerto_imap."/imap/ssl}".urldecode($ruta_folder));

  if (!$folder_cambiado) {
    throw new Exception("Error al abrir folder");
  }

  for ($i=0; $i < count($adjuntos); $i++) {

    if (isset($adjuntos[$i]->noalmacenado)) {

      $respuesta->{$adjuntos[$i]->id} = imap_fetchbody($imap, $mensaje_id, $adjuntos[$i]->id, FT_UID); imap_errors();imap_alerts();

    }

  }


  for ($i=0; $i < count($adjuntos_enlinea); $i++) {

    if (isset($adjuntos_enlinea[$i]->noalmacenado)) {

      $respuesta->{$adjuntos_enlinea[$i]->id} = imap_fetchbody($imap, $mensaje_id, $adjuntos_enlinea[$i]->id, FT_UID); imap_errors();imap_alerts();

    }

  }

  imap_close($imap);imap_errors();imap_alerts();

  return $respuesta;

}

function eliminarMensaje($imap, $servidor_imap, $puerto_imap, $ruta_folder, $mensaje_id, $papelera_id) {

  $folder_cambiado = imap_reopen($imap, "{".$servidor_imap.":".$puerto_imap."/imap/ssl}".urldecode($ruta_folder));

  if (!$folder_cambiado) {
    throw new Exception("Error al abrir folder");
  }

  if (null==$papelera_id) {
    $operacion_realizada = imap_delete($imap, $mensaje_id, FT_UID);
  }
  else {
    $operacion_realizada = imap_mail_move($imap, $mensaje_id, urldecode($papelera_id), CP_UID);
  }


  if ($operacion_realizada) {
    if (!imap_expunge($imap)) {
      throw new Exception("Error");
    }
  }
  else {
    throw new Exception("Error");
  }

  imap_close($imap);imap_errors();imap_alerts();

}

function moverMensaje($imap, $servidor_imap, $puerto_imap, $ruta_folder, $mensaje_id, $destino_id) {

  $folder_cambiado = imap_reopen($imap, "{".$servidor_imap.":".$puerto_imap."/imap/ssl}".urldecode($ruta_folder));

  if (!$folder_cambiado) {
    throw new Exception("Error al abrir folder");
  }

  $operacion_realizada = imap_mail_move($imap, $mensaje_id, urldecode($destino_id), CP_UID);

  if ($operacion_realizada) {
    if (!imap_expunge($imap)) {
      throw new Exception("Error");
    }
  }
  else {
    throw new Exception("Error");
  }

  imap_close($imap);imap_errors();imap_alerts();

}

function marcarMensajesComoLeidos($imap, $servidor_imap, $puerto_imap, $ruta_folder, $mensajes_id) {

  $respuesta = new stdClass();
  $respuesta->correctos = array();
  $respuesta->incorrectos = array();
  $secuencia_ids = '';

  $folder_cambiado = imap_reopen($imap, "{".$servidor_imap.":".$puerto_imap."/imap/ssl}".urldecode($ruta_folder));

  if (!$folder_cambiado) {
    throw new Exception("Error al abrir folder");
  }

  for ($i=0; $i < count($mensajes_id); $i++) {
    $secuencia_ids .= $mensajes_id[$i].",";
  }

  $secuencia_ids = rtrim($secuencia_ids,",");

  try {

    $estado_bandera = imap_setflag_full($imap, $secuencia_ids, "\\Seen", ST_UID); imap_errors();imap_alerts();
    $respuesta->correctos = $mensajes_id;

    if (!$estado_bandera) {
      $respuesta->incorrectos = $mensajes_id;
      throw new Exception("Error");
    }

  }
  catch (Exception $e) {
    $respuesta->incorrectos = $mensajes_id;
    throw new Exception("Error");
  }

  imap_close($imap);imap_errors();imap_alerts();

  return $respuesta;

}

function eliminarMensajes($imap, $servidor_imap, $puerto_imap, $ruta_folder, $mensajes_id, $papelera_id) {

  $respuesta = new stdClass();
  $respuesta->correctos = array();
  $respuesta->incorrectos = array();
  $secuencia_ids = '';

  $folder_cambiado = imap_reopen($imap, "{".$servidor_imap.":".$puerto_imap."/imap/ssl}".urldecode($ruta_folder));

  if (!$folder_cambiado) {
    throw new Exception("Error al abrir folder");
  }

  for ($i=0; $i < count($mensajes_id); $i++) {
    $secuencia_ids .= $mensajes_id[$i].",";
  }

  $secuencia_ids = rtrim($secuencia_ids,",");

  try {

    if (null==$papelera_id) {
      $operacion_realizada = imap_delete($imap, $secuencia_ids, FT_UID);
    }
    else {
      $operacion_realizada = imap_mail_move($imap, $secuencia_ids, urldecode($papelera_id), CP_UID);
    }


    if ($operacion_realizada) {
      $respuesta->correctos = $mensajes_id;
      if (!imap_expunge($imap)) {
        $respuesta->incorrectos = $mensajes_id;
        throw new Exception("Error");
      }
    }
    else {
      $respuesta->incorrectos = $mensajes_id;
      throw new Exception("Error");
    }

  }
  catch (Exception $e) {
    $respuesta->incorrectos = $mensajes_id;
    throw new Exception("Error");
  }

  imap_close($imap);imap_errors();imap_alerts();

  return $respuesta;

}

?>
