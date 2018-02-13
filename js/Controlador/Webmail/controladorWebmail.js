app.controller('controladorWebmail', controladorWebmail);

controladorWebmail.$inject = ['$rootScope', '$scope', 'Webmail', '$window', 'ngToast', '$timeout', '$q', '$route', '$filter', 'datosUsuario', '$location', 'CONFIG', '$http'];

function controladorWebmail ($rootScope, $scope, Webmail, $window, ngToast, $timeout, $q, $route, $filter, datosUsuario, $location, CONFIG, $http){

  if($window.sessionStorage.getItem('id_actualizacion_webmail') !== null)
  {
    clearInterval($window.sessionStorage.getItem('id_actualizacion_webmail'));
    $window.sessionStorage.removeItem('id_actualizacion_webmail');
  }

  //-----MQRSYS Variables-----
  $scope.permiso = false;
  //--------------------------

  var wi_alerta_asunto_texto = false;
  var wi_tiempo_transcurrido = 0;

  $scope.max_num_msj = 12;
  $scope.mostrar_asunto = {estado:true};
  $scope.fecha_actual = $filter('date')(Date.now(), 'dd/MM/yyyy');
  $scope.tiempo_comprobacion = [
    {texto:'Cada 5 minutos', minutos:5},
    {texto:'Cada 10 minutos', minutos:10},
    {texto:'Cada 15 minutos', minutos:15},
    {texto:'Cada 30 minutos', minutos:30},
    {texto:'Cada hora', minutos:60}
  ];
  $scope.wi_eliminar_cuenta = {
    indice: null,
    mensaje: null,
    correo: null,
    id: null
  };
  $scope.wi_mensaje_alerta_asunto_texto = '';
  $scope.wi_tamano_max_adjunto = {
    Gmail: 25000000,
    Outlook: 34000000,
    Yahoo: 25000000,
    Otro: 10000000
  }; //bytes
  $scope.wi_busqueda = {
    entrada:'',
    estado: false,
    texto:''
  };
  $scope.wi_seleccion_actual={ind_cuenta:-1, folder:null, mensaje:null};
  $scope.wi_indicacion = "CARGANDO...";
  $scope.wi_mostrar_btn_msj = true;
  $scope.wi_regex = {
    correo:{
      patron:/^[\.a-zA-Z\d_-]{3,}\@[a-zA-Z\d-]{2,}(\.[a-zA-Z\d-]{2,})+,?$/,
      mensaje:'El correo electrónico no es válido'
    },
    numero:{
      patron:/^[0-9]+$/,
      mensaje:'Utiliza únicamente números'
    }
  };
  $scope.wi_datos_cuenta = {
    indice:null,
    correo_id:null,
    operacion:null,
    tipo_servidor:null,
    etapa:1,
    nombre:null,
    correo:null,
    password:null,
    servidor_imap: null,
    puerto_imap: null,
    servidor_smtp: null,
    puerto_smtp: null,
    tiempo_comprobacion: $scope.tiempo_comprobacion[0]
  };
  $scope.wi_no_result_contactos = true;
  $scope.wi_contactos = [];
  $scope.wi_nuevo_envio = {
    operacion:null,
    mensaje_anterior: {contenido:{}, id:null, ruta_id:null},
    destinatario_ingresado:null,
    mostrar_destinatario_novalido:false,
    remitente:null,
    destinatarios:[],
    asunto:'',
    cuerpo:'',
    adjuntos:[],
    tamano:{total:0, excedido:false}
  };
  $scope.wi_cuentas=[];
  $scope.wi_servidores_correo=[
    {nombre:'Gmail',logo:'img/logo-gmail.png'},
    {nombre:'Outlook',logo:'img/logo-outlook.png'},
    {nombre:'Yahoo',logo:'img/logo-yahoo.png'},
    {nombre:'Otro',logo:'img/logo-otro.png'}
  ];
  $scope.wi_css = {
    cont_panel_cuentas:{height:0},
    cont_area_mensajes:{height:0},
    cont_iframe:{height:0}
  };
  $scope.wi_frm_enviado = {
    enviar_mensaje: false,
    agregar_cuenta: false
  };
  $scope.wi_btn_disabled = {
    frm_envio: false,
    adjuntar_archivos: false,
    agregar_cuenta: false,
    mensajes: false
  };

  $scope.wi_todos_mensajes = {
    seleccionados: false
  };

  $scope.wi_mensajes_seleccionados = {
    lista:[]
  };

  $scope.eliminar_mensaje = {
    mensaje:''
  };

  $scope.marcar_mensaje_deshabilitado = false;

  $scope.opc_opr_grupo_deshabilitado = false;


  function wiLimpiarFormularioDatosCuenta(formulario) {

    $scope.wi_datos_cuenta = {
      indice:null,
      correo_id:null,
      operacion:null,
      tipo_servidor:null,
      etapa:1,
      nombre:null,
      correo:null,
      password:null,
      servidor_imap: null,
      puerto_imap: null,
      servidor_smtp: null,
      puerto_smtp: null,
      tiempo_comprobacion: $scope.tiempo_comprobacion[0]
    };

    $scope.wi_frm_enviado.agregar_cuenta = false;

    formulario.$setPristine();
    formulario.$setUntouched();

  }

  function wiLimpiarFormularioEnvioMensaje(formulario) {
    $scope.wi_nuevo_envio = {
      operacion:null,
      mensaje_anterior: {contenido:{}, id:null, ruta_id:null},
      destinatario_ingresado:null,
      mostrar_destinatario_novalido:false,
      remitente:$scope.wi_cuentas[0],
      destinatarios:[],
      asunto:'',
      cuerpo:'',
      adjuntos:[],
      tamano:{total:0, excedido:false}
    };

    wi_alerta_asunto_texto = false;

    $scope.wi_mensaje_alerta_asunto_texto = '';

    $scope.wi_frm_enviado.enviar_mensaje = false;

    formulario.$setPristine();
    formulario.$setUntouched();
  }

  function wiObtenerContactos() {
    Webmail.obtenerContactosPorCuenta($scope.wi_nuevo_envio.remitente.correo_id).then(function (respuesta) {

      for (var d = 0; d < $scope.wi_nuevo_envio.destinatarios.length; d++) {

        $scope.wi_nuevo_envio.destinatarios[d].registrado = false;

        for (var i = 0; i < respuesta.length; i++) {

          if ($scope.wi_nuevo_envio.destinatarios[d].correo.toLowerCase()===respuesta[i].correo.toLowerCase()) {
            $scope.wi_nuevo_envio.destinatarios[d].registrado = true;
            break;
          }

        }
      }

      $scope.wi_contactos = respuesta;
    }, function (respuesta) {
      // ngToast.dismiss();
      // ngToast.create({className: 'danger', content: "<b>No se pudieron obtener los contactos asociados a la cuenta '"+$scope.wi_nuevo_envio.remitente.correo+"'. Error: "+respuesta.status+".</b>", dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
    });
  }

  $scope.irAMenuAplicaciones = function () {
    $location.path('/Aplicacion');
    datosUsuario.setAplicacion("Aplicaciones");
    SetAplicacion("Aplicaciones", $http, CONFIG);
  };

  $scope.wiMarcarMensaje = function (id_mensaje, estado_seleccion) {

    var indice = -1;

    if (estado_seleccion) {
      $scope.wi_mensajes_seleccionados.lista.push(id_mensaje);
      if ($scope.wi_mensajes_seleccionados.lista.length===$scope.wi_seleccion_actual.folder.mensajes.length) {
        $scope.wi_todos_mensajes.seleccionados = true;
      }
    }
    else {

      indice = $scope.wi_mensajes_seleccionados.lista.indexOf(id_mensaje);

      if (-1!==indice) {
        $scope.wi_mensajes_seleccionados.lista.splice(indice, 1);
        if ($scope.wi_todos_mensajes.seleccionados) {
          $scope.wi_todos_mensajes.seleccionados = false;
        }
      }

    }

  };

  $scope.wiMarcarMensajes = function () {

    $scope.marcar_mensaje_deshabilitado = true;
    var i = 0;

    for (i = 0; i < $scope.wi_seleccion_actual.folder.mensajes.length; i++) {
      $scope.wi_seleccion_actual.folder.mensajes[i].seleccionado = $scope.wi_todos_mensajes.seleccionados;
    }

    if ($scope.wi_todos_mensajes.seleccionados) {
      for (i = 0; i < $scope.wi_seleccion_actual.folder.mensajes.length; i++) {
        $scope.wi_mensajes_seleccionados.lista.push($scope.wi_seleccion_actual.folder.mensajes[i].id);
      }
    }
    else {
      $scope.wi_mensajes_seleccionados.lista = [];
    }

    $scope.marcar_mensaje_deshabilitado = false;

  };

  $scope.wiMarcarMensajesComoLeidos = function () {

    if (null !== $scope.wi_seleccion_actual.folder.peticion) {
      $scope.wi_seleccion_actual.folder.peticion.resolve('usuario');
      $scope.wi_seleccion_actual.folder.peticion = null;
    }

    $scope.wi_seleccion_actual.folder.peticion = $q.defer();

    var datos = {
      correo_id: $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].correo_id,
      ruta_folder: $scope.wi_seleccion_actual.folder.ruta,
      mensajes_id: $scope.wi_mensajes_seleccionados.lista
    };

    var notificacion = {
      contenido: '',
      clase: ''
    };

    var indice = -1;

    var m = 0;

    Webmail.marcarMensajesComoLeidos(datos).then(function(respuesta){

      ngToast.dismiss();

      if (respuesta.estado)
      {

        $scope.wi_mensajes_seleccionados.lista = [];

        for (m = 0; (m < $scope.wi_seleccion_actual.folder.mensajes.length) && (respuesta.ids.correctos.length > 0); m++) {

          indice = respuesta.ids.correctos.indexOf($scope.wi_seleccion_actual.folder.mensajes[m].id);

          if (-1!==indice) {
            $scope.wi_seleccion_actual.folder.mensajes[m].visto = true;
            $scope.wi_seleccion_actual.folder.mensajes[m].seleccionado = false;
            respuesta.ids.correctos.splice(indice, 1);
          }

        }

        if (0===respuesta.ids.incorrectos.length) {
          notificacion.clase = 'success';
          notificacion.contenido = 'Los mensajes se han marcado correctamente como leídos';
        }
        else {
          $scope.wi_mensajes_seleccionados.lista = angular.copy(respuesta.ids.incorrectos);
          notificacion.clase = 'warning';
          notificacion.contenido = 'Los mensajes que continuan seleccionados no se pudieron marcar como leídos';
        }

        if ($scope.wi_seleccion_actual.folder.mensajes.length!==$scope.wi_mensajes_seleccionados.lista.length) {
          $scope.wi_todos_mensajes.seleccionados = false;
        }


        ngToast.create({className: notificacion.clase, content: '<b>'+notificacion.contenido+'.</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

        $scope.wi_seleccion_actual.folder.peticion = null;

        $scope.wiActualizarEstadoFoldersPorCuenta($scope.wi_seleccion_actual.ind_cuenta, true, true, false, null);

      }
      else
      {
        ngToast.create({className: 'danger', content: '<b>'+respuesta.mensaje_error+'.</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

        $scope.wi_seleccion_actual.folder.peticion = null;
      }

    },function(respuesta) {
      ngToast.dismiss();
      ngToast.create({className: 'danger', content: '<b>No se pudo continuar con la operación. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

      $scope.wi_seleccion_actual.folder.peticion = null;
    });

  };

  $scope.wiEliminarMensajes = function () {

    var datos = {
      correo_id: $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].correo_id,
      ruta_folder: $scope.wi_seleccion_actual.folder.ruta,
      mensajes_id: $scope.wi_mensajes_seleccionados.lista,
      papelera_id: null
    };

    var notificacion = {
      contenido: '',
      clase: ''
    };

    var indice = -1;
    var eliminacion_definitivamente = false;

    if ($scope.wi_seleccion_actual.folder.hasOwnProperty('es_papelera')) {
      eliminacion_definitivamente = true;
    }
    else {
      datos.papelera_id = $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].folders_especiales.papelera.id;
    }

    $scope.ModalConfirmacionEliminarMensaje(

      function(confirmado){

        if(confirmado){

          if (null !== $scope.wi_seleccion_actual.folder.peticion) {
            $scope.wi_seleccion_actual.folder.peticion.resolve('usuario');
            $scope.wi_seleccion_actual.folder.peticion = null;
          }

          $scope.wi_seleccion_actual.folder.peticion = $q.defer();

          Webmail.eliminarMensajes(datos).then(function(respuesta){

            ngToast.dismiss();

            if (respuesta.estado)
            {

              $scope.wi_seleccion_actual.folder.peticion = null;

              if (0===respuesta.ids.incorrectos.length) {
                notificacion.clase = 'success';
                notificacion.contenido = (eliminacion_definitivamente) ? 'Los mensajes se han eliminado definitivamente' : 'Los mensajes se han enviado a la papelera';
              }
              else {
                notificacion.clase = 'warning';
                notificacion.contenido = 'Los mensajes que continuan seleccionados no se pudieron eliminar';
              }

              $scope.wiActualizarEstadoFoldersPorCuenta($scope.wi_seleccion_actual.ind_cuenta, true, false, true, notificacion);

            }
            else
            {
              ngToast.create({className: 'danger', content: '<b>'+respuesta.mensaje_error+'.</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

              $scope.wi_seleccion_actual.folder.peticion = null;
            }

          },function(respuesta) {
            ngToast.dismiss();
            ngToast.create({className: 'danger', content: '<b>No se pudo continuar con la operación. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

            $scope.wi_seleccion_actual.folder.peticion = null;
          });

        }
        else{

          $timeout(function () {
            $scope.$apply();
          }, 0);

        }

      },
      (eliminacion_definitivamente)?"¿Deseas eliminar definitivamente los mensajes seleccionados?" : "¿Deseas enviar a la papelera los mensajes seleccionados?"
    );

  };

  $scope.wiMostrarOcultarAsunto = function () {
    $scope.mostrar_asunto.estado = !$scope.mostrar_asunto.estado;
    $timeout(function () {
      $rootScope.$apply();
    }, 0);
  };

  $rootScope.$watch( function() {

    var medidas={};

    try {
      medidas.ancho_ventana = window.innerWidth;
      medidas.alto_ventana = window.innerHeight;
      medidas.altura_panel_cuentas = $("#wi_cont_panel_cuentas").offset().top;
    } catch (e) {
      return null;
    }

    try {
      medidas.altura_area_mensajes = $("#wi_area_mensajes").offset().top;
    } catch (e) {
      medidas.altura_area_mensajes = 0;
    }

    try {
      medidas.altura_cont_iframe = $("#wi_contenedor_iframe").offset().top;
    } catch (e) {
      medidas.altura_cont_iframe = 0;
    }

    return medidas;

  }, function(valor_actual, valor_anterior) {

    if (valor_actual!==null) {

      if (valor_actual.ancho_ventana<$rootScope.wi_ancho_min_barra_nav) {
        if(($('.wi-panel-izq').css('display') === 'none') && (-1===$scope.wi_seleccion_actual.ind_cuenta)){
          $('.wi-fondo-navbar').fadeIn();
          $( ".wi-panel-izq" ).toggle("slide");
        }
      }

      $scope.wi_css.cont_panel_cuentas.height = (valor_actual.alto_ventana - (valor_actual.altura_panel_cuentas+2))+"px";
      $scope.wi_css.cont_area_mensajes.height = (valor_actual.alto_ventana - (valor_actual.altura_area_mensajes+2))+"px";
      $scope.wi_css.cont_iframe.height = (valor_actual.alto_ventana - (valor_actual.altura_cont_iframe+5))+"px";

    }

  }, true);

  $scope.wiBuscarCorreos = function () {

    if (!$scope.wi_btn_disabled.mensajes && ''!==$scope.wi_busqueda.entrada) {

      var datos = {};

      $scope.wi_busqueda.estado = true;
      $scope.wi_busqueda.texto = angular.copy($scope.wi_busqueda.entrada);

      $scope.wi_seleccion_actual.folder.pagina = 1;

      if (null!==$scope.wi_seleccion_actual.folder.peticion) {
        $scope.wi_seleccion_actual.folder.peticion.resolve('usuario');
        $scope.wi_seleccion_actual.folder.peticion = null;
      }

      $scope.wi_seleccion_actual.folder.peticion = $q.defer();

      $scope.wi_todos_mensajes.seleccionados = false;
      $scope.wi_mensajes_seleccionados.lista = [];

      datos.correo_id = $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].correo_id;
      datos.folder_id = ('Outlook'!==$scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].servidor && 'Gmail'!==$scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].servidor) ? $scope.wi_seleccion_actual.folder.ruta:$scope.wi_seleccion_actual.folder.id ;
      datos.pagina = 1;
      datos.busqueda = $scope.wi_busqueda;

      Webmail.obtenerMensajesPorFolder(
        datos,
        $scope.wi_seleccion_actual.folder.peticion,
        false
      ).then(function (respuesta) {

        $scope.wi_seleccion_actual.folder.peticion = null;

        if (respuesta.estado) {

          $scope.wi_seleccion_actual.folder.mensajes = respuesta.mensajes;
          $scope.wi_seleccion_actual.folder.mensajes_novistos = respuesta.mensajes_novistos;
          $scope.wi_seleccion_actual.folder.numero_mensajes = respuesta.numero_mensajes;
          $scope.wi_seleccion_actual.folder.paginas = respuesta.paginas;

          $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].mensajes_novistos = 0;

          for (var i = 0; i < $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].folders.length; i++) {
            if ($scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].folders[i].hasOwnProperty('mensajes_novistos')) {
              $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].mensajes_novistos += $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].folders[i].mensajes_novistos;
            }
          }

          if (respuesta.mensajes.length>0) {
            $scope.wiOrdenarMensajes(-1, 'fecha_unix');
            $scope.wi_indicacion = null;
          }
          else {
            $scope.wi_indicacion = "NO SE ENCONTRARON MENSAJES QUE COINCIDAN CON LA BÚSQUEDA";
          }

          if (respuesta.mensaje_error) {
            ngToast.dismiss();
            ngToast.create({className: 'danger', content: '<b>'+respuesta.mensaje_error+'</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});
          }

          $timeout(function () {
            $('#wi_area_mensajes').scrollTop(0);
          }, 0);

        }
        else {
          $scope.wi_indicacion = "SELECCIONA UNA CARPETA";

          ngToast.dismiss();
          ngToast.create({className: 'danger', content: '<b>No se pudieron obtener los mensajes. '+respuesta.mensaje_error+'</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});
        }

      }, function(respuesta){

        $scope.wi_indicacion = "SELECCIONA UNA CARPETA";

        ngToast.dismiss();
        ngToast.create({className: 'danger', content: '<b>No se pudieron obtener los mensajes. Error '+respuesta.status+'</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

        $scope.wi_seleccion_actual.folder.peticion = null;

      });

    }

  };

  $scope.wiLimpiarBusqueda = function(estado_busqueda) {

    $scope.wi_todos_mensajes.seleccionados = false;
    $scope.wi_mensajes_seleccionados.lista = [];

    $scope.wi_busqueda = {
      entrada:'',
      estado: false,
      texto:''
    };

    $rootScope.wiEnfocarCampo('ebc');

    if (estado_busqueda) {
      $scope.wiSeleccionarFolder($scope.wi_seleccion_actual.ind_cuenta, $scope.wi_seleccion_actual.folder);
    }

  };

  $scope.wiAsignarIconoArchivo = function (mime) {

    var icono = null;
    var parte = mime.split("/");

    switch (parte[0]) {
      case 'text':
      icono = 'fa fa-file-text-o';
      break;
      case 'image':
      icono = 'fa fa-file-image-o';
      break;
      case 'audio':
      icono = 'fa fa-file-audio-o';
      break;
      case 'video':
      icono = 'fa fa-file-video-o';
      break;
      case 'application':
      switch (parte[1]) {
        case 'vnd.ms-excel':
        case 'vnd.ms-excel.addin.macroEnabled.12':
        case 'vnd.ms-excel.sheet.binary.macroEnabled.12':
        case 'vnd.ms-excel.sheet.macroEnabled.12':
        case 'vnd.ms-excel.template.macroEnabled.12':
        icono = 'fa fa-file-excel-o';
        break;
        case 'pdf':
        icono = 'fa fa-file-pdf-o';
        break;
        case 'vnd.ms-word.document.macroEnabled.12':
        case 'vnd.ms-word.template.macroEnabled.12':
        icono = 'fa fa-file-word-o';
        break;
        case 'zip':
        case 'rar':
        case 'gzip':
        icono = 'fa fa-file-archive-o';
        break;
        case 'vnd.ms-powerpoint':
        case 'vnd.ms-powerpoint.addin.macroEnabled.12':
        case 'vnd.ms-powerpoint.presentation.macroEnabled.12':
        case 'vnd.ms-powerpoint.slide.macroEnabled.12':
        case 'vnd.ms-powerpoint.slideshow.macroEnabled.12':
        case 'vnd.ms-powerpoint.template.macroEnabled.12':
        icono = 'fa fa-file-powerpoint-o';
        break;
        default:
        icono = 'fa fa-file-o';
      }
      break;
      default:
      icono = 'fa fa-file-o';
    }

    return icono;

  };

  $scope.wiOrdenarMensajes = function (direccion, propiedad) {

    $scope.wi_seleccion_actual.folder.mensajes.sort(function(a, b) {

      var propiedad_a = a[propiedad].toLowerCase();
      var propiedad_b = b[propiedad].toLowerCase();

      if (propiedad_a < propiedad_b) {
        return -1*direccion;
      } else if (propiedad_a > propiedad_b) {
        return 1*direccion;
      }

      return 0;
    });

    for (var i = 0; i < $scope.wi_seleccion_actual.folder.mensajes.length; i++) {
      $scope.wi_seleccion_actual.folder.mensajes[i].indice = i;
    }

  };

  $scope.wiAutenticarServidor = function (servidor) {
    if (servidor!=='Otro' && servidor!=='Yahoo') {
      Webmail.redireccionarServidor(servidor).then(function(respuesta){

        if (respuesta.estado)
        {
          $window.location.href = respuesta.uri;
        }
        else
        {
          ngToast.dismiss();
          ngToast.create({className: 'danger', content: '<b>'+respuesta.mensaje_error+'.</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
        }

      },function(respuesta) {
        ngToast.dismiss();
        ngToast.create({className: 'danger', content: '<b>No se pudo continuar con la operación. Error '+respuesta.status+'.</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
      });
    }
    else {

      if (servidor==='Yahoo') {
        $scope.wi_datos_cuenta.servidor_imap = "imap.mail.yahoo.com";
        $scope.wi_datos_cuenta.puerto_imap = "993";
        $scope.wi_datos_cuenta.servidor_smtp = "smtp.mail.yahoo.com";
        $scope.wi_datos_cuenta.puerto_smtp = "465";
      }

      $('#wiModalAgregarCuenta').modal('hide');
      $scope.wiMostrarModalDatosCuenta('alta', servidor);

    }
  };

  $scope.wiSeleccionarCuenta = function(indC){

    var cuenta_abierta = false;

    $scope.wi_cuentas[indC].abierto = !$scope.wi_cuentas[indC].abierto;

    if ($scope.wi_cuentas[indC].abierto) {

      if (0===$scope.wi_cuentas[indC].folders.length) {

        if (null !== $scope.wi_cuentas[indC].peticion) {
          $scope.wi_cuentas[indC].peticion.resolve('usuario');
        }

        $scope.wi_cuentas[indC].peticion = $q.defer();

        if ($scope.wi_seleccion_actual.ind_cuenta<0) {
          $scope.wi_indicacion = "CARGANDO...";
        }

        Webmail.obtenerFoldersPorCuenta(
          indC,
          $scope.wi_cuentas[indC].correo_id,
          $scope.wi_cuentas[indC].peticion,
          false
        ).then(function (respuesta) {

          $scope.wi_cuentas[respuesta.indice].peticion = null;

          if (respuesta.estado) {

            $scope.wi_cuentas[respuesta.indice].mensajes_novistos = 0;

            for (var i = 0; i < respuesta.folders.length; i++) {
              if (respuesta.folders[i].hasOwnProperty('mensajes_novistos')) {
                $scope.wi_cuentas[respuesta.indice].mensajes_novistos += respuesta.folders[i].mensajes_novistos;
              }
            }

            $scope.wi_cuentas[respuesta.indice].folders = respuesta.folders;

            $scope.wi_cuentas[respuesta.indice].folders_especiales = respuesta.folders_especiales;

            if ($scope.wi_seleccion_actual.ind_cuenta<0) {
              $scope.wi_indicacion = "SELECCIONA UNA CARPETA";
            }

            if (respuesta.mensaje_error) {
              ngToast.dismiss();
              ngToast.create({className: 'danger', content: '<b>'+respuesta.mensaje_error+'</b>', dismissOnTimeout:true, timeout:7000, dismissButton:true, dismissOnClick:true});
            }

          }
          else {

            $scope.wi_cuentas[respuesta.indice].abierto = false;
            $scope.wi_cuentas[respuesta.indice].folders = [];
            if ($scope.wi_seleccion_actual.ind_cuenta<0) {
              $scope.wi_indicacion = "SELECCIONA UNA CUENTA DE CORREO";
            }

            ngToast.dismiss();
            ngToast.create({className: 'danger', content: '<b>Error: '+respuesta.mensaje_error+' Si el problema continúa, elimina la cuenta y registrala nuevamente.</b>', dismissOnTimeout:true, timeout:7000, dismissButton:true, dismissOnClick:true});

          }

        }, function(respuesta){

            $scope.wi_cuentas[respuesta.data.indice].abierto = false;
            $scope.wi_cuentas[respuesta.data.indice].folders = [];
            if ($scope.wi_seleccion_actual.ind_cuenta<0) {
              $scope.wi_indicacion = "SELECCIONA UNA CUENTA DE CORREO";
            }

            ngToast.dismiss();
            ngToast.create({className: 'danger', content: '<b>Error: '+respuesta.status+'. Intenta más tarde.</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

            $scope.wi_cuentas[respuesta.data.indice].peticion = null;

        });

      }
      else if ($scope.wi_seleccion_actual.ind_cuenta<0) {
        $scope.wi_indicacion = "SELECCIONA UNA CARPETA";
      }

    }else {

      for (var i = 0; i < $scope.wi_cuentas.length; i++) {
        if ($scope.wi_cuentas[i].abierto) {
          cuenta_abierta = true;
          break;
        }
      }

      if ($scope.wi_seleccion_actual.ind_cuenta<0 && !cuenta_abierta) {
        $scope.wi_indicacion = "SELECCIONA UNA CUENTA";
      }
    }

  };

  $scope.wiSeleccionarFolder = function (indC, obj_folder) {

    var f;
    var datos = {};

    if (!$scope.wi_btn_disabled.mensajes) {

      $scope.wi_todos_mensajes.seleccionados = false;
      $scope.wi_mensajes_seleccionados.lista = [];

      $scope.wi_busqueda = {
        entrada:'',
        estado: false,
        texto: ''
      };

      obj_folder.pagina = 1;

      if (null!==$scope.wi_seleccion_actual.folder && $scope.wi_seleccion_actual.folder.seleccionable) {
        if (null!==$scope.wi_seleccion_actual.folder.peticion) {
          $scope.wi_seleccion_actual.folder.peticion.resolve('usuario');
          $scope.wi_seleccion_actual.folder.peticion = null;
        }
      }

      $scope.wi_seleccion_actual = {ind_cuenta:-1, folder:null, mensaje:null};

      $scope.wi_indicacion = "CARGANDO...";

      if (obj_folder.subfolders) {
        obj_folder.abierto = true;
        for (f = 0; f < obj_folder.folders.length; f++) {
          obj_folder.folders[f].mostrar = true;
        }
      }

      if (obj_folder.seleccionable) {

        obj_folder.peticion = $q.defer();

        datos.correo_id = $scope.wi_cuentas[indC].correo_id;
        datos.folder_id = ('Outlook'!==$scope.wi_cuentas[indC].servidor && 'Gmail'!==$scope.wi_cuentas[indC].servidor) ? obj_folder.ruta:obj_folder.id ;
        datos.pagina = 1;
        datos.busqueda = $scope.wi_busqueda;

        Webmail.obtenerMensajesPorFolder(
          datos,
          obj_folder.peticion,
          false
        ).then(function (respuesta) {

          obj_folder.peticion = null;

          if (respuesta.estado) {

            obj_folder.mensajes = respuesta.mensajes;
            obj_folder.mensajes_novistos = respuesta.mensajes_novistos;
            obj_folder.numero_mensajes = respuesta.numero_mensajes;
            obj_folder.paginas = respuesta.paginas;
            obj_folder.partes_ruta = obj_folder.ruta.split("/");
            $scope.wi_seleccion_actual.ind_cuenta = indC;
            $scope.wi_seleccion_actual.folder = obj_folder;

            $scope.wi_cuentas[indC].mensajes_novistos = 0;

            for (var i = 0; i < $scope.wi_cuentas[indC].folders.length; i++) {
              if ($scope.wi_cuentas[indC].folders[i].hasOwnProperty('mensajes_novistos')) {
                $scope.wi_cuentas[indC].mensajes_novistos += $scope.wi_cuentas[indC].folders[i].mensajes_novistos;
              }
            }

            if (respuesta.mensajes.length>0) {
              $scope.wiOrdenarMensajes(-1, 'fecha_unix');
              $scope.wi_indicacion = null;
            }
            else {
              $scope.wi_indicacion = "LA CARPETA SELECCIONADA NO CONTIENE MENSAJES";
            }

            if ($rootScope.wi_modo_tablet) {
              $('.wi-fondo-navbar').fadeOut();
              $( ".wi-panel-izq" ).toggle("slide");
            }

            if (respuesta.mensaje_error) {
              ngToast.dismiss();
              ngToast.create({className: 'danger', content: '<b>'+respuesta.mensaje_error+'</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});
            }

          }
          else {
            $scope.wi_indicacion = "SELECCIONA UNA CARPETA";

            ngToast.dismiss();
            ngToast.create({className: 'danger', content: '<b>No se pudieron obtener los mensajes. '+respuesta.mensaje_error+'</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});
          }

        }, function(respuesta){

          $scope.wi_indicacion = "SELECCIONA UNA CARPETA";

          ngToast.dismiss();
          ngToast.create({className: 'danger', content: '<b>No se pudieron obtener los mensajes. Error '+respuesta.status+'</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});

          obj_folder.peticion = null;

        });

      }
      else {
        obj_folder.partes_ruta = obj_folder.ruta.split("/");
        $scope.wi_seleccion_actual.ind_cuenta = indC;
        $scope.wi_seleccion_actual.folder = obj_folder;
        $scope.wi_indicacion = "LA CARPETA SELECCIONADA NO CONTIENE MENSAJES";

        if ($rootScope.wi_modo_tablet) {
          $('.wi-fondo-navbar').fadeOut();
          $( ".wi-panel-izq" ).toggle("slide");
        }

      }

    }

  };

  $scope.wiSeleccionarMensaje = function (mensaje){

    if (!$scope.wi_btn_disabled.mensajes) {

      if (null !== $scope.wi_seleccion_actual.folder.peticion) {
        $scope.wi_seleccion_actual.folder.peticion.resolve('usuario');
        $scope.wi_seleccion_actual.folder.peticion = null;
      }

      $scope.wi_seleccion_actual.folder.peticion = $q.defer();

      if (null!==mensaje.contenido) {

        $scope.wi_seleccion_actual.mensaje = mensaje;
        $scope.wi_indicacion = null;
        $timeout(function () {
          $('.wi-iframe-mensaje').contents().scrollTop(0);
        }, 0);

        $scope.wi_seleccion_actual.folder.peticion = null;

      }
      else {

        Webmail.obtenerContenidoMensaje(
          $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].correo_id,
          $scope.wi_seleccion_actual.folder.ruta,
          mensaje.id
        ).then(function (respuesta) {

          $scope.wi_seleccion_actual.folder.peticion = null;

          if (respuesta.estado) {

            mensaje.contenido = respuesta.contenido;

            for (var i = 0; i < mensaje.contenido.adjunto.length; i++) {
              mensaje.contenido.adjunto[i].icono = $scope.wiAsignarIconoArchivo(mensaje.contenido.adjunto[i].tipo);
            }

            mensaje.destinatarios_responder = [];

            mensaje.destinatario_responder = mensaje.remitente;

            if (mensaje.hasOwnProperty('responder_a')) {
              if (1===mensaje.responder_a.length) {
                mensaje.destinatario_responder = mensaje.responder_a[0];
              }
              else if(mensaje.responder_a.length>1){
                for (var r = 0; r < mensaje.responder_a.length; r++) {
                  mensaje.destinatarios_responder.push(mensaje.responder_a[r]);
                }
              }
            }

            if (mensaje.hasOwnProperty('cc')) {
              for (var c = 0; c < mensaje.cc.length; c++) {
                mensaje.destinatarios_responder.push(mensaje.cc[c]);
              }
            }

            for (var d = 0; d < mensaje.destinatarios_responder.length; d++) {
              if (mensaje.destinatarios_responder[d]===mensaje.remitente || mensaje.destinatarios_responder[d]===$scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].correo) {
                mensaje.destinatarios_responder.splice(d,1);
              }
            }

            if (0===mensaje.destinatarios_responder.length) {
              delete mensaje.destinatarios_responder;
            }

            $scope.wi_seleccion_actual.mensaje = mensaje;
            $scope.wi_indicacion = null;
            $timeout(function () {
              $('.wi-iframe-mensaje').contents().scrollTop(0);
            }, 0);

            if (!mensaje.visto) {
              $scope.wiActualizarEstadoFoldersPorCuenta($scope.wi_seleccion_actual.ind_cuenta, false, true, false, null);
              mensaje.visto = true;
            }

          }
          else {
            mensaje.contenido = null;
            $scope.wi_seleccion_actual.mensaje = null;
            $scope.wi_indicacion = null;
            ngToast.dismiss();
            ngToast.create({className: 'danger', content: '<b>No se pudo obteber el contenido del mensaje. '+respuesta.mensaje_error+'</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
          }

        }, function(respuesta){

          mensaje.contenido = null;
          $scope.wi_seleccion_actual.mensaje = null;
          $scope.wi_indicacion = null;
          ngToast.dismiss();
          ngToast.create({className: 'danger', content: '<b>No se pudo obteber el contenido del mensaje. Error '+respuesta.status+'</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

          $scope.wi_seleccion_actual.folder.peticion = null;

        });

      }
    }

  };

  $scope.wiCambiarMensaje = function (direccion) {
    var nuevo_indice = $scope.wi_seleccion_actual.mensaje.indice + direccion;
    if (nuevo_indice > -1 && nuevo_indice < $scope.wi_seleccion_actual.folder.mensajes.length) {
      $scope.wiSeleccionarMensaje($scope.wi_seleccion_actual.folder.mensajes[nuevo_indice]);
    }
  };

  $scope.wiEliminarMensaje = function (mensaje_id){

    var notificacion = null;
    var papelera_id = null;
    if (!$scope.wi_btn_disabled.mensajes) {

      if ($scope.wi_seleccion_actual.folder.hasOwnProperty('es_papelera')) {
        notificacion = "El mensaje se ha eliminado definitivamente";
      }
      else {
        notificacion = "El mensaje se ha enviado a la papelera";
        papelera_id = $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].folders_especiales.papelera.id;
      }

      $scope.ModalConfirmacionEliminarMensaje(

        function(confirmado){

          if(confirmado){

            if (null !== $scope.wi_seleccion_actual.folder.peticion) {
              $scope.wi_seleccion_actual.folder.peticion.resolve('usuario');
              $scope.wi_seleccion_actual.folder.peticion = null;
            }

            $scope.wi_seleccion_actual.folder.peticion = $q.defer();

            Webmail.eliminarMensaje(
              $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].correo_id,
              $scope.wi_seleccion_actual.folder.ruta,
              mensaje_id,
              papelera_id
            ).then(function (respuesta) {

              $scope.wi_seleccion_actual.folder.peticion = null;

              if (respuesta.estado) {
                for (var i = 0; i < $scope.wi_seleccion_actual.folder.mensajes.length; i++) {
                  if ($scope.wi_seleccion_actual.folder.mensajes[i].id===mensaje_id) {
                    $scope.wi_seleccion_actual.folder.mensajes.splice(i,1);
                  }
                }
                $scope.wi_seleccion_actual.mensaje = null;
                ngToast.dismiss();
                $scope.wiActualizarEstadoFoldersPorCuenta($scope.wi_seleccion_actual.ind_cuenta, true, false, true, {clase:'success', contenido:notificacion});
              }
              else {
                ngToast.dismiss();
                ngToast.create({className: 'danger', content: '<b>No se pudo eliminar el mensaje. '+respuesta.mensaje_error+'</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
              }

            }, function(respuesta){

              ngToast.dismiss();
              ngToast.create({className: 'danger', content: '<b>No se pudo eliminar el mensaje. Error '+respuesta.status+'</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

              $scope.wi_seleccion_actual.folder.peticion = null;

            });

          }
          else{

            $timeout(function () {
              $scope.$apply();
            }, 0);

          }

        },
        (null===papelera_id)?"¿Deseas eliminar definitivamente el mensaje seleccionado?" : "¿Deseas enviar a la papelera el mensaje seleccionado?"
      );

    }

  };

  $scope.wiMoverMensaje = function (mensaje_id, destino_id, destino_ruta){

    if (!$scope.wi_btn_disabled.mensajes) {

      if (null !== $scope.wi_seleccion_actual.folder.peticion) {
        $scope.wi_seleccion_actual.folder.peticion.resolve('usuario');
        $scope.wi_seleccion_actual.folder.peticion = null;
      }

      $scope.wi_seleccion_actual.folder.peticion = $q.defer();

      Webmail.moverMensaje(
        $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].correo_id,
        $scope.wi_seleccion_actual.folder.ruta,
        mensaje_id,
        destino_id
      ).then(function (respuesta) {

        $scope.wi_seleccion_actual.folder.peticion = null;

        if (respuesta.estado) {

          for (var i = 0; i < $scope.wi_seleccion_actual.folder.mensajes.length; i++) {
            if ($scope.wi_seleccion_actual.folder.mensajes[i].id===mensaje_id) {
              $scope.wi_seleccion_actual.folder.mensajes.splice(i,1);
              break;
            }
          }

          $scope.wi_seleccion_actual.mensaje = null;
          ngToast.dismiss();
          $scope.wiActualizarEstadoFoldersPorCuenta($scope.wi_seleccion_actual.ind_cuenta, true, false, true, {clase:'success', contenido:'El mensaje se ha movido a la carpeta: '+destino_ruta});

        }
        else {
          ngToast.dismiss();
          ngToast.create({className: 'danger', content: '<b>No se pudo mover el mensaje. '+respuesta.mensaje_error+'</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
        }

      }, function(respuesta){

        ngToast.dismiss();
        ngToast.create({className: 'danger', content: '<b>No se pudo mover el mensaje. Error '+respuesta.status+'</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

        $scope.wi_seleccion_actual.folder.peticion = null;

      });
    }

  };

  $scope.wiReenviarMensaje = function () {

    var comentario = "";
    var destinatarios = "";
    var cc = "";
    var tmp_obj={};
    var partes_asunto = [];
    var i=0;

    for (i = 0; i < $scope.wi_seleccion_actual.mensaje.destinatarios.length; i++) {
      destinatarios += $scope.wi_seleccion_actual.mensaje.destinatarios[i];
      if (i<$scope.wi_seleccion_actual.mensaje.destinatarios.length-1) {
        destinatarios += "; ";
      }
    }

    if ($scope.wi_seleccion_actual.mensaje.hasOwnProperty('cc')) {
      for (i = 0; i < $scope.wi_seleccion_actual.mensaje.cc.length; i++) {
        cc += $scope.wi_seleccion_actual.mensaje.cc[i];
        if (i<$scope.wi_seleccion_actual.mensaje.cc.length-1) {
          cc += "; ";
        }
      }
    }

    $scope.wi_nuevo_envio.remitente = $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta];
    $scope.wi_nuevo_envio.asunto = angular.copy($scope.wi_seleccion_actual.mensaje.asunto);

    partes_asunto = $scope.wi_nuevo_envio.asunto.split(" ");

    if ((-1===partes_asunto[0].toLowerCase().indexOf("rv")) && (-1===partes_asunto[0].toLowerCase().indexOf("fwd"))) {
      $scope.wi_nuevo_envio.asunto = "Fwd: "+$scope.wi_nuevo_envio.asunto;
    }

    $scope.wi_nuevo_envio.mensaje_anterior.contenido = angular.copy($scope.wi_seleccion_actual.mensaje.contenido);

    comentario =
    "<span>---------- Mensaje reenviado ----------</span><br>"+

    "<span><b>De: </b>"+angular.copy($scope.wi_seleccion_actual.mensaje.nombre_remitente)+" &lt;"+angular.copy($scope.wi_seleccion_actual.mensaje.remitente)+"&gt;</span><br>"+

    "<span><b>Fecha: </b>"+angular.copy($scope.wi_seleccion_actual.mensaje.fecha)+"&nbsp;&nbsp;"+angular.copy($scope.wi_seleccion_actual.mensaje.hora)+"</span><br>"+

    "<span><b>Asunto: </b>"+angular.copy($scope.wi_seleccion_actual.mensaje.asunto)+"</span><br>"+

    "<span><b>Para: </b>"+destinatarios+"</span><br>";

    if (""!==cc) {
      comentario += "<span><b>Cc: </b>"+cc+"</span><br>";
    }
    comentario += "<br>";

    $scope.wi_nuevo_envio.mensaje_anterior.contenido.cuerpo.datos = comentario + $scope.wi_nuevo_envio.mensaje_anterior.contenido.cuerpo.datos;
    $scope.wi_nuevo_envio.mensaje_anterior.contenido.cuerpo.datos_originales = comentario + $scope.wi_nuevo_envio.mensaje_anterior.contenido.cuerpo.datos_originales;

    $scope.wi_nuevo_envio.mensaje_anterior.id = angular.copy($scope.wi_seleccion_actual.mensaje.id);

    $scope.wi_nuevo_envio.mensaje_anterior.ruta_id = ('Outlook'!==$scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].servidor) ? $scope.wi_seleccion_actual.folder.ruta : $scope.wi_seleccion_actual.folder.id;

    for (i = 0; i < $scope.wi_nuevo_envio.mensaje_anterior.contenido.adjunto_enlinea.length; i++) {
      $scope.wi_nuevo_envio.mensaje_anterior.contenido.adjunto_enlinea[i].noalmacenado = true;
    }

    for (i = 0; i < $scope.wi_nuevo_envio.mensaje_anterior.contenido.adjunto.length; i++) {
      tmp_obj = {cancelado:false, tamano:null};
      tmp_obj.id = $scope.wi_nuevo_envio.mensaje_anterior.contenido.adjunto[i].id;
      tmp_obj.nombre = $scope.wi_nuevo_envio.mensaje_anterior.contenido.adjunto[i].nombre;
      tmp_obj.tipo = $scope.wi_nuevo_envio.mensaje_anterior.contenido.adjunto[i].tipo;
      tmp_obj.tamano = null;
      tmp_obj.carga_completa = true;
      tmp_obj.progreso = 100;
      tmp_obj.estilo = null;
      tmp_obj.icono = $scope.wiAsignarIconoArchivo(tmp_obj.tipo);
      tmp_obj.noalmacenado = true;

      $scope.wi_nuevo_envio.adjuntos.push(tmp_obj);
    }

    $scope.wi_seleccion_actual.mensaje = null;
    $scope.wiMostrarModalMensaje('reenvio');
  };

  $scope.wiResponderMensaje = function (responder_atodos) {

    var comentario = "";
    var tmp_obj={};
    var partes_asunto = [];
    var i=0;

    if (responder_atodos) {
      $scope.wi_nuevo_envio.destinatarios = angular.copy($scope.wi_seleccion_actual.mensaje.destinatarios_responder);
      $scope.wi_nuevo_envio.destinatarios.push($scope.wi_seleccion_actual.mensaje.destinatario_responder);
    }
    else {
      $scope.wi_nuevo_envio.destinatarios.push(angular.copy($scope.wi_seleccion_actual.mensaje.destinatario_responder));
    }

    for (i = 0; i < $scope.wi_nuevo_envio.destinatarios.length; i++) {
      $scope.wi_nuevo_envio.destinatarios[i] = {correo:$scope.wi_nuevo_envio.destinatarios[i], registrado:false};
    }

    Webmail.obtenerContactosPorCuenta($scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].correo_id).then(function (respuesta) {
      for (var d = 0; d < $scope.wi_nuevo_envio.destinatarios.length; d++) {
        for (var i = 0; i < respuesta.length; i++) {
          if ($scope.wi_nuevo_envio.destinatarios[d].correo.toLowerCase()===respuesta[i].correo.toLowerCase()) {
            $scope.wi_nuevo_envio.destinatarios[d].registrado = true;
            break;
          }
        }
      }
    }, function (respuesta) {});

    $scope.wi_nuevo_envio.remitente = $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta];
    $scope.wi_nuevo_envio.asunto = angular.copy($scope.wi_seleccion_actual.mensaje.asunto);

    partes_asunto = $scope.wi_nuevo_envio.asunto.split(" ");

    if (-1===partes_asunto[0].toLowerCase().indexOf("re")) {
      $scope.wi_nuevo_envio.asunto = "Re: "+$scope.wi_nuevo_envio.asunto;
    }

    $scope.wi_nuevo_envio.mensaje_anterior.contenido = angular.copy($scope.wi_seleccion_actual.mensaje.contenido);


    comentario =
    "<span>"+angular.copy($scope.wi_seleccion_actual.mensaje.fecha)+"&nbsp;&nbsp;"+angular.copy($scope.wi_seleccion_actual.mensaje.hora)+
    "&nbsp;&nbsp;"+angular.copy($scope.wi_seleccion_actual.mensaje.nombre_remitente)+
    "&nbsp;&nbsp;&lt;"+angular.copy($scope.wi_seleccion_actual.mensaje.remitente)+"&gt;;</span><br><br>";

    $scope.wi_nuevo_envio.mensaje_anterior.contenido.cuerpo.datos = comentario + "<blockquote style=\"border-left:2px solid #ccc;margin:0 0 0 8px;padding:0 0 0 10px;\">"+$scope.wi_nuevo_envio.mensaje_anterior.contenido.cuerpo.datos+"</blockquote>";

    $scope.wi_nuevo_envio.mensaje_anterior.contenido.cuerpo.datos_originales = comentario + "<blockquote style=\"border-left:2px solid #ccc;margin:0 0 0 8px;padding:0 0 0 10px;\">"+$scope.wi_nuevo_envio.mensaje_anterior.contenido.cuerpo.datos_originales+"</blockquote>";

    $scope.wi_nuevo_envio.mensaje_anterior.id = angular.copy($scope.wi_seleccion_actual.mensaje.id);

    $scope.wi_nuevo_envio.mensaje_anterior.ruta_id = ('Outlook'!==$scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].servidor) ? $scope.wi_seleccion_actual.folder.ruta : $scope.wi_seleccion_actual.folder.id;

    for (i = 0; i < $scope.wi_nuevo_envio.mensaje_anterior.contenido.adjunto_enlinea.length; i++) {
      $scope.wi_nuevo_envio.mensaje_anterior.contenido.adjunto_enlinea[i].noalmacenado = true;
    }

    $scope.wi_seleccion_actual.mensaje = null;
    $scope.wiMostrarModalMensaje('respuesta');
  };

  $scope.wiDescargarArchivoAdjunto = function (adjunto_id, nombre_archivo, tipo_archivo) {

    var url = "php/API/index.php/DescargarArchivoAdjuntoWebmail?"+
    "correo_id="+btoa($scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].correo_id)+"&"+
    "ruta_folder="+btoa($scope.wi_seleccion_actual.folder.ruta)+"&"+
    "mensaje_id="+btoa($scope.wi_seleccion_actual.mensaje.id)+"&"+
    "adjunto_id="+btoa(adjunto_id)+"&"+
    "nombre_archivo="+btoa(nombre_archivo)+"&"+
    "tipo_archivo="+btoa(tipo_archivo);

    var enlace = document.createElement('a');
    enlace.setAttribute('href', url);
    // enlace.setAttribute("download", filename);

    var evento_click = new MouseEvent("click", {
      "view": window,
      "bubbles": true,
      "cancelable": false
    });
    enlace.dispatchEvent(evento_click);

  };

  $scope.wiAbrirCerrarFolder = function (obj_folder) {

    var f;

    obj_folder.abierto = !obj_folder.abierto;
    for (f = 0; f < obj_folder.folders.length; f++) {
      obj_folder.folders[f].mostrar = !obj_folder.folders[f].mostrar;
    }

  };


  $scope.wiMostrarModalAgregarCuentas = function(){
    $('#wiModalAgregarCuenta').modal('show');
    $scope.wi_mostrar_btn_msj = false;
  };

  $scope.wiMostrarOcultarPanelCuentas = function () {

    if($('.wi-panel-izq').css('display') === 'none'){
      $('.wi-fondo-navbar').fadeIn();
    } else {
      $('.wi-fondo-navbar').fadeOut();
    }

    $( ".wi-panel-izq" ).toggle("slide");

  };

  $scope.wiMostrarModalMensaje = function (operacion) {
    $scope.wi_nuevo_envio.operacion = operacion;
    $('#wiModalMensaje').modal('show');
    $scope.wi_mostrar_btn_msj = false;
    wiObtenerContactos();
  };

  $scope.wiCambiarRemitente = function () {

    if ($scope.wi_cuentas.length>0) {

      if ($scope.wi_nuevo_envio.tamano.total > $scope.wi_tamano_max_adjunto[$scope.wi_nuevo_envio.remitente.servidor]) {
        $scope.wi_nuevo_envio.tamano.excedido = true;
      }
      else {
        $scope.wi_nuevo_envio.tamano.excedido = false;
      }

      wiObtenerContactos();

    }

  };

  $scope.wiEliminarDestinatario = function (indice) {
    $scope.wi_nuevo_envio.destinatarios.splice(indice,1);
  };

  $scope.wiSeleccionarDestinatario = function () {

    var agregado = false;
    var tmp = null;

    for (var d = 0; d < $scope.wi_nuevo_envio.destinatarios.length; d++) {
      if ($scope.wi_nuevo_envio.destinatario_ingresado.correo.toLowerCase() === $scope.wi_nuevo_envio.destinatarios[d].correo.toLowerCase()) {
        agregado = true;
        break;
      }
    }

    if (!agregado) {
      tmp = angular.copy($scope.wi_nuevo_envio.destinatario_ingresado);
      tmp.registrado=true;
      $scope.wi_nuevo_envio.destinatarios.push(tmp);
    }

    $scope.wi_nuevo_envio.destinatario_ingresado = null;
    $scope.wi_nuevo_envio.mostrar_destinatario_novalido = false;

  };

  $scope.wiIngresarDestinatario = function () {

    var existe = false;
    var indice = null;
    var tmp = null;
    var agregado = false;

    if (null!==$scope.wi_nuevo_envio.destinatario_ingresado) {
      $scope.wi_nuevo_envio.mostrar_destinatario_novalido = true;
    }

    if ($scope.wi_nuevo_envio.destinatario_ingresado) {

      $scope.wi_nuevo_envio.destinatario_ingresado = $scope.wi_nuevo_envio.destinatario_ingresado.trim();

      for (var d = 0; d < $scope.wi_nuevo_envio.destinatarios.length; d++) {
        if ($scope.wi_nuevo_envio.destinatario_ingresado.toLowerCase()===$scope.wi_nuevo_envio.destinatarios[d].correo.toLowerCase()) {
          agregado=true;
          break;
        }
      }

      if (!agregado) {
        for (var i = 0; i < $scope.wi_contactos.length; i++) {
          if ($scope.wi_nuevo_envio.destinatario_ingresado.toLowerCase()===$scope.wi_contactos[i].correo.toLowerCase()) {
            existe = true;
            indice = i;
            break;
          }
        }
        if(existe){
          tmp = angular.copy($scope.wi_contactos[indice]);
          tmp.registrado=true;
          $scope.wi_nuevo_envio.destinatarios.push(tmp);
        }else {
          tmp = {};
          if ($scope.wi_nuevo_envio.destinatario_ingresado.length>0) {
            tmp.correo = angular.copy($scope.wi_nuevo_envio.destinatario_ingresado);
            tmp.registrado = false;
            $scope.wi_nuevo_envio.destinatarios.push(tmp);
          }
        }
      }

      $scope.wi_nuevo_envio.mostrar_destinatario_novalido = false;
      $scope.wi_nuevo_envio.destinatario_ingresado = null;
    }


  };

  $scope.wiEventoBlurDestinatario = function () {
    if ($scope.wi_no_result_contactos) {
      $scope.wiIngresarDestinatario();
    }
  };

  $scope.wiEventoTeclearDestinatario = function (evento) {

    var caracter = evento.which || evento.keyCode;

    switch (caracter) {
      case 13:
      case 32:
      $scope.wiIngresarDestinatario();
      break;
      case 188:
      if ($scope.wi_nuevo_envio.destinatario_ingresado) {
        $scope.wi_nuevo_envio.destinatario_ingresado = $scope.wi_nuevo_envio.destinatario_ingresado.replace(",", "");
      }
      $scope.wiIngresarDestinatario();
      break;
      default:
      $scope.wi_nuevo_envio.mostrar_destinatario_novalido = false;
    }

  };

  $scope.wiEliminarArchivoAdjunto = function (indice, ocultar_modal=false) {

    $scope.wi_nuevo_envio.adjuntos[indice].btn_deshabilitado = true;

    if (!$scope.wi_nuevo_envio.adjuntos[indice].hasOwnProperty('noalmacenado')) {
      $scope.wi_nuevo_envio.adjuntos[indice].peticion.resolve('usuario');
    }

    $scope.wi_nuevo_envio.adjuntos[indice].estilo = 'warning';

    if (!$scope.wi_nuevo_envio.adjuntos[indice].hasOwnProperty('noalmacenado')) {

      Webmail.eliminarArchivoAdjunto($scope.wi_nuevo_envio.adjuntos[indice].id).then(function (respuesta) {

        if (!ocultar_modal) {

          if (respuesta.estado) {
            $scope.wi_nuevo_envio.adjuntos[indice].cancelado = true;
            $scope.wi_nuevo_envio.tamano.total -= $scope.wi_nuevo_envio.adjuntos[indice].tamano;
            if ($scope.wi_nuevo_envio.tamano.total > $scope.wi_tamano_max_adjunto[$scope.wi_nuevo_envio.remitente.servidor]) {
              $scope.wi_nuevo_envio.tamano.excedido = true;
            } else {
              $scope.wi_nuevo_envio.tamano.excedido = false;
            }
          } else {
            ngToast.dismiss();
            ngToast.create({className: 'danger', content: "<b>El archivo '"+$scope.wi_nuevo_envio.adjuntos[indice].nombre+"' no se pudo eliminar. " +respuesta.mensaje_error+".</b>", dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
          }

          $scope.wi_nuevo_envio.adjuntos[indice].btn_deshabilitado = false;

        }

      }, function(respuesta){

        if (!ocultar_modal) {

          ngToast.dismiss();
          ngToast.create({className: 'danger', content: "<b>El archivo '"+$scope.wi_nuevo_envio.adjuntos[indice].nombre+"' no se pudo eliminar. Error: "+respuesta.status+".</b>", dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

          $scope.wi_nuevo_envio.adjuntos[indice].btn_deshabilitado = false;

        }

      });

    }
    else {
      $scope.wi_nuevo_envio.adjuntos[indice].cancelado = true;
      $scope.wi_nuevo_envio.adjuntos[indice].btn_deshabilitado = false;
    }

  };

  $scope.wiAdjuntarArchivos = function(adjunto) {

    var tamano = angular.copy($scope.wi_nuevo_envio.tamano);
    var indice_archivo = 0;
    var nombre_repetido = false;

    $scope.wi_btn_disabled.adjuntar_archivos = true;

    $timeout(function () {

      for (var k = 0; k < adjunto.files.length; k++) {

        tamano.total += adjunto.files[k].size;

        if (tamano.total > $scope.wi_tamano_max_adjunto[$scope.wi_nuevo_envio.remitente.servidor]) {
          tamano.excedido = true;
          break;
        }

      }

      if (tamano.excedido) {

        ngToast.dismiss();
        ngToast.create({className: 'warning', content: "<b>Los archivos no se han adjuntado porque se supera el limite de "+$scope.wi_tamano_max_adjunto[$scope.wi_nuevo_envio.remitente.servidor]/1000000+" MB.</b>", dismissOnTimeout:true, timeout:7000, dismissButton:true, dismissOnClick:true});

        $("#wi_entrada_archivo_enviar").val('');

        $scope.wi_btn_disabled.adjuntar_archivos = false;

        return false;

      }


      for (var i = 0; i < adjunto.files.length; i++) {

        var tmp = {};
        tmp.nombre = adjunto.files[i].name;

        for (var a = 0; a < $scope.wi_nuevo_envio.adjuntos.length; a++) {
          if (tmp.nombre===$scope.wi_nuevo_envio.adjuntos[a].nombre) {
            if (!$scope.wi_nuevo_envio.adjuntos[a].cancelado) {
              nombre_repetido = true;
              break;
            }
          }
        }

        if (!nombre_repetido) {
          tmp.id = null;
          tmp.tamano = adjunto.files[i].size;
          tmp.tipo = adjunto.files[i].type;
          tmp.icono = $scope.wiAsignarIconoArchivo(adjunto.files[i].type);
          tmp.contenido = adjunto.files[i];
          tmp.progreso = 0;
          tmp.peticion = null;
          tmp.cancelado = false;
          tmp.carga_completa = false;
          tmp.btn_oculto = true;
          tmp.btn_deshabilitado = false;
          tmp.estilo = null;

          $scope.wi_nuevo_envio.adjuntos.push(tmp);
          $scope.wi_nuevo_envio.tamano.total += tmp.tamano;

          indice_archivo = $scope.wi_nuevo_envio.adjuntos.length;
          indice_archivo = (indice_archivo>0)?indice_archivo-1:indice_archivo;

          Webmail.obtenerIdArchivoAdjunto(indice_archivo).then(function (respuesta) {

            if (respuesta.estado) {

              $scope.wi_nuevo_envio.adjuntos[respuesta.indice].id = respuesta.id;

              var archivo = new FormData();
              archivo.append('archivo', $scope.wi_nuevo_envio.adjuntos[respuesta.indice].contenido);
              archivo.append('nombre_archivo', $scope.wi_nuevo_envio.adjuntos[respuesta.indice].id);

              $scope.wi_nuevo_envio.adjuntos[respuesta.indice].peticion = $q.defer();

              $scope.wi_nuevo_envio.adjuntos[respuesta.indice].btn_oculto = false;

              Webmail.almacenarArchivoAdjunto(
                archivo,
                respuesta.indice,
                $scope.wi_nuevo_envio.adjuntos[respuesta.indice].peticion
              ).then(function(respuesta) {

                if (respuesta.estado) {

                  $scope.wi_nuevo_envio.adjuntos[respuesta.indice].carga_completa = true;
                  $scope.wi_nuevo_envio.adjuntos[respuesta.indice].tipo = respuesta.tipo;

                } else {

                  ngToast.dismiss();
                  ngToast.create({className: 'danger', content: "<b>El archivo '"+$scope.wi_nuevo_envio.adjuntos[respuesta.indice].nombre+"' no se pudo adjuntar. " +respuesta.mensaje_error+".</b>", dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

                  $scope.wiEliminarArchivoAdjunto(respuesta.indice);

                }

              }, function (respuesta) {

                if ('usuario'!==$scope.wi_nuevo_envio.adjuntos[respuesta.data.indice].peticion.promise.$$state.value) {
                  ngToast.dismiss();
                  ngToast.create({className: 'danger', content: "<b>El archivo '"+$scope.wi_nuevo_envio.adjuntos[respuesta.data.indice].nombre+"' no se pudo adjuntar. Error: " +respuesta.status+".</b>", dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

                  $scope.wiEliminarArchivoAdjunto(respuesta.data.indice);
                }

              }, function (respuesta) {
                $scope.wi_nuevo_envio.adjuntos[respuesta.indice].progreso = respuesta.progreso;
              });


            }
            else {
              ngToast.dismiss();
              ngToast.create({className: 'danger', content: "<b>El archivo '"+$scope.wi_nuevo_envio.adjuntos[respuesta.indice].nombre+"' no se pudo adjuntar. " +respuesta.mensaje_error+".</b>", dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

              $scope.wiEliminarArchivoAdjunto(respuesta.indice);
            }

          }, function (respuesta) {
            ngToast.dismiss();
            ngToast.create({className: 'danger', content: "<b>El archivo '"+$scope.wi_nuevo_envio.adjuntos[respuesta.data.indice].nombre+"' no se pudo adjuntar. Error: " +respuesta.status+".</b>", dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

            $scope.wiEliminarArchivoAdjunto(respuesta.data.indice);
          });


        } else {
          ngToast.dismiss();
          ngToast.create({className: 'warning', content: "<b>El archivo '"+tmp.nombre+"' no se pudo adjuntar porque ya existe uno con el mismo nombre</b>", dismissOnTimeout:true, timeout:7000, dismissButton:true, dismissOnClick:true});
        }


      }

      $rootScope.$apply();

      $("#wi_entrada_archivo_enviar").val('');
      $scope.wi_btn_disabled.adjuntar_archivos = false;

    }, 0);

  };

  $scope.wiEventoAdjuntarArchivos = function () {
    $("#wi_entrada_archivo_enviar").trigger('click');
  };

  $scope.wiEstadoBtnCancelarEnvio = function () {

    var estado = false;

    for (var i = 0; i < $scope.wi_nuevo_envio.adjuntos.length; i++) {
      if ($scope.wi_nuevo_envio.adjuntos[i].btn_oculto) {
        estado = true;
        break;
      }
    }

    return estado;
  };

  $scope.wiOcultarModalMensaje = function (formulario) {

    for (var i = 0; i < $scope.wi_nuevo_envio.adjuntos.length; i++) {
      if (!$scope.wi_nuevo_envio.adjuntos[i].cancelado) {
        $scope.wiEliminarArchivoAdjunto(i, true);
      }
    }

    $('#wiModalMensaje').modal('hide');
    $scope.wi_mostrar_btn_msj = true;
    wiLimpiarFormularioEnvioMensaje(formulario);

  };

  $scope.wiMandarFormularioEnvio = function (formulario) {

    var datos = {};
    var i = 0;
    var error = false;

    $scope.wi_btn_disabled.frm_envio = true;
    $scope.wi_frm_enviado.enviar_mensaje = true;

    $scope.wiIngresarDestinatario();

    if (!formulario.$valid) {
      $scope.wi_nuevo_envio.mostrar_destinatario_novalido = true;

      for (i = 0; i < formulario.$$controls.length; i++) {
        if(formulario.$$controls[i].$invalid){
          document.getElementsByName(formulario.$$controls[i].$name)[0].focus();
          break;
        }
      }

      $scope.wi_btn_disabled.frm_envio = false;
      return false;
    }

    if ($scope.wi_nuevo_envio.tamano.excedido) {
      $scope.wi_btn_disabled.frm_envio = false;
      return false;
    }

    for (i = 0; i < $scope.wi_nuevo_envio.adjuntos.length; i++) {
      if ( !$scope.wi_nuevo_envio.adjuntos[i].cancelado && !$scope.wi_nuevo_envio.adjuntos[i].carga_completa) {
        error = true;
        ngToast.dismiss();
        ngToast.create({className: 'warning', content: "<b>Por favor espera a que los archivos adjuntos terminen de cargarse</b>", dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});
        break;
      }
    }

    if (error) {
      $scope.wi_btn_disabled.frm_envio = false;
      return false;
    }

    if ( !wi_alerta_asunto_texto && $scope.wi_nuevo_envio.operacion==='nuevo') {

      if (!$scope.wi_nuevo_envio.asunto.trim().length && !$scope.wi_nuevo_envio.cuerpo.trim().length) {
        $scope.wi_mensaje_alerta_asunto_texto = '¿Quieres enviar el mensaje sin asunto ni texto en el cuerpo?';
      } else if (!$scope.wi_nuevo_envio.asunto.trim().length && $scope.wi_nuevo_envio.cuerpo.trim().length) {
        $scope.wi_mensaje_alerta_asunto_texto = '¿Quieres enviar el mensaje sin asunto?';
      } else if ($scope.wi_nuevo_envio.asunto.trim().length && !$scope.wi_nuevo_envio.cuerpo.trim().length) {
        $scope.wi_mensaje_alerta_asunto_texto = '¿Quieres enviar el mensaje sin texto en el cuerpo?';
      }

      if ($scope.wi_mensaje_alerta_asunto_texto.length) {
        $('#wiModalAlertaAsuntoTexto').modal('show');
        wi_alerta_asunto_texto = true;
        $scope.wi_btn_disabled.frm_envio = false;
        return false;
      }

    }

    datos.remitente_id = angular.copy($scope.wi_nuevo_envio.remitente.correo_id);
    datos.enviados_id = angular.copy($scope.wi_nuevo_envio.remitente.folders_especiales.salida.id);
    datos.destinatarios = [];
    datos.nuevos_contactos = [];

    for (i = 0; i < $scope.wi_nuevo_envio.destinatarios.length; i++) {
      datos.destinatarios.push(angular.copy($scope.wi_nuevo_envio.destinatarios[i].correo));
      if (!$scope.wi_nuevo_envio.destinatarios[i].registrado) {
        datos.nuevos_contactos.push(angular.copy($scope.wi_nuevo_envio.destinatarios[i].correo));
      }
    }

    datos.asunto = angular.copy($scope.wi_nuevo_envio.asunto).trim();
    datos.cuerpo = angular.copy($scope.wi_nuevo_envio.cuerpo).trim();

    datos.adjuntos_enlinea = [];

    if ('nuevo'!==$scope.wi_nuevo_envio.operacion) {
      datos.cuerpo += "<br><br>"+$scope.wi_nuevo_envio.mensaje_anterior.contenido.cuerpo.datos_originales;
      datos.adjuntos_enlinea = $scope.wi_nuevo_envio.mensaje_anterior.contenido.adjunto_enlinea;
      datos.mensaje_anterior = {
        id: $scope.wi_nuevo_envio.mensaje_anterior.id,
        ruta_id: $scope.wi_nuevo_envio.mensaje_anterior.ruta_id
      };
    }

    datos.operacion = $scope.wi_nuevo_envio.operacion;

    datos.adjuntos = [];

    for (i = 0; i < $scope.wi_nuevo_envio.adjuntos.length; i++) {
      if (!$scope.wi_nuevo_envio.adjuntos[i].cancelado) {
        var tmp_obj = {};
        tmp_obj.id = angular.copy($scope.wi_nuevo_envio.adjuntos[i].id);
        tmp_obj.nombre = angular.copy($scope.wi_nuevo_envio.adjuntos[i].nombre);
        tmp_obj.tamano = angular.copy($scope.wi_nuevo_envio.adjuntos[i].tamano);
        tmp_obj.tipo = angular.copy($scope.wi_nuevo_envio.adjuntos[i].tipo);
        tmp_obj.contenido = null;

        if ($scope.wi_nuevo_envio.adjuntos[i].hasOwnProperty('noalmacenado')) {
          tmp_obj.noalmacenado = angular.copy($scope.wi_nuevo_envio.adjuntos[i].noalmacenado);
        }

        datos.adjuntos.push(tmp_obj);
      }
    }


    Webmail.enviarMensaje(datos).then(function (respuesta) {

      $('#wiModalMensaje').modal('hide');
      $scope.wi_mostrar_btn_msj=true;
      $scope.wi_btn_disabled.frm_envio = false;
      wiLimpiarFormularioEnvioMensaje(formulario);

      if (respuesta.estado) {

        if (respuesta.mensaje_error) {
          ngToast.dismiss();
          ngToast.create({className: 'warning', content: "<b>"+respuesta.mensaje_error+"</b>", dismissOnTimeout:true, timeout:30000, dismissButton:true, dismissOnClick:true});
        }
        else {
          ngToast.dismiss();
          ngToast.create({className: 'success', content: '<b>El mensaje se ha enviado correctamente</b>', dismissOnTimeout:true, timeout:30000, dismissButton:true, dismissOnClick:true});
        }

      }
      else {
        ngToast.dismiss();
        ngToast.create({className: 'danger', content: '<b>El mensaje no pudo ser enviado. '+respuesta.mensaje_error+'</b>', dismissOnTimeout:true, timeout:30000, dismissButton:true, dismissOnClick:true});
      }


    }, function (respuesta) {
      ngToast.dismiss();
      ngToast.create({className: 'danger', content: '<b>El mensaje no pudo ser enviado. Error: '+respuesta.status+'</b>', dismissOnTimeout:true, timeout:30000, dismissButton:true, dismissOnClick:true});

      $('#wiModalMensaje').modal('hide');
      $scope.wi_mostrar_btn_msj=true;
      $scope.wi_btn_disabled.frm_envio = false;
      wiLimpiarFormularioEnvioMensaje(formulario);
    });

  };

  $scope.wiOcultarModalDatosCuenta = function(formulario) {

    $('#wiModalDatosCuenta').modal('hide');
    $scope.wi_mostrar_btn_msj = true;
    wiLimpiarFormularioDatosCuenta(formulario);

    if (0===$scope.wi_cuentas.length) {
      $scope.wiMostrarModalAgregarCuentas();
      $scope.wi_indicacion = "REGISTRA UNA CUENTA DE CORREO";
    }

  };

  $scope.wiMostrarModalDatosCuenta = function(operacion, tipo_servidor, correo_id=null, indice=null) {

    if ('actualizacion' === operacion) {

      Webmail.obtenerConfiguracionCuenta(correo_id, tipo_servidor).then( function (respuesta) {
        if (respuesta.estado) {
          $scope.wi_datos_cuenta.indice = indice;
          $scope.wi_datos_cuenta.operacion = operacion;
          $scope.wi_datos_cuenta.tipo_servidor = tipo_servidor;
          $scope.wi_datos_cuenta.correo_id = correo_id;

          for (var i = 0; i < $scope.tiempo_comprobacion.length; i++) {
            if (respuesta.datos.tiempo_comprobacion == $scope.tiempo_comprobacion[i].minutos) {
              $scope.wi_datos_cuenta.tiempo_comprobacion = $scope.tiempo_comprobacion[i];
              break;
            }
          }

          $scope.wi_datos_cuenta.nombre = respuesta.datos.nombre;
          $scope.wi_datos_cuenta.correo = respuesta.datos.correo;

          if ('Otro'===tipo_servidor || 'Yahoo'===tipo_servidor) {
            $scope.wi_datos_cuenta.password = respuesta.datos.password;
            $scope.wi_datos_cuenta.servidor_imap = respuesta.datos.servidor_imap;
            $scope.wi_datos_cuenta.puerto_imap = respuesta.datos.puerto_imap;
            $scope.wi_datos_cuenta.servidor_smtp = respuesta.datos.servidor_smtp;
            $scope.wi_datos_cuenta.puerto_smtp = respuesta.datos.puerto_smtp;
          }

          $('#wiModalDatosCuenta').modal('show');
        }
        else {
          ngToast.dismiss();
          ngToast.create({className: 'danger', content: "<b>No se pudieron obtener los datos de la configuración. "+respuesta.mensaje_error+"</b>", dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
        }
      }, function (respuesta) {
        ngToast.dismiss();
        ngToast.create({className: 'danger', content: "<b>No se pudieron obtener los datos de la configuración. Error: "+respuesta.status+"</b>", dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
      });

    }
    else {
      $scope.wi_datos_cuenta.operacion = operacion;
      $scope.wi_datos_cuenta.tipo_servidor = tipo_servidor;
      $('#wiModalDatosCuenta').modal('show');
    }

  };

  $scope.wiContinuarDatosCuenta = function (formulario) {

    var datos = {};
    $scope.wi_btn_disabled.agregar_cuenta = true;
    $scope.wi_frm_enviado.agregar_cuenta = true;

    if (!formulario.$valid) {
      $( "#btn_agregar_cuenta" ).focus();
      $scope.wi_btn_disabled.agregar_cuenta = false;
      return false;
    }

    if (1===$scope.wi_datos_cuenta.etapa && ('Otro'===$scope.wi_datos_cuenta.tipo_servidor || 'Yahoo'===$scope.wi_datos_cuenta.tipo_servidor)) {
      $scope.wi_datos_cuenta.etapa = 2;
      $scope.wi_btn_disabled.agregar_cuenta = false;
      $scope.wi_frm_enviado.agregar_cuenta = false;
      return false;
    }

    if ('Otro'===$scope.wi_datos_cuenta.tipo_servidor || 'Yahoo'===$scope.wi_datos_cuenta.tipo_servidor) {

      datos.password = angular.copy($scope.wi_datos_cuenta.password);
      datos.servidor_imap = angular.copy($scope.wi_datos_cuenta.servidor_imap).trim();
      datos.puerto_imap = angular.copy($scope.wi_datos_cuenta.puerto_imap).trim();
      datos.servidor_smtp = angular.copy($scope.wi_datos_cuenta.servidor_smtp).trim();
      datos.puerto_smtp = angular.copy($scope.wi_datos_cuenta.puerto_smtp).trim();
      datos.tiempo_comprobacion = angular.copy($scope.wi_datos_cuenta.tiempo_comprobacion.minutos);

    }

    datos.nombre = angular.copy($scope.wi_datos_cuenta.nombre).trim();
    datos.tiempo_comprobacion = angular.copy($scope.wi_datos_cuenta.tiempo_comprobacion.minutos);
    datos.correo = angular.copy($scope.wi_datos_cuenta.correo).trim();

    switch ($scope.wi_datos_cuenta.operacion) {
      case 'alta':


      Webmail.almacenarCredencialesCorreo(datos).then(function (respuesta) {
        if (respuesta.estado) {
          $('#wiModalDatosCuenta').modal('hide');
          $scope.wi_mostrar_btn_msj = true;
          $scope.wi_btn_disabled.agregar_cuenta = false;
          wiLimpiarFormularioDatosCuenta(formulario);

          $scope.wi_cuentas.push({
            abierto: false,
            correo: datos.correo,
            correo_id: respuesta.correo_id,
            folders: [],
            mensajes_novistos: 0,
            peticion: null,
            servidor: "Otro",
            tiempo_comprobacion: datos.tiempo_comprobacion
          });

          $scope.wiActualizarEstadoFoldersPorCuenta($scope.wi_cuentas.length-1, false, true, false, null);
          // $route.reload();

          ngToast.dismiss();
          ngToast.create({className: 'success', content: '<b>La cuenta '+datos.correo+' se ha agregado correctamente.</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
        }
        else {
          $scope.wi_btn_disabled.agregar_cuenta = false;
          ngToast.dismiss();
          ngToast.create({className: 'danger', content: '<b>'+respuesta.mensaje_error+'</b>', dismissOnTimeout:true, timeout:30000, dismissButton:true, dismissOnClick:true});
        }
      }, function (respuesta) {
        $('#wiModalDatosCuenta').modal('hide');
        $scope.wi_mostrar_btn_msj = true;
        $scope.wi_btn_disabled.agregar_cuenta = false;
        wiLimpiarFormularioDatosCuenta(formulario);

        ngToast.dismiss();
        ngToast.create({className: 'danger', content: '<b>La configuración de la cuenta no pudo ser guardada. Error: '+respuesta.status+'</b>', dismissOnTimeout:true, timeout:30000, dismissButton:true, dismissOnClick:true});
      });

      break;

      case 'actualizacion':

      if (null !== $scope.wi_cuentas[$scope.wi_datos_cuenta.indice].peticion) {
        $scope.wi_cuentas[$scope.wi_datos_cuenta.indice].peticion.resolve('usuario');
      }

      datos.correo_id = angular.copy($scope.wi_datos_cuenta.correo_id);
      datos.tipo_servidor = angular.copy($scope.wi_datos_cuenta.tipo_servidor).trim();

      Webmail.actualizarConfiguracionCuenta(datos).then(function (respuesta) {
        if (respuesta.estado) {
          $('#wiModalDatosCuenta').modal('hide');
          $scope.wi_mostrar_btn_msj = true;
          $scope.wi_btn_disabled.agregar_cuenta = false;

          $scope.wi_cuentas[$scope.wi_datos_cuenta.indice].tiempo_comprobacion = datos.tiempo_comprobacion;

          $scope.wiActualizarEstadoFoldersPorCuenta($scope.wi_datos_cuenta.indice, false, true, true, null);

          wiLimpiarFormularioDatosCuenta(formulario);

          // $route.reload();
          ngToast.dismiss();
          ngToast.create({className: 'success', content: '<b>La configuración se ha actualizado correctamente.</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
        }
        else {
          $scope.wi_btn_disabled.agregar_cuenta = false;
          ngToast.dismiss();
          ngToast.create({className: 'danger', content: '<b>La configuración no pudo ser actualizada. '+respuesta.mensaje_error+'</b>', dismissOnTimeout:true, timeout:30000, dismissButton:true, dismissOnClick:true});
        }
      }, function (respuesta) {
        $('#wiModalDatosCuenta').modal('hide');
        $scope.wi_mostrar_btn_msj = true;
        $scope.wi_btn_disabled.agregar_cuenta = false;
        wiLimpiarFormularioDatosCuenta(formulario);

        ngToast.dismiss();
        ngToast.create({className: 'danger', content: '<b>La configuración no pudo ser actualizada. Error: '+respuesta.status+'</b>', dismissOnTimeout:true, timeout:30000, dismissButton:true, dismissOnClick:true});
      });

      break;
      default:

    }


  };

  $scope.wiMostrarModalEliminarCuenta = function (correo_id, correo, indice) {
    $scope.wi_eliminar_cuenta.indice = indice;
    $scope.wi_eliminar_cuenta.id = correo_id;
    $scope.wi_eliminar_cuenta.correo = correo;
    $scope.wi_eliminar_cuenta.mensaje = "¿Deseas eliminar la cuenta de correo "+correo+" ?";
    $('#wiModalAlertaEliminarCuenta').modal('show');
  };

  $scope.wiOcultarModalEliminarCuenta = function () {
    $scope.wi_eliminar_cuenta.indice = null;
    $scope.wi_eliminar_cuenta.id = null;
    $scope.wi_eliminar_cuenta.correo = null;
    $scope.wi_eliminar_cuenta.mensaje = null;
    $('#wiModalAlertaEliminarCuenta').modal('hide');

    if (0===$scope.wi_cuentas.length) {
      $scope.wiMostrarModalAgregarCuentas();
      $scope.wi_indicacion = "REGISTRA UNA CUENTA DE CORREO";
    }

  };

  $scope.wiEliminarCuenta = function () {
    var cuenta_abierta = false;

    if (null !== $scope.wi_cuentas[$scope.wi_eliminar_cuenta.indice].peticion) {
      $scope.wi_cuentas[$scope.wi_eliminar_cuenta.indice].peticion.resolve('usuario');
    }

    $('#wiModalAlertaEliminarCuenta').modal('hide');

    Webmail.eliminarCuenta($scope.wi_eliminar_cuenta.id).then(function (respuesta) {

      if (respuesta.estado) {

        cuenta_abierta = $scope.wi_cuentas[$scope.wi_eliminar_cuenta.indice].abierto;
        $scope.wi_cuentas.splice($scope.wi_eliminar_cuenta.indice,1);

        if ($scope.wi_seleccion_actual.ind_cuenta===$scope.wi_eliminar_cuenta.indice || cuenta_abierta) {

          $scope.wi_seleccion_actual={ind_cuenta:-1, folder:null, mensaje:null};

          cuenta_abierta = false;
          for (var i = 0; i < $scope.wi_cuentas.length; i++) {
            if ($scope.wi_cuentas[i].abierto) {
              cuenta_abierta = true;
              break;
            }
          }

          $scope.wi_indicacion = (cuenta_abierta)?"SELECCIONA UNA CUENTA O CARPETA":"SELECCIONA UNA CUENTA";

        }

        ngToast.dismiss();
        ngToast.create({className: 'success', content: "<b>La cuenta de correo "+$scope.wi_eliminar_cuenta.correo+", se ha eliminado correctamente</b>", dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

        if (0===$scope.wi_cuentas.length) {
          $route.reload();
        }

      }
      else {
        ngToast.dismiss();
        ngToast.create({className: 'danger', content: "<b>"+respuesta.mensaje_error+"</b>", dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
      }

      $scope.wiOcultarModalEliminarCuenta();

    }, function (respuesta) {
      ngToast.dismiss();
      ngToast.create({className: 'danger', content: "<b>La cuenta de correo "+$scope.wi_eliminar_cuenta.correo+", no se pudo eliminar. Error: "+respuesta.status+"</b>", dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});

      $scope.wiOcultarModalEliminarCuenta();
    });

  };

  $scope.wiObtenerMensajesPorPagina = function (pagina, ignorar_carga, cancelar_peticion, es_actualizacion, notificacion) {

    if (null!==$scope.wi_seleccion_actual.folder.peticion) {

      if (cancelar_peticion) {
        $scope.wi_seleccion_actual.folder.peticion.resolve('usuario');
      }
      else {
        return false;
      }

    }

    var datos = {};

    $scope.wi_seleccion_actual.folder.peticion = $q.defer();

    $scope.wi_btn_disabled.mensajes = false;
    $scope.marcar_mensaje_deshabilitado = true;
    $scope.opc_opr_grupo_deshabilitado = true;

    if (!es_actualizacion) {
      $scope.wi_todos_mensajes.seleccionados = false;
      $scope.wi_mensajes_seleccionados.lista = [];
    }

    datos.correo_id = $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].correo_id;
    datos.folder_id = ('Outlook'!==$scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].servidor && 'Gmail'!==$scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].servidor) ? $scope.wi_seleccion_actual.folder.ruta : $scope.wi_seleccion_actual.folder.id;
    datos.pagina = pagina;
    datos.busqueda = $scope.wi_busqueda;

    Webmail.obtenerMensajesPorFolder(
      datos,
      $scope.wi_seleccion_actual.folder.peticion,
      ignorar_carga
    ).then(function (respuesta) {

      $scope.wi_btn_disabled.mensajes = true;

      $scope.wi_seleccion_actual.folder.peticion = null;

      if (respuesta.estado) {

        if (null!==notificacion) {
          ngToast.create({className: notificacion.clase, content: '<b>'+notificacion.contenido+'.</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
        }

        $scope.wi_seleccion_actual.folder.pagina = pagina;
        $scope.wi_seleccion_actual.folder.mensajes = respuesta.mensajes;
        $scope.wi_seleccion_actual.folder.mensajes_novistos = respuesta.mensajes_novistos;
        $scope.wi_seleccion_actual.folder.numero_mensajes = respuesta.numero_mensajes;
        $scope.wi_seleccion_actual.folder.paginas = respuesta.paginas;

        $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].mensajes_novistos = 0;

        for (var i = 0; i < $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].folders.length; i++) {
          if ($scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].folders[i].hasOwnProperty('mensajes_novistos')) {
            $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].mensajes_novistos += $scope.wi_cuentas[$scope.wi_seleccion_actual.ind_cuenta].folders[i].mensajes_novistos;
          }
        }

        if (respuesta.mensajes.length>0) {

          $scope.wiOrdenarMensajes(-1, 'fecha_unix');

          if (es_actualizacion && $scope.wi_mensajes_seleccionados.lista.length>0) {

            var indice_m = -1;
            var cp_lista_seleccionados = angular.copy($scope.wi_mensajes_seleccionados.lista);
            var n_seleccionados = 0;

            $scope.wi_mensajes_seleccionados.lista = [];

            for (var m = 0; m < $scope.wi_seleccion_actual.folder.mensajes.length; m++) {

              indice_m = cp_lista_seleccionados.indexOf($scope.wi_seleccion_actual.folder.mensajes[m].id);

              if (-1!==indice_m) {
                $scope.wi_seleccion_actual.folder.mensajes[m].seleccionado = true;
                $scope.wi_mensajes_seleccionados.lista.push($scope.wi_seleccion_actual.folder.mensajes[m].id);
                n_seleccionados ++;
              }

            }

            $scope.wi_todos_mensajes.seleccionados = (n_seleccionados === $scope.wi_seleccion_actual.folder.mensajes.length) ? true : false;

          }

        }

        if (respuesta.mensaje_error) {
          ngToast.dismiss();
          ngToast.create({className: 'danger', content: '<b>'+respuesta.mensaje_error+'</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
        }

        if (!ignorar_carga) {
          $timeout(function () {
            $('#wi_area_mensajes').scrollTop(0);
          }, 0);
        }

      }
      else {

        if (respuesta.hasOwnProperty('paginas')) {
          $scope.wiObtenerMensajesPorPagina(respuesta.paginas, ignorar_carga, cancelar_peticion, false, notificacion);
        }
        else if (!ignorar_carga) {
          ngToast.dismiss();
          ngToast.create({className: 'danger', content: '<b>No se pudieron obtener los mensajes. '+respuesta.mensaje_error+'</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});
        }

      }

      $scope.wi_btn_disabled.mensajes = false;
      $scope.marcar_mensaje_deshabilitado = false;
      $scope.opc_opr_grupo_deshabilitado = false;

    }, function(respuesta){

      $scope.marcar_mensaje_deshabilitado = false;
      $scope.opc_opr_grupo_deshabilitado = false;

      if (null!==$scope.wi_seleccion_actual.folder) {
        if (
          'usuario'!==respuesta.config.timeout.$$state.value && !ignorar_carga
        ) {
          ngToast.dismiss();
          ngToast.create({className: 'danger', content: '<b>No se pudieron obtener los mensajes. Error '+respuesta.status+'</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});
        }
        $scope.wi_seleccion_actual.folder.peticion = null;
      }
    });

  };

  function wiActualizarEstructuraFolders(estructura, datos) {
    for (var f = 0; f < estructura.length; f++) {

      if (estructura[f].hasOwnProperty('mensajes_novistos')) {
        estructura[f].mensajes_novistos = datos[estructura[f].id];
      }

      if (estructura[f].hasOwnProperty('folders')) {
        wiActualizarEstructuraFolders(estructura[f].folders, datos);
      }

    }
  }

  $scope.wiActualizarEstadoFoldersPorCuenta = function (ind_cuenta, cancelar_peticion, ignorar_carga, obtener_mensajes, notificacion){

    if (null !== $scope.wi_cuentas[ind_cuenta].peticion) {

      if (cancelar_peticion) {
        $scope.wi_cuentas[ind_cuenta].peticion.resolve('usuario');
      }
      else {
        return false;
      }

    }

    $scope.wi_cuentas[ind_cuenta].peticion = $q.defer();

    if ($scope.wi_cuentas[ind_cuenta].folders.length>0) {

      Webmail.obtenerEstadoFoldersPorCuenta(
        $scope.wi_cuentas[ind_cuenta].correo_id,
        ind_cuenta,
        $scope.wi_cuentas[ind_cuenta].peticion,
        ignorar_carga
      ).then(function (respuesta) {

        var indice_cuenta = respuesta.ind_cuenta;
        $scope.wi_cuentas[indice_cuenta].peticion = null;

        if (respuesta.estado) {

          wiActualizarEstructuraFolders($scope.wi_cuentas[indice_cuenta].folders, respuesta.estado_folders);

          $scope.wi_cuentas[indice_cuenta].mensajes_novistos = 0;

          for (var i = 0; i < $scope.wi_cuentas[indice_cuenta].folders.length; i++) {
            if ($scope.wi_cuentas[indice_cuenta].folders[i].hasOwnProperty('mensajes_novistos')) {
              $scope.wi_cuentas[indice_cuenta].mensajes_novistos += $scope.wi_cuentas[indice_cuenta].folders[i].mensajes_novistos;
            }
          }

          if (null!==$scope.wi_seleccion_actual.folder) {
            if (
              respuesta.estado_folders.hasOwnProperty($scope.wi_seleccion_actual.folder.id) &&
              $scope.wi_seleccion_actual.folder.seleccionable &&
              null===$scope.wi_seleccion_actual.mensaje && !$scope.wi_busqueda.estado && obtener_mensajes
            ) {
              $scope.wiObtenerMensajesPorPagina(
                $scope.wi_seleccion_actual.folder.pagina,
                ignorar_carga,
                cancelar_peticion,
                true,
                notificacion
              );
            }
          }

        }

      },function (respuesta) {
        $scope.wi_cuentas[respuesta.data.ind_cuenta].peticion = null;
      });

    }
    else {

      Webmail.obtenerFoldersPorCuenta(
        ind_cuenta,
        $scope.wi_cuentas[ind_cuenta].correo_id,
        $scope.wi_cuentas[ind_cuenta].peticion,
        ignorar_carga
      ).then(function (respuesta) {

        $scope.wi_cuentas[respuesta.indice].peticion = null;

        if (respuesta.estado) {

          $scope.wi_cuentas[respuesta.indice].mensajes_novistos = 0;

          for (var i = 0; i < respuesta.folders.length; i++) {
            if (respuesta.folders[i].hasOwnProperty('mensajes_novistos')) {
              $scope.wi_cuentas[respuesta.indice].mensajes_novistos += respuesta.folders[i].mensajes_novistos;
            }
          }

          $scope.wi_cuentas[respuesta.indice].folders = respuesta.folders;

          $scope.wi_cuentas[respuesta.indice].folders_especiales = respuesta.folders_especiales;

        }

      }, function(respuesta){
        $scope.wi_cuentas[respuesta.data.indice].peticion = null;
      });

    }

  };


  $scope.ModalConfirmacionEliminarMensaje = function (callback, texto_mensaje) {

    $scope.eliminar_mensaje = {
      mensaje:texto_mensaje
    };

    $('#modalEliminarMensaje').modal('show');

    $("#btn_eliminar_mensajes_si").unbind('click').click( function(){
      callback(true);
      $('#modalEliminarMensaje').modal('hide');
      $scope.eliminar_mensaje = {
        mensaje:''
      };
    });

    $("#btn_eliminar_mensajes_no").unbind('click').click( function(){
      callback(false);
      $('#modalEliminarMensaje').modal('hide');
      $scope.eliminar_mensaje = {
        mensaje:''
      };
    });

  };


  function wiActualizarEstadoFolders() {

    for (var c = 0; c < $scope.wi_cuentas.length; c++) {
      if (0===(wi_tiempo_transcurrido % $scope.wi_cuentas[c].tiempo_comprobacion)) {
        $scope.wiActualizarEstadoFoldersPorCuenta(c, false, true, true, null);
      }
    }

    wi_tiempo_transcurrido += 5;
  }



  //----MQRSYS Functions------------------
  $scope.ValidarPermiso = function()
  {
    for(var k=0; k<$scope.usuarioLogeado.Permiso.length; k++)
    {
      if($scope.usuarioLogeado.Permiso[k] == "CorreoCon")
      {
        $scope.permiso = true;
        break;
      }
    }
  };

  $scope.InicializarControlador = function()
  {
    $scope.ValidarPermiso();
    if($scope.permiso)
    {
      if($scope.usuarioLogeado.Aplicacion != "Correo")
      {
        $rootScope.IrPaginaPrincipal();
      }
      else
      {
        Webmail.obtenerRegistroErrores().then(function(respuesta) {

          if (''!==respuesta.error) {
            ngToast.dismiss();
            ngToast.create({className: 'danger', content: '<b>ERROR: '+respuesta.error+'</b>', dismissOnTimeout:true, timeout:5000, dismissButton:true, dismissOnClick:true});
          }

          Webmail.obtenerCuentas().then(function(respuesta){

            $scope.wi_cuentas = respuesta;

            if (0===$scope.wi_cuentas.length)
            {
              $scope.wiMostrarModalAgregarCuentas();
              $scope.wi_indicacion = "REGISTRA UNA CUENTA DE CORREO";
            }
            else
            {
              $scope.wi_nuevo_envio.remitente = $scope.wi_cuentas[0];
              $scope.wi_indicacion = "SELECCIONA UNA CUENTA DE CORREO";

              // wiActualizarEstadoFolders();
              // $window.sessionStorage.setItem('id_actualizacion_webmail', setInterval(wiActualizarEstadoFolders, 300000));
            }

          },function(respuesta) {

            if (0===$scope.wi_cuentas.length)
            {
              $scope.wiMostrarModalAgregarCuentas();
            }

            $scope.wi_indicacion = "No se pudieron obtener las cuentas registradas. Error "+respuesta.status;

            if ($rootScope.wi_modo_tablet) {
              ngToast.dismiss();
              ngToast.create({className: 'danger', content: '<b>'+$scope.wi_indicacion+'</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});
            }

          });


        }, function (respuesta) {

          if (0===$scope.wi_cuentas.length)
          {
            $scope.wiMostrarModalAgregarCuentas();
          }

          $scope.wi_indicacion = "No se pudo continuar con la operación. Error "+respuesta.status;

          if ($rootScope.wi_modo_tablet) {
            ngToast.dismiss();
            ngToast.create({className: 'danger', content: '<b>'+$scope.wi_indicacion+'</b>', dismissOnTimeout:true, timeout:6000, dismissButton:true, dismissOnClick:true});
          }
          // $scope.modal_mensaje = {icono:'fa fa-exclamation-triangle fa-2x', clase_icono:'wi-a-icono-alerta', contenido:'No se pudo continuar con la operación. Intenta más tarde.', clase_boton:'wi-a-btn-alerta'};
          // $('#wiModalMsgGenerico').modal('show');
        });
      }
    }
    else
    {
      $rootScope.IrPaginaPrincipal();
    }
  };

  $scope.usuarioLogeado =  datosUsuario.getUsuario();

  //verifica que haya un usuario logeado
  if($scope.usuarioLogeado !== null)
  {
    if(!$scope.usuarioLogeado.SesionIniciada)
    {
      $location.path('/Login');
    }
    else
    {
      $scope.InicializarControlador();
    }
  }

  //destecta cuando los datos del usuario cambian
  $scope.$on('cambioUsuario',function()
  {
    $scope.usuarioLogeado =  datosUsuario.getUsuario();

    if(!$scope.usuarioLogeado.SesionIniciada)
    {
      $location.path('/Login');
      return;
    }
    else
    {
      $scope.InicializarControlador();
    }
  });
  //--------------------------------------
}
