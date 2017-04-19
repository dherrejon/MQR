app.controller("AutorController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, PREFIJO, AUTOR)
{   
    $scope.autor = [];
    $scope.prefijo = [];
    
    $scope.ordenarAutor = "Nombre";
    $scope.buscarAutor = "";
    
    $scope.nuevoAutor = null;
    
    $scope.mensajeError = [];
    $scope.claseAutor = {nombre:"entrada", apellidos:"entrada", prefijo:"dropdownListModal"};
    
    
    $scope.GetAutor = function()              
    {
        GetAutor($http, $q, CONFIG).then(function(data)
        {
            $scope.autor = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetPrefijo = function()              
    {
        GetPrefijo($http, $q, CONFIG).then(function(data)
        {
            $scope.prefijo = data;
            $scope.prefijo[$scope.prefijo.length] = {Nombre:"Ninguno", PrefijoId:0, Abreviacion:"Ninguno"};
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarAutor = function(campoOrdenar)
    {
        if($scope.ordenarAutor == campoOrdenar)
        {
            $scope.ordenarAutor = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarAutor = campoOrdenar;
        }
    };
    
    /*-----------------Abrir Panel Agregar-Editar termino-------------------*/
    $scope.AbrirAutor = function(operacion, autor)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevoAutor = new Autor();
            $scope.CambiarPrefijo('Ninguno');
        }
        else if(operacion == "Editar")
        {
            $scope.nuevoAutor = $scope.SetAutor(autor);
        }
    
        $('#modalAutor').modal('toggle');
    };
    
    $scope.CambiarPrefijo = function(prefijo)
    {
        if(prefijo == "Ninguno")
        {
            $scope.nuevoAutor.Prefijo.Nombre = "";
             $scope.nuevoAutor.Prefijo.Abreviacion = "";
            $scope.nuevoAutor.Prefijo.PrefijoId = "0";
        }
        else
        {
            $scope.nuevoAutor.Prefijo = prefijo;
        }
        
    };
    
    $scope.SetAutor = function(data)
    {
        var autor = new Autor();
        
        autor.AutorId = data.AutorId;
        autor.Nombre = data.Nombre;
        autor.Apellidos = data.Apellidos;
        
        if(data.Prefijo.PrefijoId == "0")
        {
            autor.Prefijo = {Nombre:"Ninguno", PrefijoId:0, Abreviacion:"Ninguno"};
        }
        else
        {
            autor.Prefijo.Abreviacion = data.Prefijo.Abreviacion;
            autor.Prefijo.PrefijoId = data.Prefijo.PrefijoId;
        }
        
        
        return autor;
    };
    
    $scope.CerrarAutorModal = function()
    {
        $('#cerrarAutorModal').modal('toggle');
    };
    
    $scope.ConfirmarCerrarAutorModal = function()
    {
        $('#modalAutor').modal('toggle');
        $scope.mensajeError = [];
        $scope.claseAutor = {nombre:"entrada", apellidos:"entrada", prefijo:"dropdownListModal"};
    };
    
    
    /*----------------- Terminar agregar-editar etiqueta --------------------*/
    $scope.TerminarAutor = function(nombreInvalido, apellidosInvalidos)
    {
        if(!$scope.ValidarDatos(nombreInvalido, apellidosInvalidos))
        {
            $('#mensajeAutor').modal('toggle');
            return;
        }
        else
        {
            if($scope.operacion == "Agregar" || $scope.operacion == "AgregarExterior")
            {
                $scope.AgregarAutor();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarAutor();
            }
        }
    };
    
    //agrega un tipo de unidad
    $scope.AgregarAutor = function()    
    {
        AgregarAutor($http, CONFIG, $q, $scope.nuevoAutor).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                if($scope.operacion == "Agregar")
                {
                    $scope.GetAutor();
                }
                else
                {
                    $scope.nuevoAutor.Abreviacion = $scope.nuevoAutor.Prefijo.Abreviacion;
                    $scope.nuevoAutor.AutorId = data[1].Id;
                    $scope.autor.push($scope.nuevoAutor);
                    AUTOR.TerminarAutor($scope.nuevoAutor);
                }
                
                $scope.mensaje = "Autor agregado.";
                $scope.EnviarAlerta('Modal');
                $scope.nuevoAutor = new Autor();
                $scope.CambiarPrefijo('Ninguno');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeAutor').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeAutor').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarAutor = function()
    {
        EditarAutor($http, CONFIG, $q, $scope.nuevoAutor).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalAutor').modal('toggle');
                $scope.mensaje = "Autor editado.";
                $scope.GetAutor();
                $scope.EnviarAlerta('Vista');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeAutor').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeAutor').modal('toggle');
        });
    };
    
    $scope.ValidarDatos = function(nombreInvalido, apellidosInvalidos)
    {
        $scope.mensajeError = [];
        
        if($scope.nuevoAutor.Prefijo.PrefijoId.length === 0)
        {
            $scope.claseAutor.prefijo = "dropdownListModalError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona un prefijo.";
        }
        else
        {
             $scope.claseAutor.prefijo = "dropdownListModal";
        }
        
        if(nombreInvalido)
        {
            $scope.claseAutor.nombre = "entradaError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un nombre válido.";
        }
        else
        {
             $scope.claseAutor.nombre = "entrada";
        }
        
        if(apellidosInvalidos)
        {
            $scope.claseAutor.apellidos = "entradaError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe apellidos válidos.";
        }
        else
        {
             $scope.claseAutor.apellidos = "entrada";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.autor.length; k++)
        {
            if($scope.autor[k].Nombre.toLowerCase() == $scope.nuevoAutor.Nombre.toLowerCase() && $scope.autor[k].Apellidos.toLowerCase() == $scope.nuevoAutor.Apellidos.toLowerCase() && $scope.autor[k].AutorId != $scope.nuevoAutor.AutorId)
            {
                $scope.claseAutor.nombre = "entradaError";
                $scope.claseAutor.apellidos = "entradaError";
                $scope.mensajeError[$scope.mensajeError.length] = "*El autor " + $scope.nuevoAutor.Nombre + " " + $scope.nuevoAutor.Apellidos + " ya existe.";
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
                $scope.buscarAutor = "";
                break;
            default: 
                break;
        }
    };
    
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoAutor").alert();

            $("#alertaExitosoAutor").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoAutor").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoAutor").alert();

            $("#alertaEditarExitosoAutor").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoAutor").fadeOut();
            }, 2000)
        }
    };
    
    //--------------------------- Prefijo ------------------
    $scope.AgregarPrefijo = function()
    {
        PREFIJO.AgregarPrefijo();
    };
    
    $scope.$on('TerminarPrefijo',function()
    {
        var prefijo = PREFIJO.GetPrefijo();
        $scope.CambiarPrefijo(prefijo);
        $scope.prefijo.push(prefijo);
        
        $scope.mensaje = "Prefijo Agregado";
        $scope.EnviarAlerta('Modal');
    });
    
    //----------------------Inicializar---------------------------------
    $scope.GetAutor();
    $scope.GetPrefijo();
    
    /*---------------- EXTERIOR -------------------------*/
    $scope.$on('AgregarAutor',function()
    {
        $scope.operacion = "AgregarExterior";

        $scope.nuevoAutor = new Autor();
        $scope.CambiarPrefijo('Ninguno');
    
        $('#modalAutor').modal('toggle');
    });
    
});

app.factory('AUTOR',function($rootScope)
{
  var service = {};
  service.autor = null;
    
  service.AgregarAutor = function()
  {
      this.autor = null;
      $rootScope.$broadcast('AgregarAutor');
  };
    
  service.TerminarAutor = function(autor)
  {
      this.autor = autor;
      $rootScope.$broadcast('TerminarAutor');
  };
    
  service.GetAutor = function()
  {
      return this.autor;
  };

  return service;
});