app.controller("AutorController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.autor = [];
    $scope.prefijo = [];
    
    $scope.ordenarAutor = "Apellidos";
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
        }
        else if(operacion == "Editar")
        {
            $scope.nuevoAutor = $scope.SetAutor(autor);
        }
    
        $('#modalAutor').modal('toggle');
    };
    
    $scope.CambiarPrefijo = function(prefijo)
    {
        $scope.nuevoAutor.Prefijo = prefijo;
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
        $scope.mensajeError = [];
        $scope.claseAutor = {nombre:"entrada", apellidos:"entrada", prefijo:"dropdownListModal"};
    };
    
    
    /*----------------- Terminar agregar-editar etiqueta --------------------*/
    $scope.TerminarAutor = function(nombreInvalido, apellidosInvalidos)
    {
        if(!$scope.ValidarDatos(nombreInvalido, apellidosInvalidos))
        {
            return;
        }
        else
        {
            if($scope.operacion == "Agregar")
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
                $('#modalAutor').modal('toggle');
                $scope.mensaje = "El autor se ha agregado.";
                $scope.GetAutor();
            }
            else
            {
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde.";
            }
            $('#mensajeAutor').modal('toggle');
            
        }).catch(function(error)
        {
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
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
                $scope.mensaje = "El autor se ha editado.";
                $scope.GetAutor();
            }
            else
            {
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde";   
            }
            $('#mensajeAutor').modal('toggle');
        }).catch(function(error)
        {
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeAutor').modal('toggle');
        });
    };
    
    $scope.ValidarDatos = function(nombreInvalido, apellidosInvalidos)
    {
        $scope.mensajeError = [];
        
        if($scope.nuevoAutor.Prefijo.Abreviacion.length === 0)
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
        
        /*for(var k=0; k<$scope.autor.length; k++)
        {
            if($scope.autor[k].Nombre.toLowerCase() == $scope.nuevoAutor.Nombre.toLowerCase() && $scope.autor[k].Apellidos.toLowerCase() == $scope.nuevoAutor.Apellidos.toLowerCase() && $scope.autor[k].AutorId != $scope.nuevoAutor.AutorId)
            {
                $scope.claseEtiqueta.nombre = "entradaError";
                $scope.mensajeError[$scope.mensajeError.length] = "*La etiqueta " + $scope.nuevaEtiqueta.Nombre.toLowerCase() + " ya existe.";
                return false;
            }
        }*/
        
        return true;
    };
    
    //----------------------Inicializar---------------------------------
    $scope.GetAutor();
    $scope.GetPrefijo();
    
});