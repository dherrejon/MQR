app.controller("AplicacionController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.apps = aplicaciones;
    $scope.claseMargen = "margin-top:55px";
    
    $scope.IniciarApp = function(app)
    {
        datosUsuario.setAplicacion(app.texto);
        $location.path(app.paginaPrincipal);
        
        SetAplicacion(app.texto, $http, CONFIG);  
    };
    
    $scope.HabilitarAplicaciones = function()
    {
        for(var k=0; k<$scope.usuarioLogeado.Permiso.length; k++)
        {
            if($scope.usuarioLogeado.Permiso[k] == "SabiduriaCon" || $scope.usuarioLogeado.Permiso[k] == "SabiduriaAdm")
            {
                $scope.apps[0].habilitada = true;
            }
        }
    };
    
    /*------------------Indentifica cuando los datos del usuario han cambiado-------------------*/
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
            $scope.HabilitarAplicaciones();
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
            $scope.HabilitarAplicaciones();
        }
    });
    
});

var aplicaciones = [
                        {texto:"Sabiduría", habilitada:false, paginaPrincipal:"/Informacion", icono:"fa fa-lightbulb-o"},
                    ];