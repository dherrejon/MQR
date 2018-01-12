<?php

define("OUTLOOK_URL_AUTH", "https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
define("OUTLOOK_URL_TOKENS", "https://login.microsoftonline.com/common/oauth2/v2.0/token");
define("OUTLOOK_CLIENT_ID", "b6ecae42-18cb-41ad-9e4d-75aef7d527e3");
define("OUTLOOK_CLIENT_SECRET", "jgO8gMXa95CNpOm06rtA6VP");
define("OUTLOOK_REDIRECT_URI", "http://localhost/MQR/php/API/index.php");
define("OUTLOOK_RESPONSE_TYPE", "code");
define("OUTLOOK_SCOPE", "offline_access https://outlook.office.com/Mail.ReadWrite https://outlook.office.com/Mail.ReadWrite.Shared https://outlook.office.com/Mail.Send https://outlook.office.com/Mail.Send.Shared https://outlook.office.com/User.Read");
//offline_access Mail.ReadWrite Mail.ReadWrite.Shared Mail.Send Mail.Send.Shared User.Read
//wl.offline_access wl.basic wl.imap
define("OUTLOOK_STATE", "Outlook");
define("OUTLOOK_RESPONSE_MODE", "query");
define("OUTLOOK_PROMPT", "consent");
define('OUTLOOK_GRANT_TYPE', 'authorization_code');

define("OUTLOOK_API_URL", "https://outlook.office.com/api/v2.0");

function solicitarOutlookToken() {

  $peticion = null;
  $parametros = array(
    "client_id" => OUTLOOK_CLIENT_ID,
    "response_type" => OUTLOOK_RESPONSE_TYPE,
    "redirect_uri" => OUTLOOK_REDIRECT_URI,
    "scope" => OUTLOOK_SCOPE,
    "response_mode" => OUTLOOK_RESPONSE_MODE,
    "state" => OUTLOOK_STATE,
    "prompt"=> OUTLOOK_PROMPT
  );

  $peticion = OUTLOOK_URL_AUTH.'?'.http_build_query($parametros);

  return $peticion;

}

function obtenerInformacionUsuarioOutlook($outlook_token) {
  $respuesta = null;

  $parametros = array(
    "\$select" => "DisplayName,EmailAddress"
  );

  $curl = curl_init();

  curl_setopt_array($curl, array(
    CURLOPT_URL => OUTLOOK_API_URL."/Me?".http_build_query($parametros),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ["Authorization: Bearer " . $outlook_token]
  ));

  $respuesta = curl_exec($curl);
  curl_close($curl);

  return json_decode($respuesta);
}

function codigoAOutlookToken($codigo) {
  $respuesta = null;
  $parametros = array(
    "client_id" => OUTLOOK_CLIENT_ID,
    "grant_type" => OUTLOOK_GRANT_TYPE,
    "scope" => OUTLOOK_SCOPE,
    "code" => $codigo,
    "redirect_uri" => OUTLOOK_REDIRECT_URI,
    "client_secret" => OUTLOOK_CLIENT_SECRET
  );

  $curl = curl_init();

  curl_setopt_array($curl, array(
    CURLOPT_URL => OUTLOOK_URL_TOKENS,
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_POSTFIELDS => http_build_query($parametros)
  ));

  $respuesta = curl_exec($curl);
  curl_close($curl);

  return json_decode($respuesta);

}

function obtenerDatosCuentaOutlook($codigo) {
  global $url_webmail_app;
  $datos_cuenta = null;
  $respuesta_user_info = null;

  $respuesta_token = codigoAOutlookToken($codigo);

  if (isset($respuesta_token->error)) {

    $_SESSION['ErrorWebmail'] = $respuesta_token->error;
    header("Location: ".$url_webmail_app);
    exit();

  }else {

    $respuesta_user_info = obtenerInformacionUsuarioOutlook($respuesta_token->access_token);

    if (isset($respuesta_user_info->error)) {
      $_SESSION['ErrorWebmail'] = $respuesta_user_info->error;
      header("Location: ".$url_webmail_app);
      exit();
    }else {
      $datos_cuenta = $respuesta_token;
      $datos_cuenta->email = $respuesta_user_info->EmailAddress;
      $datos_cuenta->nombre = (strlen($respuesta_user_info->DisplayName)>360) ? substr($respuesta_user_info->DisplayName, 0, 360) : $respuesta_user_info->DisplayName;
      $datos_cuenta->server = 'Outlook';
      $datos_cuenta->register_time = time();
      agregarTokenBD($datos_cuenta);
    }

  }

}

function renovarOutlookToken($token_renovacion) {

  $respuesta = null;

  $parametros = array(
    "client_id" => OUTLOOK_CLIENT_ID,
    "grant_type" => "refresh_token",
    "scope" => OUTLOOK_SCOPE,
    "refresh_token" => $token_renovacion,
    "redirect_uri" => OUTLOOK_REDIRECT_URI,
    "client_secret" => OUTLOOK_CLIENT_SECRET,
  );

  $curl = curl_init();

  curl_setopt_array($curl, array(
    CURLOPT_URL => OUTLOOK_URL_TOKENS,
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_POSTFIELDS => http_build_query($parametros)
  ));

  $respuesta = curl_exec($curl);
  curl_close($curl);

  return json_decode($respuesta);

}


function revisarEstadoOutlookToken($correo_id, $token_acceso, $token_renovacion, $expiracion, $tiempo_registro)
{
  $respuesta = new stdClass();
  $respuesta_rt = null;
  $respuesta_act_bd = null;
  $datos = null;

  if ( time() < ( intval($tiempo_registro) + intval($expiracion) - 60) ) {
    $respuesta->estado = true;
    $respuesta->token_acceso = $token_acceso;
  } else {

    $respuesta_rt = renovarOutlookToken($token_renovacion);

    if (isset($respuesta_rt->error)) {
      $respuesta->estado = false;
      $respuesta->mensaje_error = $respuesta_rt->error;
    } else {
      $datos = $respuesta_rt;
      $datos->correo_id = $correo_id;
      $datos->register_time = time();
      $respuesta_act_bd = actualizarTokenBD($datos);

      if ($respuesta_act_bd->estado) {
        $respuesta->estado = true;
        $respuesta->token_acceso = $respuesta_rt->access_token;
      }else {
        $respuesta->estado = $respuesta_act_bd->estado;
        $respuesta->mensaje_error = $respuesta_act_bd->mensaje;
      }

    }

  }

  return $respuesta;
}

?>
