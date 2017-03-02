app.controller("TipoFuenteController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
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
        $scope.mensajeError = [];
        $scope.claseTipoFuente = {nombre:"entrada"};
    };
    
    
    /*----------------- Terminar agregar-editar etiqueta --------------------*/
    $scope.TerminarTipoFuente = function(nombreInvalido)
    {
        if(!$scope.ValidarDatos(nombreInvalido))
        {
            return;
        }
        else
        {
            if($scope.operacion == "Agregar")
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
                $('#modalTipoFuente').modal('toggle');
                $scope.mensaje = "El tipo de fuente se ha agregado.";
                $scope.GetTipoFuente();
            }
            else
            {
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde.";
            }
            $('#mensajeTipoFuente').modal('toggle');
            
        }).catch(function(error)
        {
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
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
                $scope.mensaje = "El tipo de fuente se ha editado.";
                $scope.GetTipoFuente();
            }
            else
            {
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde";   
            }
            $('#mensajeTipoFuente').modal('toggle');
        }).catch(function(error)
        {
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
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
    
    //----------------------Inicializar---------------------------------
    $scope.GetTipoFuente();
    
});