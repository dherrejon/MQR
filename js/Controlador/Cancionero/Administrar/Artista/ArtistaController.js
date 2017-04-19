app.controller("ArtistaController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, ARTISTA)
{   
    $scope.artista = [];
    
    $scope.ordenarArtista = "Nombre";
    $scope.buscarArtista = "";
    
    $scope.nuevoArtista = null;
    
    $scope.mensajeError = [];
    $scope.claseArtista = {nombre:"entrada"};
    
    
    $scope.usuarioId = datosUsuario.getUsuarioId();
    
    $scope.GetArtista = function()              
    {
        GetArtista($http, $q, CONFIG, $scope.usuarioId).then(function(data)
        {
            $scope.artista = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarArtista = function(campoOrdenar)
    {
        if($scope.ordenarArtista == campoOrdenar)
        {
            $scope.ordenarArtista = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarArtista = campoOrdenar;
        }
    };
    
    /*-----------------Abrir Panel Agregar-Editar termino-------------------*/
    $scope.AbrirArtista = function(operacion, artista)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevoArtista = new Artista();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevoArtista = SetArtista(artista);
        }
    
        $('#modalArtista').modal('toggle');
    };
     
    $scope.CerrarArtista = function()
    {
        $('#cerrarArtistaModal').modal('toggle');
    };
    
    $scope.ConfirmarCerrarArtista = function()
    {
        $('#modalArtista').modal('toggle');
        $scope.mensajeError = [];
        $scope.claseArtista = {nombre:"entrada"};
    };
    
    
    /*----------------- Terminar agregar-editar tema --------------------*/
    $scope.TerminarArtista = function(nombreInvalido)
    {
        if(!$scope.ValidarDatos(nombreInvalido))
        {
            $('#mensajeArtista').modal('toggle');
            return;
        }
        else
        {
            if($scope.operacion == "Agregar" || $scope.operacion == "AgregarExterior")
            {
                $scope.nuevoArtista.UsuarioId = $scope.usuarioId;
                $scope.AgregarArtista();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarArtista();
            }
        }
    };
    
    $scope.AgregarArtista = function()    
    {
        AgregarArtista($http, CONFIG, $q, $scope.nuevoArtista).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                if($scope.operacion == "Agregar")
                {
                    $scope.GetArtista();
                }
                else
                {
                    //$('#modalTema').modal('toggle');
                    $scope.nuevoArtista.ArtistaId = data[1].Id; 
                    $scope.artista.push($scope.nuevoArtista);
                    ARTISTA.TerminarArtista($scope.nuevoArtista);
                }
                
                $scope.mensaje = "Artista agregado.";
                $scope.EnviarAlerta('Modal');
                $scope.nuevoArtista = new Artista();
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeArtista').modal('toggle');
            }

        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeArtista').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarArtista = function()
    {
        EditarArtista($http, CONFIG, $q, $scope.nuevoArtista).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.GetArtista();
                $('#modalArtista').modal('toggle');
                $scope.mensaje = "Artista editado.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeArtista').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeArtista').modal('toggle');
        });
    };
    
    $scope.ValidarDatos = function(nombreInvalido)
    {
        $scope.mensajeError = [];
        
        if(nombreInvalido)
        {
            $scope.claseArtista.nombre = "entradaError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un nombre válido.";
        }
        else
        {
             $scope.claseArtista.nombre = "entrada";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.artista.length; k++)
        {
            if($scope.artista[k].Nombre.toLowerCase() == $scope.nuevoArtista.Nombre.toLowerCase()  && $scope.artista[k].ArtistaId != $scope.nuevoArtista.ArtistaId)
            {
                $scope.claseArtista.nombre = "entradaError";
                $scope.mensajeError[$scope.mensajeError.length] = "*El artista " + $scope.nuevoArtista.Nombre + " ya existe.";
                return false;
            }
        }
        
        return true;
    };
    
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarArtista = "";
                break;
            case 2:
                $scope.nuevoArtista.Nombre = "";
                break;
            default: 
                break;
        }
    };
    
    //------------------------------------ Borrar -------------------------------------------------------
    $scope.BorrarArtista = function(artista)
    {
        $scope.artistaBorrar = artista.ArtistaId;
        
        $scope.mensajeBorrar = "¿Estas seguro de borrar " + artista.Nombre + "?";
        $('#borrarArtista').modal('toggle');
    };
    
    $scope.ConfirmarBorrarArtista = function()
    {
        BorrarArtista($http, CONFIG, $q, $scope.artistaBorrar).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                //$scope.GetArtista();
                
                for(var k=0; k<$scope.artista.length; k++)
                {
                    if($scope.artista[k].ArtistaId == $scope.artistaBorrar)
                    {
                        $scope.artista.splice(k,1);
                        break;
                    }
                }
                
                $scope.mensaje = "Artista borrado.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeArtista').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeArtista').modal('toggle');
        });
    };
    
    //----------------------Inicializar---------------------------------
    $scope.GetArtista();
    
    //------------------------ Exterior ---------------------------
    $scope.$on('AgregarArtista',function()
    {
        $scope.operacion = "AgregarExterior";

        $scope.nuevoArtista = new Artista();
    
        $('#mensajeArtista').modal('toggle');
    });
    
    //------------------- Alertas ---------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoArtista").alert();

            $("#alertaExitosoArtista").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoArtista").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoArtista").alert();

            $("#alertaEditarExitosoArtista").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoArtista").fadeOut();
            }, 2000)
        }
    };
    
});

app.factory('ARTISTA',function($rootScope)
{
  var service = {};
  service.artista = null;
    
  service.AgregarArtista = function()
  {
      this.artista = null;
      $rootScope.$broadcast('AgregarArtista');
  };
    
  service.TerminarArtista = function(artista)
  {
      this.artista = artista;
      $rootScope.$broadcast('TerminarArtista');
  };
    
  service.GetArtista = function()
  {
      return this.artista;
  };

  return service;
});