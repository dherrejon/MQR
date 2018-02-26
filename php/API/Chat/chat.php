<?php

function ObtenerConversacionesPorUsuario() {

  global $app;
  global $password_encriptacion_bd;

  $respuesta = new stdClass();
  $respuesta->Conversaciones = array();
  $respuesta->NumeroConversaciones = 0;

  $parametros = $app->request()->params();

  $error = false;
  $db = null;
  $sql = "SELECT ConversacionId, EsGrupo, FechaUltimoMensaje, Nombre, FechaCreacion, Hash, EsAdministrador, ExistenMensajesNoVistos, ExistenMensajesOcultos, FechaPosteriorMensajesOcultos FROM VistaConversacionPorUsuario WHERE UsuarioId = :usuario_id AND EstaOculta = 0 ORDER BY FechaUltimoMensaje DESC";

  if ($parametros['numero_conversaciones_obtenidas'] > -1) {
    $sql .= " LIMIT :numero_conversaciones_obtenidas, 10";
  }
  else {
    // $sql .= " LIMIT 10";
  }


  try {

    $db = getConnection();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuario_id', $_SESSION['UsuarioId']);

    if ($parametros['numero_conversaciones_obtenidas'] > -1) {
      $sentencia->bindParam(':numero_conversaciones_obtenidas', $parametros['numero_conversaciones_obtenidas']);
    }

    $sentencia->execute();

    $respuesta->Conversaciones = $sentencia->fetchAll(PDO::FETCH_OBJ);
    $respuesta->NumeroConversaciones = count($respuesta->Conversaciones);

    if ($respuesta->NumeroConversaciones > 0) {

      for ($c=0; $c < $respuesta->NumeroConversaciones; $c++) {

        $sql = "SELECT UsuarioId, NombreCompletoUsuario, CorreoUsuario FROM VistaConversacionPorUsuario WHERE ConversacionId = :conversacion_id";

        $sentencia = $db->prepare($sql);
        $sentencia->bindParam(':conversacion_id', $respuesta->Conversaciones[$c]->ConversacionId);
        $sentencia->execute();
        $respuesta->Conversaciones[$c]->Miembros = $sentencia->fetchAll(PDO::FETCH_OBJ);

        $numero_miembros = count($respuesta->Conversaciones[$c]->Miembros);

        if ($respuesta->Conversaciones[$c]->EsGrupo) {

          if (!$respuesta->Conversaciones[$c]->EsAdministrador) {
            $sql = "SELECT NombreCompletoUsuario FROM VistaConversacionPorUsuario WHERE ConversacionId = :conversacion_id AND EsAdministrador = 1";

            $sentencia = $db->prepare($sql);
            $sentencia->bindParam(':conversacion_id', $respuesta->Conversaciones[$c]->ConversacionId);
            $sentencia->execute();
            $respuesta->Conversaciones[$c]->NombreAdministrador = $sentencia->fetchAll(PDO::FETCH_OBJ)[0]->NombreCompletoUsuario;
          }

          $sql = "SELECT MensajeId, NombreCompletoRemitente, CorreoRemitente, Fecha, AES_DECRYPT(Contenido, :passwordEBD) AS Contenido FROM VistaMensajePorConversacion WHERE ConversacionId = :conversacion_id";

        }
        else {

          for ($m=0; $m < $numero_miembros; $m++) {
            if ($respuesta->Conversaciones[$c]->Miembros[$m]->UsuarioId != $_SESSION['UsuarioId']) {
              $respuesta->Conversaciones[$c]->Nombre = $respuesta->Conversaciones[$c]->Miembros[$m]->NombreCompletoUsuario;
              break;
            }
          }

          $sql = "SELECT MensajeId, UsuarioIdRemitente, Fecha, AES_DECRYPT(Contenido, :passwordEBD) AS Contenido FROM VistaMensajePorConversacion WHERE ConversacionId = :conversacion_id";

        }

        if ($respuesta->Conversaciones[$c]->ExistenMensajesOcultos) {
          $sql .= " AND Fecha >= :fecha_posterior_mensajes_ocultos";
        }

        $sql .= " ORDER BY Fecha DESC";
         // LIMIT 20

        $sentencia = $db->prepare($sql);
        $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
        $sentencia->bindParam(':conversacion_id', $respuesta->Conversaciones[$c]->ConversacionId);

        if ($respuesta->Conversaciones[$c]->ExistenMensajesOcultos) {
          $sentencia->bindParam(':fecha_posterior_mensajes_ocultos', $respuesta->Conversaciones[$c]->FechaPosteriorMensajesOcultos);
        }

        $sentencia->execute();
        $respuesta->Conversaciones[$c]->Mensajes = $sentencia->fetchAll(PDO::FETCH_OBJ);
        $respuesta->Conversaciones[$c]->NumeroMensajes = count($respuesta->Conversaciones[$c]->Mensajes);


        if ($respuesta->Conversaciones[$c]->NumeroMensajes>0) {

          $sql = "SELECT COUNT(MensajeId) AS NumeroTotalMensajes FROM VistaMensajePorConversacion WHERE ConversacionId = :conversacion_id";

          if ($respuesta->Conversaciones[$c]->ExistenMensajesOcultos) {
            $sql .= " AND Fecha >= :fecha_posterior_mensajes_ocultos";
          }

          $sentencia = $db->prepare($sql);
          $sentencia->bindParam(':conversacion_id', $respuesta->Conversaciones[$c]->ConversacionId);

          if ($respuesta->Conversaciones[$c]->ExistenMensajesOcultos) {
            $sentencia->bindParam(':fecha_posterior_mensajes_ocultos', $respuesta->Conversaciones[$c]->FechaPosteriorMensajesOcultos);
          }

          $sentencia->execute();
          $respuesta->Conversaciones[$c]->NumeroTotalMensajes = $sentencia->fetchAll(PDO::FETCH_OBJ)[0]->NumeroTotalMensajes;

        }
        else {
          $respuesta->Conversaciones[$c]->NumeroTotalMensajes = 0;
        }

        unset($respuesta->Conversaciones[$c]->ExistenMensajesOcultos);
        unset($respuesta->Conversaciones[$c]->FechaPosteriorMensajesOcultos);

      }


      if (-1 == $parametros['numero_conversaciones_obtenidas']) {

        $respuesta->NumeroTotalConversaciones = 0;
        $respuesta->NumeroConversacionesNovistas = 0;

        $sql = "SELECT COUNT(ConversacionId) AS TotalConversaciones FROM VistaConversacionPorUsuario WHERE UsuarioId = :usuario_id AND EstaOculta = 0";

        $sentencia = $db->prepare($sql);
        $sentencia->bindParam(':usuario_id', $_SESSION['UsuarioId']);
        $sentencia->execute();

        $respuesta->NumeroTotalConversaciones = $sentencia->fetchAll(PDO::FETCH_OBJ)[0]->TotalConversaciones;


        $sql = "SELECT COUNT(ConversacionId) AS ConversacionesNovistas FROM VistaConversacionPorUsuario WHERE UsuarioId = :usuario_id AND ExistenMensajesNoVistos = 1 AND EstaOculta = 0";

        $sentencia = $db->prepare($sql);
        $sentencia->bindParam(':usuario_id', $_SESSION['UsuarioId']);
        $sentencia->execute();

        $respuesta->NumeroConversacionesNovistas = $sentencia->fetchAll(PDO::FETCH_OBJ)[0]->ConversacionesNovistas;

      }

    }
    else if (-1 == $parametros['numero_conversaciones_obtenidas']) {
      $respuesta->NumeroTotalConversaciones = 0;
      $respuesta->NumeroConversacionesNovistas = 0;
    }

    $db = null;

    echo json_encode($respuesta);

  }
  catch (Exception $e) {

    $db=null;
    $app->status(409);
    $app->stop();

  }

}

function ObtenerConversacionPorId() {

  global $app;
  global $password_encriptacion_bd;

  $respuesta = new stdClass();
  $respuesta->Estado = true;
  $respuesta->Conversacion = null;

  $parametros = $app->request()->params();

  $db = null;
  $sql = "SELECT ConversacionId, EsGrupo, FechaUltimoMensaje, Nombre, FechaCreacion, Hash, EsAdministrador, ExistenMensajesNoVistos, ExistenMensajesOcultos, FechaPosteriorMensajesOcultos FROM VistaConversacionPorUsuario WHERE UsuarioId = :usuario_id AND EstaOculta = 0 AND ConversacionId = :conversacion_id";

  try {

    $db = getConnection();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuario_id', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':conversacion_id', $parametros['conversacion_id']);
    $sentencia->execute();

    $respuesta->Conversacion = $sentencia->fetchAll(PDO::FETCH_OBJ);

    if (1 != count($respuesta->Conversacion)) {
      $respuesta = new stdClass();
      $respuesta->Estado = false;
      $respuesta->MensajeError = 'No se encontró la conversación.';
      echo json_encode($respuesta);
      return;
    }


    $sql = "SELECT UsuarioId, NombreCompletoUsuario, CorreoUsuario FROM VistaConversacionPorUsuario WHERE ConversacionId = :conversacion_id";

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':conversacion_id', $respuesta->Conversacion[0]->ConversacionId);
    $sentencia->execute();
    $respuesta->Conversacion[0]->Miembros = $sentencia->fetchAll(PDO::FETCH_OBJ);

    $numero_miembros = count($respuesta->Conversacion[0]->Miembros);

    if ($respuesta->Conversacion[0]->EsGrupo) {

      if (!$respuesta->Conversacion[0]->EsAdministrador) {
        $sql = "SELECT NombreCompletoUsuario FROM VistaConversacionPorUsuario WHERE ConversacionId = :conversacion_id AND EsAdministrador = 1";

        $sentencia = $db->prepare($sql);
        $sentencia->bindParam(':conversacion_id', $respuesta->Conversacion[0]->ConversacionId);
        $sentencia->execute();
        $respuesta->Conversacion[0]->NombreAdministrador = $sentencia->fetchAll(PDO::FETCH_OBJ)[0]->NombreCompletoUsuario;
      }

      $sql = "SELECT MensajeId, NombreCompletoRemitente, CorreoRemitente, Fecha, AES_DECRYPT(Contenido, :passwordEBD) AS Contenido FROM VistaMensajePorConversacion WHERE ConversacionId = :conversacion_id";

    }
    else {

      for ($m=0; $m < $numero_miembros; $m++) {
        if ($respuesta->Conversacion[0]->Miembros[$m]->UsuarioId != $_SESSION['UsuarioId']) {
          $respuesta->Conversacion[0]->Nombre = $respuesta->Conversacion[0]->Miembros[$m]->NombreCompletoUsuario;
          break;
        }
      }

      $sql = "SELECT MensajeId, UsuarioIdRemitente, Fecha, AES_DECRYPT(Contenido, :passwordEBD) AS Contenido FROM VistaMensajePorConversacion WHERE ConversacionId = :conversacion_id";

    }


    if ($respuesta->Conversacion[0]->ExistenMensajesOcultos) {
      $sql .= " AND Fecha >= :fecha_posterior_mensajes_ocultos";
    }

    $sql .= " ORDER BY Fecha DESC";
     // LIMIT 20

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
    $sentencia->bindParam(':conversacion_id', $respuesta->Conversacion[0]->ConversacionId);

    if ($respuesta->Conversacion[0]->ExistenMensajesOcultos) {
      $sentencia->bindParam(':fecha_posterior_mensajes_ocultos', $respuesta->Conversacion[0]->FechaPosteriorMensajesOcultos);
    }

    $sentencia->execute();
    $respuesta->Conversacion[0]->Mensajes = $sentencia->fetchAll(PDO::FETCH_OBJ);
    $respuesta->Conversacion[0]->NumeroMensajes = count($respuesta->Conversacion[0]->Mensajes);


    if ($respuesta->Conversacion[0]->NumeroMensajes>0) {

      $sql = "SELECT COUNT(MensajeId) AS NumeroTotalMensajes FROM VistaMensajePorConversacion WHERE ConversacionId = :conversacion_id";

      if ($respuesta->Conversacion[0]->ExistenMensajesOcultos) {
        $sql .= " AND Fecha >= :fecha_posterior_mensajes_ocultos";
      }

      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':conversacion_id', $respuesta->Conversacion[0]->ConversacionId);

      if ($respuesta->Conversacion[0]->ExistenMensajesOcultos) {
        $sentencia->bindParam(':fecha_posterior_mensajes_ocultos', $respuesta->Conversacion[0]->FechaPosteriorMensajesOcultos);
      }

      $sentencia->execute();
      $respuesta->Conversacion[0]->NumeroTotalMensajes = $sentencia->fetchAll(PDO::FETCH_OBJ)[0]->NumeroTotalMensajes;

    }
    else {
      $respuesta->Conversacion[0]->NumeroTotalMensajes = 0;
    }

    unset($respuesta->Conversacion[0]->ExistenMensajesOcultos);
    unset($respuesta->Conversacion[0]->FechaPosteriorMensajesOcultos);
    $respuesta->datos = $respuesta->Conversacion[0];
    unset($respuesta->Conversacion);

    $db = null;

    echo json_encode($respuesta);

  }
  catch (Exception $e) {

    $db=null;
    $app->status(409);
    $app->stop();

  }

}

function ObtenerConversacionPorHashUsuario() {

  global $app;
  global $password_encriptacion_bd;

  $respuesta = new stdClass();
  $respuesta->Estado = true;
  $respuesta->Conversacion = null;

  $parametros = $app->request()->params();

  $db = null;
  $sql = "SELECT ConversacionId, EsGrupo, FechaUltimoMensaje, Nombre, FechaCreacion, Hash, EsAdministrador, ExistenMensajesNoVistos, ExistenMensajesOcultos, FechaPosteriorMensajesOcultos FROM VistaConversacionPorUsuario WHERE UsuarioId = :usuario_id AND EstaOculta = 0 AND Hash = :hash";

  try {

    $db = getConnection();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuario_id', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':hash', $parametros['hash']);
    $sentencia->execute();

    $respuesta->Conversacion = $sentencia->fetchAll(PDO::FETCH_OBJ);

    if (0 != count($respuesta->Conversacion)) {

      $sql = "SELECT UsuarioId, NombreCompletoUsuario, CorreoUsuario FROM VistaConversacionPorUsuario WHERE ConversacionId = :conversacion_id";

      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':conversacion_id', $respuesta->Conversacion[0]->ConversacionId);
      $sentencia->execute();
      $respuesta->Conversacion[0]->Miembros = $sentencia->fetchAll(PDO::FETCH_OBJ);

      $numero_miembros = count($respuesta->Conversacion[0]->Miembros);

      if ($respuesta->Conversacion[0]->EsGrupo) {

        if (!$respuesta->Conversacion[0]->EsAdministrador) {
          $sql = "SELECT NombreCompletoUsuario FROM VistaConversacionPorUsuario WHERE ConversacionId = :conversacion_id AND EsAdministrador = 1";

          $sentencia = $db->prepare($sql);
          $sentencia->bindParam(':conversacion_id', $respuesta->Conversacion[0]->ConversacionId);
          $sentencia->execute();
          $respuesta->Conversacion[0]->NombreAdministrador = $sentencia->fetchAll(PDO::FETCH_OBJ)[0]->NombreCompletoUsuario;
        }

        $sql = "SELECT MensajeId, NombreCompletoRemitente, CorreoRemitente, Fecha, AES_DECRYPT(Contenido, :passwordEBD) AS Contenido FROM VistaMensajePorConversacion WHERE ConversacionId = :conversacion_id";

      }
      else {

        for ($m=0; $m < $numero_miembros; $m++) {
          if ($respuesta->Conversacion[0]->Miembros[$m]->UsuarioId != $_SESSION['UsuarioId']) {
            $respuesta->Conversacion[0]->Nombre = $respuesta->Conversacion[0]->Miembros[$m]->NombreCompletoUsuario;
            break;
          }
        }

        $sql = "SELECT MensajeId, UsuarioIdRemitente, Fecha, AES_DECRYPT(Contenido, :passwordEBD) AS Contenido FROM VistaMensajePorConversacion WHERE ConversacionId = :conversacion_id";

      }


      if ($respuesta->Conversacion[0]->ExistenMensajesOcultos) {
        $sql .= " AND Fecha >= :fecha_posterior_mensajes_ocultos";
      }

      $sql .= " ORDER BY Fecha DESC";
       // LIMIT 20

      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
      $sentencia->bindParam(':conversacion_id', $respuesta->Conversacion[0]->ConversacionId);

      if ($respuesta->Conversacion[0]->ExistenMensajesOcultos) {
        $sentencia->bindParam(':fecha_posterior_mensajes_ocultos', $respuesta->Conversacion[0]->FechaPosteriorMensajesOcultos);
      }

      $sentencia->execute();
      $respuesta->Conversacion[0]->Mensajes = $sentencia->fetchAll(PDO::FETCH_OBJ);
      $respuesta->Conversacion[0]->NumeroMensajes = count($respuesta->Conversacion[0]->Mensajes);


      if ($respuesta->Conversacion[0]->NumeroMensajes>0) {

        $sql = "SELECT COUNT(MensajeId) AS NumeroTotalMensajes FROM VistaMensajePorConversacion WHERE ConversacionId = :conversacion_id";

        if ($respuesta->Conversacion[0]->ExistenMensajesOcultos) {
          $sql .= " AND Fecha >= :fecha_posterior_mensajes_ocultos";
        }

        $sentencia = $db->prepare($sql);
        $sentencia->bindParam(':conversacion_id', $respuesta->Conversacion[0]->ConversacionId);

        if ($respuesta->Conversacion[0]->ExistenMensajesOcultos) {
          $sentencia->bindParam(':fecha_posterior_mensajes_ocultos', $respuesta->Conversacion[0]->FechaPosteriorMensajesOcultos);
        }

        $sentencia->execute();
        $respuesta->Conversacion[0]->NumeroTotalMensajes = $sentencia->fetchAll(PDO::FETCH_OBJ)[0]->NumeroTotalMensajes;

      }
      else {
        $respuesta->Conversacion[0]->NumeroTotalMensajes = 0;
      }

      unset($respuesta->Conversacion[0]->ExistenMensajesOcultos);
      unset($respuesta->Conversacion[0]->FechaPosteriorMensajesOcultos);
      $respuesta->datos = $respuesta->Conversacion[0];

    }
    else {
      $respuesta->datos = null;
    }

    unset($respuesta->Conversacion);

    $db = null;

    echo json_encode($respuesta);

  }
  catch (Exception $e) {

    $db=null;
    $app->status(409);
    $app->stop();

  }

}

function ActualizarEstadoVistaConversacion() {

  global $app;
  $parametros = json_decode($app->request()->getBody());
  $respuesta = new stdClass();

  $db = null;
  $sql = "UPDATE ConversacionPorUsuario SET ExistenMensajesNoVistos = :estado_vista WHERE ConversacionId = :conversacion_id AND UsuarioId = :usuario_id";

  try {

    $db = getConnection();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':conversacion_id', $parametros->conversacion_id);
    $sentencia->bindParam(':estado_vista', $parametros->estado_vista, PDO::PARAM_INT);
    $sentencia->bindParam(':usuario_id', $_SESSION['UsuarioId']);
    $sentencia->execute();

    if ($sentencia->rowCount() > 0) {
      $respuesta->Estado = true;
    }
    else {
      $respuesta->Estado = false;
    }

    $db = null;

    echo json_encode($respuesta);

  }
  catch (Exception $e) {
    $db=null;
    $app->status(409);
    $app->stop();
  }


}

function AgregarConversacionGrupal() {

}

function AgregarConversacionPersonal() {

  global $app;
  global $password_encriptacion_bd;

  $respuesta = new stdClass();
  $respuesta->Estado = true;

  $parametros = json_decode($app->request()->getBody());

  $error = false;
  $db = null;

  $numero_miembros = count($parametros->miembros_id);
  $cadena_miembros = '';
  $hash_conversacion = null;
  $datos_destinatario = null;
  $datos_remitente = null;
  $datos_miembros = null;

  if (2 != $numero_miembros) {
    $respuesta = new stdClass();
    $respuesta->Estado = false;
    $respuesta->MensajeError = 'No fue posible crear la conversación.';
    echo json_encode($respuesta);
    return;
  }

  sort($parametros->miembros_id);

  $cadena_miembros = implode(":", $parametros->miembros_id);

  $hash_conversacion = hash('sha256', $cadena_miembros, false);

  try {

    $db = getConnection();
    $db->beginTransaction();

    $sql = "SELECT ConversacionId FROM Conversacion WHERE Hash = :hash_conversacion";

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':hash_conversacion', $hash_conversacion);
    $sentencia->execute();
    $estado_conversacion = $sentencia->fetchAll(PDO::FETCH_OBJ);

    $caso_conversacion = count($estado_conversacion);

    switch ($caso_conversacion) {
      case 0:
      break;

      case 1:

      $sql = "SELECT ConversacionPorUsuarioId, EstaOculta FROM ConversacionPorUsuario WHERE ConversacionId = :conversacion_id AND UsuarioId = :usuario_id";
      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':conversacion_id', $estado_conversacion[0]->ConversacionId);
      $sentencia->bindParam(':usuario_id', $_SESSION['UsuarioId']);
      $sentencia->execute();
      $estado_cpu = $sentencia->fetchAll(PDO::FETCH_OBJ);

      if (1 == $estado_cpu[0]->EstaOculta) {

        $sql = "UPDATE Conversacion SET FechaUltimoMensaje = :fecha_ultimo_mensaje WHERE ConversacionId = :conversacion_id";
        $sentencia = $db->prepare($sql);
        $sentencia->bindParam(':fecha_ultimo_mensaje', $parametros->fecha_mensaje);
        $sentencia->bindParam(':conversacion_id', $estado_conversacion[0]->ConversacionId);
        $sentencia->execute();

        $sql = "UPDATE ConversacionPorUsuario SET EstaOculta = 0, ExistenMensajesNoVistos = 0 WHERE ConversacionPorUsuarioId = :conversacion_por_usuario_id";
        $sentencia = $db->prepare($sql);
        $sentencia->bindParam(':conversacion_por_usuario_id', $estado_cpu[0]->ConversacionPorUsuarioId);
        $sentencia->execute();

        if (1==$sentencia->rowCount()) {
          $parametros->conversacion_id = $estado_conversacion[0]->ConversacionId;
          $respuesta->ConversacionId = $estado_conversacion[0]->ConversacionId;
          break;
        }

      }

      default:
      $db->rollBack();
      $respuesta = new stdClass();
      $respuesta->Estado = false;
      $respuesta->MensajeError = 'No fue posible crear la conversación, porque ya cuentas con una conversación con el usuario seleccionado.';
      echo json_encode($respuesta);
      return;
      break;
    }



    if (0 == $caso_conversacion) {

      $sql = "INSERT INTO Conversacion (EsGrupo, FechaUltimoMensaje, FechaCreacion, Hash) VALUES (0, :fecha_ultimo_mensaje, :fecha_creacion, :hash_conversacion)";

      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':fecha_ultimo_mensaje', $parametros->fecha_mensaje);
      $sentencia->bindParam(':fecha_creacion', $parametros->fecha_mensaje);
      $sentencia->bindParam(':hash_conversacion', $hash_conversacion);
      $sentencia->execute();

      if (0 == $sentencia->rowCount()) {
        $db->rollBack();
        $db = null;
        $respuesta = new stdClass();
        $respuesta->Estado = false;
        $respuesta->MensajeError = 'No fue posible crear la conversación.';
        echo json_encode($respuesta);
        return;
      }

      $parametros->conversacion_id = $db->lastInsertId();
      $respuesta->ConversacionId = $parametros->conversacion_id;

      for ($i=0; $i < $numero_miembros; $i++) {

        $sql = "INSERT INTO ConversacionPorUsuario (ConversacionId, UsuarioId, EstaOculta, EsAdministrador, ExistenMensajesNoVistos, ExistenMensajesOcultos) VALUES (:conversacion_id, :usuario_id, 0, :es_administrador, :existen_mensajes_novistos, 0)";

        $admin = ($parametros->miembros_id[$i] == $_SESSION['UsuarioId']) ? true : false;
        $novistos = !$admin;

        $sentencia = $db->prepare($sql);
        $sentencia->bindParam(':conversacion_id', $parametros->conversacion_id);
        $sentencia->bindParam(':usuario_id', $parametros->miembros_id[$i]);
        $sentencia->bindParam(':es_administrador', $admin, PDO::PARAM_INT);
        $sentencia->bindParam(':existen_mensajes_novistos', $novistos, PDO::PARAM_INT);
        $sentencia->execute();

        if (0 == $sentencia->rowCount()) {
          $error = true;
          break;
        }

      }

      if ($error) {
        $db->rollBack();
        $db = null;
        $respuesta = new stdClass();
        $respuesta->Estado = false;
        $respuesta->MensajeError = 'No fue posible crear la conversación.';
        echo json_encode($respuesta);
        return;
      }

    }


    $sql = "INSERT INTO Mensaje (UsuarioIdRemitente, Fecha, Contenido) VALUES (:usuario_id_remitente, :fecha, AES_ENCRYPT(:contenido, :passwordEBD))";

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuario_id_remitente', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':fecha', $parametros->fecha_mensaje);
    $sentencia->bindParam(':contenido', $parametros->contenido_mensaje);
    $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
    $sentencia->execute();

    if (0 == $sentencia->rowCount()) {
      $db->rollBack();
      $db = null;
      $respuesta = new stdClass();
      $respuesta->Estado = false;
      $respuesta->MensajeError = 'No fue posible crear la conversación.';
      echo json_encode($respuesta);
      return;
    }

    $parametros->mensaje_id = $db->lastInsertId();
    $respuesta->MensajeId = $parametros->mensaje_id;


    $sql = "INSERT INTO MensajePorConversacion (MensajeId, ConversacionId) VALUES (:mensaje_id, :conversacion_id)";

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':mensaje_id', $parametros->mensaje_id);
    $sentencia->bindParam(':conversacion_id', $parametros->conversacion_id);
    $sentencia->execute();

    if (0 == $sentencia->rowCount()) {
      $db->rollBack();
      $db = null;
      $respuesta = new stdClass();
      $respuesta->Estado = false;
      $respuesta->MensajeError = 'No fue posible crear la conversación.';
      echo json_encode($respuesta);
      return;
    }


    $db->commit();


    $sql = "SELECT UsuarioId, NombreCompletoUsuario, CorreoUsuario FROM VistaConversacionPorUsuario WHERE ConversacionId = :conversacion_id";

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':conversacion_id', $parametros->conversacion_id);
    $sentencia->execute();
    $datos_miembros = $sentencia->fetchAll(PDO::FETCH_OBJ);

    $db = null;

    for ($m=0; $m < $numero_miembros; $m++) {
      if ($datos_miembros[$m]->UsuarioId == $_SESSION['UsuarioId']) {
        $datos_remitente = $datos_miembros[$m];
      }
      else {
        $datos_destinatario = $datos_miembros[$m];
      }
    }


    switch ($caso_conversacion) {
      case 0:

      $mensaje = new stdClass();
      $mensaje->MensajeId = $parametros->mensaje_id;
      $mensaje->UsuarioIdRemitente = $datos_remitente->UsuarioId;
      $mensaje->Fecha = $parametros->fecha_mensaje;
      $mensaje->Contenido = $parametros->contenido_mensaje;

      $datos_notificacion = array(
        "nombre_evento" => 'conversaciones',
        "destinatario_id" => $datos_destinatario->UsuarioId,
        "datos" => array(
          "Operacion" => 'nueva_conversacion',
          "ConversacionId" => $parametros->conversacion_id,
          "EsGrupo" => 0,
          "FechaUltimoMensaje" => $parametros->fecha_mensaje,
          "Nombre" => $datos_remitente->NombreCompletoUsuario,
          "FechaCreacion" => $parametros->fecha_mensaje,
          "Hash" => $hash_conversacion,
          "EsAdministrador" => 0,
          "ExistenMensajesNoVistos" => 1,
          "Miembros" => $datos_miembros,
          "Mensajes" => array(),
          "NumeroMensajes" => 1,
          "NumeroTotalMensajes" => 1
        )
      );

      array_push($datos_notificacion['datos']['Mensajes'], $mensaje);

      break;

      case 1:
      $datos_notificacion = array(
        "nombre_evento" => 'conversaciones',
        "destinatario_id" => $datos_destinatario->UsuarioId,
        "datos" => array(
          "Operacion" => 'nuevo_mensaje',
          "ConversacionId" => $parametros->conversacion_id,
          "FechaUltimoMensaje" => $parametros->fecha_mensaje,
          "MensajeId" => $parametros->mensaje_id,
          "Fecha" => $parametros->fecha_mensaje,
          "UsuarioIdRemitente" => $datos_remitente->UsuarioId,
          "Contenido" => $parametros->contenido_mensaje
        )
      );
      break;
      default:
      break;
    }

    $respuesta_emision = emitirNotificacionAUsuario($datos_notificacion);

    echo json_encode($respuesta);

  }
  catch (Exception $e) {

    if ($db->inTransaction()) {
      $db->rollBack();
    }
    $db=null;
    $app->status(409);
    $app->stop();

  }

}

function EliminarConversacionPersonal() {

  global $app;
  $parametros = json_decode($app->request()->getBody());
  $respuesta = new stdClass();
  $respuesta->Estado = true;

  $datos_conversacion = null;
  $eliminar_conversacion = false;
  $ids_mensajes = null;
  $numero_mensajes = 0;
  $error = false;

  $db = null;
  $sql = "SELECT EsGrupo FROM VistaConversacionPorUsuario WHERE UsuarioId = :usuario_id AND ConversacionId = :conversacion_id";

  try {

    $db = getConnection();
    $db->beginTransaction();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuario_id', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':conversacion_id', $parametros->conversacion_id);
    $sentencia->execute();

    $datos_conversacion = $sentencia->fetchAll(PDO::FETCH_OBJ);

    if (0 == count($datos_conversacion)) {
      $error = true;
    }
    elseif ($datos_conversacion[0]->EsGrupo) {
      $error = true;
    }

    if ($error) {
      $db->rollBack();
      $db = null;
      $respuesta = new stdClass();
      $respuesta->Estado = false;
      echo json_encode($respuesta);
      return;
    }

    $sql = "SELECT EstaOculta FROM VistaConversacionPorUsuario WHERE ConversacionId = :conversacion_id AND UsuarioId != :usuario_id";

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':conversacion_id', $parametros->conversacion_id);
    $sentencia->bindParam(':usuario_id', $_SESSION['UsuarioId']);
    $sentencia->execute();

    if ($sentencia->fetchAll(PDO::FETCH_OBJ)[0]->EstaOculta) {
      $eliminar_conversacion = true;
    }


    if ($eliminar_conversacion) {

      $sql = "SELECT MensajeId FROM MensajePorConversacion WHERE ConversacionId = :conversacion_id";
      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':conversacion_id', $parametros->conversacion_id);
      $sentencia->execute();
      $ids_mensajes = $sentencia->fetchAll(PDO::FETCH_OBJ);
      $numero_mensajes = count($ids_mensajes);


      for ($m=0; $m < $numero_mensajes; $m++) {

        $sql = "DELETE FROM Mensaje WHERE MensajeId = :mensaje_id";
        $sentencia = $db->prepare($sql);
        $sentencia->bindParam(':mensaje_id', $ids_mensajes[$m]->MensajeId);
        $sentencia->execute();

        if (0 == $sentencia->rowCount()) {
          $error = true;
          break;
        }

      }

      if ($error) {
        $db->rollBack();
        $db = null;
        $respuesta = new stdClass();
        $respuesta->Estado = false;
        echo json_encode($respuesta);
        return;
      }

      $sql = "DELETE FROM Conversacion WHERE ConversacionId = :conversacion_id";
      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':conversacion_id', $parametros->conversacion_id);
      $sentencia->execute();

      if ($sentencia->rowCount() > 0) {
        $db->commit();
        $respuesta->Estado = true;
      }
      else {
        $db->rollBack();
        $respuesta->Estado = false;
      }

    }
    else {

      $fecha_actual = date("Y-m-d H:i:s", strtotime(date("Y-m-d H:i:s")) - date('Z'));

      $sql = "UPDATE ConversacionPorUsuario SET EstaOculta = 1, ExistenMensajesOcultos = 1, FechaPosteriorMensajesOcultos = :fecha_posterior_mensajes_ocultos WHERE UsuarioId = :usuario_id AND ConversacionId = :conversacion_id";

      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':fecha_posterior_mensajes_ocultos', $fecha_actual);
      $sentencia->bindParam(':usuario_id', $_SESSION['UsuarioId']);
      $sentencia->bindParam(':conversacion_id', $parametros->conversacion_id);
      $sentencia->execute();

      if (1==$sentencia->rowCount()) {
        $db->commit();
        $respuesta->Estado = true;
      }
      else {
        $db->rollBack();
        $respuesta->Estado = false;
      }

    }

    $db = null;

    echo json_encode($respuesta);

  }
  catch (Exception $e) {

    if ($db->inTransaction()) {
      $db->rollBack();
    }
    $db=null;
    $app->status(409);
    $app->stop();

  }

}

function ObtenerMensajesPorConversacion() {

  global $app;
  global $password_encriptacion_bd;

  $respuesta = new stdClass();
  $respuesta->Estado = true;
  $respuesta->Mensajes = array();
  $respuesta->NumeroMensajes = false;

  $parametros = $app->request()->params();

  $db = null;
  $sql = "SELECT ConversacionId, EsGrupo, ExistenMensajesOcultos, FechaPosteriorMensajesOcultos FROM VistaConversacionPorUsuario WHERE UsuarioId = :usuario_id AND ConversacionId = :conversacion_id";

  try {

    $db = getConnection();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuario_id', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':conversacion_id', $parametros['conversacion_id']);
    $sentencia->execute();

    $datos_conversacion = $sentencia->fetchAll(PDO::FETCH_OBJ);

    if (0 == count($datos_conversacion)) {
      $db = null;
      $respuesta = new stdClass();
      $respuesta->Estado = false;
      $respuesta->MensajeError = 'No fue posible obtener los mensajes de la conversación.';
      echo json_encode($respuesta);
      return;
    }


    if ($datos_conversacion[0]->EsGrupo) {
      $sql = "SELECT MensajeId, NombreCompletoRemitente, CorreoRemitente, Fecha, AES_DECRYPT(Contenido, :passwordEBD) AS Contenido FROM VistaMensajePorConversacion WHERE ConversacionId = :conversacion_id";
    }
    else {
      $sql = "SELECT MensajeId, UsuarioIdRemitente, Fecha, AES_DECRYPT(Contenido, :passwordEBD) AS Contenido FROM VistaMensajePorConversacion WHERE ConversacionId = :conversacion_id";
    }

    if ($datos_conversacion[0]->ExistenMensajesOcultos) {
      $sql .= " AND Fecha >= :fecha_posterior_mensajes_ocultos";
    }

    $sql .= " ORDER BY Fecha DESC";

    if ($parametros['numero_mensajes_obtenidos'] > -1) {
      $sql .= " LIMIT :numero_mensajes_obtenidos, 10";
    }
    else {
      // $sql .= " LIMIT 10";
    }

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
    $sentencia->bindParam(':conversacion_id', $parametros['conversacion_id']);

    if ($datos_conversacion[0]->ExistenMensajesOcultos) {
      $sentencia->bindParam(':fecha_posterior_mensajes_ocultos', $datos_conversacion[0]->FechaPosteriorMensajesOcultos);
    }

    if ($parametros['numero_mensajes_obtenidos'] > -1) {
      $sentencia->bindParam(':numero_mensajes_obtenidos', $parametros['numero_mensajes_obtenidos']);
    }

    $sentencia->execute();
    $respuesta->Mensajes = $sentencia->fetchAll(PDO::FETCH_OBJ);
    $respuesta->NumeroMensajes = count($respuesta->Mensajes);

    if ($respuesta->NumeroMensajes > 0) {

      if (-1 == $parametros['numero_mensajes_obtenidos']) {

        $respuesta->NumeroTotalMensajes = 0;

        $sql = "SELECT COUNT(MensajeId) AS TotalMensajes FROM VistaMensajePorConversacion WHERE ConversacionId = :conversacion_id";

        if ($datos_conversacion[0]->ExistenMensajesOcultos) {
          $sql .= " AND Fecha >= :fecha_posterior_mensajes_ocultos";
        }

        $sentencia = $db->prepare($sql);

        $sentencia->bindParam(':conversacion_id', $parametros['conversacion_id']);

        if ($datos_conversacion[0]->ExistenMensajesOcultos) {
          $sentencia->bindParam(':fecha_posterior_mensajes_ocultos', $datos_conversacion[0]->FechaPosteriorMensajesOcultos);
        }

        $sentencia->execute();

        $respuesta->NumeroTotalMensajes = $sentencia->fetchAll(PDO::FETCH_OBJ)[0]->TotalMensajes;

      }

    }
    else if (-1 == $parametros['numero_mensajes_obtenidos']) {
      $respuesta->NumeroTotalMensajes = 0;
    }

    $db = null;

    echo json_encode($respuesta);

  }
  catch (Exception $e) {

    $db=null;
    $app->status(409);
    $app->stop();

  }

}

function AgregarMensaje() {

  global $app;
  global $password_encriptacion_bd;

  $respuesta = new stdClass();
  $respuesta->Estado = true;

  $parametros = json_decode($app->request()->getBody());
  $db = null;
  $numero_miembros = count($parametros->miembros_id_anotificar);
  $estado_conversacion = null;

  $sql = "SELECT ConversacionId, EsGrupo FROM VistaConversacionPorUsuario WHERE UsuarioId = :usuario_id AND ConversacionId = :conversacion_id";

  try {

    $db = getConnection();
    $db->beginTransaction();

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuario_id', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':conversacion_id', $parametros->conversacion_id);
    $sentencia->execute();
    $estado_conversacion = $sentencia->fetchAll(PDO::FETCH_OBJ);

    if (1 != count($estado_conversacion)) {
      $db->rollBack();
      $db = null;
      $respuesta = new stdClass();
      $respuesta->Estado = false;
      $respuesta->MensajeError = 'No fue posible enviar el mensaje.';
      echo json_encode($respuesta);
      return;
    }


    $sql = "INSERT INTO Mensaje (UsuarioIdRemitente, Fecha, Contenido) VALUES (:usuario_id_remitente, :fecha, AES_ENCRYPT(:contenido, :passwordEBD))";

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':usuario_id_remitente', $_SESSION['UsuarioId']);
    $sentencia->bindParam(':fecha', $parametros->fecha_mensaje);
    $sentencia->bindParam(':contenido', $parametros->contenido_mensaje);
    $sentencia->bindParam(':passwordEBD', $password_encriptacion_bd);
    $sentencia->execute();

    if (0 == $sentencia->rowCount()) {
      $db->rollBack();
      $db = null;
      $respuesta = new stdClass();
      $respuesta->Estado = false;
      $respuesta->MensajeError = 'No fue posible enviar el mensaje.';
      echo json_encode($respuesta);
      return;
    }

    $parametros->mensaje_id = $db->lastInsertId();
    $respuesta->MensajeId = $parametros->mensaje_id;


    $sql = "INSERT INTO MensajePorConversacion (MensajeId, ConversacionId) VALUES (:mensaje_id, :conversacion_id)";

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':mensaje_id', $parametros->mensaje_id);
    $sentencia->bindParam(':conversacion_id', $parametros->conversacion_id);
    $sentencia->execute();

    if (0 == $sentencia->rowCount()) {
      $db->rollBack();
      $db = null;
      $respuesta = new stdClass();
      $respuesta->Estado = false;
      $respuesta->MensajeError = 'No fue posible enviar el mensaje.';
      echo json_encode($respuesta);
      return;
    }


    $sql = "UPDATE Conversacion SET FechaUltimoMensaje = :fecha_ultimo_mensaje WHERE ConversacionId = :conversacion_id";

    $sentencia = $db->prepare($sql);
    $sentencia->bindParam(':fecha_ultimo_mensaje', $parametros->fecha_mensaje);
    $sentencia->bindParam(':conversacion_id', $parametros->conversacion_id);
    $sentencia->execute();

    if ($estado_conversacion[0]->EsGrupo) {

      $sql = "UPDATE ConversacionPorUsuario SET ExistenMensajesNoVistos = 1 WHERE ConversacionId = :conversacion_id AND UsuarioId = IN (". implode(',', array_map(function ($id){return(1*$id);}, $miembros_id_anotificar)).")";

      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':conversacion_id', $parametros->conversacion_id);
      $sentencia->execute();

      $db->commit();
      $db = null;

      for ($n=0; $n < $numero_miembros; $n++) {

        $datos_notificacion = array(
          "nombre_evento" => 'conversaciones',
          "destinatario_id" => $parametros->miembros_id_anotificar[$n],
          "datos" => array(
            "Operacion" => 'nuevo_mensaje',
            "ConversacionId" => $parametros->conversacion_id,
            "FechaUltimoMensaje" => $parametros->fecha_mensaje,
            "MensajeId" => $parametros->mensaje_id,
            "Fecha" => $parametros->fecha_mensaje,
            "NombreCompletoRemitente" => $parametros->nombre_remitente,
            "CorreoRemitente" => $parametros->correo_remitente,
            "Contenido" => $parametros->contenido_mensaje
          )
        );

        $respuesta_emision = emitirNotificacionAUsuario($datos_notificacion);

      }

    }
    else {

      $sql = "UPDATE ConversacionPorUsuario SET EstaOculta = 0, ExistenMensajesNoVistos = 1 WHERE UsuarioId = :usuario_id AND ConversacionId = :conversacion_id";

      $sentencia = $db->prepare($sql);
      $sentencia->bindParam(':usuario_id', $parametros->miembros_id_anotificar[0]);
      $sentencia->bindParam(':conversacion_id', $parametros->conversacion_id);
      $sentencia->execute();

      $db->commit();
      $db = null;

      $datos_notificacion = array(
        "nombre_evento" => 'conversaciones',
        "destinatario_id" => $parametros->miembros_id_anotificar[0],
        "datos" => array(
          "Operacion" => 'nuevo_mensaje',
          "ConversacionId" => $parametros->conversacion_id,
          "FechaUltimoMensaje" => $parametros->fecha_mensaje,
          "MensajeId" => $parametros->mensaje_id,
          "Fecha" => $parametros->fecha_mensaje,
          "UsuarioIdRemitente" => $_SESSION['UsuarioId'],
          "Contenido" => $parametros->contenido_mensaje
        )
      );

      $respuesta_emision = emitirNotificacionAUsuario($datos_notificacion);

    }

    echo json_encode($respuesta);

  }
  catch (Exception $e) {

    if ($db->inTransaction()) {
      $db->rollBack();
    }
    $db=null;
    $app->status(409);
    $app->stop();

  }

}

?>
