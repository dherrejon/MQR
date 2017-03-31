app.controller("AdministrarInformacionController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce, ETIQUETA, TEMA, TIPOINFORMACION, FUENTE)
{   
    $scope.informacion = [];
    
    $scope.fuente = [];
    $scope.tema = [];
    $scope.tipoInformacion = [];
    $scope.origenInformacion = [];
    $scope.etiqueta = [];
    
    $scope.nuevaInformacion = null;
    $scope.detalle = null;
    $scope.mostrarEtiqueta = false;
    $scope.buscarEtiquetaOperacion = "";
    
    $scope.claseInformacion = {tema:"dropdownListModal", etiqueta:"dropdownListModal", tipo:"dropdownListModal", fuente:"dropdownListModal", origen:"dropdownListModal", contenido:"contenidoArea"};
    
    $scope.archivo = [];
    $scope.archivoSeleccionado = false; 
    
    $scope.filtroInformacion = {comentario:"active", imagen:"", archivo:""};
    
    //filtro
    $scope.buscarTema = "";
    $scope.buscarFuente = "";
    $scope.buscarEtiqueta = "";
    $scope.buscarTipoInformacion = "";
    
    $scope.mostrarFiltro = "tema";
    $scope.filtro = {tema:[], fuente:[], tipoInformacion:[], etiqueta:[]};
    
    $scope.GetInformacion = function()              
    {
        GetInformacion($http, $q, CONFIG).then(function(data)
        {
            console.log(data);
            for(var k=0; k<data.length; k++)
            {
                data[k].Contenido = $sce.trustAsHtml(data[k].Contenido);
                $scope.GetInformacionEtiqueta(data[k]);
            }
            $scope.informacion = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetInformacionEtiqueta = function(informacion)              
    {
        if(informacion.Etiqueta.length == 0)
        {
            GetInformacionEtiqueta($http, $q, CONFIG, informacion.InformacionId).then(function(data)
            {
                informacion.Etiqueta = data;

            }).catch(function(error)
            {
                alert(error);
            });
        }
    };
    
    $scope.GetFuenteAutor = function(fuente)              
    {
        if(fuente.Autor.length == 0)
        {
            GetFuenteAutor($http, $q, CONFIG, fuente.FuenteId).then(function(data)
            {
                fuente.Autor = data;
            }).catch(function(error)
            {
                alert(error);
            });
        }
    };
    
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
    
    /*-------------- Catálogos de información ---------------------*/
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
    
    $scope.GetOrigenInformacion = function()
    {
        $scope.origenInformacion = GetOrigenInformacion();
    };
    
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
    
    $scope.GetFuente = function()              
    {
        GetFuente($http, $q, CONFIG).then(function(data)
        {
            $scope.fuente = data;
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*---------------- Fitro ------------------*/
    $scope.MostrarFiltros = function(filtro)
    {
        if($scope.mostrarFiltro == filtro)
        {
            $scope.mostrarFiltro = "";
        }
        else
        {
            $scope.mostrarFiltro = filtro;
        }
    };
    
    $scope.CambiarFiltroInfomacion = function(campo)
    {
        
        if(campo == "Comentario")
        {
            $scope.filtroInformacion = {comentario:"active", imagen:"", archivo:""};
        }
        else if(campo == "Imagen")
        {
            $scope.filtroInformacion = {comentario:"", imagen:"active", archivo:""};
        }
        else if(campo == "Archivo")
        {
            $scope.filtroInformacion = {comentario:"", imagen:"", archivo:"active"};
        }
    };
    
    $scope.FitroInformacion = function(info)
    {
        if(info.OrigenInformacion.OrigenInformacionId == "1")
        {
            if($scope.filtroInformacion.comentario != "active")
            {
                return false;
            }
        }
        
        if(info.OrigenInformacion.OrigenInformacionId == "2")
        {
            if($scope.filtroInformacion.imagen != "active")
            {
                return false;
            }
        }
        
        if(info.OrigenInformacion.OrigenInformacionId == "3")
        {
            if($scope.filtroInformacion.archivo != "active")
            {
                return false;
            }
        }
        
        var cumple = false;
        
        if($scope.filtro.tema.length == 0)
        {
            cumple = true;
        }
        else
        {
            for(var k=0; k<$scope.filtro.tema.length; k++)
            {
                if(info.Tema.TemaId == $scope.filtro.tema[k])
                {
                    cumple = true;
                    break;
                }
            }
        }
        
        if(!cumple)
        {
            return false;
        }
        
        cumple = false;
        
        if($scope.filtro.fuente.length == 0)
        {
            cumple = true;
        }
        else
        {
            for(var k=0; k<$scope.filtro.fuente.length; k++)
            {
                if(info.Fuente.FuenteId == $scope.filtro.fuente[k])
                {
                    cumple = true;
                    break;
                }
            }
        }
        
        if(!cumple)
        {
            return false;
        }
        
        cumple = false;
        
        if($scope.filtro.tipoInformacion.length == 0)
        {
            cumple = true;
        }
        else
        {
            for(var k=0; k<$scope.filtro.tipoInformacion.length; k++)
            {
                if(info.TipoInformacion.TipoInformacionId == $scope.filtro.tipoInformacion[k])
                {
                    cumple = true;
                    break;
                }
            }
        }
        
        if(!cumple)
        {
            return false;
        }
        
        if($scope.filtro.etiqueta.length > 0)
        {
            for(var i=0; i<$scope.filtro.etiqueta.length; i++)
            {
                cumple = false;
                for(var j=0; j<info.Etiqueta.length; j++)
                {
                    if($scope.filtro.etiqueta[i] == info.Etiqueta[j].EtiquetaId)
                    {
                        cumple = true;
                        break;
                    }
                }
                
                if(!cumple)
                {
                    return false;
                }
            }
        }
        
        if(cumple)
        {
            return true;
        }
        
    };
    
    $scope.SetFiltroTema = function(tema)
    {
        for(var k=0; k<$scope.filtro.tema.length; k++)
        {
            if(tema == $scope.filtro.tema[k])
            {
                $scope.filtro.tema.splice(k,1);
                return;
            }
        }
        
        $scope.filtro.tema.push(tema);
    };
    
    $scope.SetFiltroFuente = function(fuente)
    {
        for(var k=0; k<$scope.filtro.fuente.length; k++)
        {
            if(fuente == $scope.filtro.fuente[k])
            {
                $scope.filtro.fuente.splice(k,1);
                return;
            }
        }
        
        $scope.filtro.fuente.push(fuente);
    };
    
    $scope.SetFiltroEtiqueta = function(etiqueta)
    {
        for(var k=0; k<$scope.filtro.etiqueta.length; k++)
        {
            if(etiqueta == $scope.filtro.etiqueta[k])
            {
                $scope.filtro.etiqueta.splice(k,1);
                return;
            }
        }
        
        $scope.filtro.etiqueta.push(etiqueta);
    };
    
    $scope.SetFiltroTipoInformacion= function(tipo)
    {
        for(var k=0; k<$scope.filtro.tipoInformacion.length; k++)
        {
            if(tipo == $scope.filtro.tipoInformacion[k])
            {
                $scope.filtro.tipoInformacion.splice(k,1);
                return;
            }
        }
        
        $scope.filtro.tipoInformacion.push(tipo);
    };
    
    
    /*---------------- Detalle ----------------*/
    $scope.DetalleInformacion = function(informacion)
    {
        $scope.detalle = informacion;
    };
    
    $scope.VerPDF = function(informacion)
    {
        var url = 'data:application/octet-stream;base64,' + informacion.Archivo;
        
        var link = document.createElement("a");
        link.download = informacion.NombreArchivo;
        link.href = url;
        link.click();
    };
    
    $scope.DescargarImagen = function(imagen)
    {
        var url = 'data:image/png;base64,' + imagen;
        var link = document.createElement("a");
        link.download = "Imagen";
        link.href = url;
        link.click();
        //window.open(url);
    };
    
    // --------------------- Abrir Modal de agregar-editar informacion ----------------
    $scope.AbrirInformacion = function(operacion, objeto)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevaInformacion = new Informacion();
            $scope.ValidarEtiqueta($scope.nuevaInformacion.Etiqueta);
        }
        if(operacion == "Editar")
        {
            $scope.nuevaInformacion = $scope.SetInformacion(objeto);
            $scope.ValidarEtiqueta(objeto.Etiqueta);
        }
        
        $('#informacionModal').modal('toggle');
    };
    
    $scope.SetInformacion = function(data)
    {
        var informacion = new Informacion();
        
        informacion.InformacionId = data.InformacionId;
        informacion.Contenido = data.ContenidoOriginal;
        informacion.Archivo = data.Archivo;
        
        informacion.NombreArchivo = data.NombreArchivo;
        informacion.ExtensionArchivo = data.ExtensionArchivo;
        
        informacion.Tema.TemaId = data.Tema.TemaId;
        informacion.Tema.Nombre = data.Tema.Nombre;
        
        informacion.Fuente.FuenteId = data.Fuente.FuenteId;
        informacion.Fuente.Nombre = data.Fuente.Nombre;
        
        informacion.TipoInformacion.TipoInformacionId = data.TipoInformacion.TipoInformacionId;
        informacion.TipoInformacion.Nombre = data.TipoInformacion.Nombre;
        
        informacion.OrigenInformacion.OrigenInformacionId = data.OrigenInformacion.OrigenInformacionId;
        
        for(var k=0; k<$scope.origenInformacion.length; k++)
        {
            if($scope.origenInformacion[k].OrigenInformacionId == data.OrigenInformacion.OrigenInformacionId)
            {
                informacion.OrigenInformacion.Nombre = $scope.origenInformacion[k].Nombre;
                break;
            }
        }
       

        for(var k=0; k<data.Etiqueta.length; k++)
        {
            informacion.Etiqueta[k] = new Etiqueta();
            informacion.Etiqueta[k].EtiquetaId = data.Etiqueta[k].EtiquetaId;
            informacion.Etiqueta[k].Nombre = data.Etiqueta[k].Nombre;
        }
        
        
        return informacion;
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
    
    $scope.AgregarEtiqueta = function(etiqueta)
    {
        $scope.nuevaInformacion.Etiqueta.push(etiqueta);
        
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.etiqueta[k].show = false;
                break;
            }
        }
    };
    
    $scope.QuitarEtiqueta = function(etiqueta)
    {
        for(var k=0; k<$scope.nuevaInformacion.Etiqueta.length; k++)
        {
            if($scope.nuevaInformacion.Etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.nuevaInformacion.Etiqueta.splice(k,1);
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
    
    $scope.CambiarTema = function(tema)
    {
        $scope.nuevaInformacion.Tema = tema;
    };
    
    $scope.CambiarFuente = function(fuente)
    {
        $scope.nuevaInformacion.Fuente = fuente;
    };
    
    $scope.CambiarTipoInformacion = function(tipo)
    {
        $scope.nuevaInformacion.TipoInformacion = tipo;
    };
    
    $scope.CambiarOrigenInformacion = function(origen)
    {
        $scope.nuevaInformacion.OrigenInformacion = origen;
    };
    
    $scope.MostrarEtiqueta = function()
    {
        $scope.mostrarEtiqueta = !$scope.mostrarEtiqueta;
    };
    
    //-------------- Agregar Exterior -------------------------------
    $scope.AbrirAgregarEtiqueta = function()
    {
        ETIQUETA.AgregarEtiqueta();
    };
    
    $scope.$on('TerminarEtiqueta',function()
    {
        $scope.nuevaInformacion.Etiqueta.push(ETIQUETA.GetEtiqueta());
        $scope.etiqueta.push(ETIQUETA.GetEtiqueta());
        $scope.etiqueta[$scope.etiqueta.length-1].show = false;
    });
    
    $scope.AbrirAgregarTema = function()
    {
        TEMA.AgregarTema();
    };
    
    $scope.$on('TerminarTema',function()
    {   
        $scope.CambiarTema(TEMA.GetTema());
        $scope.tema.push(TEMA.GetTema());
    });
    
    
    $scope.AbrirAgregarTipoInformacion = function()
    {
        TIPOINFORMACION.AgregarTipoInformacion();
    };
    
    $scope.$on('TerminarTipoInformacion',function()
    {   
        $scope.CambiarTipoInformacion(TIPOINFORMACION.GetTipoInformacion());
        $scope.tipoInformacion.push(TIPOINFORMACION.GetTipoInformacion());
    });
    
    $scope.AbrirAgregarFuente = function()
    {
        FUENTE.AgregarFuente();
    };
    
    $scope.$on('TerminarFuente',function()
    {   
        $scope.CambiarFuente(FUENTE.GetFuente());
        $scope.fuente.push(FUENTE.GetFuente());
    });
    
    /*---------- Termianar Informaocion -----------------*/
    $scope.TerminarInformacion = function(contenidoInvalido)
    {
        if(!$scope.ValidarDatos(contenidoInvalido))
        {
            return;
        }
        else
        {
            $scope.nuevaInformacion.ArchivoSeleccionado = $scope.archivoSeleccionado;
            if($scope.operacion == "Agregar")
            {
                $scope.AgregarInformacion();
            }
            
            else if($scope.operacion == "Editar")
            {
                $scope.EditarInformacion();
            }
        }
    };
    
    $scope.AgregarInformacion = function()    
    {
        AgregarInformacion($http, CONFIG, $q, $scope.nuevaInformacion).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#informacionModal').modal('toggle');
                $scope.mensaje = "La información se ha agregado.";
                $scope.GetInformacion();
            }
            else
            {
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde.";
            }
            $('#mensajeInformacion').modal('toggle');
            
        }).catch(function(error)
        {
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeInformacion').modal('toggle');
        });
    };
    
    $scope.EditarInformacion = function()
    {
        EditarInformacion($http, CONFIG, $q, $scope.nuevaInformacion).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#informacionModal').modal('toggle');
                $scope.mensaje = "La información se ha editado.";
                
                $scope.GetInformacion();
            }
            else
            {
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde";   
            }
            $('#mensajeInformacion').modal('toggle');
        }).catch(function(error)
        {
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeInformacion').modal('toggle');
        });
    };
    
    $scope.ValidarDatos = function(contenidoInvalido)
    {
        $scope.mensajeError = [];
        
        if($scope.nuevaInformacion.Tema.TemaId.length == 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona un tema.";
            $scope.claseInformacion.tema = "dropdownListModalError";
        }
        else
        {
            $scope.claseInformacion.tema = "dropdownListModal";
        }
        
        if($scope.nuevaInformacion.TipoInformacion.TipoInformacionId.length == 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona un tipo de información.";
            $scope.claseInformacion.tipo = "dropdownListModalError";
        }
        else
        {
            $scope.claseInformacion.tipo = "dropdownListModal";
        }
        
        if($scope.nuevaInformacion.Fuente.FuenteId.length == 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona una fuente.";
            $scope.claseInformacion.fuente = "dropdownListModalError";
        }
        else
        {
            $scope.claseInformacion.fuente = "dropdownListModal";
        }
        
        if($scope.nuevaInformacion.Etiqueta.length == 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona al menos una etiqueta.";
            $scope.claseInformacion.etiqueta = "dropdownListModalError";
        }
        else
        {
            $scope.claseInformacion.etiqueta = "dropdownListModal";
        }
        
        if($scope.nuevaInformacion.OrigenInformacion.OrigenInformacionId.length == 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona el origen de la información.";
            $scope.claseInformacion.origen = "dropdownListModalError";
        }
        else
        {
            $scope.claseInformacion.origen = "dropdownListModal";
        }
        
        if(contenidoInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe el contenido de la información.";
            $scope.claseInformacion.contenido = "contenidoError";
        }
        else
        {
            $scope.claseInformacion.contenido = "contenidoArea";
        }
        
        if($scope.nuevaInformacion.OrigenInformacion.OrigenInformacionId == "2" || $scope.nuevaInformacion.OrigenInformacion.OrigenInformacionId == "3")
        {
            if($scope.nuevaInformacion.Archivo.length === 0)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona un archivo.";
            }
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
    
    $scope.CerrarInformacion = function()
    {
        $scope.archivo = [];
        $scope.archivoSeleccionado = false; 
        $scope.mensajeError = [];
        $scope.claseInformacion = {tema:"dropdownListModal", etiqueta:"dropdownListModal", tipo:"dropdownListModal", fuente:"dropdownListModal", origen:"dropdownListModal", contenido:"contenidoArea"};
    };
    
    /*-------Archivo-------*/
    $scope.CargarArchivo = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            $scope.nuevaInformacion.Archivo = element.files[0];
            $scope.nuevaInformacion.NombreArchivo = element.files[0].name;
            $scope.archivoSeleccionado = true; 
        });
    };
    /*----------------------- Inicializar ---------------------------*/

    $scope.GetTema();
    $scope.GetTipoInformacion();
    $scope.GetFuente();
    $scope.GetOrigenInformacion();
    $scope.GetInformacion();
    $scope.GetEtiqueta();
    
});