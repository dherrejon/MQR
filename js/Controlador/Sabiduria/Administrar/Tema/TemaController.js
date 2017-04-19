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
        $('#cerrarTemaModal').modal('toggle');
    };
    
    $scope.ConfirmarCerrarTema = function()
    {
        $('#modalTema').modal('toggle');
        $scope.mensajeError = [];
        $scope.claseTema = {nombre:"entrada"};
    };
    
    
    /*----------------- Terminar agregar-editar tema --------------------*/
    $scope.TerminarTema = function(nombreInvalido)
    {
        if(!$scope.ValidarDatos(nombreInvalido))
        {
            $('#mensajeTema').modal('toggle');
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
                if($scope.operacion == "Agregar")
                {
                    $scope.mensaje = "Tema agregado.";
                    $scope.GetTema();
                    $scope.EnviarAlerta('Modal');
                    $scope.nuevoTema = new Tema();
                }
                else
                {
                    $('#modalTema').modal('toggle');
                    $scope.nuevoTema.TemaId = data[1].Id; 
                    $scope.tema.push($scope.nuevoTema);
                    TEMA.TerminarTema($scope.nuevoTema);
                }
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeTema').modal('toggle');
            }

        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
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
                $scope.mensaje = "Tema editado.";
                $scope.EnviarAlerta('Vista');
                $scope.GetTema();
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeTema').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
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
    
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarTema = "";
                break;
            default: 
                break;
        }
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
    
    //------------------- Alertas ---------------------------
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
            console.log("entra");
            $("#alertaEditarExitoso").alert();

            $("#alertaEditarExitoso").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitoso").fadeOut();
            }, 2000)
        }
    };
    
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