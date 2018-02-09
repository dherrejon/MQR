<?php
require_once 'libs/Gmail/GoogleToken.php';
require_once 'libs/Gmail/GmailAPI.php';
require_once 'libs/GenericIMAP/GenericIMAP.php';
require_once 'libs/GenericSMTP/GenericSMTP.php';
require_once 'libs/Gmail/ImapGmail.php';
require_once 'libs/Gmail/SmtpGmail.php';
require_once 'libs/Outlook/OutlookToken.php';
require_once 'libs/Outlook/OutlookAPI.php';

function comprobarCredencialesCorreoWebmail($parametros) {

  $respuesta = new stdClass();

  $respuesta = iniciarSesionImap(
    $parametros->correo,
    $parametros->password,
    $parametros->servidor_imap,
    $parametros->puerto_imap
  );

  unset($respuesta->imap);

  if (!$respuesta->estado) {
    $respuesta->mensaje_error .= ", realiza lo siguiente:<br /><ul>".
    "<li>Revisa que los datos de configuración sean correctos</li>".
    "<li>Revisa tu bandeja de entrada en busca de un mensaje de alerta de bloqueo de la conexión, y sigue las instrucciones para permitir el acceso</li>".
    "</ul>";
    return $respuesta;
  }

  $respuesta = iniciarSesionSmtp(
    $parametros->correo,
    $parametros->password,
    $parametros->servidor_smtp,
    $parametros->puerto_smtp
  );

  unset($respuesta->smtp);

  if (!$respuesta->estado) {
    $respuesta->mensaje_error .= ", realiza lo siguiente:<br /><ul>".
    "<li>Revisa que los datos de configuración sean correctos</li>".
    "<li>Revisa tu bandeja de entrada en busca de un mensaje de alerta de bloqueo de la conexión, y sigue las instrucciones para permitir el acceso</li>".
    "</ul>";
    return $respuesta;
  }

  return $respuesta;
}

function agregarTokenBD($datos) {

  global $app;
  global $url_webmail_app;
  global $password_encriptacion_bd;

  if (isset( $_SESSION['UsuarioId'] ))
  {

    $db=null;
    $sql = "SELECT UsuarioId FROM Usuario WHERE UsuarioId = :usuarioId";

    try {

      $db = getConnection();
      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':usuarioId', $_SESSION['UsuarioId']);
      $sentencia->execute();
      // $respuesta = $sentencia->fetchAll(PDO::FETCH_OBJ);

      if(1 == $sentencia->rowCount())
      {

        $sql = "SELECT CorreoId FROM Correo WHERE UPPER(CAST(AES_DECRYPT(Cuenta, :passwordEBD) AS CHAR)) = UPPER(:cuenta) AND UsuarioId = :usuarioId";
        $sentencia = $db->prepare($sql);
        $sentencia->bindParam(':cuenta', $datos->email);
        $sentencia->bindParam(':usuarioId', $_SESSION['UsuarioId']);
        $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
        $sentencia->execute();

        if (0 == $sentencia->rowCount()) {

          $sql = "INSERT INTO Correo (UsuarioId, Cuenta, Nombre, Servidor, TokenAcceso, TokenRenovacion, TipoToken, Expiracion, TiempoRegistro, TiempoComprobacion) VALUES (:usuarioId, AES_ENCRYPT(:cuenta, :passwordEBD), AES_ENCRYPT(:nombre, :passwordEBD), AES_ENCRYPT(:servidor, :passwordEBD), AES_ENCRYPT(:tokenAcceso, :passwordEBD), AES_ENCRYPT(:tokenRenovacion, :passwordEBD), AES_ENCRYPT(:tipoToken, :passwordEBD), :expiracion, :tiempoRegistro, 5)";

          $sentencia = $db->prepare($sql);
          $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
          $sentencia->bindParam(':usuarioId', $_SESSION['UsuarioId']);
          $sentencia->bindParam(':cuenta', $datos->email);
          $sentencia->bindParam(':nombre', $datos->nombre);
          $sentencia->bindParam(':servidor', $datos->server);
          $sentencia->bindParam(':tokenAcceso', $datos->access_token);
          $sentencia->bindParam(':tokenRenovacion', $datos->refresh_token);
          $sentencia->bindParam(':tipoToken', $datos->token_type);
          $sentencia->bindParam(':expiracion', $datos->expires_in);
          $sentencia->bindParam(':tiempoRegistro', $datos->register_time);

          $sentencia->execute();

          if (1!=$sentencia->rowCount()) {
            $_SESSION['ErrorWebmail'] = 'No se pudo registrar la cuenta en la base de datos.';
          }

        }
        else {
          $_SESSION['ErrorWebmail'] = 'La cuenta de correo ya se encuentra registrada en la base de datos.';
        }

      }
      else {
        $_SESSION['ErrorWebmail'] = 'El ID de usuario no es válido.';
      }

      $db = null;

    } catch(PDOException $e) {
      $db=null;
      $app->status(409);
      $_SESSION['ErrorWebmail'] = 'No se pudo registrar la cuenta en la base de datos.';
    }

  }
  else
  {
    $_SESSION['ErrorWebmail'] = 'No existe una sesión registrada.';
  }

  header("Location: ".$url_webmail_app);
  exit();

}

function actualizarTokenBD($datos) {
  global $app;
  global $password_encriptacion_bd;
  $parametros_respuesta=new stdClass();

  if (isset( $_SESSION['UsuarioId'] )) {

    $db=null;
    $sql = "SELECT UsuarioId FROM Usuario WHERE UsuarioId = :usuarioId";

    try {

      $db = getConnection();
      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':usuarioId', $_SESSION['UsuarioId']);
      $sentencia->execute();

      if(1 == $sentencia->rowCount()) {

        $sql = "UPDATE Correo SET TokenAcceso = AES_ENCRYPT(:tokenAcceso, :passwordEBD), TipoToken = AES_ENCRYPT(:tipoToken, :passwordEBD), Expiracion = :expiracion, TiempoRegistro = :tiempoRegistro WHERE CorreoId = :correoId";

        $sentencia = $db->prepare($sql);
        $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
        $sentencia->bindParam(':tokenAcceso', $datos->access_token);
        $sentencia->bindParam(':tipoToken', $datos->token_type);
        $sentencia->bindParam(':expiracion', $datos->expires_in);
        $sentencia->bindParam(':tiempoRegistro', $datos->register_time);
        $sentencia->bindParam(':correoId', $datos->correo_id);

        $sentencia->execute();

        if (1!=$sentencia->rowCount()) {
          $parametros_respuesta->estado = false;
          $parametros_respuesta->mensaje = 'No se pudo actualizar el token de acceso.';
        }else {
          $parametros_respuesta->estado = true;
        }

      }else {
        $parametros_respuesta->estado = false;
        $parametros_respuesta->mensaje = 'El ID de usuario no es válido.';
      }

      $db = null;

    } catch(PDOException $e) {
      $db=null;
      $app->status(409);
      $app->stop();
    }

  }else {
    $parametros_respuesta->estado = false;
    $parametros_respuesta->mensaje = 'No existe una sesión registrada.';
  }

  return $parametros_respuesta;

}

function agregarContactosBD($correo_id, $contactos) {
  global $app;
  global $password_encriptacion_bd;

  $db = null;
  $sql = "SELECT CorreoId FROM Correo WHERE CorreoId = :correoId";

  try {

    $db = getConnection();
    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':correoId', $correo_id);
    $sentencia->execute();
    $respuesta = $sentencia->fetchAll(PDO::FETCH_OBJ);

    if(1 == $sentencia->rowCount()) {

      for ($c=0; $c < count($contactos); $c++) {

        $sql = "INSERT INTO Contacto (CorreoId, CorreoElectronico) VALUES (:correoId, AES_ENCRYPT(:correoElectronico, :passwordEBD))";

        $sentencia = $db->prepare($sql);
        $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
        $sentencia->bindParam(':correoId', $correo_id);
        $sentencia->bindParam(':correoElectronico', $contactos[$c]);

        $sentencia->execute();

      }

    }

    $db = null;

  } catch(PDOException $e) {
    $db=null;
    $app->status(409);
    $app->stop();
  }

}

function agregarCredencialesCorreoBD($datos) {

  global $app;
  global $password_encriptacion_bd;
  $respuesta = new stdClass();

  if (!isset( $_SESSION['UsuarioId'] )){
    $respuesta->estado = false;
    $respuesta->mensaje_error = "No existe una sesión registrada.";
    return $respuesta;
  }

  $db=null;
  $sql = "SELECT UsuarioId FROM Usuario WHERE UsuarioId = :usuarioId";

  try {

    $db = getConnection();
    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuarioId', $_SESSION['UsuarioId']);
    $sentencia->execute();

    if(1 != $sentencia->rowCount())
    {
      $respuesta->estado = false;
      $respuesta->mensaje_error = 'El ID de usuario no es válido.';
      $db = null;
      return $respuesta;
    }

    $sql = "SELECT CorreoId FROM Correo WHERE UPPER(CAST(AES_DECRYPT(Cuenta, :passwordEBD) AS CHAR)) = UPPER(:cuenta) AND UsuarioId = :usuarioId";
    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':cuenta', $datos->correo);
    $sentencia->bindParam(':usuarioId', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
    $sentencia->execute();

    if (0 != $sentencia->rowCount()) {
      $respuesta->estado = false;
      $respuesta->mensaje_error = 'La cuenta de correo ya se encuentra registrada en la base de datos.';
      $db = null;
      return $respuesta;
    }

    $sql = "INSERT INTO Correo (UsuarioId, Cuenta, Nombre, Servidor, IMAP, PuertoIMAP, SMTP, PuertoSMTP, Password, TiempoComprobacion) VALUES (:usuarioId, AES_ENCRYPT(:cuenta, :passwordEBD), AES_ENCRYPT(:nombre, :passwordEBD), AES_ENCRYPT('Otro', :passwordEBD), :imap, :puertoIMAP, :smtp, :puertoSMTP, AES_ENCRYPT(:password, :passwordEBD), :tiempoComprobacion)";

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
    $sentencia->bindParam(':usuarioId', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':cuenta', $datos->correo);
    $sentencia->bindParam(':nombre', $datos->nombre);
    $sentencia->bindParam(':imap', $datos->servidor_imap);
    $sentencia->bindParam(':puertoIMAP', $datos->puerto_imap);
    $sentencia->bindParam(':smtp', $datos->servidor_smtp);
    $sentencia->bindParam(':puertoSMTP', $datos->puerto_smtp);
    $sentencia->bindParam(':password', $datos->password);
    $sentencia->bindParam(':tiempoComprobacion', $datos->tiempo_comprobacion);

    $sentencia->execute();

    if (1!=$sentencia->rowCount()) {
      $respuesta->estado = false;
      $respuesta->mensaje_error = 'No se pudo registrar la cuenta en la base de datos.';
      $db = null;
      return $respuesta;
    }

    $sql = "SELECT CorreoId FROM Correo WHERE UPPER(CAST(AES_DECRYPT(Cuenta, :passwordEBD) AS CHAR)) = UPPER(:cuenta) AND UsuarioId = :usuarioId";
    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':cuenta', $datos->correo);
    $sentencia->bindParam(':usuarioId', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
    $sentencia->execute();

    if (1!=$sentencia->rowCount()) {
      $respuesta->estado = false;
      $respuesta->mensaje_error = 'No se pudo registrar la cuenta en la base de datos.';
      $db = null;
      return $respuesta;
    }

    $respuesta->estado = true;
    $respuesta->correo_id = $sentencia->fetchAll(PDO::FETCH_OBJ)[0]->CorreoId;
    $db = null;
    return $respuesta;

  } catch(PDOException $e) {
    $db=null;
    $app->status(409);
    $app->stop();
  }

}

function EliminarCuentaWebmail() {

  global $app;
  global $password_encriptacion_bd;
  $respuesta = new stdClass();
  $correo_id = $app->request()->getBody();

  if (isset( $_SESSION['UsuarioId'] )){

    $db=null;

    try {

      $sql = "DELETE FROM Contacto WHERE CorreoId = :correoId";
      $db = getConnection();
      $db->beginTransaction();
      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':correoId', $correo_id);
      $sentencia->execute();

      $sql = "DELETE FROM Correo WHERE CorreoId = :correoId AND UsuarioId = :usuarioId";
      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':correoId', $correo_id);
      $sentencia->bindParam(':usuarioId', $_SESSION['UsuarioId']);
      $sentencia->execute();

      if (0 != $sentencia->rowCount()) {
        $db->commit();
        $respuesta->estado = true;
      }
      else {
        $db->rollBack();
        $respuesta->estado = false;
        $respuesta->mensaje_error = 'No se pudo eliminar la cuenta de correo.';
      }

    } catch(PDOException $e) {
      $db->rollBack();
      $db=null;
      $app->status(409);
      $app->stop();
    }

  }
  else {
    $respuesta->estado = false;
    $respuesta->mensaje_error = "No existe una sesión registrada.";
  }

  $db = null;
  echo json_encode($respuesta);
}

function CapturarRespuestaServidorWebmail() {

  global $app;
  global $url_webmail_app;
  $nombre_servidor = null;

  if(isset($_GET['state']))
  {

    $nombre_servidor = $_GET['state'];

    if (isset($_GET['error']))
    {
      $_SESSION['ErrorWebmail'] = $_GET['error'];
      header("Location: ".$url_webmail_app);
      exit();
    }
    else
    {
      switch ($nombre_servidor) {
        case 'Gmail':
        obtenerDatosCuentaGmail($_GET['code']);
        break;

        case 'Outlook':
        obtenerDatosCuentaOutlook($_GET['code']);
        break;
        default:
        break;
      }
    }

  }
  else
  {
    $app->status(404);
    $app->stop();
  }

}

function RedireccionarServidorWebmail() {

  global $app;
  $respuesta = new stdClass();
  $respuesta->estado = true;
  $parametros = $app->request()->params();

  switch ($parametros['servidor']) {
    case 'Gmail':
    $respuesta->uri = solicitarGoogleToken();
    break;
    case 'Outlook':
    $respuesta->uri = solicitarOutlookToken();
    break;
    default:
    $respuesta->estado = false;
    $respuesta->mensaje_error = "No fue posible redireccionar al servidor de correo seleccionado";
    break;
  }

  echo json_encode($respuesta);

}

function ObtenerRegistroErroresWebmail() {

  $respuesta = new stdClass();

  if (isset($_SESSION['ErrorWebmail']))
  {
    $respuesta->error = $_SESSION['ErrorWebmail'];
    unset($_SESSION['ErrorWebmail']);
  }
  else
  {
    $respuesta->error = '';
  }

  echo json_encode($respuesta);

}

function ObtenerCuentasWebmail() {
  global $app;
  global $url_webmail_app;
  global $password_encriptacion_bd;

  if (isset( $_SESSION['UsuarioId'] )) {

    $db=null;
    $sql = "SELECT CorreoId AS correo_id, CAST(AES_DECRYPT(Cuenta, :passwordEBD) AS CHAR) AS correo, CAST(AES_DECRYPT(Servidor, :passwordEBD) AS CHAR) AS servidor, TiempoComprobacion AS tiempo_comprobacion, '' AS mensajes_novistos, '' AS peticion, '' AS abierto, '' AS folders FROM Correo WHERE UsuarioId = :usuarioId";

    try {

      $db = getConnection();
      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
      $sentencia->bindParam(':usuarioId', $_SESSION['UsuarioId']);
      $sentencia->execute();
      $respuesta = $sentencia->fetchAll(PDO::FETCH_OBJ);
      $db = null;

      for ($c=0; $c < count($respuesta); $c++) {
        $respuesta[$c]->tiempo_comprobacion *= 1;
        $respuesta[$c]->mensajes_novistos = 0;
        $respuesta[$c]->peticion = null;
        $respuesta[$c]->abierto = false;
        $respuesta[$c]->folders = array();
      }

      echo json_encode($respuesta);

    } catch(PDOException $e) {
      $db=null;
      $app->status(409);
      $app->stop();
    }

  }else {
    echo json_encode(array());
  }
}

function ObtenerContactosPorCuentaWebmail() {

  global $app;
  global $password_encriptacion_bd;
  $parametros = $app->request()->params();

  $db=null;
  $sql = "SELECT CAST(AES_DECRYPT(CorreoElectronico, :passwordEBD) AS CHAR) AS correo FROM Contacto WHERE CorreoId = :correoId";

  try {

    $db = getConnection();
    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
    $sentencia->bindParam(':correoId', $parametros['correo_id']);
    $sentencia->execute();
    $respuesta = $sentencia->fetchAll(PDO::FETCH_OBJ);
    $db = null;

    echo json_encode($respuesta);

  } catch(PDOException $e) {
    $db=null;
    $app->status(409);
    $app->stop();
  }

}

function obtenerCredencialesCuentaWebmail($correo_id) {

  global $app;
  global $password_encriptacion_bd;

  if (isset( $_SESSION['UsuarioId'] )) {

    $db=null;
    $sql = "SELECT CAST(AES_DECRYPT(Cuenta, :passwordEBD) AS CHAR) AS correo, CAST(AES_DECRYPT(Nombre, :passwordEBD) AS CHAR) AS nombre, CAST(AES_DECRYPT(Servidor, :passwordEBD) AS CHAR) AS servidor, CAST(AES_DECRYPT(Password, :passwordEBD) AS CHAR) AS password, CAST(AES_DECRYPT(TokenAcceso, :passwordEBD) AS CHAR) AS token_acceso, CAST(AES_DECRYPT(TokenRenovacion, :passwordEBD) AS CHAR) AS token_renovacion, CAST(AES_DECRYPT(TipoToken, :passwordEBD) AS CHAR) AS tipo_token, Expiracion AS expiracion, TiempoRegistro AS tiempo_registro, IMAP AS servidor_imap, PuertoIMAP AS puerto_imap, SMTP AS servidor_smtp, PuertoSMTP AS puerto_smtp FROM Correo WHERE CorreoId = :correoId AND UsuarioId = :usuarioId";

    try {

      $db = getConnection();
      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
      $sentencia->bindParam(':correoId', $correo_id);
      $sentencia->bindParam(':usuarioId', $_SESSION['UsuarioId']);
      $sentencia->execute();
      $respuesta = $sentencia->fetchAll(PDO::FETCH_OBJ);
      $db = null;

      return $respuesta;

    } catch(PDOException $e) {
      $db=null;
      $app->status(409);
      $app->stop();
    }

  }else {
    return array();
  }
}

function ObtenerConfiguracionCuentaWebmail() {

  global $app;
  global $password_encriptacion_bd;
  $parametros = $app->request()->params();
  $respuesta = new stdClass();

  if (!isset( $_SESSION['UsuarioId'] )) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = 'No existe una sesión registrada.';
    echo json_encode($respuesta);
    $app->stop();
    return;
  }

  $db=null;

  if ('Otro'==$parametros['tipo_servidor'] || 'Yahoo'==$parametros['tipo_servidor']) {
    $sql = "SELECT CAST(AES_DECRYPT(Cuenta, :passwordEBD) AS CHAR) AS correo, CAST(AES_DECRYPT(Nombre, :passwordEBD) AS CHAR) AS nombre, CAST(AES_DECRYPT(Password, :passwordEBD) AS CHAR) AS password, IMAP AS servidor_imap, PuertoIMAP AS puerto_imap, SMTP AS servidor_smtp, PuertoSMTP AS puerto_smtp, TiempoComprobacion AS tiempo_comprobacion FROM Correo WHERE CorreoId = :correoId AND UsuarioId = :usuarioId";
  }
  else {
    $sql = "SELECT CAST(AES_DECRYPT(Cuenta, :passwordEBD) AS CHAR) AS correo, CAST(AES_DECRYPT(Nombre, :passwordEBD) AS CHAR) AS nombre, TiempoComprobacion AS tiempo_comprobacion FROM Correo WHERE CorreoId = :correoId AND UsuarioId = :usuarioId";
  }

  try {

    $db = getConnection();
    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
    $sentencia->bindParam(':correoId', $parametros['correo_id']);
    $sentencia->bindParam(':usuarioId', $_SESSION['UsuarioId']);
    $sentencia->execute();
    $datos = $sentencia->fetchAll(PDO::FETCH_OBJ);

    if (1 != $sentencia->rowCount()) {
      $db = null;
      $respuesta->estado = false;
      $respuesta->mensaje_error = 'Error al obtener los datos.';
      echo json_encode($respuesta);
      $app->stop();
      return;
    }

    $respuesta->estado = true;
    $respuesta->datos = $datos[0];
    $db = null;

    echo json_encode($respuesta);

  } catch(PDOException $e) {
    $db=null;
    $app->status(409);
    $app->stop();
  }

}

function ActualizarConfiguracionCuentaWebmail() {

  global $app;
  global $password_encriptacion_bd;
  $parametros = json_decode($app->request()->getBody());
  $respuesta = new stdClass();

  if (!isset( $_SESSION['UsuarioId'] )) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = 'No existe una sesión registrada.';
    echo json_encode($respuesta);
    $app->stop();
    return;
  }


  $db=null;

  if ('Otro'==$parametros->tipo_servidor || 'Yahoo'==$parametros->tipo_servidor) {

    $respuesta = comprobarCredencialesCorreoWebmail($parametros);

    if (!$respuesta->estado) {
      echo json_encode($respuesta);
      $app->stop();
      return;
    }

    $sql = "UPDATE Correo SET Nombre = AES_ENCRYPT(:nombre, :passwordEBD), Password = AES_ENCRYPT(:password, :passwordEBD), IMAP = :imap, PuertoIMAP = :puerto_imap, SMTP = :smtp, PuertoSMTP = :puerto_smtp, TiempoComprobacion = :tiempo_comprobacion WHERE CorreoId = :correoId AND UsuarioId = :usuarioId";

  }
  else {
    $sql = "UPDATE Correo SET Nombre = AES_ENCRYPT(:nombre, :passwordEBD),  TiempoComprobacion = :tiempo_comprobacion WHERE CorreoId = :correoId AND UsuarioId = :usuarioId";
  }

  try {

    $db = getConnection();
    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
    $sentencia->bindParam(':correoId', $parametros->correo_id);
    $sentencia->bindParam(':usuarioId', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':nombre', $parametros->nombre);
    $sentencia->bindParam(':tiempo_comprobacion', $parametros->tiempo_comprobacion);

    if ('Otro'==$parametros->tipo_servidor || 'Yahoo'==$parametros->tipo_servidor) {
      $sentencia->bindParam(':password', $parametros->password);
      $sentencia->bindParam(':imap', $parametros->servidor_imap);
      $sentencia->bindParam(':puerto_imap', $parametros->puerto_imap);
      $sentencia->bindParam(':smtp', $parametros->servidor_smtp);
      $sentencia->bindParam(':puerto_smtp', $parametros->puerto_smtp);
      $sentencia->bindParam(':imap', $parametros->servidor_imap);
    }

    $sentencia->execute();

    $db = null;
    $respuesta->estado = true;

    echo json_encode($respuesta);

  } catch(PDOException $e) {
    $db=null;
    $app->status(409);
    $app->stop();
  }

}

function ObtenerFoldersPorCuentaWebmail() {

  global $app;
  $respuesta = new stdClass();
  $parametros = $app->request()->params();
  $cuenta = obtenerCredencialesCuentaWebmail($parametros['correo_id']);

  $folders_especiales = new stdClass();
  $folders_especiales->entrada = new stdClass();
  $folders_especiales->entrada->palabras = "entrada|recibidos|inbox";
  $folders_especiales->entrada->palabras_gmail = "INBOX";
  $folders_especiales->entrada->palabras_outlook = "inbox";

  $folders_especiales->salida = new stdClass();
  $folders_especiales->salida->palabras = "enviados|sent";
  $folders_especiales->salida->palabras_gmail = "SENT";
  $folders_especiales->salida->palabras_outlook = "sentitems";

  $folders_especiales->papelera = new stdClass();
  $folders_especiales->papelera->palabras = "papelera|eliminados|deleted|trash";
  $folders_especiales->papelera->palabras_gmail = "TRASH";
  $folders_especiales->papelera->palabras_outlook = "deleteditems";

  $folders_especiales->nodeseado = new stdClass();
  $folders_especiales->nodeseado->palabras = "no deseado|spam|junk|bulk";
  $folders_especiales->nodeseado->palabras_gmail = "SPAM";
  $folders_especiales->nodeseado->palabras_outlook = "junkemail";

  $folders_especiales->borradores = new stdClass();
  $folders_especiales->borradores->palabras = "borradores|draft";
  $folders_especiales->borradores->palabras_gmail = "DRAFT";
  $folders_especiales->borradores->palabras_outlook = "drafts";

  if (1!=count($cuenta)) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = "No se pudieron obtener los datos del correo.";
    echo json_encode($respuesta);
    $app->stop();
    return;
  }

  switch ($cuenta[0]->servidor) {
    case 'Gmail':
    $respuesta = revisarEstadoGoogleToken(
      $parametros['correo_id'],
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      $respuesta->folders_especiales = $folders_especiales;
      try {
        $tmp_respuesta = obtenerFoldersGmail($parametros['correo_id'], $respuesta->token_acceso, $respuesta->folders_especiales);
        $respuesta->folders = $tmp_respuesta->folders;

        if (0==$tmp_respuesta->num_errores) {
          if (0==count($tmp_respuesta->folders)) {
            $respuesta->estado = false;
            $respuesta->mensaje_error = "No se encontraron carpetas";
            unset($respuesta->folders_especiales);
          }
        }
        else {
          if (0==count($tmp_respuesta->folders)) {
            $respuesta->estado = false;
            $respuesta->mensaje_error = "No se pudieron obtener las carpetas";
            unset($respuesta->folders_especiales);
          }
          else if($tmp_respuesta->num_errores>1) {
            $respuesta->mensaje_error = "No se pudieron obtener ".$tmp_respuesta->num_errores." carpetas";
          }
          else {
            $respuesta->mensaje_error = "No se pudo obtener ".$tmp_respuesta->num_errores." carpeta";
          }
        }

      }
      catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
        unset($respuesta->folders_especiales);
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Outlook':
    $respuesta = revisarEstadoOutlookToken(
      $parametros['correo_id'],
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      $respuesta->folders_especiales = $folders_especiales;
      try {
        $respuesta->folders = obtenerFoldersOutlook($parametros['correo_id'], $cuenta[0]->correo, $respuesta->token_acceso, $respuesta->folders_especiales);
        if (0==count($respuesta->folders)) {
          $respuesta->estado = false;
          $respuesta->mensaje_error = "No se encontraron carpetas";
          unset($respuesta->folders_especiales);
        }
      }
      catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
        unset($respuesta->folders_especiales);
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Otro':
    $respuesta = iniciarSesionImap(
      $cuenta[0]->correo,
      $cuenta[0]->password,
      $cuenta[0]->servidor_imap,
      $cuenta[0]->puerto_imap
    );

    if ($respuesta->estado) {
      $respuesta->folders_especiales = $folders_especiales;
      try {
        $tmp_respuesta = obtenerFolders($parametros['correo_id'], $respuesta->imap, $respuesta->folders_especiales);
        $respuesta->folders = $tmp_respuesta->folders;

        if (0==$tmp_respuesta->num_errores) {
          if (0==count($tmp_respuesta->folders)) {
            $respuesta->estado = false;
            $respuesta->mensaje_error = "No se encontraron carpetas";
            unset($respuesta->folders_especiales);
          }
        }
        else {
          if (0==count($tmp_respuesta->folders)) {
            $respuesta->estado = false;
            $respuesta->mensaje_error = "No se pudieron obtener las carpetas";
            unset($respuesta->folders_especiales);
          }
          else if($tmp_respuesta->num_errores>1) {
            $respuesta->mensaje_error = "No se pudieron obtener ".$tmp_respuesta->num_errores." carpetas";
          }
          else {
            $respuesta->mensaje_error = "No se pudo obtener ".$tmp_respuesta->num_errores." carpeta";
          }
        }

      }
      catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "No se pudieron obtener las carpetas";
        unset($respuesta->folders_especiales);
      }
      unset($respuesta->imap);
    }
    break;

    default:
    break;
  }

  echo json_encode($respuesta);

}

function ObtenerEstadoFoldersPorCuentaWebmail() {

  global $app;
  $respuesta = new stdClass();
  $parametros = $app->request()->params();
  $cuenta = obtenerCredencialesCuentaWebmail($parametros['correo_id']);

  if (1!=count($cuenta)) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = "No se pudieron obtener los datos del correo.";
    echo json_encode($respuesta);
    $app->stop();
    return;
  }

  switch ($cuenta[0]->servidor) {
    case 'Gmail':
    $respuesta = revisarEstadoGoogleToken(
      $parametros['correo_id'],
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        $respuesta->estado_folders = obtenerEstadoFoldersGmail($respuesta->token_acceso);
      }
      catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Outlook':
    $respuesta = revisarEstadoOutlookToken(
      $parametros['correo_id'],
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        $respuesta->estado_folders = obtenerEstadoFoldersOutlook($parametros['correo_id'], $cuenta[0]->correo, $respuesta->token_acceso);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Otro':
    $respuesta = iniciarSesionImap(
      $cuenta[0]->correo,
      $cuenta[0]->password,
      $cuenta[0]->servidor_imap,
      $cuenta[0]->puerto_imap
    );

    if ($respuesta->estado) {
      try {
        $respuesta->estado_folders = obtenerEstadoFolders($parametros['correo_id'], $respuesta->imap);
      }
      catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "No se pudieron obtener las carpetas";
      }
      unset($respuesta->imap);
    }
    break;

    default:
    break;
  }

  echo json_encode($respuesta);

}

function ObtenerMensajesPorFolderWebmail() {
  global $app;
  $respuesta = new stdClass();
  $parametros = $app->request()->params();
  $cuenta = obtenerCredencialesCuentaWebmail($parametros['correo_id']);

  if (1!=count($cuenta)) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = "Error al realizar la petición de los datos del correo.";
    echo json_encode($respuesta);
    $app->stop();
    return;
  }

  switch ($cuenta[0]->servidor) {
    case 'Gmail':
    $respuesta = revisarEstadoGoogleToken(
      $parametros['correo_id'],
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {

        $tmp_respuesta = obtenerMensajesGmail($parametros['folder_id'], $cuenta[0]->correo, $respuesta->token_acceso, $parametros['pagina'], json_decode($parametros['busqueda']));
        $respuesta->mensajes = $tmp_respuesta->mensajes;
        $respuesta->mensajes_novistos = $tmp_respuesta->mensajes_novistos;
        $respuesta->numero_mensajes = $tmp_respuesta->numero_mensajes;
        $respuesta->paginas = $tmp_respuesta->paginas;

        if ($tmp_respuesta->num_errores>0) {
          if (0==count($tmp_respuesta->mensajes)) {
            $respuesta->estado = false;
            $respuesta->mensaje_error = "Error al realizar la petición al servidor.";
          }
          else if($tmp_respuesta->num_errores>1) {
            $respuesta->mensaje_error = "No se pudieron obtener ".$tmp_respuesta->num_errores." mensajes";
          }
          else {
            $respuesta->mensaje_error = "No se pudo obtener ".$tmp_respuesta->num_errores." mensaje";
          }
        }

      } catch (Exception $e) {

        $respuesta->estado = false;

        if ( preg_match("/fueraderango\//", $e->getMessage()) ) {
          $tmp = explode("/", $e->getMessage());
          $respuesta->mensaje_error = "No se encontraron mensajes en el rango seleccionado.";
          $respuesta->paginas = $tmp[1]*1;
        }
        else {
          $respuesta->mensaje_error = "Error: ".$e->getMessage();;
        }

      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Outlook':
    $respuesta = revisarEstadoOutlookToken(
      $parametros['correo_id'],
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {

        $tmp_respuesta = obtenerMensajesOutlook($parametros['folder_id'], $cuenta[0]->correo, $respuesta->token_acceso, $parametros['pagina'], json_decode($parametros['busqueda']));
        $respuesta->mensajes = $tmp_respuesta->mensajes;
        $respuesta->mensajes_novistos = $tmp_respuesta->mensajes_novistos;
        $respuesta->numero_mensajes = $tmp_respuesta->numero_mensajes;
        $respuesta->paginas = $tmp_respuesta->paginas;

        if ($tmp_respuesta->num_errores>0) {
          if (0==count($tmp_respuesta->mensajes)) {
            $respuesta->estado = false;
            $respuesta->mensaje_error = "Error al realizar la petición al servidor.";
          }
          else if($tmp_respuesta->num_errores>1) {
            $respuesta->mensaje_error = "No se pudieron obtener ".$tmp_respuesta->num_errores." mensajes";
          }
          else {
            $respuesta->mensaje_error = "No se pudo obtener ".$tmp_respuesta->num_errores." mensaje";
          }
        }

      } catch (Exception $e) {

        $respuesta->estado = false;

        if ( preg_match("/fueraderango\//", $e->getMessage()) ) {
          $tmp = explode("/", $e->getMessage());
          $respuesta->mensaje_error = "No se encontraron mensajes en el rango seleccionado.";
          $respuesta->paginas = $tmp[1]*1;
        }
        else {
          $respuesta->mensaje_error = "Error: ".$e->getMessage();
        }

      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Otro':
    $respuesta = iniciarSesionImap(
      $cuenta[0]->correo,
      $cuenta[0]->password,
      $cuenta[0]->servidor_imap,
      $cuenta[0]->puerto_imap
    );

    if ($respuesta->estado) {
      try {
        $tmp_respuesta = obtenerMensajes($respuesta->imap, $parametros['folder_id'], $cuenta[0]->correo, $parametros['pagina'], json_decode($parametros['busqueda']));
        $respuesta->mensajes = $tmp_respuesta->mensajes;
        $respuesta->mensajes_novistos = $tmp_respuesta->mensajes_novistos;
        $respuesta->numero_mensajes = $tmp_respuesta->numero_mensajes;
        $respuesta->paginas = $tmp_respuesta->paginas;

        if ($tmp_respuesta->num_errores>0) {
          if (0==count($tmp_respuesta->mensajes)) {
            $respuesta->estado = false;
            $respuesta->mensaje_error = "Error al realizar la petición al servidor.";
          }
          else if($tmp_respuesta->num_errores>1) {
            $respuesta->mensaje_error = "No se pudieron obtener ".$tmp_respuesta->num_errores." mensajes";
          }
          else {
            $respuesta->mensaje_error = "No se pudo obtener ".$tmp_respuesta->num_errores." mensaje";
          }
        }

      } catch (Exception $e) {

        $respuesta->estado = false;

        if ( preg_match("/fueraderango\//", $e->getMessage()) ) {
          $tmp = explode("/", $e->getMessage());
          $respuesta->mensaje_error = "No se encontraron mensajes en el rango seleccionado.";
          $respuesta->paginas = $tmp[1]*1;
        }
        else {
          $respuesta->mensaje_error = "Error al realizar la petición al servidor.";
        }

      }
      unset($respuesta->imap);
    }
    break;

    default:
    break;
  }

  echo json_encode($respuesta);
}

function ObtenerContenidoMensajeWebmail() {
  global $app;
  $respuesta = new stdClass();
  $parametros = $app->request()->params();
  $cuenta = obtenerCredencialesCuentaWebmail($parametros['correo_id']);

  if (1!=count($cuenta)) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = "Error al realizar la petición de los datos del correo.";
    echo json_encode($respuesta);
    $app->stop();
    return;
  }

  switch ($cuenta[0]->servidor) {
    case 'Gmail':
    $respuesta = revisarEstadoGoogleToken(
      $parametros['correo_id'],
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        $respuesta->contenido = obtenerContenidoMensajeGmail($parametros['mensaje_id'], $respuesta->token_acceso);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Outlook':
    $respuesta = revisarEstadoOutlookToken(
      $parametros['correo_id'],
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        $respuesta->contenido = obtenerContenidoMensajeOutlook($parametros['mensaje_id'], $cuenta[0]->correo, $respuesta->token_acceso);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Otro':
    $respuesta = iniciarSesionImap(
      $cuenta[0]->correo,
      $cuenta[0]->password,
      $cuenta[0]->servidor_imap,
      $cuenta[0]->puerto_imap
    );

    if ($respuesta->estado) {
      try {
        $respuesta->contenido = obtenerContenidoMensaje($respuesta->imap, $parametros['ruta_folder'], $parametros['mensaje_id']);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error al realizar la petición al servidor.";
      }
      unset($respuesta->imap);
    }
    break;

    default:
    break;
  }

  echo json_encode($respuesta);
}

function DescargarArchivoAdjuntoWebmail() {

  global $app;
  global $url_webmail_app;
  $parametros = new stdClass();

  $parametros->correo_id = base64_decode($_GET['correo_id']);
  $parametros->ruta_folder = base64_decode($_GET["ruta_folder"]);
  $parametros->mensaje_id = base64_decode($_GET["mensaje_id"]);
  $parametros->adjunto_id = base64_decode($_GET["adjunto_id"]);
  $parametros->nombre_archivo = base64_decode($_GET["nombre_archivo"]);
  $parametros->tipo_archivo = base64_decode($_GET["tipo_archivo"]);

  $cuenta = obtenerCredencialesCuentaWebmail($parametros->correo_id);

  if (1!=count($cuenta)) {
    $_SESSION['ErrorWebmail'] = 'No se pudo descargar el archivo adjunto';
    header("Location: ".$url_webmail_app);
    exit();
  }

  switch ($cuenta[0]->servidor) {
    case 'Gmail':
    $respuesta = revisarEstadoGoogleToken(
      $parametros->correo_id,
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        descargarArchivoAdjuntoGmail($parametros->mensaje_id, $respuesta->token_acceso, $parametros->adjunto_id, $parametros->nombre_archivo, $parametros->tipo_archivo);
      } catch (Exception $e) {
        $_SESSION['ErrorWebmail'] = 'No se pudo descargar el archivo adjunto';
        header("Location: ".$url_webmail_app);
        exit();
      }
    }
    break;

    case 'Outlook':
    $respuesta = revisarEstadoOutlookToken(
      $parametros->correo_id,
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        descargarArchivoAdjuntoOutlook($parametros->mensaje_id, $cuenta[0]->correo, $respuesta->token_acceso, $parametros->adjunto_id, $parametros->nombre_archivo, $parametros->tipo_archivo);
      } catch (Exception $e) {
        $_SESSION['ErrorWebmail'] = 'No se pudo descargar el archivo adjunto';
        header("Location: ".$url_webmail_app);
        exit();
      }
    }
    break;

    case 'Otro':
    $respuesta = iniciarSesionImap(
      $cuenta[0]->correo,
      $cuenta[0]->password,
      $cuenta[0]->servidor_imap,
      $cuenta[0]->puerto_imap
    );

    if ($respuesta->estado) {
      try {
        descargarArchivoAdjunto($respuesta->imap, $parametros->ruta_folder, $parametros->mensaje_id, $parametros->adjunto_id, $parametros->nombre_archivo, $parametros->tipo_archivo);
      } catch (Exception $e) {
        $_SESSION['ErrorWebmail'] = 'No se pudo descargar el archivo adjunto';
        header("Location: ".$url_webmail_app);
        exit();
      }
    }
    break;

    default:
    break;
  }

}

function ObtenerIdArchivoAdjuntoWebmail() {

  $respuesta = new stdClass();

  try {
    $respuesta->estado = true;
    $nombre_archivo = $_SESSION['UsuarioId']."-".time()."-".uniqid();
    $respuesta->id = $nombre_archivo;
  } catch (Exception $e) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = "Error al crear el identificador";
  }

  echo json_encode($respuesta);

}

function AlmacenarArchivoAdjuntoWebmail() {

  global $app;
  global $directorio_adjuntos;
  $respuesta = new stdClass();
  $nombre_archivo = $_POST['nombre_archivo'];

  try {

    if (!is_uploaded_file($_FILES['archivo']['tmp_name'])) {
      $respuesta->estado = false;
      $respuesta->mensaje_error = 'Error al cargar';
      echo json_encode($respuesta);
      $app->stop();
      return;
    }

    if($_FILES['archivo']['error']>0){
      $respuesta->estado = false;
      $respuesta->mensaje_error = 'Error de lectura';
      echo json_encode($respuesta);
      $app->stop();
      return;
    }

    $respuesta->tipo = $_FILES['archivo']['type'];

    $carpeta = __DIR__.$directorio_adjuntos."/".$_SESSION['UsuarioId'];

    if (!file_exists($carpeta)) {
      mkdir($carpeta, 0755);
    }

    $ruta = $carpeta."/".$nombre_archivo;

    if (is_file($ruta)) {
      $respuesta->estado = false;
      $respuesta->mensaje_error = 'Error al cargar';
      echo json_encode($respuesta);
      $app->stop();
      return;
    }

    move_uploaded_file($_FILES['archivo']['tmp_name'], $ruta);

    if (is_file($ruta)) {
      $respuesta->estado = true;
    } else {
      $respuesta->estado = false;
      $respuesta->mensaje_error = 'Error al cargar';
    }

  } catch (Exception $e) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = 'Error al cargar';
  }


  echo json_encode($respuesta);
}

function EliminarArchivoAdjuntoWebmail() {

  global $app;
  global $directorio_adjuntos;
  $respuesta = new stdClass();
  $nombre_archivo = $app->request()->getBody();
  $ruta = __DIR__.$directorio_adjuntos."/".$_SESSION['UsuarioId']."/".$nombre_archivo;

  if (is_file($ruta)) {
    if (unlink($ruta)) {
      $respuesta->estado = true;
    } else {
      $respuesta->estado = false;
      $respuesta->mensaje_error = 'Error de lectura';
    }
  } else {
    $respuesta->estado = true;
  }

  echo json_encode($respuesta);

}

function EnviarMensajeWebmail() {

  global $app;
  global $directorio_adjuntos;
  $respuesta = new stdClass();
  $respuesta->estado = true;
  $adjuntos_noalmacenados = new stdClass();
  $datos = json_decode($app->request()->getBody());
  $cuenta = obtenerCredencialesCuentaWebmail($datos->remitente_id);

  if (1!=count($cuenta)) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = "Error al realizar la petición de los datos del correo.";;
    echo json_encode($respuesta);
    $app->stop();
    return;
  }


  if ('nuevo' != $datos->operacion) {

    switch ($cuenta[0]->servidor) {
      case 'Gmail':
      $respuesta = revisarEstadoGoogleToken(
        $datos->remitente_id,
        $cuenta[0]->token_acceso,
        $cuenta[0]->token_renovacion,
        $cuenta[0]->expiracion,
        $cuenta[0]->tiempo_registro
      );

      if (!$respuesta->estado) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
        unset($respuesta->token_acceso);
        echo json_encode($respuesta);
        $app->stop();
        return;
      }
      break;

      case 'Outlook':
      $respuesta = revisarEstadoOutlookToken(
        $datos->remitente_id,
        $cuenta[0]->token_acceso,
        $cuenta[0]->token_renovacion,
        $cuenta[0]->expiracion,
        $cuenta[0]->tiempo_registro
      );

      if (!$respuesta->estado) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
        unset($respuesta->token_acceso);
        echo json_encode($respuesta);
        $app->stop();
        return;
      }
      break;

      case 'Otro':
      $respuesta = iniciarSesionImap(
        $cuenta[0]->correo,
        $cuenta[0]->password,
        $cuenta[0]->servidor_imap,
        $cuenta[0]->puerto_imap
      );

      if (!$respuesta->estado) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error de IMAP";
        unset($respuesta->imap);
        echo json_encode($respuesta);
        $app->stop();
        return;
      }
      break;

      default:
      break;
    }

    try {

      switch ($cuenta[0]->servidor) {
        case 'Gmail':
        $adjuntos_noalmacenados = obtenerArchivoAdjuntoDeMensajeGmail($datos->mensaje_anterior->id, $cuenta[0]->token_acceso, $datos->adjuntos, $datos->adjuntos_enlinea);
        break;
        case 'Outlook':
        $adjuntos_noalmacenados = obtenerArchivoAdjuntoDeMensajeOutlook($datos->mensaje_anterior->id, $cuenta[0]->correo, $cuenta[0]->token_acceso);
        break;
        default:
        $adjuntos_noalmacenados = obtenerArchivoAdjuntoDeMensaje($respuesta->imap, $datos->mensaje_anterior->ruta_id, $datos->mensaje_anterior->id);
        break;
      }

    } catch (Exception $e) {
      $respuesta = new stdClass();
      $respuesta->estado = false;
      $respuesta->mensaje_error = "Error de IMAP";
      echo json_encode($respuesta);
      $app->stop();
      return;
    }

  }


  for ($a=0; $a < count($datos->adjuntos); $a++) {

    if (!isset($datos->adjuntos[$a]->noalmacenado)) {

      $ruta = __DIR__.$directorio_adjuntos."/".$_SESSION['UsuarioId']."/".$datos->adjuntos[$a]->id;

      try {
        $datos->adjuntos[$a]->contenido = file_get_contents($ruta);
        unlink($ruta);
      } catch (Exception $e) {
        $respuesta = new stdClass();
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error de almacenamiento";
        break;
      }

    }
    else{

      try {
        $tmp_id = $datos->adjuntos[$a]->id;
        $datos->adjuntos[$a]->contenido = base64_decode($adjuntos_noalmacenados->{$tmp_id});
      } catch (Exception $e) {
        $respuesta = new stdClass();
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error de almacenamiento";
        break;
      }
    }

  }


  if (!$respuesta->estado) {
    echo json_encode($respuesta);
    $app->stop();
    return;
  }


  for ($a=0; $a < count($datos->adjuntos_enlinea); $a++) {

    if (!isset($datos->adjuntos_enlinea[$a]->noalmacenado)) {

      $ruta = __DIR__.$directorio_adjuntos."/".$_SESSION['UsuarioId']."/".$datos->adjuntos_enlinea[$a]->id;

      try {
        $datos->adjuntos_enlinea[$a]->contenido = file_get_contents($ruta);
        unlink($ruta);
      } catch (Exception $e) {
        $respuesta = new stdClass();
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error de almacenamiento";
        break;
      }

    }
    else {
      try {
        $tmp_id = $datos->adjuntos_enlinea[$a]->id;
        $datos->adjuntos_enlinea[$a]->contenido = base64_decode($adjuntos_noalmacenados->{$tmp_id});
      } catch (Exception $e) {
        $respuesta = new stdClass();
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error de almacenamiento";
        break;
      }
    }

  }

  if (!$respuesta->estado) {
    echo json_encode($respuesta);
    $app->stop();
    return;
  }

  switch ($cuenta[0]->servidor) {
    case 'Gmail':
    $respuesta = revisarEstadoGoogleToken(
      $datos->remitente_id,
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        enviarMensajeGmail($cuenta[0]->correo, $cuenta[0]->nombre, $respuesta->token_acceso, $datos);
        $respuesta->estado = true;
      }
      catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Outlook':
    $respuesta = revisarEstadoOutlookToken(
      $datos->remitente_id,
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        enviarMensajeOutlook($cuenta[0]->correo, $respuesta->token_acceso, $datos);
        $respuesta->estado = true;
      }
      catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Otro':
    $respuesta = iniciarSesionSmtp(
      $cuenta[0]->correo,
      $cuenta[0]->password,
      $cuenta[0]->servidor_smtp,
      $cuenta[0]->puerto_smtp
    );

    if ($respuesta->estado) {
      try {

        enviarMensaje($cuenta[0]->correo, $cuenta[0]->nombre, $respuesta->smtp, $datos);

        $tmp_respuesta = almacenarMensajeEnServidor(
          $cuenta[0]->correo,
          $cuenta[0]->nombre,
          $cuenta[0]->password,
          $cuenta[0]->servidor_imap,
          $cuenta[0]->puerto_imap,
          $datos
        );

        if (!$tmp_respuesta->estado) {
          $respuesta->mensaje_error = "El mensaje se ha enviado, pero no pudo ser almacenado en la carpeta 'enviados' del servidor.";
        }

        $respuesta->estado = true;

      }
      catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error de SMTP";
      }

      unset($respuesta->smtp);
    }
    break;

    default:
    break;
  }

  if ($respuesta->estado) {
    agregarContactosBD($datos->remitente_id, $datos->nuevos_contactos);
  }

  echo json_encode($respuesta);

}

function AlmacenarCredencialesCorreoWebmail() {

  global $app;
  $respuesta = new stdClass();
  $parametros = json_decode($app->request()->getBody());

  $respuesta = comprobarCredencialesCorreoWebmail($parametros);

  if ($respuesta->estado) {
    $respuesta = agregarCredencialesCorreoBD($parametros);
  }

  echo json_encode($respuesta);
}

function EliminarMensajeWebmail() {
  global $app;
  $respuesta = new stdClass();
  $parametros = json_decode($app->request()->getBody());
  $cuenta = obtenerCredencialesCuentaWebmail($parametros->correo_id);

  if (1!=count($cuenta)) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = "Error al realizar la petición de los datos del correo.";
    echo json_encode($respuesta);
    $app->stop();
    return;
  }

  switch ($cuenta[0]->servidor) {
    case 'Gmail':
    $respuesta = revisarEstadoGoogleToken(
      $parametros->correo_id,
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        eliminarMensajeGmail($parametros->mensaje_id, $respuesta->token_acceso, $parametros->papelera_id);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Outlook':
    $respuesta = revisarEstadoOutlookToken(
      $parametros->correo_id,
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        eliminarMensajeOutlook($parametros->mensaje_id, $cuenta[0]->correo, $respuesta->token_acceso, $parametros->papelera_id);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Otro':
    $respuesta = iniciarSesionImap(
      $cuenta[0]->correo,
      $cuenta[0]->password,
      $cuenta[0]->servidor_imap,
      $cuenta[0]->puerto_imap
    );

    if ($respuesta->estado) {
      try {
        eliminarMensaje($respuesta->imap, $parametros->ruta_folder, $parametros->mensaje_id, $parametros->papelera_id);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error al realizar la petición al servidor.";
      }
      unset($respuesta->imap);
    }
    break;

    default:
    break;
  }

  echo json_encode($respuesta);
}

function MoverMensajeWebmail() {
  global $app;
  $respuesta = new stdClass();
  $parametros = json_decode($app->request()->getBody());
  $cuenta = obtenerCredencialesCuentaWebmail($parametros->correo_id);

  if (1!=count($cuenta)) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = "Error al realizar la petición de los datos del correo.";
    echo json_encode($respuesta);
    $app->stop();
    return;
  }

  switch ($cuenta[0]->servidor) {
    case 'Gmail':
    $respuesta = revisarEstadoGoogleToken(
      $parametros->correo_id,
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        moverMensajeGmail($parametros->mensaje_id, $respuesta->token_acceso, $parametros->ruta_folder, $parametros->destino_id);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Outlook':
    $respuesta = revisarEstadoOutlookToken(
      $parametros->correo_id,
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        moverMensajeOutlook($parametros->mensaje_id, $cuenta[0]->correo, $respuesta->token_acceso, $parametros->destino_id);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Otro':
    $respuesta = iniciarSesionImap(
      $cuenta[0]->correo,
      $cuenta[0]->password,
      $cuenta[0]->servidor_imap,
      $cuenta[0]->puerto_imap
    );

    if ($respuesta->estado) {
      try {
        moverMensaje($respuesta->imap, $parametros->ruta_folder, $parametros->mensaje_id, $parametros->destino_id);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error al realizar la petición al servidor.";
      }
      unset($respuesta->imap);
    }
    break;

    default:
    break;
  }

  echo json_encode($respuesta);
}

function MarcarMensajesComoLeidosWebmail() {
  global $app;
  $respuesta = new stdClass();
  $parametros = json_decode($app->request()->getBody());
  $cuenta = obtenerCredencialesCuentaWebmail($parametros->correo_id);

  if (1!=count($cuenta)) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = "Error al realizar la petición de los datos del correo.";
    echo json_encode($respuesta);
    $app->stop();
    return;
  }

  switch ($cuenta[0]->servidor) {
    case 'Gmail':
    $respuesta = revisarEstadoGoogleToken(
      $parametros->correo_id,
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        $respuesta->ids = marcarMensajesComoLeidosGmail($parametros->mensajes_id, $respuesta->token_acceso);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Outlook':
    $respuesta = revisarEstadoOutlookToken(
      $parametros->correo_id,
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        $respuesta->ids = marcarMensajesComoLeidosOutlook($parametros->mensajes_id, $cuenta[0]->correo, $respuesta->token_acceso);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Otro':
    $respuesta = iniciarSesionImap(
      $cuenta[0]->correo,
      $cuenta[0]->password,
      $cuenta[0]->servidor_imap,
      $cuenta[0]->puerto_imap
    );

    if ($respuesta->estado) {
      try {
        $respuesta->ids = marcarMensajesComoLeidos($respuesta->imap, $parametros->ruta_folder, $parametros->mensajes_id);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error al realizar la petición al servidor.";
      }
      unset($respuesta->imap);
    }
    break;

    default:
    break;
  }

  echo json_encode($respuesta);
}

function EliminarMensajesWebmail() {
  global $app;
  $respuesta = new stdClass();
  $parametros = json_decode($app->request()->getBody());
  $cuenta = obtenerCredencialesCuentaWebmail($parametros->correo_id);

  if (1!=count($cuenta)) {
    $respuesta->estado = false;
    $respuesta->mensaje_error = "Error al realizar la petición de los datos del correo.";
    echo json_encode($respuesta);
    $app->stop();
    return;
  }

  switch ($cuenta[0]->servidor) {
    case 'Gmail':
    $respuesta = revisarEstadoGoogleToken(
      $parametros->correo_id,
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        $respuesta->ids = eliminarMensajesGmail($parametros->mensajes_id, $respuesta->token_acceso, $parametros->papelera_id);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Outlook':
    $respuesta = revisarEstadoOutlookToken(
      $parametros->correo_id,
      $cuenta[0]->token_acceso,
      $cuenta[0]->token_renovacion,
      $cuenta[0]->expiracion,
      $cuenta[0]->tiempo_registro
    );

    if ($respuesta->estado) {
      try {
        $respuesta->ids = eliminarMensajesOutlook($parametros->mensajes_id, $cuenta[0]->correo, $respuesta->token_acceso, $parametros->papelera_id);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error: ".$e->getMessage();
      }
      unset($respuesta->token_acceso);
    }
    break;

    case 'Otro':
    $respuesta = iniciarSesionImap(
      $cuenta[0]->correo,
      $cuenta[0]->password,
      $cuenta[0]->servidor_imap,
      $cuenta[0]->puerto_imap
    );

    if ($respuesta->estado) {
      try {
        $respuesta->ids = eliminarMensajes($respuesta->imap, $parametros->ruta_folder, $parametros->mensajes_id, $parametros->papelera_id);
      } catch (Exception $e) {
        $respuesta->estado = false;
        $respuesta->mensaje_error = "Error al realizar la petición al servidor.";
      }
      unset($respuesta->imap);
    }
    break;

    default:
    break;
  }

  echo json_encode($respuesta);
}

?>
