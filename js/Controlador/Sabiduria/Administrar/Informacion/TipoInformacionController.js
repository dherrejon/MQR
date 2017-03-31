app.controller("TipoInfomacionController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, TIPOINFORMACION)
{   
    $scope.tipoInformacion = [];
    
    $scope.ordenarTipoInformacion = "Nombre";
    $scope.buscarTipoInformacion = "";
    
    $scope.nuevoTipoInformacion = null;
    
    $scope.mensajeError = [];
    $scope.claseTipoInformacion = {nombre:"entrada"};
    
    $scope.GetTipoInformacion = function()              
    {
        GetTipoInformacion($http, $q, CONFIG).then(function(data)
        {
            $scope.tipoInformacion = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarTipoInformacion = function(campoOrdenar)
    {
        if($scope.ordenarTipoInformacion == campoOrdenar)
        {
            $scope.ordenarTipoInformacion = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarTipoInformacion = campoOrdenar;
        }
    };
    
    /*-----------------Abrir Panel Agregar-Editar termino-------------------*/
    $scope.AbrirTipoInformacion = function(operacion, tipo)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevoTipoInformacion = new TipoInformacion();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevoTipoInformacion = SetTipoInformacion(tipo);
        }
    
        $('#modalTipoInformacion').modal('toggle');
    };
     
    $scope.CerrarTipoInformacionModal = function()
    {
        $scope.mensajeError = [];
        $scope.claseTipoInformacion = {nombre:"entrada"};
    };
    
    
    /*----------------- Terminar agregar-editar etiqueta --------------------*/
    $scope.TerminarTipoInformacion = function(nombreInvalido)
    {
        if(!$scope.ValidarDatos(nombreInvalido))
        {
            return;
        }
        else
        {
            if($scope.operacion == "Agregar" || $scope.operacion == "AgregarExterior")
            {
                $scope.AgregarTipoInformacion();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarTipoInformacion();
            }
        }
    };
    
    //agrega un tipo de unidad
    $scope.AgregarTipoInformacion = function()    
    {
        AgregarTipoInformacion($http, CONFIG, $q, $scope.nuevoTipoInformacion).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalTipoInformacion').modal('toggle');
                $scope.mensaje = "El tipo de información se ha agregado.";
                
                if($scope.operacion == "Agregar")
                {
                    $scope.GetTipoInformacion();
                }
                else
                {
                    $scope.nuevoTipoInformacion.TipoInformacionId = data[1].Id;
                    TIPOINFORMACION.TerminarTipoInformacion($scope.nuevoTipoInformacion);
                }
            }
            else
            {
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde.";
            }
            $('#mensajeTipoInformacion').modal('toggle');
            
        }).catch(function(error)
        {
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeTipoInformacion').modal('toggle');
        });
    };
    
    $scope.EditarTipoInformacion = function()
    {
        EditarTipoInformacion($http, CONFIG, $q, $scope.nuevoTipoInformacion).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalTipoInformacion').modal('toggle');
                $scope.mensaje = "El tipo de información se ha editado.";
                $scope.GetTipoInformacion();
            }
            else
            {
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde";   
            }
            $('#mensajeTipoInformacion').modal('toggle');
        }).catch(function(error)
        {
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeTipoInformacion').modal('toggle');
        });
    };
    
    $scope.ValidarDatos = function(nombreInvalido)
    {
        $scope.mensajeError = [];
        
        if(nombreInvalido)
        {
            $scope.claseTipoInformacion.nombre = "entradaError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un nombre válido.";
        }
        else
        {
             $scope.claseTipoInformacion.nombre = "entrada";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.tipoInformacion.length; k++)
        {
            if($scope.tipoInformacion[k].Nombre.toLowerCase() == $scope.nuevoTipoInformacion.Nombre.toLowerCase()  && $scope.tipoInformacion[k].TipoInformacionId != $scope.nuevoTipoInformacion.TipoInformacionId)
            {
                $scope.claseTipoInformacion.nombre = "entradaError";
                $scope.mensajeError[$scope.mensajeError.length] = "*El tipo de información " + $scope.nuevoTipoInformacion.Nombre.toLowerCase() + " ya existe.";
                return false;
            }
        }
        
        return true;
    };
    
    //----------------------Inicializar---------------------------------
    $scope.GetTipoInformacion();
    
    //------------------------ Exterior ---------------------------
    $scope.$on('AgregarTipoInformacion',function()
    {
        $scope.operacion = "AgregarExterior";

        $scope.nuevoTipoInformacion = new TipoInformacion();
    
        $('#modalTipoInformacion').modal('toggle');
    });
    
});

app.factory('TIPOINFORMACION',function($rootScope)
{
  var service = {};
  service.tipoInformacion = null;
    
  service.AgregarTipoInformacion = function()
  {
      this.tipoInformacion = null;
      $rootScope.$broadcast('AgregarTipoInformacion');
  };
    
  service.TerminarTipoInformacion = function(tipoInformacion)
  {
      this.tipoInformacion = tipoInformacion;
      $rootScope.$broadcast('TerminarTipoInformacion');
  };
    
  service.GetTipoInformacion = function()
  {
      return this.tipoInformacion;
  };

  return service;
});