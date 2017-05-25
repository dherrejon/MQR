app.controller("AplicacionController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.claseMargen = "margin-top:55px";
    
    $scope.IniciarApp = function(app)
    {
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
    
    /*$scope.HabilitarAplicaciones = function()
    {
        for(var k=0; k<$scope.usuarioLogeado.Permiso.length; k++)
        {
            if($scope.usuarioLogeado.Permiso[k] == "SabiduriaCon" || $scope.usuarioLogeado.Permiso[k] == "SabiduriaAdm")
            {
                $rootScope.apps[0].habilitada = true;
            }
            if($scope.usuarioLogeado.Permiso[k] == "CancioneroCon" || $scope.usuarioLogeado.Permiso[k] == "CancioneroAdm")
            {
                $rootScope.apps[2].habilitada = true;
            }
        }
    };*/
    
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
            $scope.IniciarApp("Aplicaciones");
            //$rootScope.HabilitarAplicaciones();
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
            $scope.IniciarApp("Aplicaciones");
            //$rootScope.HabilitarAplicaciones();
        }
    });
        
});

var aplicaciones = [
                        {texto:"Conocimiento", habilitada:false, paginaPrincipal:"/Informacion", icono:"fa fa-book"},
                        {texto:"Actividades", habilitada:false, paginaPrincipal:"/Actividades",   icono:"fa fa-calendar"},
                        {texto:"Cancionero", habilitada:false, paginaPrincipal:"/Cancionero", icono:"fa fa-music"},
                        {texto:"Diario", habilitada:false, paginaPrincipal:"/Diario", icono:"fa fa-clock-o"}
                    ];