app.controller("CancioneroController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.titulo = "Cancionero";
    $scope.buscarCancionero = "";
    
    $scope.permiso = false;
    $scope.cancion = [];
    $scope.detalle = new Cancion();
    
    
    //----------------------------- Catálogos ------------------------------------
    $scope.GetCancion = function()              
    {
        GetCancion($http, $q, CONFIG, "todos").then(function(data)
        {
            $scope.cancion = data;
            $scope.GetArtistaPorCancion();
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetArtistaPorCancion = function()              
    {
        GetArtistaPorCancion($http, $q, CONFIG, "todos").then(function(data)
        {
            $scope.artistaCancion = data;
            $scope.SetArtistaCancion();
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.SetArtistaCancion = function()
    {
        var sqlBase = "Select ArtistaId, Nombre From ? WHERE CancionId = '";
        var sql = "";
        
        for(var k=0; k<$scope.cancion.length; k++)
        {
            sql = sqlBase;
            sql +=  $scope.cancion[k].CancionId + "'";
           
            $scope.cancion[k].Artista = alasql(sql,[$scope.artistaCancion]);
        } 
    };
        
    $scope.GetCancionero = function(cancion)              
    {
        GetCancionero($http, $q, CONFIG, cancion.CancionId).then(function(data)
        {
            cancion.Cancionero = data.Cancionero;
            cancion.NombreArchivo = data.NombreArchivo;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    //--------------- Detalles --------------------------
    $scope.VerDetalles = function(cancion)
    {
        $scope.detalle = cancion;
  
        if(cancion.Cancionero.length == 0)
        {
            $scope.GetCancionero(cancion);
        }
    };

    //manejo de vista
    $scope.ObtenerClaseCancion = function(cancion)
    {
        if(cancion.CancionId == $scope.detalle.CancionId)
        {
            return "active";
        }
        else
        {
            return ""; 
        }
    };
    
    //Ver Imagen
    $scope.VisualizarImagen = function(imagen)
    {
        $scope.verImagen = new Object();
        $scope.verImagen.imagen = imagen;
    };


    //--------------------------- Limpiar --------------------------------
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarCancionero = "";
                $("#buscarCancion").focus();
                break;
            default:
                break;
        }
    };
    
    //---- 

    //Busqueda de caciones
    $scope.BuscarCancion = function(cancion)
    {
        if($scope.buscarCancionero.length > 0)
        {
            var index = cancion.Titulo.toLowerCase().indexOf($scope.buscarCancionero.toLowerCase());
            
            
            if(index < 0)
            {
                return false;
            }
            else
            {
                if(index == 0)
                {
                    return true;
                }
                else
                {
                    if(cancion.Titulo[index-1] == " ")
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
        else
        {
            return true;
        }
        
    };
    
    /*----------------------- Usuario logeado --------------------------*/
    
    $scope.ValidarPermiso = function()
    {
        for(var k=0; k<$scope.usuarioLogeado.Permiso.length; k++)
        {
            if($scope.usuarioLogeado.Permiso[k] == "CancioneroCon")
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
            if($scope.usuarioLogeado.Aplicacion != "GuitaraBit")
            {
                $rootScope.IrPaginaPrincipal();
            }
            else
            {
                $scope.usuarioId = datosUsuario.getUsuarioId();
                $scope.GetCancion();
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
});
