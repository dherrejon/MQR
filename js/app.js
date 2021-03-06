var app = angular.module('MQR',['ngRoute','angular-md5', 'angular-loading-bar', 'ngMessages', 'ui.bootstrap', 'ngToast','textAngular','ngResource']);

app.constant('CONFIG',{
  APIURL: "php/API/index.php",
  APIKEY: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoid2ViLmFwcCIsImlhdCI6MTQ4NjUyMDMzMn0.y0ZN77h-2Ur4Sv4LkwW8XIuJ8sg6BIThF8dI2amVXPg",
});

app.factory('mhttpInterceptor', function($q,CONFIG,$rootScope,$window,$location)
{

  return{

    'request': function(config)
    {
      if(config.url.indexOf( CONFIG.APIURL) !== -1)
      {

        if($rootScope.status)
        {
          if($window.sessionStorage.getItem('Sistema_MQR') !== null)
          {
            config.headers['X-Api-Key'] = $window.sessionStorage.getItem('Sistema_MQR');
          }
          else
          {
            config.headers['X-Api-Key'] = CONFIG.APIKEY;
          }
        }
        else
        {
          config.headers['X-Api-Key'] = CONFIG.APIKEY;
        }
      }


      return config;

    },

    'response': function(response){

      if(response.headers('X-Api-Key') !== null)
      {
        if(response.headers('X-Origin-Response') === $location.host())
        {
          $window.sessionStorage.setItem('Sistema_MQR', response.headers('X-Api-Key'));
          $rootScope.ChecarSesion( response.headers('X-Api-Key') );
        }

      }

      return response;
    },

    responseError: function(response)
    {
      if(response.status === 401)
      {
        $location.path('/Login');
      }

      return $q.reject(response);
    }
  };
});


app.config(['$routeProvider', '$httpProvider', '$locationProvider', function($routeProvider, $httpProvider, $locationProvider)
{
  $locationProvider.hashPrefix('');
  $httpProvider.interceptors.push('mhttpInterceptor');
  $httpProvider.useApplyAsync(true);

  $routeProvider.
  when('/Login',{
    templateUrl: 'html/Login.html'
  }).
  when('/Aplicacion',{
    templateUrl: 'html/Aplicacion.html'
  }).
  when('/RecuperarPassword/:usuarioId/:codigo',{
    templateUrl: 'html/RecuperarPassword.html'
  }).
  //Sabiduría
  when('/Informacion',{
    templateUrl: 'html/Sabiduria/Informacion.html'
  }).
  //administrar
  when('/Etiqueta',{
    templateUrl: 'html/Sabiduria/Administrar/AdministrarEtiqueta.html'
  }).
  when('/Fuente',{
    templateUrl: 'html/Sabiduria/Administrar/AdministrarFuente.html'
  }).
  when('/Autor',{
    templateUrl: 'html/Sabiduria/Administrar/AdministrarAutor.html'
  }).
  when('/ConfigurarInformacion',{
    templateUrl: 'html/Sabiduria/Administrar/AdministrarInformacion.html'
  }).
  when('/Tema',{
    templateUrl: 'html/Sabiduria/Administrar/AdministrarTema.html'
  }).
  when('/Usuario',{
    templateUrl: 'html/Sabiduria/Administrar/Usuario.html'
  }).

  //Cancionero
  when('/Cancionero',{
    templateUrl: 'html/Cancionero/Cancionero.html'
  }).
  when('/Artista',{
    templateUrl: 'html/Cancionero/Administrar/AdministrarArtista.html'
  }).
  when('/Cancion',{
    templateUrl: 'html/Cancionero/Administrar/AdministrarCancion.html'
  }).

  //Webmail
  when('/Webmail',{
    templateUrl: 'html/Webmail/webmail.html'
  }).

  otherwise({
    templateUrl: 'html/Login.html'
  });
}]);

app.run(function($rootScope, $location, $window, $http, CONFIG, $q, datosUsuario, $timeout, Notificaciones)
{

  $rootScope.wi_ancho_min_barra_nav = 951;
  $rootScope.wi_modo_tablet = (window.innerWidth<$rootScope.wi_ancho_min_barra_nav) ? true : false;

  $rootScope.claseApp = "col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 appPanel";

  $rootScope.erNombrePersonal = /^([A-Z]|Ñ|[a-z]|[ñáéíóú]|[ÁÉÍÓÚ])+((\s|\.\s)([A-Z]|Ñ|[a-z]|[ñáéíóú]|[ÁÉÍÓÚ])+)*\.?\s?$/;   //expresion regular para los apellido y el nombre de una persona
  $rootScope.erEtiqueta = /^([^\s]){1,250}$/;   //expresion regular para los apellido y el nombre de una etiqueta
  $rootScope.erPassword = /^(\w){6}(\w)*$/;   //expresion regular para la contraseña
  $rootScope.erNombreUsuario = /^(\w|ñ){3}(\w|ñ)*$/;   //expresion regular para el nombre de usurio
  $rootScope.erNumeroEntero = /^([0-9]){0,5}$/;   //número entero
  $rootScope.erTema = /^\S+\s(\S+\s?){1,5}$/;   //expresion regular para los apellido y el nombre de una etiqueta


  $rootScope.ChecarSesion = function(token)           //verifica el esatdo de la sesión
  {
    var payload = token.split(".");
    var decode_payload = $.parseJSON( atob( payload[1] ) );

    if( decode_payload.state !== true )
    {
      if($window.sessionStorage.getItem('Sistema_MQR') !== null)
      {
        $window.sessionStorage.removeItem('Sistema_MQR');
      }

      if(decode_payload.state === 'expired')
      {
        $rootScope.CerrarSesion();
        if($location.path() !== "/Login")
        {
          $window.location = "#Login";
        }
      }
    }
  };

  $rootScope.GetEstadoSesion = function()            //Si el usuario ha iniciado sesion obtine los datos de este si se ha actualizado la aplicación web
  {
    SesionIniciada($http, $q, CONFIG).then(function(data)
    {
      if(data.SesionIniciada)
      {
        datosUsuario.enviarUsuario(data);
        Notificaciones.conectar();
      }
      else
      {
        datosUsuario.enviarUsuario(new Usuario());
      }
    }).catch(function(error){
      alert(error);
    });
  };

  $rootScope.GetEstadoSesion();                     //Cada ves que se inicializa la aplicación verifica los datos del ususario

  /*-----tamaño de la pantalla -----------*/
  $rootScope.anchoPantalla = $( window ).width();
  $( window ).resize(function()
  {
    $rootScope.anchoPantalla = $( window ).width();

    $rootScope.wi_modo_tablet = (window.innerWidth<$rootScope.wi_ancho_min_barra_nav) ? true : false;

    $rootScope.$apply();
  });

  $(document).on('shown.bs.modal', '.modal', function () {
    $timeout(function () {
      $('#contenedor_lista_notificaciones').scrollTop(0);
    }, 0);
  });

  $(document).on('show.bs.modal', '.modal', function () {
    var zIndex = 1040 + (10 * $('.modal:visible').length);
    $(this).css('z-index', zIndex);
    $timeout(function() {
      $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
    }, 0);
  });

  $(document).on('hidden.bs.modal', '.modal', function () {
    $('.modal:visible').length && $(document.body).addClass('modal-open');
  });

  $rootScope.wiEnfocarCampo = function(campoId) {
    document.getElementById(campoId).focus();
  };

  $rootScope.wiInteractuarCampo = function (eventoEnviar, campo) {
    var campoBorrado=(campo)?(campo.$dirty):false;
    return eventoEnviar || campoBorrado;
  };

  $rootScope.wiMostrarBtnLimpiarTexto = function (modelo, campo){
    var fmodelo = (modelo)?(modelo.length>0):false;
    return ( fmodelo || campo.$error.pattern || campo.$error.minlength || campo.$error.maxlength );
  };

});

//identificas cuando los datos del usuario cambian
app.factory('datosUsuario',function($rootScope)
{
  var service = {};
  service.usuario = null;

  service.enviarUsuario = function(usuario)
  {
    this.usuario = usuario;
    $rootScope.$broadcast('cambioUsuario');
  };
  service.getUsuario = function()
  {
    return this.usuario;
  };
  service.getUsuarioId = function()
  {
    return this.usuario.UsuarioId;
  };
  service.setAplicacion = function(aplicacion)
  {
    this.usuario.Aplicacion = aplicacion;
    $rootScope.$broadcast('cambioAplicaion');
  };

  return service;
});

/*--------Trabajar con multiples modales---------*/
// $(document).on('show.bs.modal', '.modal', function ()
// {
//   var zIndex = Math.max.apply(null, Array.prototype.map.call(document.querySelectorAll('*'), function(el)
//   {
//     return +el.style.zIndex;
//   })) + 9999999;
//
//   $(document).on('hidden.bs.modal', '.modal', function ()
//   {
//     $('.modal:visible').length && $(document.body).addClass('modal-open');
//   });
// });

//configuracion texAngular
app.config(['$provide', function($provide)
{
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions){
    taOptions.toolbar = [
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      ['html','insertLink'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent']
    ];
    return taOptions;
  }]);
}]);

//configuracion alertas ngToast
app.config(['ngToastProvider', function(ngToastProvider)
{
  ngToastProvider.configure({
    verticalPosition: 'bottom',
    horizontalPosition: 'left',
  });
}]);
