<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/PHPMailer/vendor/autoload.php';

function iniciarSesionSmtp($correo, $password, $servidor, $puerto) {

  $respuesta = new stdClass();
  $respuesta->smtp = null;
  $respuesta->estado = false;

  $mail = new PHPMailer(true);

  try {
    $mail->isSMTP();
    $mail->Host = $servidor;
    $mail->SMTPAuth = true;
    $mail->Username = $correo;
    $mail->Password = $password;
    $mail->SMTPSecure = 'ssl';
    $mail->Port = $puerto;

    $respuesta->estado = $mail->SmtpConnect();
    $respuesta->smtp = $mail;
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

  $contenido_mensaje = null;

  $smtp->CharSet = 'UTF-8';
  $smtp->setFrom($correo, $nombre);

  for ($i=0; $i < count($datos->destinatarios); $i++) {
    $smtp->addAddress($datos->destinatarios[$i]);
  }

  $smtp->addReplyTo($correo, $nombre);

  for ($i=0; $i < count($datos->adjuntos_enlinea); $i++) {
    $smtp->addStringEmbeddedImage(
      $datos->adjuntos_enlinea[$i]->contenido,
      $datos->adjuntos_enlinea[$i]->cid,
      $datos->adjuntos_enlinea[$i]->nombre,
      'base64',
      $datos->adjuntos_enlinea[$i]->tipo,
      'inline'
    );
  }

  for ($i=0; $i < count($datos->adjuntos); $i++) {
    $smtp->addStringAttachment(
      $datos->adjuntos[$i]->contenido,
      $datos->adjuntos[$i]->nombre,
      'base64',
      $datos->adjuntos[$i]->tipo,
      'attachment'
    );
  }

  $smtp->isHTML(true);
  $smtp->Subject = $datos->asunto;
  $smtp->Body    = $datos->cuerpo;
  $smtp->AltBody = strip_tags($datos->cuerpo);
  // $smtp->addCustomHeader('MIME-Version', '1.0');
  $smtp->addCustomHeader('X-Mailer', 'PHP/'.phpversion());

  $enviado = $smtp->send();

  if ($enviado) {
    $contenido_mensaje = $smtp->getSentMIMEMessage();
  }

  return $contenido_mensaje;

}

?>
