var app = angular.module('MQR',['ngRoute','angular-md5']);

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


app.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) 
{   
    $httpProvider.interceptors.push('mhttpInterceptor');
    
    $routeProvider.
    when('/Login',{
        templateUrl: 'html/Login.html'
    }).
    when('/Aplicacion',{
        templateUrl: 'html/Aplicacion.html'
    }).
    //Sabiduría
    when('/Informacion',{
        templateUrl: 'html/Sabiduria/Informacion.html'
    }).
    otherwise({
        templateUrl: 'html/Login.html'
    });
}]);

app.run(function($rootScope, $location, $window, $http, CONFIG, $q, datosUsuario)
{   
    $rootScope.claseApp = "col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 appPanel";
    
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
  service.setAplicacion = function(aplicacion)
  {
      this.usuario.Aplicacion = aplicacion;
      $rootScope.$broadcast('cambioAplicaion');
  };
    
  return service;
});