<?php

function construirCadenaAuthImapGmail($correo, $token_acceso) {
  return base64_encode("user=$correo\1auth=Bearer $token_acceso\1\1");
}

function autenticarOauthImapGmail($imap, $correo, $token_acceso) {
  $parametros_respuesta = new stdClass();
  $parametros_autenticacion = array('XOAUTH2', construirCadenaAuthImapGmail($correo, $token_acceso));
  $imap->sendRequest('AUTHENTICATE', $parametros_autenticacion);

  while (true) {
    $respuesta = "";
    $es_plus = $imap->readLine($respuesta, '+', true);
    if ($es_plus) {
      // error_log("got an extra server challenge: $respuesta");
      $imap->sendRequest('');
    } else {
      if (preg_match('/^NO /i', $respuesta) || preg_match('/^BAD /i', $respuesta)) {
        // error_log("got failure response: $respuesta");
        $parametros_respuesta->estado = false;
        $parametros_respuesta->mensaje = $respuesta;
        return $parametros_respuesta;
      } else if (preg_match("/^OK /i", $respuesta)) {
        $parametros_respuesta->estado = true;
        $parametros_respuesta->mensaje = $respuesta;
        return $parametros_respuesta;
      } else {
        // Some untagged response, such as CAPABILITY
      }
    }
  }
}

function iniciarSesionImapGmail($correo_id, $correo, $token_acceso, $token_renovacion, $expiracion, $tiempo_registro) {

  $respuesta = new stdClass();
  $respuesta_aut = null;
  $respuesta_gt = revisarEstadoGoogleToken($correo_id, $token_acceso, $token_renovacion, $expiracion, $tiempo_registro);

  if (!$respuesta_gt->estado) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = $respuesta_gt->mensaje;
    return $respuesta;
  }

  $imap = new Zend_Mail_Protocol_Imap('imap.gmail.com', '993', true);
  $respuesta_aut = autenticarOauthImapGmail($imap, $correo, $respuesta_gt->token_acceso);

  if ($respuesta_aut->estado) {
    $respuesta->estado = true;
    $respuesta->imap = $imap;
  }
  else {
    $respuesta->estado = false;
    $respuesta->mensaje_error = $respuesta_aut->mensaje;
  }

  return $respuesta;
}

?>
