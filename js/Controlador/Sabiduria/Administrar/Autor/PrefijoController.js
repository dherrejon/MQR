app.controller("PrefijoController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, PREFIJO)
{   
    $scope.prefijo = [];
    
    $scope.bucarPrefijo = "";
    $scope.ordenarPrefijo = "Nombre";
    $scope.nuevoPrefijo  = null;
    
    $scope.mensajeError = [];
    $scope.clasePrefijo = {nombre:"entrada", abreviacion:"entrada"};
    
    
    $scope.GetPrefijo = function()              
    {
        GetPrefijo($http, $q, CONFIG).then(function(data)
        {
            $scope.prefijo = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarPrefijo = function(campoOrdenar)
    {
        if($scope.ordenarPrefijo == campoOrdenar)
        {
            $scope.ordenarPrefijo = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarPrefijo = campoOrdenar;
        }
    };
    
    /*-----------------Abrir Panel Agregar-Editar termino-------------------*/
    $scope.AbrirPrefijo = function(operacion, prefijo)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevoPrefijo = new Prefijo();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevoPrefijo = SetPrefijo(prefijo);
        }
    
        $('#modalPrefijo').modal('toggle');
    };
    
    //---------------------------------------- Cerrar ---------------------------
    $scope.CerrarPrefijoModal = function()
    {
        $('#cerrarPrefijoModal').modal('toggle');
    };
    
    $scope.ConfirmarCerrarPrefijoModal = function()
    {
        $('#modalPrefijo').modal('toggle');
        $scope.mensajeError = [];
        $scope.clasePrefijo = {nombre:"entrada", abreviacion:"entrada"};
    };
    
    
    /*----------------- Terminar agregar-editar etiqueta --------------------*/
    $scope.TerminarPrefijo = function(nombreInvalido, abreviacionInvalida)
    {
        if(!$scope.ValidarDatos(nombreInvalido, abreviacionInvalida))
        {
            $('#mensajePrefijo').modal('toggle');
            return;
        }
        else
        {
            if($scope.operacion == "Agregar" || $scope.operacion == "AgregarExterior")
            {
                $scope.AgregarPrefijo();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarPrefijo();
            }
        }
    };
    
    //agrega un tipo de unidad
    $scope.AgregarPrefijo = function()    
    {
        AgregarPrefijo($http, CONFIG, $q, $scope.nuevoPrefijo).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                //$('#modalPrefijo').modal('toggle');
                if($scope.operacion == "Agregar")
                {
                    $scope.EnviarAlerta('Modal');
                    $scope.mensaje = "Prefijo Agregado.";
                    $scope.GetPrefijo();
                    $scope.nuevoPrefijo = new Prefijo();
                }
                else if($scope.operacion == "AgregarExterior")
                {
                    $scope.nuevoPrefijo.PrefijoId = data[1].Id;
                    $scope.prefijo.push($scope.nuevoPrefijo);
                    $('#modalPrefijo').modal('toggle');
                    PREFIJO.TerminarPrefijo($scope.nuevoPrefijo);
                }
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajePrefijo').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajePrefijo').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarPrefijo = function()
    {
        EditarPrefijo($http, CONFIG, $q, $scope.nuevoPrefijo).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalPrefijo').modal('toggle');
                $scope.EnviarAlerta('Vista');
                $scope.mensaje = "Prefijo editado.";
                $scope.GetPrefijo();
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajePrefijo').modal('toggle');
            }
           
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajePrefijo').modal('toggle');
        });
    };
    
    $scope.ValidarDatos = function(nombreInvalido, abreviacionInvalida)
    {
        $scope.mensajeError = [];
        
        if(nombreInvalido)
        {
            $scope.clasePrefijo.nombre = "entradaError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una prefijo válido.";
        }
        else
        {
             $scope.clasePrefijo.nombre = "entrada";
        }
        
        if(abreviacionInvalida)
        {
            $scope.clasePrefijo.abreviacion = "entradaError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una abreviación válida.";
        }
        else
        {
             $scope.clasePrefijo.abreviacion = "entrada";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.prefijo.length; k++)
        {
            if($scope.prefijo[k].Nombre.toLowerCase() == $scope.nuevoPrefijo.Nombre.toLowerCase() && $scope.prefijo[k].PrefijoId != $scope.nuevoPrefijo.PrefijoId)
            {
                $scope.clasePrefijo.nombre = "entradaError";
                $scope.mensajeError[$scope.mensajeError.length] = "*El prefijo " + $scope.nuevoPrefijo.Nombre.toLowerCase() + " ya existe.";
                return false;
            }
            
            if($scope.prefijo[k].Abreviacion.toLowerCase() == $scope.nuevoPrefijo.Abreviacion.toLowerCase() && $scope.prefijo[k].PrefijoId != $scope.nuevoPrefijo.PrefijoId)
            {
                $scope.clasePrefijo.abreviacion = "entradaError";
                $scope.mensajeError[$scope.mensajeError.length] = "*La abreviación " + $scope.nuevoPrefijo.Abreviacion.toLowerCase() + " ya existe.";
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
                $scope.bucarPrefijo = "";
                break;
            default: 
                break;
        }
    };
    
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitoso").alert();

            $("#alertaExitoso").fadeIn();
            setTimeout(function () {
                $("#alertaExitoso").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitoso").alert();

            $("#alertaEditarExitoso").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitoso").fadeOut();
            }, 2000)
        }
    };
    
    //----------------------Inicializar---------------------------------
    $scope.GetPrefijo();
    
    
    /*---------------- EXTERIOR -------------------------*/
    $scope.$on('AgregarPrefijo',function()
    {
        $scope.operacion = "AgregarExterior";

        $scope.nuevoPrefijo = new Prefijo();
    
        $('#modalPrefijo').modal('toggle');
    });
   
    
});

app.factory('PREFIJO',function($rootScope)
{
  var service = {};
  service.prefijo = null;
    
  service.AgregarPrefijo = function()
  {
      this.prefijo = null;
      $rootScope.$broadcast('AgregarPrefijo');
  };
    
  service.TerminarPrefijo = function(prefijo)
  {
      this.prefijo = prefijo;
      $rootScope.$broadcast('TerminarPrefijo');
  };
    
  service.GetPrefijo = function()
  {
      return this.prefijo;
  };

  return service;
});