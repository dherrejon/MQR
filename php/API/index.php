<?php

session_start();

require 'Slim/Slim.php';
require 'configuration.php';

require_once 'Zend/Mail.php';
require_once 'Zend/Mail/Protocol/Imap.php';
require_once 'Zend/Mail/Storage/Imap.php';
require_once 'Zend/Mail/Transport/Smtp.php';

require_once 'Notificaciones/notificaciones.php';

require 'General/Sesion.php';
require 'General/Usuario.php';

require 'Sabiduria/Administrar/Etiqueta.php';
require 'Sabiduria/Administrar/Fuente.php';
require 'Sabiduria/Administrar/TipoFuente.php';
require 'Sabiduria/Administrar/Prefijo.php';
require 'Sabiduria/Administrar/Autor.php';
require 'Sabiduria/Administrar/Tema.php';
require 'Sabiduria/Administrar/TipoInformacion.php';
require 'Sabiduria/Administrar/Informacion.php';

require 'Cancionero/Artista.php';
require 'Cancionero/Cancion.php';

require_once 'Webmail/cuentas.php';
require_once 'Amistad/amistad.php';

/*-----Seguridad-----*/
require 'PHP-JWT/Authentication/JWT.php';
require 'PHP-JWT/Exceptions/SignatureInvalidException.php';
require 'PHP-JWT/Exceptions/BeforeValidException.php';
require 'PHP-JWT/Exceptions/ExpiredException.php';

$host = $_SERVER['SERVER_NAME'];

\Slim\Slim::registerAutoloader();
$app = new \Slim\Slim();

date_default_timezone_set($time_zone);

//-------------------------------------------------Seguridad------------------------------------------
$seguridad = function() use ($key, $host)
{

  $app = \Slim\Slim::getInstance();

  $jwt = $app->request->headers->get('X-Api-Key');

  if( null != $jwt )
  {
    try
    {
      $app->response->headers->set('X-Origin-Response', $host);
      $jwtDecoded = JWT::decode($jwt, $key, array('HS256'));
    }
    catch ( SignatureInvalidException $excepcionSE )
    {
      $app->status(401);
      $app->stop();
    }
    catch ( BeforeValidException $excepcionBE )
    {
      $app->status(401);
      $app->stop();
    }
    catch ( ExpiredException $excepcionEE )
    {

      try{
        $app->response->headers->set('X-Api-Key', generateToken(false));
      }
      catch ( DomainException $excepcion )
      {
        $app->status(401);
        $app->stop();
      }

    }
    catch ( DomainException $excepcionDE )
    {
      $app->status(401);
      $app->stop();
    }
    catch ( UnexpectedValueException $excepcionUE )
    {
      $app->status(401);
      $app->stop();
    }
  }
  else
  {
    $app->status(401);
    $app->stop();
  }
};

//------------------------------------ Inicio de sesion ------------------------------------------------
function generateToken($expired)
{
  global $key;
  global $host;
  global $app;
  global $token_expiration_time;
  $state;
  $usuario = null;

  if(!$expired)
  {
    if ( isset( $_SESSION['MQR'] ) ){
      $state = true;
      $usuario = $_SESSION['UsuarioId'];
    }
    else{
      $state = false;
      $usuario = null;
    }
  }
  else{
    $state = 'expired';
  }


  try{

    if (null==$usuario) {
      $newPayload = array(
        "state" => $state,
        "iat" => time(),
        "exp" => strtotime($token_expiration_time)
      );
    }
    else {
      $newPayload = array(
        "state" => $state,
        "usr" => $usuario,
        "iat" => time(),
        "exp" => strtotime($token_expiration_time)
      );
    }

    $newJWT = JWT::encode($newPayload, $key);

    return $newJWT;
  }
  catch ( DomainException $excepcion )
  {
    $app->status(401);
    $app->stop();
  }
}

function quitarSesion()
{

  if( isset( $_SESSION['MQR'] ) )
  {

    if ( ini_get("session.use_cookies") )
    {

      $params = session_get_cookie_params();
      setcookie(session_name(),
      '',
      time() - 42000,
      $params["path"],
      $params["domain"],
      $params["secure"],
      $params["httponly"]);

    }

    session_unset();
    session_destroy();

  }
}

$ChecarSesion = function() use ($session_expiration_time)
{

  $app = \Slim\Slim::getInstance();

  if( isset( $_SESSION['MQR'] ) )
  {

    if( ( $_SESSION['timeout'] - time() ) < 0 )
    {
      quitarSesion();

      $app->response->headers->set('X-Api-Key', generateToken(true));
    }
    else
    {
      $_SESSION['timeout'] = strtotime( $session_expiration_time );
    }

  }
};

/*-----------Sesion-------------*/
$app->post('/Login', $seguridad, 'Login');
$app->get('/GetEstadoSesion', $seguridad, $ChecarSesion, 'GetEstadoSesion');
$app->get('/CerrarSesion', $seguridad, 'CerrarSesion');
$app->put('/SetAplicacion', $seguridad, 'SetAplicacion');

/*----------------------Usuario ----------------------*/
$app->get('/GetUsuarios', $seguridad, $ChecarSesion, 'GetUsuarios');
$app->post('/AgregarUsuario', $seguridad, $ChecarSesion, 'AgregarUsuario');
$app->put('/EditarUsuario', $seguridad, $ChecarSesion, 'EditarUsuario');
$app->post('/ActivarDesactivarUsuario', $seguridad, $ChecarSesion, 'ActivarDesactivarUsuario');
$app->get('/ObtenerDatosUsuario', $seguridad, $ChecarSesion, 'ObtenerDatosUsuario');

$app->get('/GetPermiso', $seguridad, $ChecarSesion, 'GetPermiso');

$app->get('/GetPermisoUsuario', $seguridad, $ChecarSesion, 'GetPermisoUsuario');
$app->put('/CambiarPasswordPorUsuario', $seguridad, $ChecarSesion, 'CambiarPasswordPorUsuario');

$app->put('/RecuperarPassword', $seguridad, $ChecarSesion, 'RecuperarPassword');
$app->post('/ValidarRecuperarPassword', $seguridad, $ChecarSesion, 'ValidarRecuperarPassword');
$app->put('/ReiniciarPassword', $seguridad, $ChecarSesion, 'ReiniciarPassword');

/*----------------------- Etiqueta ------------------------------------------*/
$app->get('/GetEtiqueta/:id', $seguridad, $ChecarSesion, 'GetEtiqueta');
$app->post('/AgregarEtiqueta', $seguridad, $ChecarSesion, 'AgregarEtiqueta');
$app->put('/EditarEtiqueta', $seguridad, $ChecarSesion, 'EditarEtiqueta');
$app->post('/ActivarDesactivarEtiqueta', $seguridad, $ChecarSesion, 'ActivarDesactivarEtiqueta');
$app->delete('/BorrarEtiqueta', $seguridad, $ChecarSesion, 'BorrarEtiqueta');

/*----------------------- Prefijo ------------------------------------------*/
$app->get('/GetAutor', $seguridad, $ChecarSesion, 'GetAutor');
$app->post('/AgregarAutor', $seguridad, $ChecarSesion, 'AgregarAutor');
$app->put('/EditarAutor', $seguridad, $ChecarSesion, 'EditarAutor');

/*----------------------- Prefijo ------------------------------------------*/
$app->get('/GetPrefijo', $seguridad, $ChecarSesion, 'GetPrefijo');
$app->post('/AgregarPrefijo', $seguridad, $ChecarSesion, 'AgregarPrefijo');
$app->put('/EditarPrefijo', $seguridad, $ChecarSesion, 'EditarPrefijo');

/*-----------------------  TipoFuente ------------------------------------------*/
$app->get('/GetTipoFuente', $seguridad, $ChecarSesion, 'GetTipoFuente');
$app->post('/AgregarTipoFuente', $seguridad, $ChecarSesion, 'AgregarTipoFuente');
$app->put('/EditarTipoFuente', $seguridad, $ChecarSesion, 'EditarTipoFuente');

/*-----------------------  Fuente ------------------------------------------*/
$app->get('/GetFuente', $seguridad, $ChecarSesion, 'GetFuente');
$app->post('/AgregarFuente', $seguridad, $ChecarSesion, 'AgregarFuente');
$app->put('/EditarFuente', $seguridad, $ChecarSesion, 'EditarFuente');

$app->get('/GetFuenteAutor/:id', $seguridad, $ChecarSesion, 'GetFuenteAutor');
$app->get('/GetFuenteEtiqueta', $seguridad, $ChecarSesion, 'GetFuenteEtiqueta');

/*-----------------------  Tema ------------------------------------------*/
$app->get('/GetTema', $seguridad, $ChecarSesion, 'GetTema');
$app->post('/AgregarTema', $seguridad, $ChecarSesion, 'AgregarTema');
$app->put('/EditarTema', $seguridad, $ChecarSesion, 'EditarTema');

/*-----------------------  Tipo Informacion ------------------------------------------*/
$app->get('/GetTipoInformacion', $seguridad, $ChecarSesion, 'GetTipoInformacion');
$app->post('/AgregarTipoInformacion', $seguridad, $ChecarSesion, 'AgregarTipoInformacion');
$app->put('/EditarTipoInformacion', $seguridad, $ChecarSesion, 'EditarTipoInformacion');

/*-----------------------  Información ------------------------------------------*/
$app->get('/GetInformacion', $seguridad, $ChecarSesion, 'GetInformacion');
$app->post('/AgregarInformacion', $seguridad, $ChecarSesion, 'AgregarInformacion');
$app->delete('/EliminarInformacion', $seguridad, $ChecarSesion, 'EliminarInformacion');
$app->post('/EditarInformacion', $seguridad, $ChecarSesion, 'EditarInformacion');
$app->get('/GetInformacionEtiqueta/:id', $seguridad, $ChecarSesion, 'GetInformacionEtiqueta');

$app->get('/GetEtiquetasInformacion', $seguridad, $ChecarSesion, 'GetEtiquetasInformacion');
$app->get('/GetTemaInformacion', $seguridad, $ChecarSesion, 'GetTemaInformacion');
$app->get('/GetAutoresFuente', $seguridad, $ChecarSesion, 'GetAutoresFuente');
$app->get('/GetArchivoInformacion/:id', $seguridad, $ChecarSesion, 'GetArchivoInformacion');

//---------------------------------------------------------------------------------------------------------------Cancionero

/*-----------------------  Artista ------------------------------------------*/
$app->get('/GetArtista/:id', $seguridad, $ChecarSesion, 'GetArtista');
$app->post('/AgregarArtista', $seguridad, $ChecarSesion, 'AgregarArtista');
$app->put('/EditarArtista', $seguridad, $ChecarSesion, 'EditarArtista');
$app->delete('/BorrarArtista', $seguridad, $ChecarSesion, 'BorrarArtista');

/*-----------------------  Cancion ------------------------------------------*/
$app->get('/GetCancion/:id', $seguridad, $ChecarSesion, 'GetCancion');
$app->get('/GetCancionTodas', $seguridad, $ChecarSesion, 'GetCancionTodas');
$app->post('/AgregarCancion', $seguridad, $ChecarSesion, 'AgregarCancion');
$app->post('/EditarCancion', $seguridad, $ChecarSesion, 'EditarCancion');
$app->delete('/BorrarCancion', $seguridad, $ChecarSesion, 'BorrarCancion');

$app->get('/GetArtistaPorCancionTodos', $seguridad, $ChecarSesion, 'GetArtistaPorCancionTodos');
$app->get('/GetArtistaPorCancion/:id', $seguridad, $ChecarSesion, 'GetArtistaPorCancion');
$app->get('/GetCancionero/:id', $seguridad, $ChecarSesion, 'GetCancionero');

/*-----------------------  Webmail ------------------------------------------*/
$app->get('/RedireccionarServidorWebmail', $seguridad, $ChecarSesion, 'RedireccionarServidorWebmail');
$app->get('/', 'CapturarRespuestaServidorWebmail');
$app->get('/ObtenerRegistroErroresWebmail', $seguridad, $ChecarSesion, 'ObtenerRegistroErroresWebmail');
$app->get('/ObtenerCuentasWebmail', $seguridad, $ChecarSesion, 'ObtenerCuentasWebmail');
$app->get('/ObtenerContactosPorCuentaWebmail', $seguridad, $ChecarSesion, 'ObtenerContactosPorCuentaWebmail');
$app->get('/ObtenerFoldersPorCuentaWebmail', $seguridad, $ChecarSesion, 'ObtenerFoldersPorCuentaWebmail');
$app->get('/ObtenerEstadoFoldersPorCuentaWebmail', $seguridad, $ChecarSesion, 'ObtenerEstadoFoldersPorCuentaWebmail');
$app->get('/ObtenerMensajesPorFolderWebmail', $seguridad, $ChecarSesion, 'ObtenerMensajesPorFolderWebmail');
$app->get('/ObtenerContenidoMensajeWebmail', $seguridad, $ChecarSesion, 'ObtenerContenidoMensajeWebmail');
$app->get('/DescargarArchivoAdjuntoWebmail', 'DescargarArchivoAdjuntoWebmail');

$app->get('/ObtenerIdArchivoAdjuntoWebmail', $seguridad, $ChecarSesion, 'ObtenerIdArchivoAdjuntoWebmail');
$app->post('/AlmacenarArchivoAdjuntoWebmail', $seguridad, $ChecarSesion, 'AlmacenarArchivoAdjuntoWebmail');
$app->delete('/EliminarArchivoAdjuntoWebmail', $seguridad, $ChecarSesion, 'EliminarArchivoAdjuntoWebmail');
$app->post('/EnviarMensajeWebmail', $seguridad, $ChecarSesion, 'EnviarMensajeWebmail');
$app->delete('/EliminarMensajeWebmail', $seguridad, $ChecarSesion, 'EliminarMensajeWebmail');
$app->put('/MoverMensajeWebmail', $seguridad, $ChecarSesion, 'MoverMensajeWebmail');

$app->get('/ObtenerConfiguracionCuentaWebmail', $seguridad, $ChecarSesion, 'ObtenerConfiguracionCuentaWebmail');
$app->put('/ActualizarConfiguracionCuentaWebmail', $seguridad, $ChecarSesion, 'ActualizarConfiguracionCuentaWebmail');
$app->post('/AlmacenarCredencialesCorreoWebmail', $seguridad, $ChecarSesion, 'AlmacenarCredencialesCorreoWebmail');
$app->delete('/EliminarCuentaWebmail', $seguridad, $ChecarSesion, 'EliminarCuentaWebmail');

$app->post('/MarcarMensajesComoLeidosWebmail', $seguridad, $ChecarSesion, 'MarcarMensajesComoLeidosWebmail');
$app->delete('/EliminarMensajesWebmail', $seguridad, $ChecarSesion, 'EliminarMensajesWebmail');


/*-----------------------  Amistad ------------------------------------------*/
$app->post('/EnviarSolicitudAmistad', $seguridad, $ChecarSesion, 'EnviarSolicitudAmistad');
$app->get('/ConsultarSolicitudAmistad', $seguridad, $ChecarSesion, 'ConsultarSolicitudAmistad');
$app->get('/ObtenerSolicitudesEnviadas', $seguridad, $ChecarSesion, 'ObtenerSolicitudesEnviadas');
$app->get('/ObtenerSolicitudesRecibidas', $seguridad, $ChecarSesion, 'ObtenerSolicitudesRecibidas');
$app->get('/ObtenerSolicitudRecibida', $seguridad, $ChecarSesion, 'ObtenerSolicitudRecibida');
$app->get('/ObtenerListaAmigos', $seguridad, $ChecarSesion, 'ObtenerListaAmigos');
$app->get('/ObtenerDatosAmigo', $seguridad, $ChecarSesion, 'ObtenerDatosAmigo');
$app->put('/AceptarSolicitudAmistad', $seguridad, $ChecarSesion, 'AceptarSolicitudAmistad');
$app->delete('/CancelarSolicitudAmistad', $seguridad, $ChecarSesion, 'CancelarSolicitudAmistad');
$app->delete('/EliminarAmigo', $seguridad, $ChecarSesion, 'EliminarAmigo');

/*-----------------------  Notificaciones ------------------------------------------*/
$app->get('/ObtenerNotificacionesPorUsuario', $seguridad, $ChecarSesion, 'ObtenerNotificacionesPorUsuario');
$app->post('/EnviarRecurso', $seguridad, $ChecarSesion, 'EnviarRecurso');
$app->put('/MarcarNotificacionLeida', $seguridad, $ChecarSesion, 'MarcarNotificacionLeida');
$app->delete('/EliminarNotificacion', $seguridad, $ChecarSesion, 'EliminarNotificacion');

$app->run();


?>
