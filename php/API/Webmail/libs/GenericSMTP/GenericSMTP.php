<?php

function iniciarSesionSmtp($correo, $password, $servidor, $puerto) {

  $respuesta = new stdClass();

  $config = array(
    'auth' => 'login',
    'username' => $correo,
    'password' => $password,
    'ssl' => 'ssl',
    // 'ssl' => 'tls'
    'port' => $puerto
  );

  try {
    $respuesta->smtp = new Zend_Mail_Transport_Smtp($servidor, $config);

    $socket = fsockopen("ssl://".$servidor, $puerto, $errno, $errstr, 15);

    if($socket) {
      $respuesta->estado = true;
    }
    else {
      $respuesta->estado = false;
    }
  }
  catch (Exception $e) {
    $respuesta->estado = false;
    $respuesta->smtp = null;
  }

  if (!$respuesta->estado) {
    $respuesta->mensaje_error = "No se pudo establecer una conexion con el servidor SMTP";
  }

  return $respuesta;

}


function enviarMensaje($correo, $nombre, $smtp, $datos) {

  $mensaje = new Zend_Mail('UTF-8');
  $mensaje->setFrom($correo, $nombre);
  $mensaje->setReplyTo($correo, $nombre);
  $mensaje->setSubject('=?utf-8?B?'.base64_encode($datos->asunto).'?=');
  $mensaje->setBodyText(strip_tags($datos->cuerpo), 'UTF-8', Zend_Mime::ENCODING_QUOTEDPRINTABLE);
  $mensaje->setBodyHtml($datos->cuerpo, 'UTF-8', Zend_Mime::ENCODING_QUOTEDPRINTABLE);
  $mensaje->addHeader('MIME-Version', '1.0');
  $mensaje->addHeader('X-Mailer', 'PHP/'.phpversion());

  for ($i=0; $i < count($datos->destinatarios); $i++) {
    $mensaje->addTo($datos->destinatarios[$i], '');
  }

  for ($i=0; $i < count($datos->adjuntos_enlinea); $i++) {
    $obj = new Zend_Mime_Part($datos->adjuntos_enlinea[$i]->contenido);
    $obj->type = $datos->adjuntos_enlinea[$i]->tipo;
    $obj->disposition = Zend_Mime::DISPOSITION_INLINE;
    $obj->encoding = Zend_Mime::ENCODING_BASE64;
    $obj->filename = $datos->adjuntos_enlinea[$i]->nombre;
    $obj->id = $datos->adjuntos_enlinea[$i]->cid;

    $mensaje->addAttachment($obj);
  }

  for ($i=0; $i < count($datos->adjuntos); $i++) {
    $mensaje->createAttachment(
      $datos->adjuntos[$i]->contenido,
      $datos->adjuntos[$i]->tipo,
      Zend_Mime::DISPOSITION_ATTACHMENT,
      Zend_Mime::ENCODING_BASE64,
      $datos->adjuntos[$i]->nombre
    );
  }

  $mensaje->send($smtp);
}

?>
