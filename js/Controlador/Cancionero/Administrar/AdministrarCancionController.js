app.controller("AdministrarCancionController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.titulo = "Cancionero";
    $scope.buscarCancionero = "";
    $scope.buscarArtista = "";
    
    $scope.permiso = false;
    $scope.archivoSeleccionado = false;
    $scope.cancion = [];
    $scope.artista = [];
    $scope.detalle = new Cancion();
    
    
    //----------------------------- Catálogos ------------------------------------
    $scope.GetCancion = function()              
    {
        GetCancion($http, $q, CONFIG, $scope.usuarioId).then(function(data)
        {
            $scope.cancion = data;
            $scope.GetArtistaPorCancion();
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetArtistaPorCancion = function()              
    {
        GetArtistaPorCancion($http, $q, CONFIG, $scope.usuarioId).then(function(data)
        {
            $scope.artistaCancion = data;
            $scope.SetArtistaCancion();
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.SetArtistaCancion = function()
    {
        var sqlBase = "Select ArtistaId, Nombre From ? WHERE CancionId = '";
        var sql = "";
        
        for(var k=0; k<$scope.cancion.length; k++)
        {
            sql = sqlBase;
            sql +=  $scope.cancion[k].CancionId + "'";
           
            $scope.cancion[k].Artista = alasql(sql,[$scope.artistaCancion]);
        } 
    };
    
    $scope.GetArtista = function()              
    {
        GetArtista($http, $q, CONFIG, $scope.usuarioId).then(function(data)
        {
            $scope.artista = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetCancionero = function(cancion)              
    {
        GetCancionero($http, $q, CONFIG, cancion.CancionId).then(function(data)
        {
            cancion.Cancionero = data.Cancionero;
            cancion.NombreArchivo = data.NombreArchivo;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    //--------------- Detalles --------------------------
    $scope.VerDetalles = function(cancion)
    {
        $scope.detalle = cancion;
  
        if(cancion.Cancionero.length == 0)
        {
            $scope.GetCancionero(cancion);
        }
    };
    
    //------- Abrir Agregar - Editar ------------------
    $scope.AbrirCancion = function(operacion, objeto)
    {
        $scope.operacion = operacion;
    
        if(operacion == "Agregar")
        {
            $scope.cancionOriginal = new Cancion();
            $scope.nuevaCancion = new Cancion();
            $scope.ValidarArtista([]);
        }
        else if(operacion == "Editar")
        {
            $scope.cancionOriginal = $scope.SetCancion(objeto);
            $scope.nuevaCancion = $scope.SetCancion(objeto);
            $scope.ValidarArtista(objeto.Artista);
        }
        
        $('#modalCancionero').modal('toggle');
    };
    
    $scope.SetCancion = function(data)
    {
        var cancion = new Cancion();
        
        cancion.CancionId = data.CancionId;
        cancion.Titulo = data.Titulo; 
        cancion.Cancionero = data.Cancionero;
        cancion.NombreArchivo = data.NombreArchivo;
        cancion.UsuarioId = data.UsuarioId; 
        
        for(var k=0; k<data.Artista.length; k++)
        {
            cancion.Artista[k] = new Object();
            
            cancion.Artista[k].ArtistaId = data.Artista[k].ArtistaId;
            cancion.Artista[k].Nombre = data.Artista[k].Nombre;
        }
        
        return cancion;
    };
    
    
    $scope.ValidarArtista = function(artista)
    {
        for(var k=0; k<$scope.artista.length; k++)
        {
            $scope.artista[k].show = true;
            for(var i=0; i<artista.length; i++)
            {
                if(artista[i].ArtistaId == $scope.artista[k].ArtistaId)
                {
                    $scope.artista[k].show = false;
                    break;
                }
            }
        }
    };
    
    //manejo de vista
    $scope.ObtenerClaseCancion = function(cancion)
    {
        if(cancion.CancionId == $scope.detalle.CancionId)
        {
            return "active";
        }
        else
        {
            return ""; 
        }
    };
    
    //operacion abrir
    $scope.QuitarArchivo = function()
    {
        $scope.archivoSeleccionado = false;
        $scope.nuevaCancion.Archivo = "";
        $scope.nuevaCancion.NombreArchivo = "";
    };
    
    //Ver Imagen
    $scope.VisualizarImagen = function(imagen, origen)
    {
        $scope.verImagen = new Object();
        $scope.verImagen.imagen = imagen;
        $scope.verImagen.origen = origen;
    };
    
    //Cerrar Cancion 
    $scope.CerrarCancion = function()
    {
        /*if($scope.nuevaCancion.Artista != $scope.cancionOriginal.Artista)
        {
            console.log($scope.nuevaCancion.Artista);
            console.log($scope.cancionOriginal.Artista);
        }
        
        if($scope.nuevaCancion.Artista == $scope.cancionOriginal.Artista && $scope.nuevaCancion.CancionId == $scope.cancionOriginal.CancionId && $scope.nuevaCancion.Titulo == $scope.cancionOriginal.Titulo && $scope.nuevaCancion.NombreArchivo == $scope.cancionOriginal.NombreArchivo && $scope.nuevaCancion.Cancionero == $scope.cancionOriginal.Cancionero)     
        {
            $scope.ConfirmarCerrarCancion();
        }
        else
        {*/
            //console.log($scope.nuevaCancion);
            //console.log($scope.cancionOriginal)
        $('#cerrarCancion').modal('toggle');
            
        //}
    };
    
    $scope.ConfirmarCerrarCancion = function()
    {
        $scope.mensajeError = [];
        $scope.LimpiarInterfaz();
        $('#modalCancionero').modal('toggle');
    };
    
    $scope.LimpiarInterfaz = function()
    {
        $scope.buscarArtista = "";
        $scope.QuitarArchivo();
    };
    
    //--- Agregar - Quitar Artista ---
     $('#nuevoArtista').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                $scope.AgregarNuevoArtista();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.AgregarArtista = function(artista)
    {
        $scope.nuevaCancion.Artista.push(artista);
        
        artista.show = false;
        $scope.buscarArtista = "";
    };
    
    $scope.AgregarNuevoArtista = function()
    {
        if($scope.buscarArtista.length > 0)
        {
            if(!$scope.ValidarArtistaAgregado())
            {
                $scope.$apply();
                return;    
            }
            else
            {
                var artista = new Artista();
                artista.Nombre = $scope.buscarArtista;
                artista.ArtistaId = "-1";
                $scope.buscarArtista = "";
                
                $scope.nuevaCancion.Artista.push(artista);
                $scope.$apply();
            }
        }
    };
    
    $scope.ValidarArtistaAgregado = function()
    {
        for(var k=0; k<$scope.artista.length; k++)
        {
            if($scope.artista[k].Nombre.toLowerCase() == $scope.buscarArtista.toLowerCase())
            {
                if($scope.artista[k].show)
                {
                    $scope.AgregarArtista($scope.artista[k]);
                    return false;
                }
                else
                {
                    $scope.mensajeError = [];
                    $scope.mensajeError[$scope.mensajeError.length] = "*Este artista ya fue agregado";
                    $scope.buscarArtista = "";
                    $('#mensajeCancion').modal('toggle');
                    return false;
                }
            }
        }
        
        for(var k=0; k<$scope.nuevaCancion.Artista.length; k++)
        {
            if($scope.nuevaCancion.Artista[k].Nombre.toLowerCase() == $scope.buscarArtista.toLowerCase())
            {
                $scope.mensajeError = [];
                $scope.mensajeError[$scope.mensajeError.length] = "*Este artista ya fue agregado";
                $scope.buscarArtista = "";
                $('#mensajeCancion').modal('toggle');
                return false;
            }
        }
        
        return true;
    };
    
    $scope.QuitarArtista = function(artista)
    {
        
        for(var k=0; k<$scope.nuevaCancion.Artista.length; k++)
        {
            if(artista == $scope.nuevaCancion.Artista[k])
            {
                $scope.nuevaCancion.Artista.splice(k,1);
                break;
            }
        }
        
        if(artista.ArtistaId != "-1")
        {
            for(var k=0; k<$scope.artista.length; k++)
            {
                if($scope.artista[k].ArtistaId == artista.ArtistaId)
                {
                    $scope.artista[k].show = true;
                    return;
                }
            }
        }
    };
    
    
    //----------------- Terminar Cancion ---------------------------------------
    $scope.TerminarCancion = function(tituloInvalido)
    {
        if(!$scope.ValidarDatos(tituloInvalido))
        {
            $('#mensajeCancion').modal('toggle');
            return;
        }
        else
        {
            $scope.nuevaCancion.UsuarioId = $scope.usuarioId;
            $scope.nuevaCancion.ArchivoSeleccionado = $scope.archivoSeleccionado;
            
            if($scope.operacion == "Agregar")
            {
                $scope.AgregarCancion();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarCancion();
            }
        }
    };
    
    $scope.AgregarCancion = function()    
    {
        AgregarCancion($http, CONFIG, $q, $scope.nuevaCancion).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                
                $scope.mensaje = "Canción agregada.";
                //$scope.GetCancion();
                $scope.LimpiarInterfaz();
                $scope.EnviarAlerta('Modal');
                
                $scope.nuevaCancion.CancionId = data[1].CancionId;
                $scope.SetNuevaCancion($scope.nuevaCancion);
                
                $scope.nuevaCancion = new Cancion();
                $scope.ValidarArtista([]);
                //$('#modalCancionero').modal('toggle');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeCancion').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeCancion').modal('toggle');
        });
    };
    
    $scope.EditarCancion = function()    
    {
        EditarCancion($http, CONFIG, $q, $scope.nuevaCancion).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.mensaje = "Canción editada.";
                //$scope.GetCancion();
                $scope.SetNuevaCancion($scope.nuevaCancion);
                $scope.LimpiarInterfaz();
                $scope.EnviarAlerta('Vista');
                
                $('#modalCancionero').modal('toggle');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeCancion').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeCancion').modal('toggle');
        });
    };
    
    $scope.SetNuevaCancion = function(cancion)
    {
        if($scope.operacion == "Agregar")
        {
            var nuevaCancion = $scope.SetCancion(cancion);
            nuevaCancion.Cancionero = "";
            nuevaCancion.NombreArchivo = "";
            $scope.VerDetalles(nuevaCancion);
            $scope.cancion.push(nuevaCancion);
        }
        else if($scope.operacion == "Editar")
        {
            for(var k=0; k<$scope.cancion.length; k++)
            {
                if($scope.cancion[k].CancionId == cancion.CancionId)
                {
                    $scope.cancion[k] = $scope.SetCancion(cancion);
                    $scope.cancion[k].NombreArchivo = "";
                    $scope.cancion[k].Cancionero = "";
                    $scope.VerDetalles($scope.cancion[k]);
                    
                    break;
                }
            }
        }
    };
    
    $scope.ValidarDatos = function(tituloInvalido)
    {
        $scope.mensajeError = [];
        if(tituloInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un título.";
        }
        
        if($scope.nuevaCancion.Cancionero.length == 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona un cancionero.";
        }
        
        if($scope.nuevaCancion.Artista.length == 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Indica al menos un artista.";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;
        }
        else
        {
            return true;
        }
    };
    
    //-------- Archivo -----------
    $scope.CargarArchivo = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            if(element.files.length >0 )
            {
                $scope.nuevaCancion.Cancionero = element.files[0];
                $scope.nuevaCancion.NombreArchivo = element.files[0].name;
                $scope.archivoSeleccionado = true;
            }
        });
    };
    
    function ImagenSeleccionada(evt) 
    {
        var files = evt.target.files;

        for (var i = 0, f; f = files[i]; i++) 
        {
            if (!f.type.match('image.*')) 
            {
                continue;
            }

            var reader = new FileReader();

            reader.onload = (function(theFile) 
            {
                return function(e) 
                {
                    document.getElementById("PrevisualizarImagenDetalles").innerHTML = ['<img class=" center-block img-responsive visualizarImagenCompleta" src="', e.target.result,'" title="', escape(theFile.name), '"/>'].join('');
                };
            })(f);

            reader.readAsDataURL(f);
        }
    }
 
    document.getElementById('cargarImagen').addEventListener('change', ImagenSeleccionada, false);
    
    //Borrar
    $scope.BorrarCancion = function(cancion)
    {
        $scope.borrarCancion = cancion.CancionId;
        
        $scope.mensajeBorrar = "¿Estas seguro de eliminar " + cancion.Titulo + "?"
        
        $("#borrarCancion").modal('toggle');
    };
    
    $scope.ConfirmarBorrarCancion = function()
    {
        BorrarCancion($http, CONFIG, $q, $scope.borrarCancion).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                //$scope.GetArtista();
                
                for(var k=0; k<$scope.cancion.length; k++)
                {
                    if($scope.cancion[k].CancionId == $scope.borrarCancion)
                    {
                        $scope.cancion.splice(k,1);
                        break;
                    }
                }
                
                $scope.detalle = new Cancion();
                
                $scope.mensaje = "Canción borrada.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeArtista').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeArtista').modal('toggle');
        });
    };
    
    //--------------------------- Limpiar --------------------------------
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarCancionero = "";
                $("#buscarCancion").focus();
                break;
            case 2:
                $scope.buscarArtista = "";
                break;
            case 3:
                $scope.nuevaCancion.Titulo = "";
                break;
            default:
                break;
        }
    };
    
    //---- 

    //Busqueda de caciones
    $scope.BuscarCancion = function(cancion)
    {
        if($scope.buscarCancionero.length > 0)
        {
            var index = cancion.Titulo.toLowerCase().indexOf($scope.buscarCancionero.toLowerCase());
            
            
            if(index < 0)
            {
                return false;
            }
            else
            {
                if(index == 0)
                {
                    return true;
                }
                else
                {
                    if(cancion.Titulo[index-1] == " ")
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
        else
        {
            return true;
        }
    };
    
    //--------------- Alerta ----
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoCancion").alert();

            $("#alertaExitosoCancion").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoCancion").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoCancion").alert();

            $("#alertaEditarExitosoCancion").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoCancion").fadeOut();
            }, 2000)
        }
    };
    
    /*----------------------- Usuario logeado --------------------------*/
    
    $scope.ValidarPermiso = function()
    {
        for(var k=0; k<$scope.usuarioLogeado.Permiso.length; k++)
        {
            if($scope.usuarioLogeado.Permiso[k] == "GuitaraBit")
            {
                $scope.permiso = true;
                break;
            }
        }
    };
    $scope.InicializarControlador = function()
    {
        $scope.ValidarPermiso();
        if($scope.permiso)
        {
            if($scope.usuarioLogeado.Aplicacion != "Cancionero")
            {
                $rootScope.IrPaginaPrincipal();
            }
            else
            {
                $scope.usuarioId = datosUsuario.getUsuarioId();
                $scope.GetCancion();
                $scope.GetArtista();
            }
        }
        else
        {
            $rootScope.IrPaginaPrincipal();
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
