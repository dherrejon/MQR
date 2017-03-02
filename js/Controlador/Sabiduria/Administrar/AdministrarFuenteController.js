app.controller("AdministrarFuenteController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.titulo = "Fuente";
    
    $scope.permiso = false;
    
    $scope.ValidarPermiso = function()
    {
        for(var k=0; k<$scope.usuarioLogeado.Permiso.length; k++)
        {
            if($scope.usuarioLogeado.Permiso[k] == "SabiduriaAdm")
            {
                $scope.permiso = true;
                break;
            }
        }
    };
    
    $scope.tabs = tabFuente;
    
    
    //Cambia el contenido de la pestaña
    $scope.SeleccionarTab = function(tab, index)    
    {
        $scope.titulo = tab.titulo;
        
        /*switch (index)
        {
            case 0:  
                $('#Autor').show();
                $('#Prefijo').hide();
                break;
            case 1:  
                $('#Prefijo').show();
                $('#Autor').hide();
                break;
            default:
                break;
        } */       
    };
    
    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        $scope.ValidarPermiso();
        if($scope.permiso)
        {
            if($scope.usuarioLogeado.Aplicacion.length == 0)
            {
                $rootScope.IrPaginaPrincipal();
            }
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
    
    
});


var tabFuente = [
                    {titulo:"Fuente", referencia: "#Fuente", clase:"active", area:"fuente"},
                    {titulo:"Tipo Fuente", referencia: "#TipoFuente", clase:"", area:"tipoFuente"}
                ];
