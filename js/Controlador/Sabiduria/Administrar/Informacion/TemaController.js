app.controller("TemaController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, TEMA)
{   
    $scope.tema = [];
    
    $scope.ordenarTema = "Nombre";
    $scope.buscarTema = "";
    
    $scope.nuevoTema = null;
    
    $scope.mensajeError = [];
    $scope.claseTema = {nombre:"entrada"};
    
    $scope.GetTema = function()              
    {
        GetTema($http, $q, CONFIG).then(function(data)
        {
            $scope.tema = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarTema = function(campoOrdenar)
    {
        if($scope.ordenarTema == campoOrdenar)
        {
            $scope.ordenarTema = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarTema = campoOrdenar;
        }
    };
    
    /*-----------------Abrir Panel Agregar-Editar termino-------------------*/
    $scope.AbrirTema = function(operacion, tema)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevoTema = new Tema();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevoTema = SetTema(tema);
        }
    
        $('#modalTema').modal('toggle');
    };
     
    $scope.CerrarTema = function()
    {
        $scope.mensajeError = [];
        $scope.claseTema = {nombre:"entrada"};
    };
    
    
    /*----------------- Terminar agregar-editar tema --------------------*/
    $scope.TerminarTema = function(nombreInvalido)
    {
        if(!$scope.ValidarDatos(nombreInvalido))
        {
            return;
        }
        else
        {
            if($scope.operacion == "Agregar" || $scope.operacion == "AgregarExterior")
            {
                $scope.AgregarTema();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarTema();
            }
        }
    };
    
    $scope.AgregarTema = function()    
    {
        AgregarTema($http, CONFIG, $q, $scope.nuevoTema).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalTema').modal('toggle');
                $scope.mensaje = "El tema se ha agregado.";
                
                if($scope.operacion == "Agregar")
                {
                    $scope.GetTema();
                }
                else
                {
                    $scope.nuevoTema.TemaId = data[1].Id; 
                    TEMA.TerminarTema($scope.nuevoTema);
                }
            }
            else
            {
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde.";
            }
            $('#mensajeTema').modal('toggle');
            
        }).catch(function(error)
        {
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeTema').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarTema = function()
    {
        EditarTema($http, CONFIG, $q, $scope.nuevoTema).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalTema').modal('toggle');
                $scope.mensaje = "El tema se ha editado.";
                
                $scope.GetTema();
            }
            else
            {
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde";   
            }
            $('#mensajeTema').modal('toggle');
        }).catch(function(error)
        {
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeTema').modal('toggle');
        });
    };
    
    $scope.ValidarDatos = function(nombreInvalido)
    {
        $scope.mensajeError = [];
        
        if(nombreInvalido)
        {
            $scope.claseTema.nombre = "entradaError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un nombre válido.";
        }
        else
        {
             $scope.claseTema.nombre = "entrada";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.tema.length; k++)
        {
            if($scope.tema[k].Nombre.toLowerCase() == $scope.nuevoTema.Nombre.toLowerCase()  && $scope.tema[k].TemaId != $scope.nuevoTema.TemaId)
            {
                $scope.claseTema.nombre = "entradaError";
                $scope.mensajeError[$scope.mensajeError.length] = "*El tema " + $scope.nuevoTema.Nombre.toLowerCase() + " ya existe.";
                return false;
            }
        }
        
        return true;
    };
    
    //----------------------Inicializar---------------------------------
    $scope.GetTema();
    
    //------------------------ Exterior ---------------------------
    $scope.$on('AgregarTema',function()
    {
        $scope.operacion = "AgregarExterior";

        $scope.nuevoTema = new Tema();
    
        $('#modalTema').modal('toggle');
    });
    
});

app.factory('TEMA',function($rootScope)
{
  var service = {};
  service.tema = null;
    
  service.AgregarTema = function()
  {
      this.tema = null;
      $rootScope.$broadcast('AgregarTema');
  };
    
  service.TerminarTema = function(tema)
  {
      this.tema = tema;
      $rootScope.$broadcast('TerminarTema');
  };
    
  service.GetTema = function()
  {
      return this.tema;
  };

  return service;
});