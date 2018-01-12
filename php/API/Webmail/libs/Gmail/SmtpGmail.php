<?php

function construirCadenaAuthSmtpGmail($correo, $token_acceso) {
  return base64_encode("user=$correo\1auth=Bearer $token_acceso\1\1");
}

function iniciarSesionSmtpGmail($correo_id, $correo, $token_acceso, $token_renovacion, $expiracion, $tiempo_registro) {

  $respuesta = new stdClass();
  $respuesta_aut = null;
  $respuesta_gt = revisarEstadoGoogleToken($correo_id, $token_acceso, $token_renovacion, $expiracion, $tiempo_registro);

  if (!$respuesta_gt->estado) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = $respuesta_gt->mensaje;
    return $respuesta;
  }

  $authSmtpGmail = construirCadenaAuthSmtpGmail($correo, $token_acceso);

  $config = array('ssl' => 'ssl',
                  'port' => '465',
                  'auth' => 'xoauth',
                  'xoauth_request' => $authSmtpGmail);

  try {
    $respuesta->smtp = new Zend_Mail_Transport_Smtp('smtp.gmail.com', $config);
    $respuesta->estado = true;
    // Zend_Mail::setDefaultTransport($respuesta->smtp);
  } catch (Exception $e) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = 'Error de atutenticación';
  }

  return $respuesta;
}

?>
