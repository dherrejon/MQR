<?php

function EnviarSolicitudAmistad() {

  global $app;
  $parametros = json_decode($app->request()->getBody());
  $respuesta = new stdClass();

  $db=null;

  $sql = "SELECT Aceptada FROM Amistad WHERE UsuarioIdRemitente = :usuarioIdRemitente AND UsuarioIdDestinatario = :usuarioIdDestinatario";

  try {

    $db = getConnection();
    $db->beginTransaction();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuarioIdRemitente', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':usuarioIdDestinatario', $parametros->destinatario_id);
    $sentencia->execute();
    $resultado_bd = $sentencia->fetchAll(PDO::FETCH_OBJ);

    if ( count($resultado_bd) > 0 ) {

      if (1 == $resultado_bd[0]->Aceptada) {
        $respuesta->estado = 'aceptada';
      }
      else {
        $respuesta->estado = 'enviada';
      }

      $db->rollBack();
      $db = null;
      echo json_encode($respuesta);
      $app->stop();
      return;

    }
    else {

      $sql = "SELECT AmistadId, Aceptada, UsuarioIdRemitente FROM Amistad WHERE UsuarioIdDestinatario = :usuarioIdDestinatario AND UsuarioIdRemitente = :usuarioIdRemitente";

      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':usuarioIdDestinatario', $_SESSION['UsuarioId']);
      $sentencia->bindParam(':usuarioIdRemitente', $parametros->destinatario_id);
      $sentencia->execute();
      $resultado_bd = $sentencia->fetchAll(PDO::FETCH_OBJ);

      if ( count($resultado_bd)>0 ) {

        if (1 == $resultado_bd[0]->Aceptada) {
          $respuesta->estado = 'aceptada';
        }
        else {
          $respuesta->estado = 'recibida';
          $respuesta->AmistadId = $resultado_bd[0]->AmistadId;
          $respuesta->UsuarioIdRemitente = $resultado_bd[0]->UsuarioIdRemitente;
        }

        $db->rollBack();
        $db = null;
        echo json_encode($respuesta);
        $app->stop();
        return;
      }

    }

    $sql = "INSERT INTO Amistad (UsuarioIdRemitente, UsuarioIdDestinatario, Aceptada) VALUES (:usuarioIdRemitente, :usuarioIdDestinatario, 0)";

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuarioIdRemitente', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':usuarioIdDestinatario', $parametros->destinatario_id);
    $sentencia->execute();

    if ($sentencia->rowCount() > 0) {

      $datos = new stdClass();
      $datos->destinatario_id = $parametros->destinatario_id;
      $datos->elemento_id = $db->lastInsertId();
      $datos->tipo = 'amistad';
      $datos->operacion = 'nueva_solicitud';
      $datos->mensaje = 'Te ha enviado una solicitud de amistad';

      $respuesta_bd = almacenarNotificacion($datos, $db);

      if ($respuesta_bd->estado) {

        $db->commit();
        $db = null;

        $respuesta_emision = emitirNotificacionAUsuario($respuesta_bd->datos);
        $respuesta->estado = true;

        if ($respuesta_emision->estado) {
          $respuesta->clase = 'success';
          $respuesta->mensaje = "La solicitud de amistad se ha enviado correctamente.";
        }
        else {
          $respuesta->clase = 'warning';
          $respuesta->mensaje = "La solicitud de amistad se ha enviado, pero no fue posible notificar al usuario.";
        }

      }
      else {

        $db->rollBack();
        $db = null;
        $respuesta->estado = false;
        $respuesta->clase = "danger";
        $respuesta->mensaje = "No fue posible enviar la solicitud de amistad. Intenta nuevamente.";

      }

    }
    else {
      $db->rollBack();
      $db = null;
      $respuesta->estado = false;
      $respuesta->clase = "danger";
      $respuesta->mensaje = "No fue posible enviar la solicitud de amistad. Intenta nuevamente.";
    }

    echo json_encode($respuesta);

  } catch(PDOException $e) {
    $db->rollBack();
    $db=null;
    $app->status(409);
    $app->stop();
  }

}

function ConsultarSolicitudAmistad() {

  global $app;
  $parametros = $app->request()->params();
  $respuesta = new stdClass();

  $sql = "SELECT Aceptada FROM Amistad WHERE UsuarioIdRemitente = :usuarioIdRemitente AND UsuarioIdDestinatario = :usuarioIdDestinatario";
  $db = null;

  try
  {
    $db = getConnection();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuarioIdRemitente', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':usuarioIdDestinatario', $parametros['destinatario_id']);
    $sentencia->execute();
    $resultado_bd = $sentencia->fetchAll(PDO::FETCH_OBJ);

    if ( count($resultado_bd) > 0 ) {

      if (1 == $resultado_bd[0]->Aceptada) {
        $respuesta->estado = 'aceptada';
      }
      else {
        $respuesta->estado = 'enviada';
      }

    }
    else {

      $sql = "SELECT AmistadId, Aceptada, UsuarioIdRemitente FROM Amistad WHERE UsuarioIdRemitente = :usuarioIdRemitente AND UsuarioIdDestinatario = :usuarioIdDestinatario";

      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':usuarioIdRemitente', $parametros['destinatario_id']);
      $sentencia->bindParam(':usuarioIdDestinatario', $_SESSION['UsuarioId']);
      $sentencia->execute();
      $resultado_bd = $sentencia->fetchAll(PDO::FETCH_OBJ);

      if ( count($resultado_bd) > 0 ) {
        if (1 == $resultado_bd[0]->Aceptada) {
          $respuesta->estado = 'aceptada';
        }
        else {
          $respuesta->estado = 'recibida';
          $respuesta->AmistadId = $resultado_bd[0]->AmistadId;
          $respuesta->UsuarioIdRemitente = $resultado_bd[0]->UsuarioIdRemitente;
        }
      }
      else {
        $respuesta->estado = 'noenviada';
      }

    }

    $db = null;

    echo json_encode($respuesta);
  }
  catch(PDOException $e)
  {
    $db=null;
    $app->status(409);
    $app->stop();
  }

}

function ObtenerSolicitudesEnviadas() {

  global $app;
  $respuesta = new stdClass();

  $sql = "SELECT SolicitudId, NombreUsuarioDestinatario, ApellidosUsuarioDestinatario, CorreoDestinatario, UsuarioIdDestinatario FROM VistaSolicitudAmistadEnviada WHERE UsuarioIdRemitente = :usuarioIdRemitente AND Aceptada = 0 ORDER BY SolicitudId DESC";
  $db = null;

  try
  {
    $db = getConnection();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuarioIdRemitente', $_SESSION['UsuarioId']);
    $sentencia->execute();
    $respuesta = $sentencia->fetchAll(PDO::FETCH_OBJ);
    $db = null;

    echo json_encode($respuesta);
  }
  catch(PDOException $e)
  {
    $db=null;
    $app->status(409);
    $app->stop();
  }

}

function ObtenerSolicitudesRecibidas() {

  global $app;
  $respuesta = new stdClass();

  $sql = "SELECT SolicitudId, NombreUsuarioRemitente, ApellidosUsuarioRemitente, CorreoRemitente, UsuarioIdRemitente FROM VistaSolicitudAmistadRecibida WHERE UsuarioIdDestinatario = :usuarioIdDestinatario AND Aceptada = 0 ORDER BY SolicitudId DESC";
  $db = null;

  try
  {
    $db = getConnection();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuarioIdDestinatario', $_SESSION['UsuarioId']);
    $sentencia->execute();
    $respuesta = $sentencia->fetchAll(PDO::FETCH_OBJ);
    $db = null;

    echo json_encode($respuesta);
  }
  catch(PDOException $e)
  {
    $db=null;
    $app->status(409);
    $app->stop();
  }

}

function ObtenerSolicitudRecibida() {

  global $app;
  $respuesta = new stdClass();
  $parametros = $app->request()->params();

  $sql = "SELECT SolicitudId, NombreUsuarioRemitente, ApellidosUsuarioRemitente, CorreoRemitente, UsuarioIdRemitente FROM VistaSolicitudAmistadRecibida WHERE UsuarioIdDestinatario = :usuarioIdDestinatario AND Aceptada = 0 AND SolicitudId = :solicitud_id";
  $db = null;

  try
  {
    $db = getConnection();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuarioIdDestinatario', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':solicitud_id', $parametros['solicitud_id']);
    $sentencia->execute();
    $respuesta = $sentencia->fetchAll(PDO::FETCH_OBJ);
    $db = null;

    echo json_encode($respuesta);
  }
  catch(PDOException $e)
  {
    $db=null;
    $app->status(409);
    $app->stop();
  }

}

function ObtenerListaAmigos() {

  global $app;
  $respuesta = new stdClass();

  $sql = "SELECT SolicitudId, NombreUsuarioRemitente AS NombreUsuario, ApellidosUsuarioRemitente AS ApellidosUsuario, CorreoRemitente AS CorreoUsuario, UsuarioIdRemitente AS AmigoId FROM VistaSolicitudAmistadRecibida WHERE UsuarioIdDestinatario = :usuarioIdDestinatario AND Aceptada = 1 UNION ALL SELECT SolicitudId, NombreUsuarioDestinatario AS NombreUsuario, ApellidosUsuarioDestinatario AS ApellidosUsuario, CorreoDestinatario AS CorreoUsuario, UsuarioIdDestinatario AS AmigoId FROM VistaSolicitudAmistadEnviada WHERE UsuarioIdRemitente = :usuarioIdRemitente AND Aceptada = 1 ORDER BY NombreUsuario ASC, ApellidosUsuario ASC";
  $db = null;

  try
  {
    $db = getConnection();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuarioIdDestinatario', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':usuarioIdRemitente', $_SESSION['UsuarioId']);
    $sentencia->execute();
    $respuesta = $sentencia->fetchAll(PDO::FETCH_OBJ);
    $db = null;

    echo json_encode($respuesta);
  }
  catch(PDOException $e)
  {
    $db=null;
    $app->status(409);
    $app->stop();
  }

}

function ObtenerDatosAmigo() {

  global $app;
  $parametros = $app->request()->params();
  $respuesta = new stdClass();

  $sql = "SELECT SolicitudId, NombreUsuarioDestinatario AS NombreUsuario, ApellidosUsuarioDestinatario AS ApellidosUsuario, CorreoDestinatario AS CorreoUsuario, UsuarioIdDestinatario AS AmigoId FROM VistaSolicitudAmistadEnviada WHERE UsuarioIdRemitente = :usuarioIdRemitente AND Aceptada = 1 AND SolicitudId = :solicitud_id";
  $db = null;

  try
  {
    $db = getConnection();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuarioIdRemitente', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':solicitud_id', $parametros['solicitud_id']);
    $sentencia->execute();
    $respuesta = $sentencia->fetchAll(PDO::FETCH_OBJ);
    $db = null;

    echo json_encode($respuesta);
  }
  catch(PDOException $e)
  {
    $db=null;
    $app->status(409);
    $app->stop();
  }

}

function AceptarSolicitudAmistad() {

  global $app;
  $parametros = json_decode($app->request()->getBody());
  $respuesta = new stdClass();

  $db=null;
  $sql = "UPDATE Amistad SET Aceptada = 1 WHERE AmistadId = :amistadId";

  try {

    $db = getConnection();
    $db->beginTransaction();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':amistadId', $parametros->solicitud_id);
    $sentencia->execute();

    if ($sentencia->rowCount() > 0) {

      $datos = new stdClass();
      $datos->destinatario_id = $parametros->destinatario_id;
      $datos->elemento_id = $parametros->solicitud_id;
      $datos->tipo = 'amistad';
      $datos->operacion = 'solicitud_aceptada';
      $datos->mensaje = 'Ha aceptado tu solicitud de amistad';

      $respuesta_bd = almacenarNotificacion($datos, $db);

      if ($respuesta_bd->estado) {

        $db->commit();
        $db = null;

        $respuesta_emision = emitirNotificacionAUsuario($respuesta_bd->datos);
        $respuesta->estado = true;

        if ($respuesta_emision->estado) {
          $respuesta->clase = 'success';
          $respuesta->mensaje = "La solicitud de amistad se ha confirmado correctamente.";
        }
        else {
          $respuesta->clase = 'warning';
          $respuesta->mensaje = "La solicitud de amistad se ha confirmado, pero no fue posible notificar al usuario.";
        }


      }
      else {

        $db->rollBack();
        $db = null;
        $respuesta->estado = false;
        $respuesta->clase = "danger";
        $respuesta->mensaje = "No se pudo confirmar la solicitud de amistad. Intenta nuevamente.";

      }

    }
    else {
      $db->rollBack();
      $db=null;
      $respuesta->estado = false;
      $respuesta->clase = "danger";
      $respuesta->mensaje = "No se pudo confirmar la solicitud de amistad. Intenta nuevamente.";
    }

    echo json_encode($respuesta);

  } catch(PDOException $e) {
    $db->rollBack();
    $db=null;
    $app->status(409);
    $app->stop();
  }

}

function CancelarSolicitudAmistad() {

  global $app;
  $parametros = json_decode($app->request()->getBody());
  $respuesta = new stdClass();

  $db=null;
  $sql = "DELETE FROM Amistad WHERE AmistadId = :amistadId";

  try {

    $db = getConnection();
    $db->beginTransaction();
    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':amistadId', $parametros->solicitud_id);
    $sentencia->execute();

    if ($sentencia->rowCount() > 0) {

      $datos = new stdClass();
      $datos->destinatario_id = $parametros->destinatario_id;
      $datos->elemento_id = $parametros->solicitud_id;
      $datos->tipo = 'amistad';

      if ($parametros->solicitud_recibida) {
        $datos->operacion = 'solicitud_rechazada';
        $datos->mensaje = 'Ha rechazado tu solicitud de amistad';
      }
      else {
        $datos->operacion = 'solicitud_cancelada';
        $datos->mensaje = 'Ha cancelado su solicitud de amistad';
      }

      $respuesta_bd = almacenarNotificacion($datos, $db);

      if ($respuesta_bd->estado) {

        $db->commit();
        $db = null;

        $respuesta_emision = emitirNotificacionAUsuario($respuesta_bd->datos);
        $respuesta->estado = true;

        if ($respuesta_emision->estado) {
          $respuesta->clase = 'success';
          $respuesta->mensaje = ($parametros->solicitud_recibida) ? "La solicitud de amistad se ha rechazado correctamente." : "La solicitud de amistad se ha cancelado correctamente.";
        }
        else {
          $respuesta->clase = 'warning';
          $respuesta->mensaje = ($parametros->solicitud_recibida) ? "La solicitud de amistad se ha rechazado, pero no fue posible notificar al usuario." : "La solicitud de amistad se ha cancelado, pero no fue posible notificar al usuario.";
        }

      }
      else {

        $db->rollBack();
        $db = null;

        $respuesta->estado = false;
        $respuesta->clase = "danger";
        $respuesta->mensaje = ($parametros->solicitud_recibida) ? "No se pudo rechazar la solicitud de amistad. Intenta nuevamente." : "No se pudo cancelar la solicitud de amistad. Intenta nuevamente.";

      }

    }
    else {

      $db->rollBack();
      $db = null;

      $respuesta->estado = false;
      $respuesta->clase = "danger";
      $respuesta->mensaje = ($parametros->solicitud_recibida) ? "No se pudo rechazar la solicitud de amistad. Intenta nuevamente." : "No se pudo cancelar la solicitud de amistad. Intenta nuevamente.";

    }

    echo json_encode($respuesta);

  } catch(PDOException $e) {
    $db->rollBack();
    $db = null;
    $app->status(409);
    $app->stop();
  }

}

function EliminarAmigo() {

  global $app;
  $parametros = json_decode($app->request()->getBody());
  $respuesta = new stdClass();

  $db=null;
  $sql = "DELETE FROM Amistad WHERE AmistadId = :amistadId";

  try {

    $db = getConnection();
    $db->beginTransaction();
    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':amistadId', $parametros->solicitud_id);
    $sentencia->execute();

    if ($sentencia->rowCount() > 0) {

      $db->commit();
      $db = null;

      $respuesta->estado = true;
      $respuesta->clase = 'success';
      $respuesta->mensaje = "El amigo se ha eliminado de tu lista correctamente.";

    }
    else {

      $db->rollBack();
      $db = null;

      $respuesta->estado = false;
      $respuesta->clase = "danger";
      $respuesta->mensaje = "No se pudo eliminar el amigo de tu lista.";

    }

    echo json_encode($respuesta);

  } catch(PDOException $e) {
    $db->rollBack();
    $db = null;
    $app->status(409);
    $app->stop();
  }

}

function verificarAmistad($amistad_id, $db) {

  global $app;
  $respuesta = new stdClass();

  $sql = "SELECT AmistadId FROM Amistad WHERE AmistadId = :amistad_id AND Aceptada = 1 AND (UsuarioIdRemitente = :usuario_id OR UsuarioIdDestinatario = :usuario_id)";

  try
  {
    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':amistad_id', $amistad_id);
    $sentencia->bindParam(':usuario_id', $_SESSION['UsuarioId']);
    $sentencia->execute();
    $respuesta_bd = $sentencia->fetchAll(PDO::FETCH_OBJ);

    if ( count($respuesta_bd) > 0 ) {
      $respuesta->estado = true;
    }
    else {
      $respuesta->estado = false;
    }

  }
  catch(PDOException $e)
  {
    $respuesta->estado = false;
  }

  return $respuesta;

}

?>
