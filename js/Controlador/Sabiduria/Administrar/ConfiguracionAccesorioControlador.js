app.controller("ConfiguaracionAccesorioController", function($scope, $http, $q, CONFIG, $rootScope, datosUsuario, $window, $filter, $location)
{   
    $rootScope.clasePrincipal = "";
    
    $scope.permisoUsuario = {
                            tipoAccesorio:{consultar:false, agregar:false, editar:false, activar:false}, 
                            muestrario:{consultar:false, agregar:false, editar:false, activar:false}
                            };
    $scope.IdentificarPermisos = function()
    {
        for(var k=0; k < $scope.usuarioLogeado.Permiso.length; k++)
        {
            if($scope.usuarioLogeado.Permiso[k] == "ConTAcConsultar")
            {
                $scope.permisoUsuario.tipoAccesorio.consultar = true;
            }
            else if($scope.usuarioLogeado.Permiso[k] == "ConTAcAgregar")
            {
                $scope.permisoUsuario.tipoAccesorio.agregar= true;
            }
            else if($scope.usuarioLogeado.Permiso[k] == "ConTAcEditar")
            {
                $scope.permisoUsuario.tipoAccesorio.editar = true;
            }
            else if($scope.usuarioLogeado.Permiso[k] == "ConTAcActivar")
            {
                $scope.permisoUsuario.tipoAccesorio.activar= true;
            }
            else if($scope.usuarioLogeado.Permiso[k] == "ConMAcConsultar")
            {
                $scope.permisoUsuario.muestrario.consultar= true;
            }
            else if($scope.usuarioLogeado.Permiso[k] == "ConMAcAgregar")
            {
                $scope.permisoUsuario.muestrario.agregar= true;
            }
            else if($scope.usuarioLogeado.Permiso[k] == "ConMAcEditar")
            {
                $scope.permisoUsuario.muestrario.editar = true;
            }
            else if($scope.usuarioLogeado.Permiso[k] == "ConMAcActivar")
            {
                $scope.permisoUsuario.muestrario.activar = true;
            }
        }
    };
    
    $scope.titulo = "Tipo Accesorio";
    $scope.tabs = tabAccesorio;
    
    //Cambia el contenido de la pestaña
    $scope.SeleccionarTab = function(tab, index)    
    {
        $scope.titulo = tab.titulo;
        
        switch (index)
        {
            case 0:  
                $('#TipoAccesorio').show();
                $('#Muestrario').hide();
                break;
            case 1:  
                $('#Muestrario').show();
                $('#TipoAccesorio').hide();
                break;
            default:
                break;
        }        
    };

    
    
});

//Pestañas
var tabAccesorio = 
    [
        {titulo:"Tipo Accesorio", referencia: "#TipoAccesorio", clase:"active", area:"tipoMaterial"},
        {titulo:"Muestrario Accesorios", referencia: "#Muestrario", clase:"", area:"material"},
    ];