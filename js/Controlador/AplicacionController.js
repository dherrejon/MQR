app.controller("AplicacionController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, APLICACION)
{   
    $scope.claseMargen = "margin-top:55px";
    
    $scope.grupoApp = APLICACION.GetGrupo();
    
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
    
    $scope.CambiarGrupoAplicacion = function(app)
    {
        $scope.grupoApp = app;
        APLICACION.SetGrupo(app);
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
                        {texto:"Life@Bit", habilitada:false,   icono:"fa fa-cog", grupo:"Inicio", isGrupo:true},

                        {texto:"Mis Actividades", habilitada:false, paginaPrincipal:"/Actividades",   icono:"fa fa-calendar", grupo:"Life@Bit", isGrupo:false},
                        {texto:"Mi Buscador", habilitada:false, paginaPrincipal:"/Buscador",   icono:"fa fa-search", grupo:"Life@Bit", isGrupo:false},

                        {texto:"Mi Diario", habilitada:false, paginaPrincipal:"/Diario", icono:"fa fa-clock-o", grupo:"Life@Bit", isGrupo:false},

                        {texto:"GuitaraBit", habilitada:false, paginaPrincipal:"/Cancionero", icono:"fa fa-music", grupo:"MQRSYS", isGrupo:false},
                        {texto:"WikiMario", habilitada:false, paginaPrincipal:"/Informacion", icono:"fa fa-book", grupo:"MQRSYS", isGrupo:false},
    
                        {texto:"Mis Notas", habilitada:false, paginaPrincipal:"/Notas", icono:"fa fa-sticky-note", grupo:"Life@Bit", isGrupo:false},
    
                        {texto:"MQRSYS", habilitada:false,   icono:"fa fa-cog", grupo:"Inicio", isGrupo:true},
                        
                    ];

app.factory('APLICACION',function($rootScope)
{
    var service = {};
    service.grupo = "Inicio";
    
    service.SetGrupo = function(grupo)
    {
        service.grupo = grupo;
    };
    
    service.GetGrupo = function()
    {
      return this.grupo;
    };

    return service;
});