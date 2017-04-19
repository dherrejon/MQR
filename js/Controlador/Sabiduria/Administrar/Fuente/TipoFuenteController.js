app.controller("TipoFuenteController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, TIPOFUENTE)
{   
    $scope.tipoFuente = [];
    
    $scope.ordenarTipoFuente = "Nombre";
    $scope.buscarTipoFuente = "";
    
    $scope.nuevoTipoFuente = null;
    
    $scope.mensajeError = [];
    $scope.claseTipoFuente = {nombre:"entrada"};
    
    $scope.GetTipoFuente = function()              
    {
        GetTipoFuente($http, $q, CONFIG).then(function(data)
        {
            $scope.tipoFuente = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarTipoFuente = function(campoOrdenar)
    {
        if($scope.ordenarTipoFuente == campoOrdenar)
        {
            $scope.ordenarTipoFuente = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarTipoFuente = campoOrdenar;
        }
    };
    
    /*-----------------Abrir Panel Agregar-Editar termino-------------------*/
    $scope.AbrirTipoFuente = function(operacion, tipo)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevoTipoFuente = new TipoFuente();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevoTipoFuente = SetTipoFuente(tipo);
        }
    
        $('#modalTipoFuente').modal('toggle');
    };
    
    $scope.CerrarTipoFuenteModal = function()
    {
        $('#cerrarTipoFuenteModal').modal('toggle');
    };
     
    $scope.ConfirmarCerrarTipoFuenteModal = function()
    {
        $('#modalTipoFuente').modal('toggle');
        $scope.mensajeError = [];
        $scope.claseTipoFuente = {nombre:"entrada"};
    };
    
    
    /*----------------- Terminar agregar-editar etiqueta --------------------*/
    $scope.TerminarTipoFuente = function(nombreInvalido)
    {
        if(!$scope.ValidarDatos(nombreInvalido))
        {
             $('#mensajeTipoFuente').modal('toggle');
            return;
        }
        else
        {
            if($scope.operacion == "Agregar" || $scope.operacion == "AgregarExterior")
            {
                $scope.AgregarTipoFuente();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarTipoFuente();
            }
        }
    };
    
    //agrega un tipo de unidad
    $scope.AgregarTipoFuente = function()    
    {
        AgregarTipoFuente($http, CONFIG, $q, $scope.nuevoTipoFuente).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {                
                if($scope.operacion == "Agregar")
                {
                    $scope.mensaje = "Tipo de fuente agregado.";
                    $scope.GetTipoFuente();
                    $scope.EnviarAlerta('Modal');
                    $scope.nuevoTipoFuente = new TipoFuente();
                }
                else
                {
                    $scope.nuevoTipoFuente.TipoFuenteId = data[1].Id;
                    $scope.tipoFuente.push( $scope.nuevoTipoFuente);
                    TIPOFUENTE.TerminarTipoFuente($scope.nuevoTipoFuente);
                    $('#modalTipoFuente').modal('toggle');
                }
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeTipoFuente').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeTipoFuente').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarTipoFuente = function()
    {
        EditarTipoFuente($http, CONFIG, $q, $scope.nuevoTipoFuente).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalTipoFuente').modal('toggle');
                $scope.mensaje = "Tipo de fuente editado.";
                $scope.GetTipoFuente();
                $scope.EnviarAlerta('Vista');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeTipoFuente').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeTipoFuente').modal('toggle');
        });
    };
    
    $scope.ValidarDatos = function(nombreInvalido)
    {
        $scope.mensajeError = [];
        
        if(nombreInvalido)
        {
            $scope.claseTipoFuente.nombre = "entradaError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un nombre válido.";
        }
        else
        {
             $scope.claseTipoFuente.nombre = "entrada";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.tipoFuente.length; k++)
        {
            if($scope.tipoFuente[k].Nombre.toLowerCase() == $scope.nuevoTipoFuente.Nombre.toLowerCase()  && $scope.tipoFuente[k].TipoFuenteId != $scope.nuevoTipoFuente.TipoFuenteId)
            {
                $scope.claseTipoFuente.nombre = "entradaError";
                $scope.mensajeError[$scope.mensajeError.length] = "*El tipo de fuente " + $scope.nuevoTipoFuente.Nombre.toLowerCase() + " ya existe.";
                return false;
            }
        }
        
        return true;
    };
    
    //-----------------------Limpiar-------------------------
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarTipoFuente = "";
                break;
            default: 
                break;
        }
    };
    
    //----------------------Inicializar---------------------------------
    $scope.GetTipoFuente();
    
     //--------------------- Alertas --------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoTipoFuente").alert();

            $("#alertaExitosoTipoFuente").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoTipoFuente").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitoso").alert();

            $("#alertaEditarExitoso").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoTipoFuente").fadeOut();
            }, 2000)
        }
    };
    
    /*---------------- EXTERIOR -------------------------*/
    $scope.$on('AgregarTipoFuente',function()
    {
        $scope.operacion = "AgregarExterior";

        $scope.nuevoTipoFuente = new TipoFuente();
    
        $('#modalTipoFuente').modal('toggle');
    });
    
});

app.factory('TIPOFUENTE',function($rootScope)
{
  var service = {};
  service.tipoFuente = null;
    
  service.AgregarTipoFuente = function()
  {
      this.tipoFuente= null;
      $rootScope.$broadcast('AgregarTipoFuente');
  };
    
  service.TerminarTipoFuente = function(tipoFuente)
  {
      this.tipoFuente = tipoFuente;
      $rootScope.$broadcast('TerminarTipoFuente');
  };
    
  service.GetTipoFuente = function()
  {
      return this.tipoFuente;
  };

  return service;
});