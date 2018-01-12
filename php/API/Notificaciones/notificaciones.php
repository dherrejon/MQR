<?php

require_once __DIR__ . '/elephant-io/vendor/autoload.php';
use ElephantIO\Client;
use ElephantIO\Engine\SocketIO\Version1X;

function emitirNotificacionAUsuario($datos) {

  $respuesta = new stdClass();

  try {

    $client = new Client(new Version1X('http://localhost:4040'));

    $client->initialize();

    $client->emit('authenticate', ['token' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c3IiOiJhcGkiLCJpYXQiOjE0ODY1MjAzMzJ9.L2tdqH1t8_fqt2KXhe24AtPU04G_U5RADuqgK2sjoVk']);

    $client->emit('emitir_notificacion', $datos);

    $client->close();

    $respuesta->estado = true;

  } catch (Exception $e) {

    $respuesta->estado = false;

  }

  return $respuesta;

}

function almacenarNotificacion($datos, $db) {

  global $app;
  $respuesta = new stdClass();

  $datos->fecha = date("Y-m-d H:i:s");

  $sql = "SELECT CONCAT(Nombre, ' ', Apellidos) AS NombreRemitente FROM Usuario WHERE UsuarioId = :usuarioId";

  try {

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuarioId', $_SESSION['UsuarioId']);
    $sentencia->execute();
    $resultado_bd = $sentencia->fetchAll(PDO::FETCH_OBJ);

    if (count($resultado_bd) > 0) {

      $datos->nombre_remitente = $resultado_bd[0]->NombreRemitente;

      $sql = "INSERT INTO Notificacion (DestinatarioId, ElementoId, NoLeida, NombreRemitente, Tipo, Operacion, Fecha, Mensaje) VALUES (:destinatarioId, :elementoId, 1, :nombreRemitente, :tipo, :operacion, :fecha, :mensaje)";

      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':destinatarioId', $datos->destinatario_id);
      $sentencia->bindParam(':elementoId', $datos->elemento_id);
      $sentencia->bindParam(':nombreRemitente', $datos->nombre_remitente);
      $sentencia->bindParam(':tipo', $datos->tipo);
      $sentencia->bindParam(':operacion', $datos->operacion);
      $sentencia->bindParam(':fecha', $datos->fecha);
      $sentencia->bindParam(':mensaje', $datos->mensaje);
      $sentencia->execute();


      if ($sentencia->rowCount() > 0) {

        $datos->notificacion_id = $db->lastInsertId();

        $respuesta->estado = true;
        $respuesta->datos = array(
          "destinatario_id" => $datos->destinatario_id,
          "datos" => array(
            "NotificacionId" => $datos->notificacion_id,
            "ElementoId" => $datos->elemento_id,
            "NoLeida" => "1",
            "NombreRemitente" => $datos->nombre_remitente,
            "Tipo"  => $datos->tipo,
            "Operacion" => $datos->operacion,
            "Fecha" => $datos->fecha,
            "Mensaje" => $datos->mensaje
          )
        );

      }
      else {
        $respuesta->estado = false;
      }

    }
    else {
      $respuesta->estado = false;
    }

  }
  catch (PDOException $e) {
    $respuesta->estado = false;
  }

  return $respuesta;

}

function ObtenerNotificacionesPorUsuario() {

  global $app;
  $respuesta = new stdClass();
  $respuesta->notifiaciones = array();
  $respuesta->notifiaciones_restantes = false;
  $respuesta->notifiaciones_noleidas = 0;
  $respuesta->ultimo_id = -1;

  $parametros = $app->request()->params();
  $n = 0;

  if (-1 == $parametros['ultima_notificacion_id']) {
    $sql = "SELECT NotificacionId, ElementoId, NoLeida, NombreRemitente, Tipo, Operacion, Fecha, Mensaje FROM Notificacion WHERE DestinatarioId = :destinatarioId ORDER BY NotificacionId DESC LIMIT 10";
  }
  else {
    $sql = "SELECT NotificacionId, ElementoId, NoLeida, NombreRemitente, Tipo, Operacion, Fecha, Mensaje FROM Notificacion WHERE DestinatarioId = :destinatarioId AND NotificacionId < :ultima_notificacion_id ORDER BY NotificacionId DESC LIMIT 10";
  }


  try {

    $db = getConnection();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':destinatarioId', $_SESSION['UsuarioId']);

    if (-1 != $parametros['ultima_notificacion_id']) {
      $sentencia->bindParam(':ultima_notificacion_id', $parametros['ultima_notificacion_id']);
    }

    $sentencia->execute();
    $respuesta->notifiaciones = $sentencia->fetchAll(PDO::FETCH_OBJ);
    $n = count($respuesta->notifiaciones);

    if ($n>0) {

      $respuesta->ultimo_id = $respuesta->notifiaciones[$n-1]->NotificacionId;


      $sql = "SELECT COUNT(NotificacionId) AS NotificacionesRestantes FROM Notificacion WHERE DestinatarioId = :destinatarioId AND NotificacionId < :ultima_notificacion_id";

      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':destinatarioId', $_SESSION['UsuarioId']);
      $sentencia->bindParam(':ultima_notificacion_id', $respuesta->ultimo_id);
      $sentencia->execute();

      $respuesta->notifiaciones_restantes = ($sentencia->fetchAll(PDO::FETCH_OBJ)[0]->NotificacionesRestantes > 0) ? true : false;


      $sql = "SELECT COUNT(NotificacionId) AS NumeroNoLeidas FROM Notificacion WHERE DestinatarioId = :destinatarioId AND NoLeida = 1";

      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':destinatarioId', $_SESSION['UsuarioId']);
      $sentencia->execute();

      $respuesta->notifiaciones_noleidas = $sentencia->fetchAll(PDO::FETCH_OBJ)[0]->NumeroNoLeidas;

    }


    $db = null;

    echo json_encode($respuesta);

  }
  catch (PDOException $e) {

    $db=null;
    $app->status(409);
    $app->stop();

  }

}

function EnviarRecurso() {

  global $app;
  $parametros = json_decode($app->request()->getBody());
  $respuesta = new stdClass();
  $respuesta->destinatarios_error = array();
  $error = false;

  $respuesta_va = null;
  $respuesta_an = null;
  $respuesta_emision = null;
  $almacenar_notificacion = false;
  $datos = null;
  $db = null;

  for ($i=0; $i < count($parametros->destinatario); $i++) {

    try {

      $respuesta_va = null;
      $respuesta_an = null;
      $respuesta_emision = null;
      $almacenar_notificacion = false;
      $datos = new stdClass();
      $db = null;

      $db = getConnection();
      $db->beginTransaction();

      $respuesta_va = verificarAmistad($parametros->destinatario[$i]->SolicitudId, $db);

      if ($respuesta_va->estado) {

        switch ($parametros->tipo) {
          case 'cancion':
          $almacenar_notificacion = true;
          $datos->mensaje = 'Te ha recomendado la canción "'.$parametros->nombre_recurso.'"';
          break;

          case 'informacion':
          $almacenar_notificacion = true;
          $datos->mensaje = 'Te ha recomendado la información "'.$parametros->nombre_recurso.'"';
          break;

          default:
          break;
        }

      }

      if ($almacenar_notificacion) {

        $almacenar_notificacion = false;

        $datos->destinatario_id = $parametros->destinatario[$i]->AmigoId;
        $datos->elemento_id = $parametros->elemento_id;
        $datos->tipo = $parametros->tipo;
        $datos->operacion = $parametros->operacion;

        $respuesta_an = almacenarNotificacion($datos, $db);

        if ($respuesta_an->estado) {

          $respuesta_emision = emitirNotificacionAUsuario($respuesta_an->datos);

          if ($respuesta_emision->estado) {
            $almacenar_notificacion = true;
            $db->commit();
            $db = null;
          }

        }

      }

    }
    catch (PDOException $e) {
      $almacenar_notificacion = false;
    }


    if (!$almacenar_notificacion) {
      array_push($respuesta->destinatarios_error, ''.$parametros->destinatario[$i]->AmigoId);
      $db->rollBack();
      $db = null;
    }

  }



  if ( count($respuesta->destinatarios_error) > 0 ) {

    $respuesta->estado = false;
    $respuesta->clase = "danger";

    switch ($parametros->tipo) {
      case 'cancion':
      case 'informacion':
        $respuesta->mensaje = "No se pudo enviar la recomendación a los amigos que continuan seleccionados.";
      break;

      default:
      break;
    }

  }
  else {

    $respuesta->estado = true;
    $respuesta->clase = 'success';

    switch ($parametros->tipo) {
      case 'cancion':
      case 'informacion':
        $respuesta->mensaje = (count($parametros->destinatario)>1) ? "Las recomendaciones se han enviado correctamente." : "La recomendación se ha enviado correctamente.";
      break;

      default:
      break;
    }

  }

  echo json_encode($respuesta);

}


function MarcarNotificacionLeida() {

  global $app;
  $parametros = json_decode($app->request()->getBody());
  $respuesta = new stdClass();

  $sql = "UPDATE Notificacion SET NoLeida = 0 WHERE NotificacionId = :notificacionId";

  try {

    $db = getConnection();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':notificacionId', $parametros->notificacion_id);
    $sentencia->execute();

    if ($sentencia->rowCount() > 0) {
      $respuesta->estado = true;
    }
    else {
      $respuesta->estado = false;
    }

    $db = null;

    echo json_encode($respuesta);

  }
  catch (PDOException $e) {
    $db=null;
    $app->status(409);
    $app->stop();
  }

}


function EliminarNotificacion() {

  global $app;
  $parametros = json_decode($app->request()->getBody());
  $respuesta = new stdClass();

  $sql = "DELETE FROM Notificacion WHERE NotificacionId = :notificacionId";

  try {

    $db = getConnection();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':notificacionId', $parametros->notificacion_id);
    $sentencia->execute();

    if ($sentencia->rowCount() > 0) {
      $respuesta->estado = true;
    }
    else {
      $respuesta->estado = false;
    }

    $db = null;

    echo json_encode($respuesta);

  }
  catch (PDOException $e) {
    $db=null;
    $app->status(409);
    $app->stop();
  }

}

?>
