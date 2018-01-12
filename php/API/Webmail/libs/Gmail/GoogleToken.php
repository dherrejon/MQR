<?php

define("GOOGLE_URL_AUTH", "https://accounts.google.com/o/oauth2/v2/auth");
define("GOOGLE_URL_TOKENS", "https://www.googleapis.com/oauth2/v4/token");
define("GOOGLE_CLIENT_ID", "840908321783-vvbnb37sfaht31856l8s1tqvvetfkgh7.apps.googleusercontent.com");
define("GOOGLE_CLIENT_SECRET", "r00ttaLrxbJujWLWEcyicTvk");
define("GOOGLE_REDIRECT_URI", "http://localhost/MQR/php/API/index.php");
define("GOOGLE_RESPONSE_TYPE", "code");
define("GOOGLE_SCOPE", "https://mail.google.com/ https://www.googleapis.com/auth/userinfo.email  https://www.googleapis.com/auth/userinfo.profile");
define("GOOGLE_ACCESS_TYPE", "offline");
define("GOOGLE_STATE", "Gmail");
define("GOOGLE_INCLUDE_GRANTED_SCOPES", "true");
define("GOOGLE_PROMPT", "consent select_account");
define("GOOGLE_GRANT_TYPE", "authorization_code");
define("GOOGLE_URL_USER_INFO", "https://www.googleapis.com/oauth2/v3/userinfo");


function solicitarGoogleToken() {

  $peticion = null;
  $parametros = array(
    "client_id" => GOOGLE_CLIENT_ID,
    "redirect_uri" => GOOGLE_REDIRECT_URI,
    "response_type" => GOOGLE_RESPONSE_TYPE,
    "scope" => GOOGLE_SCOPE,
    "access_type" => GOOGLE_ACCESS_TYPE,
    "state" => GOOGLE_STATE,
    "include_granted_scopes" => GOOGLE_INCLUDE_GRANTED_SCOPES,
    "prompt" => GOOGLE_PROMPT
  );

  $peticion = GOOGLE_URL_AUTH.'?'.http_build_query($parametros);

  // header("Location: " . $peticion);
  // echo "<script type=\"text/javascript\"> window.open('".$peticion."', \"\", \"width=500,height=600\"); </script>";
  return $peticion;

}


function obtenerInformacionUsuarioGoogle($google_token) {
  $respuesta = null;

  $curl = curl_init();

  curl_setopt_array($curl, array(
    CURLOPT_URL => GOOGLE_URL_USER_INFO,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ["Authorization: Bearer " . $google_token]
  ));

  $respuesta = curl_exec($curl);
  curl_close($curl);

  return json_decode($respuesta);
}


function codigoAGoogleToken($codigo) {

  $respuesta = null;
  $parametros = array(
    "code" => $codigo,
    "client_id" => GOOGLE_CLIENT_ID,
    "client_secret" => GOOGLE_CLIENT_SECRET,
    "redirect_uri" => GOOGLE_REDIRECT_URI,
    "grant_type" => GOOGLE_GRANT_TYPE
  );

  $curl = curl_init();

  curl_setopt_array($curl, array(
    CURLOPT_URL => GOOGLE_URL_TOKENS,
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_POSTFIELDS => http_build_query($parametros)
  ));

  $respuesta = curl_exec($curl);
  curl_close($curl);

  return json_decode($respuesta);

}

function obtenerDatosCuentaGmail($codigo)
{
  global $url_webmail_app;
  $datos_cuenta = null;
  $respuesta_user_info = null;

  $respuesta_token = codigoAGoogleToken($codigo);

  if (isset($respuesta_token->error)) {
    // $respuesta_token->error;
    // $respuesta_token->error_description

    $_SESSION['ErrorWebmail'] = $respuesta_token->error;
    header("Location: ".$url_webmail_app);
    exit();

  }else {
    // echo "Refresh token: " . $respuesta_token->refresh_token;
    // echo "Access token: " . $respuesta_token->access_token;
    // echo "Expires in: " . $respuesta_token->expires_in;
    // echo "Token type: " . $respuesta_token->token_type;
    $respuesta_user_info = obtenerInformacionUsuarioGoogle($respuesta_token->access_token);

    if (isset($respuesta_user_info->error))
    {
      $_SESSION['ErrorWebmail'] = $respuesta_user_info->error;
      header("Location: ".$url_webmail_app);
      exit();
    }
    else
    {
      $datos_cuenta = $respuesta_token;
      $datos_cuenta->email = $respuesta_user_info->email;
      $datos_cuenta->nombre = (strlen($respuesta_user_info->name)>360) ? substr($respuesta_user_info->name, 0, 360) : $respuesta_user_info->name;
      $datos_cuenta->server = 'Gmail';
      $datos_cuenta->register_time = time();
      agregarTokenBD($datos_cuenta);
    }

  }

}


function renovarGoogleToken($token_renovacion) {

  $respuesta = null;
  $parametros = array(
    "refresh_token" => $token_renovacion,
    "client_id" => GOOGLE_CLIENT_ID,
    "client_secret" => GOOGLE_CLIENT_SECRET,
    "grant_type" => "refresh_token"
  );

  $curl = curl_init();

  curl_setopt_array($curl, array(
    CURLOPT_URL => GOOGLE_URL_TOKENS,
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_POSTFIELDS => http_build_query($parametros)
  ));

  $respuesta = curl_exec($curl);
  curl_close($curl);

  return json_decode($respuesta);

}


function revisarEstadoGoogleToken($correo_id, $token_acceso, $token_renovacion, $expiracion, $tiempo_registro)
{
  $respuesta = new stdClass();
  $respuesta_rt = null;
  $respuesta_act_bd = null;
  $datos = null;

  if ( time() < ( intval($tiempo_registro) + intval($expiracion) - 60) ) {
    $respuesta->estado = true;
    $respuesta->token_acceso = $token_acceso;
  } else {

    $respuesta_rt = renovarGoogleToken($token_renovacion);

    if (isset($respuesta_rt->error)) {

      $respuesta->estado = false;
      $respuesta->mensaje = $respuesta_rt->error;

    } else {

      $datos = $respuesta_rt;
      $datos->correo_id = $correo_id;
      $datos->register_time = time();
      $respuesta_act_bd = actualizarTokenBD($datos);

      if ($respuesta_act_bd->estado) {
        $respuesta->estado = true;
        $respuesta->token_acceso = $respuesta_rt->access_token;
      }else {
        $respuesta = $respuesta_act_bd;
      }

    }

  }

  return $respuesta;
}

?>
