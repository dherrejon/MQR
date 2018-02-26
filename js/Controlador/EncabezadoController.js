app.controller("EncabezadoControlador", function($scope, $window, $http, $rootScope, $q, CONFIG, datosUsuario, $location, md5, $timeout, Amistad, ngToast, Notificaciones, Chat, $sce, $filter, $route, cfpLoadingBar)
{

  $scope.btn_amistad_deshabilitado = false;
  $scope.btn_notificaciones_deshabilitado = false;
  $scope.btn_conversaciones_deshabilitado = false;
  $scope.cambio_conversacion_deshabilitado = false;

  $scope.mdl_notificaciones_visible = false;
  $scope.mdl_solicitud_amistad_visible = false;
  $scope.mdl_lista_amigos_visible = false;
  $scope.mdl_enviar_recurso_visible = false;
  $scope.mdl_conversaciones_visible = false;
  $scope.mdl_amigos_para_conversacion_visible = false;

  $scope.opc_solicitud_amistad = [
    {activa:true},
    {activa:false},
    {activa:false}
  ];

  $scope.nueva_solicitud_amistad = {
    frm: {},
    correo: '',
    resultado: null,
    frm_enviado: false
  };

  $scope.solicitudes_amistad_enviadas = {
    datos: [],
    estado: false
  };

  $scope.solicitudes_amistad_recibidas = {
    datos: [],
    estado: false
  };

  $scope.lista_amigos = {
    datos: [],
    estado: false,
    busqueda: ''
  };

  $rootScope.lista_notificaciones = {
    noleidas: 0,
    datos: [],
    estado: 'inicial',
    obtener_mas: false,
    ultimo_id: -1
  };

  $scope.enviar_recurso = {
    titulo:'',
    tipo:'',
    operacion:'',
    elemento_id:null,
    destinatario:[],
    nombre_recurso:'',
    busqueda:''
  };

  $scope.solicitudes={busqueda: ''};

  $scope.cancion_recomendada = null;
  $scope.informacion_recomendada = null;

  $scope.eliminar_recurso = {
    mensaje:'',
    funcion:null
  };

  $scope.usuario_id = null;

  $rootScope.lista_conversaciones = {
    numero_conversaciones: 0,
    numero_total_conversaciones: 0,
    numero_conversaciones_novistas: 0,
    datos: [],
    estado: 'inicial',
    obtener_mas: false,
    vista_seleccionada: 'conversaciones',
    conversacion_seleccionada: null,
    id_temporal_conversacion: -1
  };

  $scope.datos_nueva_conversacion = {
    miembros: [],
    busqueda: ''
  };

  $scope.nuevoPassword = {nuevo:"", repetir:"", actual:""};
  $scope.clasePassword = {nuevo:"entrada", repetir:"entrada", actual:"entrada"};

  $rootScope.apps = aplicaciones;
  $rootScope.apps.Grupo = "MQRSYS";

  $rootScope.fecha_hora_actual = null;


  if($window.sessionStorage.getItem('id_actualizar_fecha_actual') !== null)
  {
    clearInterval($window.sessionStorage.getItem('id_actualizar_fecha_actual'));
    $window.sessionStorage.removeItem('id_actualizar_fecha_actual');
  }

  function actualizarFechaActual() {
    $rootScope.fecha_actual = $filter('date')(new Date(), 'dd/MM/yy');
  }

  actualizarFechaActual();

  $window.sessionStorage.setItem('id_actualizar_fecha_actual', setInterval(actualizarFechaActual, 1000));

  /*------------------Indentifica cuando los datos del usuario han cambiado-------------------*/
  $scope.$on('cambioAplicaion',function()
  {
    if($window.sessionStorage.getItem('id_actualizacion_webmail') !== null)
    {
      clearInterval($window.sessionStorage.getItem('id_actualizacion_webmail'));
      $window.sessionStorage.removeItem('id_actualizacion_webmail');
    }

    $scope.usuario =  datosUsuario.getUsuario();

    if(!($scope.usuario.Aplicacion  === null ||  $scope.usuario.Aplicacion  === undefined))
    {
      $scope.CambiarBarraNavegacion();
    }
  });

  $scope.CambiarBarraNavegacion = function()
  {
    switch($scope.usuario.Aplicacion)
    {
      case "WikiMario":
      $scope.barraNavegacion = EncabezadoSabiduria;
      $scope.HabilitarOpcionesBarraNavegacionSabiduria();
      break;

      case "GuitaraBit":
      $scope.barraNavegacion = EncabezadoCancionero;
      $scope.HabilitarOpcionesBarraNavegacionCancionero();
      break;

      case "Mis Actividades":
      $scope.barraNavegacion = EncabezadoActividades;
      $scope.HabilitarOpcionesBarraNavegacionActividades();
      break;

      case "Mi Diario":
      $scope.barraNavegacion = EncabezadoDiario;
      $scope.HabilitarOpcionesBarraNavegacionDiario();
      break;

      case "Mis Notas":
      $scope.barraNavegacion = EncabezadoNotas;
      $scope.HabilitarOpcionesBarraNavegacionNotas();
      break;

      case "Mi Buscador":
      $scope.barraNavegacion = EncabezadoBuscador;
      break;

      case "Aplicaciones":
      $scope.barraNavegacion = EncabezadoAplicaciones;
      break;

      case "Correo":
      $scope.barraNavegacion = EncabezadoCorreo;
      break;
      default:
      $scope.barraNavegacion = [];
      break;
    }
  };

  /*----------------------Control de vista de clases de la barra de navegación----------------------------*/
  $scope.MouseClickElemento = function(opcion, funcion)
  {
    $('#'+ opcion ).removeClass('open');

    $scope.CerrarBarraNavegacion();

    if(funcion == "CerrarSesion")
    {
      $rootScope.CerrarSesion();
    }

    else if(funcion == "CambiarPassword")
    {
      $scope.CambiarPassword();
    }
  };

  $scope.MouseClickOpcion = function(opcion, tipo)
  {
    if(tipo == "opc")
    {
      $('#'+ opcion.texto ).addClass('open');
    }
    else if(tipo == "pre")
    {
      $('#'+ opcion ).addClass('open');
    }

  };

  //despliega las secciones del módulo donde esta el mouse
  $scope.MouseEnterarElemento = function(index)
  {
    $('.header-horizontal-menu .navbar-nav > li.dropdown').removeClass('open');
    $('#'+$scope.barraNavegacion.opcion[index].texto).addClass('open');
  };

  $scope.MouseEnterarElementoPredeterminado = function(id)
  {
    $("#" + id).addClass("open");
  };

  //oculta las secciones
  $scope.MouseSalirElemento = function(index)
  {
    $('#'+$scope.barraNavegacion.opcion[index].texto).removeClass('open');
  };

  $scope.MouseSalirElementoPredeterminado = function(id)
  {
    $('#'+ id).removeClass('open');
  };

  //Cierra la barra de navegacion en el tamaño xs
  $scope.CerrarBarraNavegacion = function()
  {
    $('#navbarCollapse').removeClass('in');
  };

  /*-------------------------Cerrar Sesión-----------------------------------------*/
  $rootScope.CerrarSesion = function()
  {
    $('#navbarCollapse').removeClass('in');

    CerrarSesion($http, $rootScope, $q, CONFIG).then(function(data)
    {
      if(data)
      {
        if($window.sessionStorage.getItem('id_actualizacion_webmail') !== null)
        {
          clearInterval($window.sessionStorage.getItem('id_actualizacion_webmail'));
          $window.sessionStorage.removeItem('id_actualizacion_webmail');
        }

        $window.sessionStorage.removeItem('KeyUser');
        $scope.usuario = new Usuario();
        datosUsuario.enviarUsuario($scope.usuario);
        $window.location = "#Login";
        $scope.barraNavegacion = [];

        ngToast.dismiss();
        Notificaciones.desconectar();
      }
      else
      {
        alert("Error. Intentelo más tarde");
      }

    }).catch(function(error){
      alert("Error. Intentelo más tarde, " + error );
    });
  };

  //Habilitar Opciones de la barra de navegacion
  $scope.HabilitarOpcionesBarraNavegacionSabiduria = function()
  {
    $scope.LimpiarBarraNavegacionInformacion();

    for(var k=0; k<$scope.usuario.Permiso.length; k++)
    {
      if($scope.usuario.Permiso[k] == "SabiduriaCon")
      {
        $scope.barraNavegacion.opcion[0].show = true;
      }
      if($scope.usuario.Permiso[k] == "SabiduriaAdm")
      {
        $scope.barraNavegacion.opcion[1].show = true;
      }

      if($scope.usuario.Permiso[k] == "AdmUsuarios")
      {
        $scope.permisoUsuario = true;
      }
    }
  };

  $scope.HabilitarOpcionesBarraNavegacionCancionero = function()
  {
    $scope.LimpiarBarraNavegacionCancionero();

    for(var k=0; k<$scope.usuario.Permiso.length; k++)
    {
      if($scope.usuario.Permiso[k] == "CancioneroCon")
      {
        $scope.barraNavegacion.opcion[0].show = true;
      }
      if($scope.usuario.Permiso[k] == "CancioneroAdm")
      {
        $scope.barraNavegacion.opcion[1].show = true;
      }

      if($scope.usuario.Permiso[k] == "AdmUsuarios")
      {
        $scope.permisoUsuario = true;
      }
    }
  };

  $scope.HabilitarOpcionesBarraNavegacionActividades = function()
  {
    $scope.LimpiarBarraNavegacionActividades();

    for(var k=0; k<$scope.usuario.Permiso.length; k++)
    {
      if($scope.usuario.Permiso[k] == "ActividadesCon")
      {
        $scope.barraNavegacion.opcion[0].show = true;
      }
      if($scope.usuario.Permiso[k] == "ActividadesAdm")
      {
        $scope.barraNavegacion.opcion[1].show = true;
      }

      if($scope.usuario.Permiso[k] == "AdmUsuarios")
      {
        $scope.permisoUsuario = true;
      }
    }
  };

  $scope.HabilitarOpcionesBarraNavegacionDiario = function()
  {
    $scope.LimpiarBarraNavegacionDiario();

    for(var k=0; k<$scope.usuario.Permiso.length; k++)
    {
      if($scope.usuario.Permiso[k] == "DiarioCon")
      {
        $scope.barraNavegacion.opcion[0].show = true;
        $scope.barraNavegacion.opcion[1].show = true;
      }

      if($scope.usuario.Permiso[k] == "AdmUsuarios")
      {
        $scope.permisoUsuario = true;
      }
    }
  };

  $scope.HabilitarOpcionesBarraNavegacionNotas = function()
  {
    $scope.LimpiarBarraNavegacionNotas();

    for(var k=0; k<$scope.usuario.Permiso.length; k++)
    {
      if($scope.usuario.Permiso[k] == "NotasAcc")
      {
        $scope.barraNavegacion.opcion[0].show = true;
        $scope.barraNavegacion.opcion[1].show = true;
      }

      if($scope.usuario.Permiso[k] == "AdmUsuarios")
      {
        $scope.permisoUsuario = true;
      }
    }
  };

  $scope.LimpiarBarraNavegacionInformacion = function()
  {
    $scope.barraNavegacion.opcion[0].show = false;
    $scope.barraNavegacion.opcion[1].show = false;

    $scope.permisoUsuario = false;
  };

  $scope.LimpiarBarraNavegacionCancionero = function()
  {
    $scope.barraNavegacion.opcion[0].show = false;
    $scope.barraNavegacion.opcion[1].show = false;

    $scope.permisoUsuario = false;
  };

  $scope.LimpiarBarraNavegacionActividades = function()
  {
    $scope.barraNavegacion.opcion[0].show = false;
    $scope.barraNavegacion.opcion[1].show = false;

    $scope.permisoUsuario = false;
  };

  $scope.LimpiarBarraNavegacionDiario = function()
  {
    $scope.barraNavegacion.opcion[0].show = false;
    $scope.barraNavegacion.opcion[1].show = false;

    $scope.permisoUsuario = false;
  };

  $scope.LimpiarBarraNavegacionNotas = function()
  {
    $scope.barraNavegacion.opcion[0].show = false;
    $scope.barraNavegacion.opcion[1].show = false;

    $scope.permisoUsuario = false;
  };


  /*------------------------------Cambiar Contraseña--------------------------------------------*/
  $scope.CambiarPassword = function()
  {
    $('#CambiarPasswordModal').modal('toggle');
  };

  $scope.GuardarPassword = function(passwordInvalido)
  {
    if(!$scope.ValidarPassword(passwordInvalido))
    {
      $('#mensajeEncabezado').modal('toggle');
      return;
    }

    var datosUsuario = [];
    datosUsuario[0] = $scope.usuario.UsuarioId;
    datosUsuario[1] = md5.createHash( $scope.nuevoPassword.actual );
    datosUsuario[2] = md5.createHash( $scope.nuevoPassword.nuevo );

    CambiarPasswordPorUsuario($http, CONFIG, $q, datosUsuario).then(function(data)
    {
      if(data == "Exitoso")
      {
        $scope.mensaje = "La contraseña se ha actualizado correctamente.";
        $scope.LimpiarInterfaz();
        //$('#mensajeEncabezado').modal('toggle');
        $scope.EnviarAlerta('Modal');
        $('#CambiarPasswordModal').modal('toggle');
      }
      else if(data == "ErrorPassword")
      {
        $scope.mensajeError[$scope.mensajeError.length] = "*Tu contraseña actual es incorrecta.";
        $('#mensajeEncabezado').modal('toggle');
      }
      else
      {
        $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
        $('#mensajeEncabezado').modal('toggle');
      }
    }).catch(function(error)
    {
      $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde." + error;
      $('#mensajeEncabezado').modal('toggle');
      return;
    });
  };

  $scope.ValidarPassword = function(passwordInvalido)
  {
    $scope.mensajeError = [];
    if(passwordInvalido)
    {
      $scope.mensajeError[$scope.mensajeError.length] = "*La contraseña solo puede tener letras y números. Mínimo debe tener 6 carácteres.";
      $scope.clasePassword.nuevo = "entradaError";
      return false;
    }
    else
    {
      $scope.clasePassword.nuevo = "entrada";
    }
    if($scope.nuevoPassword.nuevo != $scope.nuevoPassword.repetir)
    {
      $scope.mensajeError[$scope.mensajeError.length] = "*Las contraseñas no coinciden.";
      $scope.clasePassword.repetir = "entradaError";
    }
    else
    {
      $scope.clasePassword.repetir = "entrada";
    }
    if($scope.nuevoPassword.actual === "" || $scope.nuevoPassword.actual === undefined || $scope.nuevoPassword.actual === null)
    {
      $scope.mensajeError[$scope.mensajeError.length] = "*Escribe tu contraseña actual.";
      $scope.clasePassword.actual = "entradaError";
    }
    else
    {
      $scope.clasePassword.actual = "entrada";
    }
    if($scope.mensajeError.length > 0)
    {
      return false;
    }
    else
    {
      return true;
    }
  };

  $scope.CerrarCambiarPasswordForma = function()
  {
    $('#cerrarCambiarPassword').modal('toggle');
  };

  $scope.ConfirmarCerrarCambiarPasswordForma = function()
  {
    $('#CambiarPasswordModal').modal('toggle');
    $scope.LimpiarInterfaz();

  };

  $scope.LimpiarInterfaz = function()
  {
    $scope.nuevoPassword = {nuevo:"", repetir:"", actual:""};
    $scope.clasePassword = {nuevo:"entrada", repetir:"entrada", actual:"entrada"};
    $scope.mensajeError = [];
  };

  $scope.EnviarAlerta = function(alerta)
  {
    if(alerta == "Modal")
    {
      $("#alertaExitoso").alert();

      $("#alertaExitoso").fadeIn();
      setTimeout(function () {
        $("#alertaExitoso").fadeOut();
      }, 2000);
    }
  };

  /*---------------- Ir a pagina Principal ------------------*/
  $rootScope.IrPaginaPrincipal = function()
  {
    if($scope.usuario !== undefined || $scope.usuario !== null)
    {
      //console.log($scope.usuario);
      if($scope.usuario.Aplicacion.length === 0 || $scope.usuario.Aplicacion == "Aplicaciones")
      {
        $location.path('/Aplicacion');
      }
      else
      {
        for(var k=0; k<aplicaciones.length; k++)
        {
          if($scope.usuario.Aplicacion == aplicaciones[k].texto)
          {
            $location.path(aplicaciones[k].paginaPrincipal);
            break;
          }
        }
      }
    }

  };

  //---------------------------- Aplicaciones ----------------------------
  $scope.IniciarApp = function(app)
  {
    $('#app').removeClass('open');
    $scope.CerrarBarraNavegacion();

    if(app != "Aplicaciones")
    {
      datosUsuario.setAplicacion(app.texto);

      SetAplicacion(app.texto, $http, CONFIG);
      $location.path(app.paginaPrincipal);
    }
    else
    {
      datosUsuario.setAplicacion("Aplicaciones");

      SetAplicacion("Aplicaciones", $http, CONFIG);
    }
  };

  $rootScope.HabilitarAplicaciones = function()
  {
    for(var k=0; k<$rootScope.apps.length; k++)
    {
      $rootScope.apps[k].habilitada = false;
    }

    if($rootScope.apps.Grupo === "MQRSYS")
    {
      for(k=0; k<$scope.usuario.Permiso.length; k++)
      {
        if($scope.usuario.Permiso[k] == "SabiduriaCon" || $scope.usuario.Permiso[k] == "SabiduriaAdm")
        {
          $rootScope.apps[5].habilitada = true;
        }

        if($scope.usuario.Permiso[k] == "CancioneroCon" || $scope.usuario.Permiso[k] == "CancioneroAdm")
        {
          $rootScope.apps[4].habilitada = true;
        }

        if($scope.usuario.Permiso[k] == "CancioneroCon" || $scope.usuario.Permiso[k] == "CancioneroAdm" || $scope.usuario.Permiso[k] == "SabiduriaCon" || $scope.usuario.Permiso[k] == "SabiduriaAdm")
        {
          $rootScope.apps[7].habilitada = true;
        }

        if($scope.usuario.Permiso[k] == "CorreoCon")
        {
          $rootScope.apps[8].habilitada = true;
        }
      }
    }


  };


  // solicitudes de amistad

  $scope.MostrarMdlSolicitudAmistad = function () {
    $('#modalSolicitudesAmistad').modal('show');
    $scope.mdl_solicitud_amistad_visible = true;
  };

  $scope.OcultarMdlSolicitudAmistad = function () {
    $scope.mdl_solicitud_amistad_visible = false;
    $('#modalSolicitudesAmistad').modal('hide');
    $scope.ReiniciarFrmSolicitudAmistad();
    $scope.opc_solicitud_amistad = [
      {activa:true},
      {activa:false},
      {activa:false}
    ];

    $scope.solicitudes.busqueda = '';
  };

  $scope.ReiniciarFrmSolicitudAmistad = function() {

    $scope.nueva_solicitud_amistad.correo = '';
    $scope.nueva_solicitud_amistad.resultado = null;
    $scope.nueva_solicitud_amistad.frm_enviado = false;
    $scope.btn_amistad_deshabilitado = false;

    $scope.nueva_solicitud_amistad.frm.$setPristine();
    $scope.nueva_solicitud_amistad.frm.$setUntouched();

  };

  $scope.LimpiarCampoNtCorreo = function () {
    $scope.nueva_solicitud_amistad.correo = '';
    $scope.nueva_solicitud_amistad.resultado = null;
    $scope.nueva_solicitud_amistad.frm_enviado = false;
    $scope.wiEnfocarCampo('nt_correo');
  };

  $scope.EventoTecladoCampoNtCorreo = function (evento) {
    var caracter = evento.which || evento.keyCode;

    if(13!==caracter){
      $scope.nueva_solicitud_amistad.frm_enviado = false;
    }

  };

  $scope.EnviarFrmSolicitudAmistad = function() {

    if ($scope.btn_amistad_deshabilitado) {
      return false;
    }

    var datos = {};
    $scope.nueva_solicitud_amistad.frm_enviado = true;
    $scope.btn_amistad_deshabilitado = true;

    if (!$scope.nueva_solicitud_amistad.frm.$valid) {

      for (var i = 0; i < $scope.nueva_solicitud_amistad.frm.$$controls.length; i++) {
        if($scope.nueva_solicitud_amistad.frm.$$controls[i].$invalid){
          document.getElementsByName($scope.nueva_solicitud_amistad.frm.$$controls[i].$name)[0].focus();
          break;
        }
      }

      $scope.btn_amistad_deshabilitado = false;
      return false;
    }

    datos.correo = angular.copy($scope.nueva_solicitud_amistad.correo).trim();

    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerDatosUsuario',
      params: datos
    }).then(function satisfactorio(datos_usuario) {

      if(datos_usuario.data.length) {

        datos = {destinatario_id: datos_usuario.data[0].UsuarioId};

        Amistad.consultarSolicitud(datos).then( function (respuesta) {

          $scope.nueva_solicitud_amistad.resultado = datos_usuario.data[0];
          $scope.nueva_solicitud_amistad.resultado.estado = respuesta.estado;

          if ('recibida'===respuesta.estado) {
            $scope.nueva_solicitud_amistad.resultado.AmistadId = respuesta.AmistadId;
            $scope.nueva_solicitud_amistad.resultado.UsuarioIdRemitente = respuesta.UsuarioIdRemitente;
          }

          $scope.nueva_solicitud_amistad.frm_enviado = false;
          $scope.btn_amistad_deshabilitado = false;

        }, function (respuesta) {

          $scope.nueva_solicitud_amistad.frm_enviado = false;
          $scope.btn_amistad_deshabilitado = false;

          ngToast.dismiss();
          ngToast.create({className: 'danger', content: "<b>No se pudieron obtener los datos asociados a la dirección de correo electrónico ingresada. Error: "+respuesta.status+".</b>", dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

        });

      }
      else {
        $scope.nueva_solicitud_amistad.resultado = {estado: 'noexiste'};
        $scope.nueva_solicitud_amistad.frm_enviado = false;
        $scope.btn_amistad_deshabilitado = false;
      }

    }, function error(respuesta) {

      $scope.nueva_solicitud_amistad.frm_enviado = false;
      $scope.btn_amistad_deshabilitado = false;

      ngToast.dismiss();
      ngToast.create({className: 'danger', content: "<b>No se pudieron obtener los datos asociados a la dirección de correo electrónico ingresada. Error: "+respuesta.status+".</b>", dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

    });

  };

  $scope.EnviarSolicitudAmistad = function () {

    $scope.btn_amistad_deshabilitado = true;

    var datos = {
      destinatario_id: angular.copy($scope.nueva_solicitud_amistad.resultado.UsuarioId)
    };

    Amistad.enviarSolicitud(datos).then( function (respuesta) {

      if (respuesta.hasOwnProperty('clase')) {

        if (respuesta.estado) {
          $scope.ReiniciarFrmSolicitudAmistad();
        }

        ngToast.dismiss();
        ngToast.create({className: respuesta.clase, content: "<b>"+respuesta.mensaje+"</b>", dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

      }
      else {

        $scope.nueva_solicitud_amistad.resultado.estado = respuesta.estado;

        if ('recibida'===respuesta.estado) {
          $scope.nueva_solicitud_amistad.resultado.AmistadId = respuesta.AmistadId;
          $scope.nueva_solicitud_amistad.resultado.UsuarioIdRemitente = respuesta.UsuarioIdRemitente;
        }

      }

      $scope.btn_amistad_deshabilitado = false;

    }, function (respuesta) {

      ngToast.dismiss();
      ngToast.create({className: 'danger', content: '<b>No se pudo enviar la solicitud de amistad. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

      $scope.btn_amistad_deshabilitado = false;

    });
  };

  $scope.ConsultarSolicitudesAmistadEviadas = function () {

    Amistad.consultarSolicitudesEnviadas().then( function (respuesta) {

      $scope.solicitudes_amistad_enviadas.datos = respuesta;
      $scope.solicitudes_amistad_enviadas.estado = true;

    }, function (respuesta) {

      $scope.OcultarMdlSolicitudAmistad();
      ngToast.dismiss();
      ngToast.create({className: 'danger', content: '<b>No se pudieron obtener los datos de las solicitudes de amistad. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

    });

  };

  $scope.BuscarSolicitudAmistadEnviada = function (valor) {
    if (valor) {
      var vL=valor.toLowerCase();
      return function( e ) {
        return (
          -1!==e.NombreUsuarioDestinatario.toLowerCase().indexOf(vL) ||
          -1!==e.ApellidosUsuarioDestinatario.toLowerCase().indexOf(vL) ||
          -1!==e.CorreoDestinatario.toLowerCase().indexOf(vL)
        );
      };
    }
  };

  $scope.ConsultarSolicitudesAmistadRecibidas = function () {

    Amistad.consultarSolicitudesRecibidas().then( function (respuesta) {

      $scope.solicitudes_amistad_recibidas.datos = respuesta;
      $scope.solicitudes_amistad_recibidas.estado = true;

    }, function (respuesta) {

      $scope.OcultarMdlSolicitudAmistad();
      ngToast.dismiss();
      ngToast.create({className: 'danger', content: '<b>No se pudieron obtener los datos de las solicitudes de amistad. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

    });

  };

  $scope.BuscarSolicitudAmistadRecibida = function (valor) {
    if (valor) {
      var vL=valor.toLowerCase();
      return function( e ) {
        return (
          -1!==e.NombreUsuarioRemitente.toLowerCase().indexOf(vL) ||
          -1!==e.ApellidosUsuarioRemitente.toLowerCase().indexOf(vL) ||
          -1!==e.CorreoRemitente.toLowerCase().indexOf(vL)
        );
      };
    }
  };

  $scope.AceptarSolicitudAmistad = function (elemento, id, remitente_id) {

    $scope.btn_amistad_deshabilitado = true;

    var indice = -1;

    Amistad.aceptarSolicitud({solicitud_id: id, destinatario_id: remitente_id}).then( function (respuesta) {

      if (respuesta.estado) {

        if (null !== elemento) {

          indice = $scope.solicitudes_amistad_recibidas.datos.indexOf(elemento);

          if (-1!==indice) {
            $scope.solicitudes_amistad_recibidas.datos.splice(indice, 1);
          }

        }
        else {
          $scope.ReiniciarFrmSolicitudAmistad();
        }

      }

      ngToast.dismiss();
      ngToast.create({className: respuesta.clase, content: "<b>"+respuesta.mensaje+"</b>", dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

      $scope.btn_amistad_deshabilitado = false;

    }, function (respuesta) {

      $scope.btn_amistad_deshabilitado = false;

      ngToast.dismiss();
      ngToast.create({className: 'danger', content: '<b>No se pudo confirmar la solicitud de amistad. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

    });

  };

  $scope.CancelarSolicitudAmistad = function (elemento, recibida) {

    $scope.btn_amistad_deshabilitado = true;

    var indice = -1;

    var datos = {
      solicitud_id: elemento.SolicitudId,
      solicitud_recibida: recibida
    };

    if (recibida) {
      datos.destinatario_id = elemento.UsuarioIdRemitente;
    }
    else {
      datos.destinatario_id = elemento.UsuarioIdDestinatario;
    }

    Amistad.cancelarSolicitud(datos).then( function (respuesta) {

      if (respuesta.estado) {

        if (recibida) {

          indice = $scope.solicitudes_amistad_recibidas.datos.indexOf(elemento);

          if (-1!==indice) {
            $scope.solicitudes_amistad_recibidas.datos.splice(indice, 1);
          }

        }
        else {

          indice = $scope.solicitudes_amistad_enviadas.datos.indexOf(elemento);

          if (-1!==indice) {
            $scope.solicitudes_amistad_enviadas.datos.splice(indice, 1);
          }

        }

      }

      ngToast.dismiss();
      ngToast.create({className: respuesta.clase, content: "<b>"+respuesta.mensaje+"</b>", dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

      $scope.btn_amistad_deshabilitado = false;

    }, function (respuesta) {

      $scope.btn_amistad_deshabilitado = false;

      ngToast.dismiss();
      ngToast.create({className: 'danger', content: '<b>No se pudo cancelar la solicitud de amistad. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

    });

  };

  $scope.LimpiarListaSolicitudes = function () {
    $scope.solicitudes_amistad_enviadas = {
      datos: [],
      estado: false
    };
    $scope.solicitudes_amistad_recibidas = {
      datos: [],
      estado: false
    };

    $scope.solicitudes.busqueda = "";
  };


  /*-------------------------------------Enviar recurso---------------------------------------*/

  if(!$rootScope.$$listenerCount['mostrar_modal_enviar_recurso']){

    $rootScope.$on('mostrar_modal_enviar_recurso', function (evento, datos) {

      $scope.enviar_recurso.titulo = datos.titulo;
      $scope.enviar_recurso.tipo = datos.tipo;
      $scope.enviar_recurso.operacion = datos.operacion;
      $scope.enviar_recurso.elemento_id = datos.elemento_id;
      $scope.enviar_recurso.nombre_recurso = datos.nombre_recurso;

      $scope.MostrarModalEnviarRecurso();

    });

  }

  $scope.MostrarModalEnviarRecurso = function () {

    $scope.ConsultarListaAmigos(true);
    $('#modalEnviarRecurso').modal('show');
    $scope.mdl_enviar_recurso_visible = true;

  };

  $scope.OcultarModalEnviarRecurso = function () {

    $scope.mdl_enviar_recurso_visible = false;

    $('#modalEnviarRecurso').modal('hide');

    $scope.lista_amigos = {
      datos: [],
      estado: false,
      busqueda: ''
    };

    $scope.enviar_recurso = {
      titulo:'',
      tipo:'',
      operacion:'',
      elemento_id:null,
      destinatario:[],
      nombre_recurso:'',
      busqueda:''
    };

  };

  $scope.OpcionDestinario = function (elemento) {

    var indice = -1;

    if (elemento.Seleccion) {
      $scope.enviar_recurso.destinatario.push(elemento);
    }
    else {
      indice = $scope.enviar_recurso.destinatario.indexOf(elemento);
      if (-1!==indice) {
        $scope.enviar_recurso.destinatario.splice(indice, 1);
      }
    }

  };

  function deseleccionarDestinatario(destinatario) {
    $timeout(function() {
      document.querySelector('#destinario_recurso_'+destinatario).click();
    },0);
  }

  $scope.EnviarRecurso = function () {

    $scope.btn_notificaciones_deshabilitado = true;

    var datos = angular.copy($scope.enviar_recurso);

    delete datos.titulo;
    delete datos.busqueda;

    $scope.enviar_recurso.busqueda = "";

    Notificaciones.almacenarNotificacionEnviarRecurso(datos).then( function (respuesta) {

      if (respuesta.estado) {
        $scope.OcultarModalEnviarRecurso();
      }
      else {
        for (var i = 0; i < $scope.lista_amigos.datos.length; i++) {
          if ( -1 !== respuesta.destinatarios_error.indexOf($scope.lista_amigos.datos[i].AmigoId) ) {
            $scope.lista_amigos.datos[i].Seleccion = true;
          }
          else if ($scope.lista_amigos.datos[i].Seleccion) {
            deseleccionarDestinatario($scope.lista_amigos.datos[i].AmigoId);
          }
        }
      }

      $scope.btn_notificaciones_deshabilitado = false;

      ngToast.dismiss();
      ngToast.create({className: respuesta.clase, content: "<b>"+respuesta.mensaje+"</b>", dismissOnTimeout:true, timeout:9000, dismissButton:true, dismissOnClick:true});

    }, function (respuesta) {

      $scope.btn_notificaciones_deshabilitado = false;

      ngToast.dismiss();
      ngToast.create({className: 'danger', content: '<b>No se pudo continuar con la operación. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

    });


  };


  /*-------------------------------------Amigos---------------------------------------*/
  $scope.MostrarModalAmigos = function () {
    $scope.ConsultarListaAmigos(false);
    $('#modalListaAmigos').modal('show');
    $scope.mdl_lista_amigos_visible = true;
  };

  $scope.OcultarModalAmigos = function () {

    $scope.mdl_lista_amigos_visible = false;

    $('#modalListaAmigos').modal('hide');
    $scope.lista_amigos = {
      datos: [],
      estado: false,
      busqueda: ''
    };

    $scope.lista_amigos.busqueda = '';

  };

  $scope.ConsultarListaAmigos = function (agregar_seleccion) {

    Amistad.consultarListaAmigos().then( function (respuesta) {

      $scope.lista_amigos.datos = respuesta;

      if (agregar_seleccion) {
        for (var i = 0; i < $scope.lista_amigos.datos.length; i++) {
          $scope.lista_amigos.datos[i].Seleccion = false;
        }
      }

      $scope.lista_amigos.estado = true;

    }, function (respuesta) {

      $scope.OcultarModalAmigos();
      ngToast.dismiss();
      ngToast.create({className: 'danger', content: '<b>No se pudieron obtener los datos de la lista de amigos. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

    });

  };

  $scope.BuscarAmigo = function (valor) {
    if (valor) {
      var vL=valor.toLowerCase();
      return function( e ) {
        return (
          -1!==e.NombreUsuario.toLowerCase().indexOf(vL) ||
          -1!==e.ApellidosUsuario.toLowerCase().indexOf(vL) ||
          -1!==e.CorreoUsuario.toLowerCase().indexOf(vL)
        );
      };
    }
  };

  $scope.EliminarAmigo = function (elemento) {

    $scope.btn_amistad_deshabilitado = true;

    var indice = -1;

    $scope.ModalConfirmacionEliminarRecurso(

      function(confirmado){

        if(confirmado){

          Amistad.eliminarAmigo({solicitud_id: elemento.SolicitudId, destinatario_id:elemento.AmigoId}).then( function (respuesta) {

            ngToast.dismiss();

            if (respuesta.estado) {

              indice = $scope.lista_amigos.datos.indexOf(elemento);

              if (-1!==indice) {
                $scope.lista_amigos.datos.splice(indice, 1);
              }

            }

            ngToast.create({className: respuesta.clase, content: "<b>"+respuesta.mensaje+"</b>", dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

            $scope.btn_amistad_deshabilitado = false;

          }, function (respuesta) {

            $scope.btn_amistad_deshabilitado = false;

            ngToast.dismiss();
            ngToast.create({className: 'danger', content: '<b>No se pudo eliminar el amigo de tu lista. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

          });

        }
        else{

          $timeout(function () {
            $scope.btn_amistad_deshabilitado = false;
            $scope.$apply();
          }, 0);

        }

      },
      "¿Deseas eliminar de tu lista de amigos a "+elemento.NombreUsuario+" "+elemento.ApellidosUsuario+"?"
    );

  };


  // Notificaciones

  $scope.MostrarModalNotificaciones = function () {
    $scope.mdl_notificaciones_visible = true;
    ngToast.dismiss();
    $('#modalListaNotificaciones').modal('show');
  };

  $scope.OcultarModalNotificaciones = function () {
    $scope.mdl_notificaciones_visible = false;
    $('#modalListaNotificaciones').modal('hide');
  };

  $scope.EliminarNotificacion = function (elemento) {

    var indice = -1;
    var error = true;

    if ($scope.btn_notificaciones_deshabilitado) {
      return false;
    }

    $scope.btn_notificaciones_deshabilitado = true;

    $scope.ModalConfirmacionEliminarRecurso(

      function(confirmado){

        if(confirmado){

          Notificaciones.eliminarNotificacion({notificacion_id: elemento.NotificacionId}).then( function (respuesta) {

            ngToast.dismiss();

            if (respuesta.estado) {

              indice = $rootScope.lista_notificaciones.datos.indexOf(elemento);

              if (-1!==indice) {

                error = false;

                if ('1'===elemento.NoLeida) {
                  $rootScope.lista_notificaciones.noleidas -= 1;
                }

                $rootScope.lista_notificaciones.datos.splice(indice, 1);
                ngToast.create({className: 'success', content: "<b>La notificación se ha elimindo correctamente</b>", dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

              }

              if (0 === $rootScope.lista_notificaciones.datos.length) {
                $scope.ObtenerMasNotificaciones();
              }

            }

            if (error) {
              ngToast.create({className: 'danger', content: '<b>No se pudo eliminar la notificación.</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});
            }

            $scope.btn_notificaciones_deshabilitado = false;

          }, function (respuesta) {

            $scope.btn_notificaciones_deshabilitado = false;

            ngToast.dismiss();
            ngToast.create({className: 'danger', content: '<b>No se pudo eliminar la notificación. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

          });

        }
        else{

          $timeout(function () {
            $scope.btn_notificaciones_deshabilitado = false;
            $scope.$apply();
          }, 0);

        }

      },
      "¿Deseas eliminar la notificación?"
    );

  };

  function procesarFecha(fecha) {
    fecha = new Date(fecha);
    return $filter('date')(fecha, 'dd/MM/yy') + " a las " + $filter('date')(fecha, 'h:mm a');
  }

  $scope.ObtenerMasNotificaciones = function () {

    $scope.btn_notificaciones_deshabilitado = true;

    Notificaciones.obtenerNotificaciones({ultima_notificacion_id: $rootScope.lista_notificaciones.ultimo_id}).then( function (respuesta) {

      if (respuesta.notifiaciones.length>0) {

        for (var i = 0; i < respuesta.notifiaciones.length; i++) {
          respuesta.notifiaciones[i].FechaHora =  procesarFecha(respuesta.notifiaciones[i].Fecha);
        }

        $rootScope.lista_notificaciones.datos = $rootScope.lista_notificaciones.datos.concat(respuesta.notifiaciones);
        $rootScope.lista_notificaciones.noleidas = parseInt(respuesta.notifiaciones_noleidas);
        $rootScope.lista_notificaciones.obtener_mas = respuesta.notifiaciones_restantes;
        $rootScope.lista_notificaciones.ultimo_id = respuesta.ultimo_id;

      }

      $scope.btn_notificaciones_deshabilitado = false;

    }, function (respuesta) {

      $scope.btn_notificaciones_deshabilitado = false;

      ngToast.dismiss();
      ngToast.create({className: 'danger', content: '<b>No se pudieron obtener más notificaciones. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

    });

  };

  if(!$rootScope.$$listenerCount['cargar_notificaciones_iniciales']){

    $rootScope.$on('cargar_notificaciones_iniciales', function (evento, datos) {

      $rootScope.lista_notificaciones.estado = 'cargando';
      $rootScope.lista_notificaciones.noleidas = 0;
      var fecha = null;

      if(datos.estado) {

        for (var i = 0; i < datos.contenido.length; i++) {
          datos.contenido[i].FechaHora =  procesarFecha(datos.contenido[i].Fecha);
        }

        $rootScope.lista_notificaciones.noleidas = parseInt(datos.noleidas);
        $rootScope.lista_notificaciones.datos = datos.contenido;
        $rootScope.lista_notificaciones.estado = 'cargada';
        $rootScope.lista_notificaciones.obtener_mas = datos.obtener_mas;
        $rootScope.lista_notificaciones.ultimo_id = datos.ultimo_id;

      }
      else {

        $rootScope.lista_notificaciones.noleidas = 0;
        $rootScope.lista_notificaciones.datos = [];
        $rootScope.lista_notificaciones.estado = 'error';

      }

    });

  }


  function notificacionLeida(datos) {
    if ('1'===datos.NoLeida) {
      $rootScope.lista_notificaciones.noleidas -= 1;
      datos.NoLeida = 0;
      Notificaciones.marcarNotificacionLeida({notificacion_id:datos.NotificacionId}).then( function (respuesta) {}, function (respuesta) {});
    }
  }

  function cerrarModals() {

    $scope.OcultarModalNotificaciones();
    $scope.OcultarMdlSolicitudAmistad();
    $scope.OcultarModalAmigos();
    $scope.OcultarModalEnviarRecurso();
    $scope.OcultarModalAmigosParaConversacion();
    $scope.OcultarModalConversaciones();

  }

  if(!$rootScope.$$listenerCount['nueva_notificacion']){

    $rootScope.$on('nueva_notificacion', function (evento, datos) {

      var i = 0;
      var fecha = null;
      var indice = null;
      var notificacion_repetida = false;


      $timeout(function () {

        for (i = 0; i < $rootScope.lista_notificaciones.datos.length; i++) {
          if (datos.NotificacionId === $rootScope.lista_notificaciones.datos[i].NotificacionId) {
            notificacion_repetida = true;
            break;
          }
        }

        if (!notificacion_repetida) {

          datos.FechaHora =  procesarFecha(datos.Fecha);
          $rootScope.lista_notificaciones.datos.push(datos);
          $rootScope.lista_notificaciones.noleidas += 1;

          $rootScope.$apply();

          indice = $rootScope.lista_notificaciones.datos.length-1;

          ngToast.dismiss();

          ngToast.create({
            className: 'info',
            content: $sce.trustAsHtml("<a href=\"\" ng-click=\"MostrarAccionNotificacion(lista_notificaciones.datos["+(indice)+"])\"><table><tr><td><i class=\"fa fa-bell fa-2x\" aria-hidden=\"true\" style=\"padding:0 15px 0 0\"></i></td><td><div>"+datos.NombreRemitente+"</div><div><b>"+datos.Mensaje+"</b></div></td></tr></table></a>"),
            compileContent: true,
            dismissOnTimeout:true,
            timeout:15000,
            dismissButton:true,
            dismissOnClick:false
          });


          if ('amistad'===datos.Tipo) {

            $scope.btn_amistad_deshabilitado = true;

            switch (datos.Operacion) {

              case 'nueva_solicitud':
              if ($scope.mdl_solicitud_amistad_visible && $scope.opc_solicitud_amistad[2].activa) {

                Amistad.obtenerSolicitudRecibida({solicitud_id: datos.ElementoId}).then( function (respuesta) {

                  if (respuesta.length>0) {
                    $scope.solicitudes_amistad_recibidas.estado = true;
                    $scope.solicitudes_amistad_recibidas.datos.push(respuesta[0]);
                    notificacionLeida($rootScope.lista_notificaciones.datos[indice]);
                  }

                }, function (respuesta) {

                  ngToast.dismiss();
                  ngToast.create({className: 'danger', content: '<b>No se pudieron obtener los datos de la nueva solicitud de amistad. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

                });

              }
              break;
              case 'solicitud_aceptada':
              if ($scope.mdl_solicitud_amistad_visible && $scope.opc_solicitud_amistad[1].activa) {

                for (i = 0; i < $scope.solicitudes_amistad_enviadas.datos.length; i++) {
                  if ( datos.ElementoId === $scope.solicitudes_amistad_enviadas.datos[i].SolicitudId) {
                    $scope.solicitudes_amistad_enviadas.datos.splice(i,1);
                    notificacionLeida($rootScope.lista_notificaciones.datos[indice]);
                    break;
                  }
                }

              }
              else if ($scope.mdl_lista_amigos_visible || $scope.mdl_enviar_recurso_visible || $scope.mdl_amigos_para_conversacion_visible) {

                Amistad.obtenerDatosAmigo({solicitud_id: datos.ElementoId}).then( function (respuesta) {

                  if (respuesta.length>0) {
                    $scope.lista_amigos.estado = true;
                    $scope.lista_amigos.datos.push(respuesta[0]);
                    notificacionLeida($rootScope.lista_notificaciones.datos[indice]);
                  }

                }, function (respuesta) {

                  ngToast.dismiss();
                  ngToast.create({className: 'danger', content: '<b>No se pudieron obtener los datos de la solicitud de amistad aceptada. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

                });

              }
              break;
              case 'solicitud_rechazada':
              if ($scope.mdl_solicitud_amistad_visible && $scope.opc_solicitud_amistad[1].activa) {

                for (i = 0; i < $scope.solicitudes_amistad_enviadas.datos.length; i++) {
                  if ( datos.ElementoId === $scope.solicitudes_amistad_enviadas.datos[i].SolicitudId) {
                    $scope.solicitudes_amistad_enviadas.datos.splice(i,1);
                    notificacionLeida($rootScope.lista_notificaciones.datos[indice]);
                    break;
                  }
                }

              }
              break;
              case 'solicitud_cancelada':
              if ($scope.mdl_solicitud_amistad_visible && $scope.opc_solicitud_amistad[2].activa) {

                for (i = 0; i < $scope.solicitudes_amistad_recibidas.datos.length; i++) {
                  if ( datos.ElementoId === $scope.solicitudes_amistad_recibidas.datos[i].SolicitudId) {
                    $scope.solicitudes_amistad_recibidas.datos.splice(i,1);
                    notificacionLeida($rootScope.lista_notificaciones.datos[indice]);
                    break;
                  }
                }

              }
              break;
              default:

            }

            $scope.btn_amistad_deshabilitado = false;

          }

        }

      }, 0);


    });

  }


  $rootScope.MostrarAccionNotificacion = function (datos) {
    ngToast.dismiss();
    $rootScope.$broadcast(datos.Tipo, datos);
  };

  if(!$rootScope.$$listenerCount['amistad']){

    $rootScope.$on('amistad', function (evento, datos) {

      switch (datos.Operacion) {

        case 'nueva_solicitud':
        if (!$scope.opc_solicitud_amistad[2].activa) {
          notificacionLeida(datos);
          cerrarModals();
          $scope.opc_solicitud_amistad[2].activa = true;
          $scope.MostrarMdlSolicitudAmistad();
        }
        break;
        case 'solicitud_aceptada':
        if (!$scope.opc_solicitud_amistad[1].activa && !$scope.mdl_lista_amigos_visible && !$scope.mdl_enviar_recurso_visible && !$scope.mdl_amigos_para_conversacion_visible) {
          notificacionLeida(datos);
          cerrarModals();
          $scope.MostrarModalAmigos();
        }
        break;
        case 'solicitud_rechazada':
        if (!$scope.opc_solicitud_amistad[1].activa) {
          notificacionLeida(datos);
          cerrarModals();
          $scope.opc_solicitud_amistad[1].activa = true;
          $scope.MostrarMdlSolicitudAmistad();
        }
        break;
        case 'solicitud_cancelada':
        if (!$scope.opc_solicitud_amistad[2].activa) {
          notificacionLeida(datos);
          cerrarModals();
          $scope.opc_solicitud_amistad[2].activa = true;
          $scope.MostrarMdlSolicitudAmistad();
        }
        break;
        default:

      }

    });

  }

  if(!$rootScope.$$listenerCount['cancion']){

    $rootScope.$on('cancion', function (evento, datos) {

      switch (datos.Operacion) {

        case 'recomendacion':

        $scope.cancion_recomendada = datos;

        notificacionLeida(datos);

        cerrarModals();

        if ('/Cancionero'===$location.path()) {
          $route.reload();
        }
        else {
          $scope.IniciarApp($rootScope.apps[4]);
        }

        break;
        default:

      }

    });

  }

  if(!$rootScope.$$listenerCount['controlador_cancion_cargado']){

    $rootScope.$on('controlador_cancion_cargado', function (evento, datos) {

      var cancion_recomendada = angular.copy($scope.cancion_recomendada);

      if (null!==$scope.cancion_recomendada) {

        $scope.cancion_recomendada = null;
        $rootScope.$broadcast('seleccionar_cancion_recomendada', cancion_recomendada);

      }

    });

  }

  if(!$rootScope.$$listenerCount['informacion']){

    $rootScope.$on('informacion', function (evento, datos) {


      switch (datos.Operacion) {

        case 'recomendacion':

        $scope.informacion_recomendada = datos;

        notificacionLeida(datos);

        cerrarModals();

        if ('/Informacion'===$location.path()) {
          $route.reload();
        }
        else {
          $scope.IniciarApp($rootScope.apps[5]);
        }

        break;
        default:

      }

    });

  }

  if(!$rootScope.$$listenerCount['controlador_informacion_cargado']){

    $rootScope.$on('controlador_informacion_cargado', function (evento, datos) {

      var informacion_recomendada = angular.copy($scope.informacion_recomendada);

      if (null!==$scope.informacion_recomendada) {

        $scope.informacion_recomendada = null;
        $rootScope.$broadcast('seleccionar_informacion_recomendada', informacion_recomendada);

      }

    });

  }


  // Confirmacion de eliminar recurso

  $scope.ModalConfirmacionEliminarRecurso = function (callback, texto_mensaje) {

    $scope.eliminar_recurso = {
      mensaje:texto_mensaje
    };

    $('#modalEliminarRecurso').modal('show');

    $("#btn_eliminar_si").unbind('click').click( function(){
      callback(true);
      $('#modalEliminarRecurso').modal('hide');
      $scope.eliminar_recurso = {
        mensaje:''
      };
    });

    $("#btn_eliminar_no").unbind('click').click( function(){
      callback(false);
      $('#modalEliminarRecurso').modal('hide');
      $scope.eliminar_recurso = {
        mensaje:''
      };
    });

  };



  /****conversaciones****/

  $scope.MostrarModalConversaciones = function () {
    $scope.mdl_conversaciones_visible = true;
    ngToast.dismiss();
    $('#modalListaConversaciones').modal('show');
  };

  $scope.OcultarModalConversaciones = function () {

    if ($scope.cambio_conversacion_deshabilitado) {
      return false;
    }

    if (null!==$rootScope.lista_conversaciones.conversacion_seleccionada) {
      if ($rootScope.lista_conversaciones.conversacion_seleccionada.Error) {
        indice = $rootScope.lista_conversaciones.datos.indexOf($rootScope.lista_conversaciones.conversacion_seleccionada);
        if (-1!==indice) {
          $rootScope.lista_conversaciones.datos.splice(indice, 1);
        }
      }
    }

    $scope.mdl_conversaciones_visible = false;
    $('#modalListaConversaciones').modal('hide');
    $rootScope.lista_conversaciones.vista_seleccionada = 'conversaciones';
    $rootScope.lista_conversaciones.conversacion_seleccionada = null;
  };

  $scope.MostrarModalAmigosParaConversacion = function () {
    $scope.ConsultarListaAmigos(false);
    $scope.mdl_amigos_para_conversacion_visible = true;
    ngToast.dismiss();
    $('#modalAmigosParaConversacion').modal('show');
  };

  $scope.OcultarModalAmigosParaConversacion = function () {

    $scope.mdl_amigos_para_conversacion_visible = false;
    ngToast.dismiss();
    $('#modalAmigosParaConversacion').modal('hide');

    $scope.lista_amigos = {
      datos: [],
      estado: false,
      busqueda: ''
    };

    $scope.datos_nueva_conversacion = {
      miembros: [],
      busqueda: ''
    };

  };


  function buscarConversacionesEnListaLocal(conversacion_id) {

    for (var c = 0; c < $scope.lista_conversaciones.datos.length; c++) {
      if (conversacion_id == $scope.lista_conversaciones.datos[c].ConversacionId) {
        return $scope.lista_conversaciones.datos[c];
      }
    }

    return null;
  }

  function buscarIdMensajeEnConversacionLocal(conversacion, mensaje_id) {

    for (var m = 0; m < conversacion.Mensajes.length; m++) {
      if (mensaje_id == conversacion.Mensajes[m].MensajeId) {
        return conversacion.Mensajes[m];
      }
    }

    return null;
  }

  function procesarFechaConversacion(fecha_hora_utc) {

    var tmp = {};
    var tmp_fecha_hora = new Date();
    var offset = tmp_fecha_hora.getTimezoneOffset();
    var fecha_hora_local = null;

    fecha_hora_utc = new Date(fecha_hora_utc);
    fecha_hora_local = fecha_hora_utc.getTime() - (offset*60000);
    tmp.Fecha = $filter('date')(fecha_hora_local, 'dd/MM/yy');
    tmp.Hora = $filter('date')(fecha_hora_local, 'HH:mm');

    return tmp;

  }

  if(!$rootScope.$$listenerCount['cargar_conversaciones_iniciales']){

    $rootScope.$on('cargar_conversaciones_iniciales', function (evento, datos) {

      $scope.usuario_id = datosUsuario.getUsuarioId();

      $rootScope.lista_conversaciones.estado = 'cargando';
      $rootScope.lista_conversaciones.numero_conversaciones_novistas = 0;
      $rootScope.lista_conversaciones.numero_conversaciones = 0;
      $rootScope.lista_conversaciones.numero_total_conversaciones = 0;
      $rootScope.lista_conversaciones.datos = [];

      if(datos.estado) {

        for (var i = 0; i < datos.contenido.length; i++) {

          datos.contenido[i].FechaCreacion = procesarFechaConversacion(datos.contenido[i].FechaCreacion);
          datos.contenido[i].FechaHora =  procesarFechaConversacion(datos.contenido[i].FechaUltimoMensaje);
          datos.contenido[i].NumeroMensajes = parseInt(datos.contenido[i].NumeroMensajes);
          datos.contenido[i].NumeroTotalMensajes = parseInt(datos.contenido[i].NumeroTotalMensajes);
          datos.contenido[i].ContenidoNuevoMensaje = '';
          datos.contenido[i].IdTemporalMensajes = -1;
          datos.contenido[i].Error = false;

          for (var m = 0; m < datos.contenido[i].Mensajes.length; m++) {
            datos.contenido[i].Mensajes[m].FechaHora = procesarFechaConversacion(datos.contenido[i].Mensajes[m].Fecha);
            datos.contenido[i].Mensajes[m].Error = false;
          }

        }

        $rootScope.lista_conversaciones.datos = datos.contenido;
        $rootScope.lista_conversaciones.numero_conversaciones_novistas = parseInt(datos.numero_conversaciones_novistas);
        $rootScope.lista_conversaciones.numero_conversaciones = parseInt(datos.numero_conversaciones);
        $rootScope.lista_conversaciones.numero_total_conversaciones = parseInt(datos.numero_total_conversaciones);
        $rootScope.lista_conversaciones.estado = 'cargada';

      }
      else {
        $rootScope.lista_conversaciones.estado = 'error';
      }

    });

  }

  if(!$rootScope.$$listenerCount['conversaciones']){

    $rootScope.$on('conversaciones', function (evento, datos) {

      $timeout(function () {

        switch (datos.Operacion) {
          case 'nueva_conversacion':

          if (null === buscarConversacionesEnListaLocal(datos.ConversacionId)) {

            datos.FechaCreacion = procesarFechaConversacion(datos.FechaCreacion);
            datos.FechaHora = procesarFechaConversacion(datos.FechaUltimoMensaje);
            datos.NumeroMensajes = parseInt(datos.NumeroMensajes);
            datos.NumeroTotalMensajes = parseInt(datos.NumeroTotalMensajes);
            datos.ContenidoNuevoMensaje = '';
            datos.IdTemporalMensajes = -1;
            datos.Error = false;

            for (var m = 0; m < datos.Mensajes.length; m++) {
              datos.Mensajes[m].FechaHora = procesarFechaConversacion(datos.Mensajes[m].Fecha);
              datos.Mensajes[m].Error = false;
            }

            $rootScope.lista_conversaciones.datos.push(datos);

            $rootScope.lista_conversaciones.numero_conversaciones_novistas ++;
            $rootScope.lista_conversaciones.numero_conversaciones ++;
            $rootScope.lista_conversaciones.numero_total_conversaciones ++;

          }

          break;

          case 'nuevo_mensaje':

          var conversacion = buscarConversacionesEnListaLocal(datos.ConversacionId);

          if (null === conversacion) {

            Chat.obtenerConversacionPorId(
              {conversacion_id: datos.ConversacionId}
            ).then( function (respuesta) {

              if (respuesta.Estado) {

                var conversacion = buscarConversacionesEnListaLocal(respuesta.datos.ConversacionId);

                if (null === conversacion) {

                  respuesta.datos.FechaCreacion = procesarFechaConversacion(respuesta.datos.FechaCreacion);
                  respuesta.datos.FechaHora = procesarFechaConversacion(respuesta.datos.FechaUltimoMensaje);
                  respuesta.datos.NumeroMensajes = parseInt(respuesta.datos.NumeroMensajes);
                  respuesta.datos.NumeroTotalMensajes = parseInt(respuesta.datos.NumeroTotalMensajes);
                  respuesta.datos.ContenidoNuevoMensaje = '';
                  respuesta.datos.IdTemporalMensajes = -1;
                  respuesta.datos.Error = false;

                  for (var m = 0; m < respuesta.datos.Mensajes.length; m++) {
                    respuesta.datos.Mensajes[m].FechaHora = procesarFechaConversacion(respuesta.datos.Mensajes[m].Fecha);
                    respuesta.datos.Mensajes[m].Error = false;
                  }

                  $rootScope.lista_conversaciones.datos.push(respuesta.datos);

                  $rootScope.lista_conversaciones.numero_conversaciones_novistas ++;
                  $rootScope.lista_conversaciones.numero_conversaciones ++;
                  $rootScope.lista_conversaciones.numero_total_conversaciones ++;

                }
                else if (null === buscarIdMensajeEnConversacionLocal(conversacion, datos.MensajeId) ) {

                  datos.FechaHora = procesarFechaConversacion(datos.Fecha);
                  datos.Error = false;
                  conversacion.Mensajes.unshift(datos);
                  conversacion.FechaUltimoMensaje = datos.Fecha;
                  conversacion.NumeroMensajes ++;
                  conversacion.NumeroTotalMensajes ++;

                  if (null !== $rootScope.lista_conversaciones.conversacion_seleccionada) {
                    if (0 == conversacion.ExistenMensajesNoVistos && conversacion.ConversacionId != $rootScope.lista_conversaciones.conversacion_seleccionada.ConversacionId) {
                      conversacion.ExistenMensajesNoVistos = 1;
                      $rootScope.lista_conversaciones.numero_conversaciones_novistas ++;
                    }
                  }
                  else if (0 == conversacion.ExistenMensajesNoVistos) {
                    conversacion.ExistenMensajesNoVistos = 1;
                    $rootScope.lista_conversaciones.numero_conversaciones_novistas ++;
                  }

                }

              }

            }, function (respuesta) {
            });

          }
          else if (null === buscarIdMensajeEnConversacionLocal(conversacion, datos.MensajeId) ) {

            datos.FechaHora = procesarFechaConversacion(datos.Fecha);
            datos.Error = false;
            conversacion.Mensajes.unshift(datos);
            conversacion.FechaUltimoMensaje = datos.Fecha;
            conversacion.NumeroMensajes ++;
            conversacion.NumeroTotalMensajes ++;

            if (null !== $rootScope.lista_conversaciones.conversacion_seleccionada) {

              if (conversacion.ConversacionId != $rootScope.lista_conversaciones.conversacion_seleccionada.ConversacionId) {

                if (0 == conversacion.ExistenMensajesNoVistos) {
                  conversacion.ExistenMensajesNoVistos = 1;
                  $rootScope.lista_conversaciones.numero_conversaciones_novistas ++;
                }

              }
              else {

                $timeout(function () {
                  $('#contenedor_conv_mjs').scrollTop($('#contenedor_conv_mjs')[0].scrollHeight);
                }, 0);

                Chat.actualizarEstadoVistaConversacion(
                  {
                    conversacion_id: conversacion.ConversacionId,
                    estado_vista: false
                  }
                ).then( function (respuesta) {
                }, function (respuesta) {
                });

              }

            }
            else if (0 == conversacion.ExistenMensajesNoVistos) {
              conversacion.ExistenMensajesNoVistos = 1;
              $rootScope.lista_conversaciones.numero_conversaciones_novistas ++;
            }

          }

          break;
          default:
        }


        $rootScope.$apply();

      }, 0);

    });

  }

  $scope.EliminarConversacion = function (conversacion) {

    var indice = -1;

    if (conversacion.ConversacionId < 0) {

      if (1 == conversacion.ExistenMensajesNoVistos) {
        $timeout(function () {
          $rootScope.lista_conversaciones.numero_conversaciones_novistas --;
          $rootScope.$apply();
        }, 0);
      }

      indice = $rootScope.lista_conversaciones.datos.indexOf(conversacion);
      if (-1!==indice) {
        $rootScope.lista_conversaciones.datos.splice(indice, 1);
      }

      return true;
    }



    if (1 == conversacion.EsGrupo) {

    }
    else {

      Chat.eliminarConversacionPersonal(
        {conversacion_id: conversacion.ConversacionId}
      ).then( function (respuesta) {

        if (respuesta.Estado) {

          if (1 == conversacion.ExistenMensajesNoVistos) {
            $timeout(function () {
              $rootScope.lista_conversaciones.numero_conversaciones_novistas --;
              $rootScope.$apply();
            }, 0);
          }

          indice = $rootScope.lista_conversaciones.datos.indexOf(conversacion);
          if (-1!==indice) {
            $rootScope.lista_conversaciones.datos.splice(indice, 1);
          }

        }
        else {
          ngToast.dismiss();
          ngToast.create({className: 'danger', content: "<b>No se pudo eliminar la conversación.</b>", dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});
        }

      }, function (respuesta) {

        ngToast.dismiss();
        ngToast.create({className: 'danger', content: "<b>No se pudo eliminar la conversación. Error: "+respuesta.status+".</b>", dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

      });

    }

  };

  $scope.ActualizarEstadoVistaConversacion = function (conversacion, estado_vista) {

    Chat.actualizarEstadoVistaConversacion(
      {
        conversacion_id: conversacion.ConversacionId,
        estado_vista: estado_vista
      }
    ).then( function (respuesta) {
      if (respuesta.Estado) {

        conversacion.ExistenMensajesNoVistos = estado_vista;

        $timeout(function () {
          $rootScope.lista_conversaciones.numero_conversaciones_novistas += (estado_vista) ? 1 : -1;
          $rootScope.$apply();
        }, 0);

      }
      else {
        ngToast.dismiss();
        ngToast.create({className: 'danger', content: "<b>No se pudo actualizar el estado de la conversación.</b>", dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});
      }
    }, function (respuesta) {
      ngToast.dismiss();
      ngToast.create({className: 'danger', content: "<b>No se pudo actualizar el estado de la conversación. Error: "+respuesta.status+".</b>", dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});
    });

  };

  $scope.SeleccionarConversacion = function (conversacion) {

    if ($scope.cambio_conversacion_deshabilitado) {
      return false;
    }

    $rootScope.lista_conversaciones.conversacion_seleccionada = conversacion;
    $rootScope.lista_conversaciones.vista_seleccionada = 'mensajes';

    $timeout(function () {
      $('#contenedor_conv_mjs').scrollTop($('#contenedor_conv_mjs')[0].scrollHeight);
    }, 0);

    if (!conversacion.Error && (1 == conversacion.ExistenMensajesNoVistos)) {

      Chat.actualizarEstadoVistaConversacion(
        {
          conversacion_id: conversacion.ConversacionId,
          estado_vista: false
        }
      ).then( function (respuesta) {
        if (respuesta.Estado) {

          conversacion.ExistenMensajesNoVistos = 0;

          $timeout(function () {
            $rootScope.lista_conversaciones.numero_conversaciones_novistas --;
            $rootScope.$apply();
          }, 0);

        }
      }, function (respuesta) {
      });

    }

  };

  $scope.RegresarAListaConversaciones = function () {

    var indice = -1;

    if ($scope.cambio_conversacion_deshabilitado) {
      return false;
    }

    if ($rootScope.lista_conversaciones.conversacion_seleccionada.Error) {
      indice = $rootScope.lista_conversaciones.datos.indexOf($rootScope.lista_conversaciones.conversacion_seleccionada);
      if (-1!==indice) {
        $rootScope.lista_conversaciones.datos.splice(indice, 1);
      }
    }

    $rootScope.lista_conversaciones.vista_seleccionada = 'conversaciones';

    $rootScope.lista_conversaciones.conversacion_seleccionada = null;

  };

  $scope.CrearConversacionPersonal = function (elemento) {

    $scope.OcultarModalAmigosParaConversacion();

    cfpLoadingBar.start();

    var datos_usuario = datosUsuario.getUsuario();

    var hash = CryptoJS.SHA256(( parseInt(datos_usuario.UsuarioId) <= parseInt(elemento.AmigoId) ) ? parseInt(datos_usuario.UsuarioId)+':'+parseInt(elemento.AmigoId) : parseInt(elemento.AmigoId)+':'+parseInt(datos_usuario.UsuarioId)).toString();

    var conversacion_encontrada = $filter('filter')($rootScope.lista_conversaciones.datos, {Hash: hash}, true);

    if (conversacion_encontrada.length) {
      $rootScope.lista_conversaciones.conversacion_seleccionada = conversacion_encontrada[0];
    }
    else {

      Chat.obtenerConversacionPorHashUsuario(
        {hash: hash}
      ).then( function (respuesta) {

        if (respuesta.Estado) {

          if (null == respuesta.datos) {

            $rootScope.lista_conversaciones.conversacion_seleccionada = angular.copy({
              ConversacionId: null,
              EsGrupo: 0,
              FechaUltimoMensaje: null,
              Nombre: elemento.NombreUsuario+" "+elemento.ApellidosUsuario,
              FechaCreacion: null,
              Hash: hash,
              ExistenMensajesNoVistos: 0,
              Miembros: [
                {UsuarioId: datos_usuario.UsuarioId, NombreCompletoUsuario: datos_usuario.Nombre+' '+datos_usuario.Apellidos, CorreoUsuario: datos_usuario.Correo},
                {UsuarioId: elemento.AmigoId, NombreCompletoUsuario: elemento.NombreUsuario+' '+elemento.ApellidosUsuario, CorreoUsuario: elemento.CorreoUsuario}
              ],
              EsAdministrador: true,
              FechaHora: null,
              Mensajes: [],
              NumeroMensajes: 1,
              NumeroTotalMensajes: 1,
              ContenidoNuevoMensaje: '',
              IdTemporalMensajes: -1,
              Error: false
            });

          }
          else {

            conversacion_encontrada = $filter('filter')($rootScope.lista_conversaciones.datos, {Hash: hash}, true);

            if (0 == conversacion_encontrada.length) {

              respuesta.datos.FechaCreacion = procesarFechaConversacion(respuesta.datos.FechaCreacion);
              respuesta.datos.FechaHora = procesarFechaConversacion(respuesta.datos.FechaUltimoMensaje);
              respuesta.datos.NumeroMensajes = parseInt(respuesta.datos.NumeroMensajes);
              respuesta.datos.NumeroTotalMensajes = parseInt(respuesta.datos.NumeroTotalMensajes);
              respuesta.datos.ContenidoNuevoMensaje = '';
              respuesta.datos.IdTemporalMensajes = -1;
              respuesta.datos.Error = false;

              for (var m = 0; m < respuesta.datos.Mensajes.length; m++) {
                respuesta.datos.Mensajes[m].FechaHora = procesarFechaConversacion(respuesta.datos.Mensajes[m].Fecha);
                respuesta.datos.Mensajes[m].Error = false;
              }

              $rootScope.lista_conversaciones.datos.push(respuesta.datos);

              if (1 == respuesta.datos.ExistenMensajesNoVistos) {
                $rootScope.lista_conversaciones.numero_conversaciones_novistas ++;
              }
              $rootScope.lista_conversaciones.numero_conversaciones ++;
              $rootScope.lista_conversaciones.numero_total_conversaciones ++;

              $rootScope.lista_conversaciones.conversacion_seleccionada = respuesta.datos;

            }
            else {
              $rootScope.lista_conversaciones.conversacion_seleccionada = conversacion_encontrada[0];
            }

          }

        }
        else {
          cfpLoadingBar.complete();
          return false;
        }

      }, function (respuesta) {
        cfpLoadingBar.complete();
        return false;
      });

    }

    $rootScope.lista_conversaciones.vista_seleccionada = 'mensajes';

    cfpLoadingBar.complete();

  };

  $scope.GuardarConversacionPersonal = function (fecha_actual_utc) {

    var contenido_mensaje = angular.copy($rootScope.lista_conversaciones.conversacion_seleccionada.ContenidoNuevoMensaje);
    var miembros_id = [];

    $rootScope.lista_conversaciones.conversacion_seleccionada.ContenidoNuevoMensaje = '';

    $rootScope.lista_conversaciones.conversacion_seleccionada.ConversacionId = angular.copy($rootScope.lista_conversaciones.id_temporal_conversacion);

    $rootScope.lista_conversaciones.conversacion_seleccionada.FechaUltimoMensaje = fecha_actual_utc;

    $rootScope.lista_conversaciones.conversacion_seleccionada.FechaCreacion = procesarFechaConversacion(fecha_actual_utc);

    $rootScope.lista_conversaciones.conversacion_seleccionada.FechaHora = procesarFechaConversacion(fecha_actual_utc);

    $rootScope.lista_conversaciones.conversacion_seleccionada.Mensajes = [{
      MensajeId: angular.copy($rootScope.lista_conversaciones.conversacion_seleccionada.IdTemporalMensajes),
      UsuarioIdRemitente: datosUsuario.getUsuarioId(),
      Fecha: fecha_actual_utc,
      Contenido: contenido_mensaje,
      FechaHora: procesarFechaConversacion(fecha_actual_utc),
      Error: false
    }];

    for (var m = 0; m < $rootScope.lista_conversaciones.conversacion_seleccionada.Miembros.length; m++) {
      miembros_id.push($rootScope.lista_conversaciones.conversacion_seleccionada.Miembros[m].UsuarioId);
    }

    $rootScope.lista_conversaciones.datos.push($rootScope.lista_conversaciones.conversacion_seleccionada);


    $rootScope.lista_conversaciones.id_temporal_conversacion --;

    $rootScope.lista_conversaciones.conversacion_seleccionada.IdTemporalMensajes --;


    Chat.agregarConversacionPersonal(
      {
        miembros_id: miembros_id,
        fecha_mensaje: fecha_actual_utc,
        contenido_mensaje: contenido_mensaje,
      },
      $rootScope.lista_conversaciones.conversacion_seleccionada,
      $rootScope.lista_conversaciones.conversacion_seleccionada.Mensajes[0]
    ).then( function (respuesta) {

      if (respuesta.Estado) {
        respuesta.conversacion.ConversacionId = respuesta.ConversacionId;
        respuesta.mensaje.MensajeId = respuesta.MensajeId;

        $rootScope.lista_conversaciones.numero_conversaciones ++;
        $rootScope.lista_conversaciones.numero_total_conversaciones ++;
      }
      else {
        respuesta.conversacion.Error = true;
      }

    }, function (respuesta) {
      respuesta.conversacion.Error = true;
    });

  };

  $scope.AgregarMensajeAConversacion = function (fecha_actual_utc) {

    $scope.nuevo_mensaje_conversacion = null;
    var miembros_id_anotificar = [];
    var contenido_mensaje = angular.copy($rootScope.lista_conversaciones.conversacion_seleccionada.ContenidoNuevoMensaje).replace(/\r?\n/g, '<br />');

    $rootScope.lista_conversaciones.conversacion_seleccionada.ContenidoNuevoMensaje = '';

    $scope.nuevo_mensaje_conversacion = {
      MensajeId: angular.copy($rootScope.lista_conversaciones.conversacion_seleccionada.IdTemporalMensajes),
      UsuarioIdRemitente: datosUsuario.getUsuarioId(),
      Fecha: fecha_actual_utc,
      Contenido: contenido_mensaje,
      FechaHora: procesarFechaConversacion(fecha_actual_utc),
      Error: false
    };

    $rootScope.lista_conversaciones.conversacion_seleccionada.Mensajes.unshift($scope.nuevo_mensaje_conversacion);

    $rootScope.lista_conversaciones.conversacion_seleccionada.FechaUltimoMensaje = fecha_actual_utc;

    $rootScope.lista_conversaciones.conversacion_seleccionada.IdTemporalMensajes --;

    for (var m = 0; m < $rootScope.lista_conversaciones.conversacion_seleccionada.Miembros.length; m++) {
      if (datosUsuario.getUsuarioId() != $rootScope.lista_conversaciones.conversacion_seleccionada.Miembros[m].UsuarioId) {
        miembros_id_anotificar.push($rootScope.lista_conversaciones.conversacion_seleccionada.Miembros[m].UsuarioId);
      }
    }

    $timeout(function () {
      $('#contenedor_conv_mjs').scrollTop($('#contenedor_conv_mjs')[0].scrollHeight);
    }, 0);

    Chat.agregarMensaje(
      {
        miembros_id_anotificar: miembros_id_anotificar,
        conversacion_id: $rootScope.lista_conversaciones.conversacion_seleccionada.ConversacionId,
        fecha_mensaje: fecha_actual_utc,
        contenido_mensaje: contenido_mensaje,
      },
      $rootScope.lista_conversaciones.conversacion_seleccionada,
      $scope.nuevo_mensaje_conversacion
    ).then( function (respuesta) {

      if (respuesta.Estado) {
        respuesta.mensaje.MensajeId = respuesta.MensajeId;

        respuesta.conversacion.NumeroMensajes ++;
        respuesta.conversacion.NumeroTotalMensajes ++;
      }
      else {
        respuesta.mensaje.Error = true;
      }

    }, function (respuesta) {
      respuesta.mensaje.Error = true;
    });

  };

  $scope.ContinuarEnvioMensaje = function () {

    if ($scope.cambio_conversacion_deshabilitado) {
      return false;
    }

    var fecha_actual_utc = new Date();
    fecha_actual_utc = $filter('date')(fecha_actual_utc.getTime() + (fecha_actual_utc.getTimezoneOffset()*60000), 'yyyy-MM-dd HH:mm:ss');

    $scope.cambio_conversacion_deshabilitado = true;

    if (null === $rootScope.lista_conversaciones.conversacion_seleccionada.ConversacionId) {
      $scope.GuardarConversacionPersonal(fecha_actual_utc);
    }
    else {
      $scope.AgregarMensajeAConversacion(fecha_actual_utc);
    }

    $scope.cambio_conversacion_deshabilitado = false;

  };

  /*------------------Indentifica cuando los datos del usuario han cambiado-------------------*/
  $scope.usuario =  datosUsuario.getUsuario();

  //verifica que haya un usuario logeado
  if($scope.usuario !== null)
  {
    if(!$scope.usuario.SesionIniciada)
    {
      //$location.path('/Login');
      return;
    }
    else
    {
      if(!($scope.usuario.Aplicacion  === null ||  $scope.usuario.Aplicacion  === undefined))
      {
        $scope.CambiarBarraNavegacion();
        $scope.HabilitarAplicaciones();
      }
    }
  }

  //destecta cuando los datos del usuario cambian
  $scope.$on('cambioUsuario',function()
  {
    $scope.usuario =  datosUsuario.getUsuario();

    if(!$scope.usuario.SesionIniciada)
    {
      //$location.path('/Login');
      return;
    }
    else
    {
      if(!($scope.usuario.Aplicacion  === null ||  $scope.usuario.Aplicacion  === undefined))
      {
        $scope.CambiarBarraNavegacion();
        $scope.HabilitarAplicaciones();
      }
    }
  });

});

var EncabezadoSabiduria =
{
  titulo:"WikiMario",
  opcion: [
    { texto:"Inicio", tipo:"link", referencia:"#Informacion", show: false},
    { texto:"Administrar", tipo:"dropdown", show: false,
    elemento:
    [
      //{texto:"Usuarios", referencia:"#Usuario", funcion:"", show:false},
      {texto:"Fuentes", referencia:"#Fuente", funcion:"", show:true},
      {texto:"Autores", referencia:"#Autor", funcion:"", show:true},
      {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
      {texto:"Información", referencia:"#ConfigurarInformacion", funcion:"", show:true},
      {texto:"Temas", referencia:"#Tema", funcion:"", show:true}
    ]},

  ]
};

var EncabezadoCancionero =
{
  titulo:"GuitaraBit",
  opcion: [
    { texto:"Inicio", tipo:"link", referencia:"#Informacion", show: false},
    { texto:"Administrar", tipo:"dropdown", show: false,
    elemento:
    [
      //{texto:"Usuarios", referencia:"#Usuario", funcion:"", show:false},
      {texto:"Artistas", referencia:"#Artista", funcion:"", show:true},
      {texto:"Canciones", referencia:"#Cancion", funcion:"", show:true},
    ]},

  ]
};

var EncabezadoActividades =
{
  titulo:"Mis Actividades",
  opcion: [
    { texto:"Inicio", tipo:"link", referencia:"#Actividades", show: false},
    { texto:"Administrar", tipo:"dropdown", show: false,
    elemento:
    [
      //{texto:"Usuarios", referencia:"#Usuario", funcion:"", show:false},
      {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
      {texto:"Frecuencias", referencia:"#Frecuencia", funcion:"", show:true},
      {texto:"Temas", referencia:"#TemaActividad", funcion:"", show:true},
      {texto:"Personas", referencia:"#PersonaActividad", funcion:"", show:true},
      {texto:"Lugares", referencia:"#Lugar", funcion:"", show:true},
      {texto:"Unidades", referencia:"#Unidades", funcion:"", show:true},
    ]},
  ]
};

var EncabezadoDiario =
{
  titulo:"Mi Diario",
  opcion: [
    { texto:"Inicio", tipo:"link", referencia:"#Diario", show: false},
    { texto:"Administrar", tipo:"dropdown", show: false,
    elemento:
    [
      //{texto:"Usuarios", referencia:"#Usuario", funcion:"", show:false},
      {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
      {texto:"Temas", referencia:"#TemaActividad", funcion:"", show:true}
    ]},

  ]
};

var EncabezadoNotas =
{
  titulo:"Mis Notas",
  opcion: [
    { texto:"Inicio", tipo:"link", referencia:"#Notas", show: false},
    { texto:"Administrar", tipo:"dropdown", show: false,
    elemento:
    [
      //{texto:"Usuarios", referencia:"#Usuario", funcion:"", show:false},
      {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
      {texto:"Temas", referencia:"#TemaActividad", funcion:"", show:true}
    ]},

  ]
};

var EncabezadoBuscador =
{
  titulo:"Mi Buscador",
  /*opcion: [
  { texto:"Inicio", tipo:"link", referencia:"#Conocimiento", show: false},
  { texto:"Administrar", tipo:"dropdown", show: false,
  elemento:
  [
  //{texto:"Usuarios", referencia:"#Usuario", funcion:"", show:false},
  {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
  {texto:"Temas", referencia:"#TemaActividad", funcion:"", show:true}
]},

]*/
};

var EncabezadoAplicaciones =
{
  titulo:"MQRSYS",

} ;

var EncabezadoCorreo =
{
  titulo:"Correo",

} ;
