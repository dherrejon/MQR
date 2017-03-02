app.controller("UsuarioController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.ValidarPermiso = function()
    {
        for(var k=0; k<$scope.usuarioLogeado.Permiso.length; k++)
        {
            if($scope.usuarioLogeado.Permiso[k] == "SabiduriaAdm")
            {
                $scope.permiso = true;
                break;
            }
        }
    };
    
    $scope.usuario = [];
    $scope.permiso = [];
    
    $scope.ordenarUsuario = "Apellidos";
    $scope.buscarUsuario = "";
    
    $scope.nuevoUsuario = null;
    $scope.usuarioActualizar = null;
    
    $scope.mensajeError = [];
    //$scope.claseUsuario = {tipoFuente:"dropdownListModal", nombre:"entrada", autor:"dropdownListModal", etiqueta:"dropdownListModal"};
        
    $scope.detalle = "";
    
    $scope.GetUsuarios = function()              
    {
        GetUsuarios($http, $q, CONFIG).then(function(data)
        {
            $scope.usuario = data;
            
            for(var k=0; k<data.length; k++)
            {
                $scope.GetPermisoUsuario($scope.usuario[k]);
            }
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetPermisoUsuario = function(usuario)              
    {
        GetPermisoUsuario($http, $q, CONFIG, usuario.UsuarioId).then(function(data)
        {
            usuario.Permiso = data;
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetPermiso = function()              
    {
        GetPermiso($http, $q, CONFIG).then(function(data)
        {
            $scope.permiso = data;        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarUsuario = function(campoOrdenar)
    {
        if($scope.ordenarUsuario == campoOrdenar)
        {
            $scope.ordenarUsuario = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarUsuario = campoOrdenar;
        }
    };
    
    /*---------------------- Detalle --------------------------*/
    $scope.DetalleUsuario = function(usuario)
    {
        $scope.usuarioActualizar = usuario;
        $scope.SetPermisoUsuario(usuario);
    };
    
    $scope.SetPermisoUsuario = function(usuario)
    {
        for(var k=0; k<$scope.permiso.length; k++)
        {
            $scope.permiso[k].Usuario = false;
            for(var i=0; i<usuario.Permiso.length; i++)
            {
                if(usuario.Permiso[i].PermisoId == $scope.permiso[k].PermisoId)
                {
                     $scope.permiso[k].Usuario = true;
                    break;
                }
            }
        }
    };
    
    $scope.GetClaseDetallesSeccion = function(seccion)
    {
        if($scope.detalle == seccion)
        {
            return "opcionAcordionSeleccionado";
        }
        else
        {
            return "opcionAcordion";
        }
    };
    
    $scope.MostrarDetalle = function(detalle)
    {
        if($scope.detalle == detalle)
        {
            $scope.detalle = "";
        }
        else
        {
            $scope.detalle = detalle;
        }
    };
    
    /*-----------------Abrir Panel Agregar-Editar termino-------------------*/
    $scope.AbrirFuente = function(operacion, fuente)
    {
        $scope.operacion = operacion;
        $scope.mostrarOpcionFuente = "";
        
        if(operacion == "Agregar")
        {
            $scope.nuevaFuente = new Fuente();
            $scope.nuevaFuente.Autor = [];
            $scope.nuevaFuente.Etiqueta = [];
            $scope.ValidarAutor($scope.nuevaFuente.Autor);
            $scope.ValidarEtiqueta($scope.nuevaFuente.Etiqueta);
        }
        else if(operacion == "Editar")
        {
            $scope.nuevaFuente = $scope.SetFuente(fuente);
            $scope.ValidarAutor($scope.nuevaFuente.Autor);
            $scope.ValidarEtiqueta($scope.nuevaFuente.Etiqueta);
        }
    
        $('#modalFuente').modal('toggle');
    };
    
    $scope.ValidarAutor = function(autor)
    {
        for(var k=0; k<$scope.autor.length; k++)
        {
            $scope.autor[k].show = true;
            for(var i=0; i<autor.length; i++)
            {
                if(autor[i].AutorId == $scope.autor[k].AutorId)
                {
                    $scope.autor[k].show = false;
                    break;
                }
            }
        }
    };
    
    $scope.ValidarEtiqueta = function(etiqueta)
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            $scope.etiqueta[k].show = true;
            for(var i=0; i<etiqueta.length; i++)
            {
                if(etiqueta[i].EtiquetaId == $scope.etiqueta[k].EtiquetaId)
                {
                    $scope.etiqueta[k].show = false;
                    break;
                }
            }
        }
    };
    
    $scope.CambiarTipoFuente = function(tipo)
    {
        $scope.nuevaFuente.TipoFuente = tipo;
    };
    
    $scope.SetFuente = function(data)
    {
        var fuente = new Fuente();
        
        fuente.FuenteId = data.FuenteId;
        fuente.Nombre = data.Nombre;
        
        fuente.TipoFuente.TipoFuenteId = data.TipoFuente.TipoFuenteId;
        fuente.TipoFuente.Nombre = data.TipoFuente.Nombre;
        
        fuente.Autor = [];
        fuente.Etiqueta = [];
        
        
        for(var k=0; k<data.Autor.length; k++)
        {
            fuente.Autor[k] = new Autor();
            fuente.Autor[k].AutorId = data.Autor[k].AutorId;
            fuente.Autor[k].Nombre = data.Autor[k].Nombre;
            fuente.Autor[k].Apellidos = data.Autor[k].Apellidos;
            fuente.Autor[k].Abreviacion = data.Autor[k].Abreviacion;
        }
        
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            fuente.Etiqueta[k] = new Etiqueta();
            fuente.Etiqueta[k].EtiquetaId = data.Etiqueta[k].EtiquetaId;
            fuente.Etiqueta[k].Nombre = data.Etiqueta[k].Nombre;
        }
        
        return fuente;
    };
    
    $scope.MostrarOpcionFuente =function(opcion)
    {
        if(opcion == $scope.mostrarOpcionFuente )
        {
            $scope.mostrarOpcionFuente = "";
        }
        else
        {
            $scope.mostrarOpcionFuente = opcion;
            
            if(opcion == "autor")
            {
                $scope.datosAgregados = "Autor";
            }
            else if(opcion == "etiqueta")
            {
                $scope.datosAgregados = "Etiqueta";
            }
        }
        
    };
    
    $scope.CerrarModalFuente = function()
    {
        $scope.mensajeError = [];
         $scope.claseFuente = {tipoFuente:"dropdownListModal", nombre:"entrada", autor:"dropdownListModal", etiqueta:"dropdownListModal"};
    };
    
    
    $scope.AgregarAutor = function(autor)
    {
        $scope.nuevaFuente.Autor.push(autor);
        $scope.nuevaFuente.Autor[$scope.nuevaFuente.Autor.length-1].Abreviacion = autor.Prefijo.Abreviacion;
        autor.show = false;
    };
    
    $scope.AgregarEtiqueta = function(etiqueta)
    {
        $scope.nuevaFuente.Etiqueta.push(etiqueta);
        etiqueta.show = false;
    };
    
    $scope.QuitarAutor = function(autor)
    {
        for(var k=0; k<$scope.nuevaFuente.Autor.length; k++)
        {
            if($scope.nuevaFuente.Autor[k].AutorId == autor.AutorId)
            {
                $scope.nuevaFuente.Autor.splice(k,1);
                break;
            }
        }
        
        for(var k=0; k<$scope.autor.length; k++)
        {
            if($scope.autor[k].AutorId == autor.AutorId)
            {
                $scope.autor[k].show = true;
                break;
            }
        }
    };
    
    $scope.QuitarEtiqueta = function(etiqueta)
    {
        for(var k=0; k<$scope.nuevaFuente.Etiqueta.length; k++)
        {
            if($scope.nuevaFuente.Etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.nuevaFuente.Etiqueta.splice(k,1);
                break;
            }
        }
        
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.etiqueta[k].show = true;
                break;
            }
        }
    };
    
    $scope.MostrarAgregado = function(dato)
    {
        if($scope.datosAgregados == dato)
        {
            $scope.datosAgregados = "";
        }
        else
        {
           $scope.datosAgregados = dato; 
        }
    };
    
    $scope.GetClaseSeccionAgregado = function(seccion)
    {
        if($scope.datosAgregados == seccion)
        {
            return "opcionAcordionSeleccionado";
        }
        else
        {
            return "opcionAcordion";
        }
    };
    
    /*----------------- Terminar agregar-editar etiqueta --------------------*/
    $scope.TerminarFuente = function(nombreInvalido)
    {
        if(!$scope.ValidarDatos(nombreInvalido))
        {
            return;
        }
        else
        {
            if($scope.operacion == "Agregar")
            {
                $scope.AgregarFuente();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarFuente();
            }
        }
    };
    
    //agrega un tipo de unidad
    $scope.AgregarFuente = function()    
    {
        AgregarFuente($http, CONFIG, $q, $scope.nuevaFuente).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalFuente').modal('toggle');
                $scope.mensaje = "La fuente se ha agregado.";
                $scope.GetFuente();
            }
            else
            {
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde.";
            }
            $('#mensajeFuente').modal('toggle');
            
        }).catch(function(error)
        {
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeFuente').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarFuente = function()
    {
        EditarFuente($http, CONFIG, $q, $scope.nuevaFuente).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalFuente').modal('toggle');
                $scope.mensaje = "La fuente se ha editado.";
                $scope.GetFuente();
            }
            else
            {
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde";   
            }
            $('#mensajeFuente').modal('toggle');
        }).catch(function(error)
        {
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeFuente').modal('toggle');
        });
    };
    
    $scope.ValidarDatos = function(nombreInvalido)
    {
        $scope.mensajeError = [];
        
        if($scope.nuevaFuente.TipoFuente.Nombre.length === 0)
        {
            $scope.claseFuente.tipoFuente = "dropdownListModalError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona un tipo de fuente.";
        }
        else
        {
             $scope.claseFuente.tipoFuente = "dropdownListModal";
        }
        
        if(nombreInvalido)
        {
            $scope.claseFuente.nombre = "entradaError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un nombre válido.";
        }
        else
        {
             $scope.claseFuente.nombre = "entrada";
        }
        
        if($scope.nuevaFuente.Autor.length === 0)
        {
            $scope.claseFuente.autor = "dropdownListModalError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona al menos un autor.";
        }
        else
        {
             $scope.claseFuente.autor = "dropdownListModal";
        }
        
        if($scope.nuevaFuente.Etiqueta.length === 0)
        {
            $scope.claseFuente.etiqueta = "dropdownListModalError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona al menos una etiqueta.";
        }
        else
        {
             $scope.claseFuente.etiqueta = "dropdownListModal";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.fuente.length; k++)
        {
            if($scope.fuente[k].Nombre.toLowerCase() == $scope.nuevaFuente.Nombre.toLowerCase() && $scope.fuente[k].FuenteId != $scope.nuevaFuente.FuenteId)
            {
                $scope.claseFuente.nombre = "entradaError";
                $scope.mensajeError[$scope.mensajeError.length] = "*La fuente " + $scope.nuevaFuente.Nombre.toLowerCase() + " ya existe.";
                return false;
            }
        }
        
        return true;
    };
    
    /*-------------- Activar y desactivar etiqueta ------------------*/
    $scope.ActivarDesactivarUsuario = function(usuario) //Activa o desactiva un elemento (empresa y tipo de unidad de negocio)
    {
        $scope.usuarioActualizar = usuario;
        
        if(usuario.Activo)
        {
            $scope.mensajeAdvertencia = "¿Estas seguro de ACTIVAR - " + usuario.NombreUsuario + "?";
        }
        else
        {
            $scope.mensajeAdvertencia = "¿Estas seguro de DESACRIVAR - " + usuario.NombreUsuario + "?";
        }
        $('#modalActivarDesactivarUsuario').modal('toggle'); 
    };
    
    /*Se confirmo que se quiere cambiar el estado de activo del elemeneto*/ 
    $scope.ConfirmarActualizarUsuario= function()  
    {
        var datos = [];
        if($scope.usuarioActualizar.Activo)
        {
            datos[0] = 1;
        }
        else
        {
            datos[0] = 0;
        }
        
        datos[1] = $scope.usuarioActualizar.UsuarioId;

        ActivarDesactivarUsuario($http, $q, CONFIG, datos).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.mensaje = "El usuario se ha actualizado.";
            }
            else
            {
                $scope.usuarioActualizar.Activo = !$scope.usuarioActualizar.Activo;
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde.";
            }
            $('#mensajeUsuario').modal('toggle');
        }).catch(function(error)
        {
            $scope.usuarioActualizar.Activo = !$scope.usuarioActualizar.Activo;
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeUsuario').modal('toggle');
        });
    };
        
    /*Se cancelo el cambiar el estado de activo del elemento*/
    $scope.CancelarCambiarActivoUsuario = function()           
    {
        $scope.usuarioActualizar.Activo = !$scope.usuarioActualizar.Activo;
    };
    
    //----------------------Inicializar---------------------------------
    $scope.InicializarUsuario = function()
    {
        $scope.GetUsuarios();
        $scope.GetPermiso();
    };
    
    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        $scope.ValidarPermiso();
        if($scope.permiso)
        {
            if($scope.usuarioLogeado.Aplicacion.length == 0)
            {
                $rootScope.IrPaginaPrincipal();
            }
            else
            {
                $scope.InicializarUsuario();
            }
        }
    };
    
    $scope.usuarioLogeado =  datosUsuario.getUsuario(); 
    
    //verifica que haya un usuario logeado
    if($scope.usuarioLogeado !== null)
    {
        if(!$scope.usuarioLogeado.SesionIniciada)
        {
             $location.path('/Login');
        }
        else
        {
            $scope.InicializarControlador();
        }
    }
    
    //destecta cuando los datos del usuario cambian
    $scope.$on('cambioUsuario',function()
    {
        $scope.usuarioLogeado =  datosUsuario.getUsuario();
    
        if(!$scope.usuarioLogeado.SesionIniciada)
        {
            $location.path('/Login');
            return;
        }
        else
        {
            $scope.InicializarControlador();
        }
    });
    
});