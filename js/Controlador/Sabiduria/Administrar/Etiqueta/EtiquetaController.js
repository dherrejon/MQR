app.controller("EtiquetaController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.etiqueta = [];
    $scope.ordenarEtiqueta = "Nombre";
    $scope.operacion = "";
    
    $scope.nuevaEtiqueta = null;
    $scope.etiquetaActualizar = null;
    $scope.mensajeError = [];
    $scope.claseEtiqueta = {nombre:"entrada"};
    
    $scope.GetEtiqueta = function()              
    {
        GetEtiqueta($http, $q, CONFIG).then(function(data)
        {
            $scope.etiqueta = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarEtiqueta = function(campoOrdenar)
    {
        if($scope.ordenarEtiqueta == campoOrdenar)
        {
            $scope.ordenarEtiqueta = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarEtiqueta = campoOrdenar;
        }
    };
    
    /*-----------------Abrir Panel Agregar-Editar termino-------------------*/
    $scope.AbrirEtiqueta = function(operacion, etiqueta)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevaEtiqueta = new Etiqueta();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevaEtiqueta = SetEtiqueta(etiqueta);
        }
    
        $('#modalEtiqueta').modal('toggle');
    };
    
    $scope.CerrarEtiquetaModal = function()
    {
        $scope.mensajeError = [];
        $scope.claseEtiqueta = {nombre:"entrada"};
    };
    
    
    /*----------------- Terminar agregar-editar etiqueta --------------------*/
    $scope.TerminarEtiqueta = function(nombreInvalido)
    {
        if(!$scope.ValidarDatos(nombreInvalido))
        {
            return;
        }
        else
        {
            if($scope.operacion == "Agregar")
            {
                $scope.AgregarEtiqueta();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarEtiqueta();
            }
        }
    };
    
    //agrega un tipo de unidad
    $scope.AgregarEtiqueta = function()    
    {
        AgregarEtiqueta($http, CONFIG, $q, $scope.nuevaEtiqueta).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalEtiqueta').modal('toggle');
                $scope.mensaje = "La etiqueta se ha agregado.";
                $scope.GetEtiqueta();
            }
            else
            {
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde.";
            }
            $('#mensajeEtiqueta').modal('toggle');
            
        }).catch(function(error)
        {
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeEtiqueta').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarEtiqueta = function()
    {
        EditarEtiqueta($http, CONFIG, $q, $scope.nuevaEtiqueta).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalEtiqueta').modal('toggle');
                $scope.mensaje = "La etiqueta se ha editado.";
                $scope.GetEtiqueta();
            }
            else
            {
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde";   
            }
            $('#mensajeEtiqueta').modal('toggle');
        }).catch(function(error)
        {
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeEtiqueta').modal('toggle');
        });
    };
    
    $scope.ValidarDatos = function(nombreInvalido)
    {
        $scope.mensajeError = [];
        
        if(nombreInvalido)
        {
            $scope.claseEtiqueta.nombre = "entradaError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una etiqueta válida.";
        }
        else
        {
             $scope.claseEtiqueta.nombre = "entrada";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].Nombre.toLowerCase() == $scope.nuevaEtiqueta.Nombre.toLowerCase() && $scope.etiqueta[k].EtiquetaId != $scope.nuevaEtiqueta.EtiquetaId)
            {
                $scope.claseEtiqueta.nombre = "entradaError";
                $scope.mensajeError[$scope.mensajeError.length] = "*La etiqueta " + $scope.nuevaEtiqueta.Nombre.toLowerCase() + " ya existe.";
                return false;
            }
        }
        
        return true;
    };
    
    /*-------------- Activar y desactivar etiqueta ------------------*/
    $scope.ActivarDesactivarEtiqueta = function(etiqueta) //Activa o desactiva un elemento (empresa y tipo de unidad de negocio)
    {
        $scope.etiquetaActualizar = etiqueta;
        
        if(etiqueta.Activo)
        {
            $scope.mensajeAdvertencia = "¿Estas seguro de ACTIVAR - " + etiqueta.Nombre + "?";
        }
        else
        {
            $scope.mensajeAdvertencia = "¿Estas seguro de DESACRIVAR - " + etiqueta.Nombre + "?";
        }
        $('#modalActivarDesactivarEtiqueta').modal('toggle'); 
    };
    
    /*Se confirmo que se quiere cambiar el estado de activo del elemeneto*/ 
    $scope.ConfirmarActualizarEtiqueta = function()  
    {
        var datos = [];
        if($scope.etiquetaActualizar.Activo)
        {
            datos[0] = 1;
        }
        else
        {
            datos[0] = 0;
        }
        
        datos[1] = $scope.etiquetaActualizar.EtiquetaId;

        ActivarDesactivarEtiqueta($http, $q, CONFIG, datos).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.mensaje = "La etiqueta se ha actualizado.";
            }
            else
            {
                $scope.etiquetaActualizar.Activo = !$scope.etiquetaActualizar.Activo;
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde.";
            }
            $('#mensajeEtiqueta').modal('toggle');
        }).catch(function(error)
        {
            $scope.etiquetaActualizar.Activo = !$scope.etiquetaActualizar.Activo;
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeEtiqueta').modal('toggle');
        });
    };
        
    /*Se cancelo el cambiar el estado de activo del elemento*/
    $scope.CancelarCambiarActivoEtiqueta = function()           
    {
        $scope.etiquetaActualizar.Activo = !$scope.etiquetaActualizar.Activo;
    };
    
    //----------------------Inicializar---------------------------------
    $scope.GetEtiqueta();
   
    
});