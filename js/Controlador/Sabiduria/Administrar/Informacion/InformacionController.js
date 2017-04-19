app.controller("AdministrarInformacionController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce, ETIQUETA, TEMA, TIPOINFORMACION, FUENTE)
{   
    $scope.informacion = [];
    
    $scope.fuente = [];
    $scope.tema = [];
    $scope.tipoInformacion = [];
    $scope.origenInformacion = [];
    $scope.etiqueta = [];
    $scope.informacion = [];
    $scope.autor = [];
    
    $scope.etiquetasInformacion = [];
    
    $scope.nuevaInformacion = null;
    $scope.detalle = null;
    $scope.mostrarEtiqueta = false;
    $scope.mostrarTema = false;
    $scope.mostrarTipoInformacion = false;
    $scope.mostrarFuente = false;
    $scope.ordenarInformacion = "Tema.Nombre";
    
    $scope.claseInformacion = {tema:"dropdownListModal", etiqueta:"dropdownListModal", tipo:"dropdownListModal", fuente:"dropdownListModal", origen:"dropdownListModal", contenido:"contenidoArea"};
    
    $scope.archivo = [];
    $scope.archivoSeleccionado = false; 
    
    $scope.filtroInformacion = {comentario:"active", imagen:"active", archivo:"active"};
    
    
    //----buscar
    $scope.buscarTemaOperacion = "";
    $scope.buscarTipoOperacion = "";
    $scope.buscarFuenteOperacion = "";
    $scope.buscarAutorOperacion = "";
    $scope.buscarEtiquetaOperacion = "";
    $scope.buscarTipoInformacionOperacion = "";
        
    //filtro
    $scope.buscarTema = "";
    $scope.buscarFuente = "";
    $scope.buscarEtiqueta = "";
    $scope.buscarTipoInformacion = "";
    $scope.buscarAutor = "";
    
    $scope.mostrarFiltro = "etiqueta";
    $scope.filtro = {tema:[], fuente:[], tipoInformacion:[], etiqueta:[], autor:[]};
    
    $scope.GetInformacion = function()              
    {
        GetInformacion($http, $q, CONFIG).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {
                data[k].Contenido = $sce.trustAsHtml(data[k].Contenido);
            }
            $scope.informacion = data;
            
            $scope.GetEtiquetasInformacion();
            $scope.GetAutoresFuente();
        
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
    
    $scope.GetEtiquetasInformacion = function()              
    {
        GetEtiquetasInformacion($http, $q, CONFIG).then(function(data)
        {
            $scope.etiquetasInformacion = data;
            $scope.SetEtiquetaInformacion();

        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetAutoresFuente = function()              
    {
        GetAutoresFuente($http, $q, CONFIG).then(function(data)
        {
            $scope.autoresFuente = data;
            $scope.SetAutoresFuentes();
            
            var sql = "SELECT DISTINCT Abreviacion, Nombre, AutorId FROM ?";
            $scope.autor = alasql(sql, [data]);

        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.SetEtiquetaInformacion = function()
    {
        var sqlBase = "Select EtiquetaId, Nombre From ? WHERE InformacionId = '";
        var sql = "";
        for(var k=0; k<$scope.informacion.length; k++)
        {
            sql = sqlBase;
            sql +=  $scope.informacion[k].InformacionId + "'";
           
            $scope.informacion[k].Etiqueta = alasql(sql,[$scope.etiquetasInformacion]);
        }
        
    };
    
    $scope.SetAutoresFuentes = function()
    {
        var sqlBase = "Select Abreviacion, Nombre, AutorId From ? WHERE FuenteId = '";
        var sql = "";
        for(var k=0; k<$scope.informacion.length; k++)
        {
            sql = sqlBase;
            sql +=  $scope.informacion[k].Fuente.FuenteId + "'";
           
            $scope.informacion[k].Fuente.Autor = alasql(sql,[$scope.autoresFuente]);
        }

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
    
    //--------------------- Ordenar -------------------
    $scope.CambiarOrdenar = function(campo)
    {
        if($scope.ordenarInformacion == campo)
        {
            $scope.ordenarInformacion = "-" + campo;
        }
        else
        {
            $scope.ordenarInformacion = campo;
        }
    };
    
    $scope.GetClaseOrdenar = function(campo)
    {
        if($scope.ordenarInformacion == campo || $scope.ordenarInformacion == ("-" + campo))
        {
            return "active";
        }
        else
        {
            return "";
        }
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
        var count = 0;
        
        if( $scope.filtroInformacion.comentario == "active")
        {
            count++;
        }
        if( $scope.filtroInformacion.imagen == "active")
        {
            count++;
        }
        if( $scope.filtroInformacion.archivo == "active")
        {
            count++;
        }
        
        if(campo == "Comentario")
        {
            if($scope.filtroInformacion.comentario == "active" && count>1)
            {
                $scope.filtroInformacion.comentario = "";
            }
            else
            {
                $scope.filtroInformacion.comentario = "active";
            }
        }
        
        if(campo == "Imagen")
        {
            if($scope.filtroInformacion.imagen == "active" && count>1)
            {
                $scope.filtroInformacion.imagen = "";
            }
            else
            {
                $scope.filtroInformacion.imagen = "active";
            }
        }
        
        if(campo == "Archivo")
        {
            if($scope.filtroInformacion.archivo == "active" && count>1)
            {
                $scope.filtroInformacion.archivo = "";
            }
            else
            {
                $scope.filtroInformacion.archivo = "active";
            }
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
        else
        {
            cumple = true;
        }
        
        if(!cumple)
        {
            return false;
        }
        
        if($scope.filtro.autor.length > 0)
        {
            for(var i=0; i<$scope.filtro.autor.length; i++)
            {
                cumple = false;
                for(var j=0; j<info.Fuente.Autor.length; j++)
                {
                    if($scope.filtro.autor[i] == info.Fuente.Autor[j].AutorId)
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
        else
        {
            cumple = true;
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
    
    $scope.SetFiltroAutor = function(autor)
    {
        for(var k=0; k<$scope.filtro.autor.length; k++)
        {
            if(autor == $scope.filtro.autor[k])
            {
                $scope.filtro.autor.splice(k,1);
                return;
            }
        }
        
        $scope.filtro.autor.push(autor);
    };
    
    
    $scope.LimpiarFiltro = function()
    {
        $scope.filtro = {tema:[], fuente:[], tipoInformacion:[], etiqueta:[], autor:[]};
        
        for(var k=0; k<$scope.tipoInformacion.length; k++)
        {
            $scope.tipoInformacion[k].Filtro = false;
        }
        
        for(var k=0; k<$scope.tema.length; k++)
        {
            $scope.tema[k].Filtro = false;
        }
        
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            $scope.etiqueta[k].Filtro = false;
        }
        
        for(var k=0; k<$scope.fuente.length; k++)
        {
            $scope.fuente[k].Filtro = false;
        }
        
        for(var k=0; k<$scope.autor.length; k++)
        {
            $scope.autor[k].Filtro = false;
        }
        
        $scope.buscarEtiqueta = "";
        $scope.buscarFuente = "";
        $scope.buscarTema = "";
        $scope.buscarTipoInformacion = "";
        $scope.buscarAutor = "";
    };
    
    /*---------- Filtro de filtros -------------*/
    $scope.FiltroTema = function(tema)
    {
        var cumple = false;
        
        for(var k=0; k<$scope.informacion.length; k++)  //&& $scope.informacion[k].OrigenInformacion.OrigenInformacionId == $scope.filtroInformacion.id
        {
            if(tema.TemaId == $scope.informacion[k].Tema.TemaId)
            {
                cumple  = true;
                break;
            }
        }
        
        return cumple;
    };
    
    $scope.FiltroFuente = function(fuente)
    {
        var cumple = false;
        
        for(var k=0; k<$scope.informacion.length; k++)  //&& $scope.informacion[k].OrigenInformacion.OrigenInformacionId == $scope.filtroInformacion.id
        {
            if(fuente.FuenteId == $scope.informacion[k].Fuente.FuenteId)
            {
                cumple  = true;
                break;
            }
        }
        
        return cumple;
    };
    
    
    $scope.FiltroTipoInformacion = function(tipo)
    {
        var cumple = false;
        
        for(var k=0; k<$scope.informacion.length; k++)  //&& $scope.informacion[k].OrigenInformacion.OrigenInformacionId == $scope.filtroInformacion.id
        {
            if(tipo.TipoInformacionId == $scope.informacion[k].TipoInformacion.TipoInformacionId)
            {
                cumple  = true;
                break;
            }
        }
        
        return cumple;
    };
    
    
    /*---------------- Detalle ----------------*/
    $scope.DetalleInformacion = function(informacion)
    {
        $scope.detalle = informacion;
    };
    
    $scope.VisualizarImagen = function(imagen, origen, preSeleccion)
    {
        console.log(preSeleccion);
        $scope.preImage = new Object();
        $scope.preImage.Imagen = imagen;
        $scope.preImage.Origen = origen;
        $scope.preImage.PreSeleccion = preSeleccion;
    };
    
    $scope.VerPDF = function(informacion)
    {
        var url = 'data:application/PDF;base64,' + informacion.Archivo;
        
        /*var link = document.createElement("a");
        link.download = informacion.NombreArchivo;
        link.href = url;
        link.click();
        
        var url = 'data:application/pdf;base64,' + $scope.nuevaInformacion.Archivo;*/
        window.open(url, '_blank');
    };
    
    $scope.DescargarImagen = function(imagen)
    {
        var url = 'data:image/png;base64,' + imagen;
        var link = document.createElement("a");
        link.download = "Imagen";
        link.href = url;
        link.click();
    };
    
    $scope.PrevisualizarArchivo = function()
    {
        if($scope.archivoSeleccionado)
        {
            var reader = new FileReader();
            var url = $scope.nuevaInformacion.Archivo;
            
            window.open($scope.archivoPreseleccionado);
        }
        else
        {
            var url = 'data:application/pdf;base64,' + $scope.nuevaInformacion.Archivo;
            window.open(url);
        }
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
                    document.getElementById("PrevisualizarImagenDetalles").innerHTML = ['<img class=" center-block img-responsive" src="', e.target.result,'" title="', escape(theFile.name), '"/>'].join('');
                };
            })(f);

            reader.readAsDataURL(f);
        }
    }
 
    document.getElementById('cargarImagen').addEventListener('change', ImagenSeleccionada, false);
    
    
    function ArchivoSeleccionado(evt) 
    {
        var files = evt.target.files;

        for (var i = 0, f; f = files[i]; i++) 
        {
            var reader = new FileReader();

            reader.onload = (function(theFile) 
            {
                return function(e) 
                {
                    $scope.archivoPreseleccionado = e.target.result;
                    $scope.$apply();
                };
            })(f);

            reader.readAsDataURL(f);
        }
        
       
    }
 
    document.getElementById('cargarArchivo').addEventListener('change', ArchivoSeleccionado, false);
    
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
        informacion.Observacion = data.Observacion;
        informacion.Seccion = data.Seccion;
        
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
        $scope.buscarEtiquetaOperacion = "";
        
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
        if($scope.mostrarTema)
        {
            $scope.mostrarTema  = false;  
        }
        $scope.buscarTemaOperacion = "";
        
        if(tema != 'Ninguno')
        {
            $scope.nuevaInformacion.Tema = tema;
        }
        else
        {
            $scope.nuevaInformacion.Tema = new Tema();
        }
    };
    
    $scope.CambiarFuente = function(fuente)
    {
        if($scope.mostrarFuente)
        {
            $scope.mostrarFuente  = false;  
        }
        $scope.buscarFuenteOperacion = "";
        
        if(fuente != "Ninguno")
        {
            $scope.nuevaInformacion.Fuente = fuente;
        }
        else
        {
            $scope.nuevaInformacion.Fuente = new Fuente;    
        }
    };
    
    $scope.CambiarTipoInformacion = function(tipo)
    {
        if($scope.mostrarTipoInformacion)
        {
            $scope.mostrarTipoInformacion  = false;  
        }
        $scope.buscarTipoInformacionOperacion = "";
    
        $scope.nuevaInformacion.TipoInformacion = tipo;
    };
    
    $scope.QuitarArchivo = function(origen)
    {
        $scope.nuevaInformacion.Archivo = "";
        $scope.nuevaInformacion.OrigenInformacion = origen;
    };
    
    $scope.PosibleOrigenInformacion = function(origen)
    {
        $scope.posibleOrigen = origen;
    };
    
    $scope.MostrarEtiqueta = function()
    {
        $scope.mostrarEtiqueta = !$scope.mostrarEtiqueta;
    };
    
    $scope.MostrarTema = function()
    {
        $scope.mostrarTema = !$scope.mostrarTema;
    };
    
    $scope.MostrarTipoInformacion = function()
    {
        $scope.mostrarTipoInformacion = !$scope.mostrarTipoInformacion;
    };
    
    $scope.MostrarFuente = function()
    {
        $scope.mostrarFuente = !$scope.mostrarFuente;
    };
    
    //-------------- Agregar Exterior -------------------------------
    //Etiqueta
    $scope.AbrirAgregarEtiqueta = function()
    {
        ETIQUETA.AgregarEtiqueta('Informacion');
    };
    
    $scope.$on('TerminarEtiquetaInformacion',function()
    {
        var etiqueta = SetEtiqueta(ETIQUETA.GetEtiqueta());
        etiqueta.show = false;
        $scope.nuevaInformacion.Etiqueta.push(etiqueta);
        $scope.etiqueta.push(etiqueta);
        
        $scope.buscarEtiquetaOperacion = "";
    });
    
    $scope.$on('TerminarEtiqueta',function()
    {
        var etiqueta = SetEtiqueta(ETIQUETA.GetEtiqueta());
        etiqueta.show = true;
        $scope.etiqueta.push(etiqueta);
    });
    
    //tema
    $scope.AbrirAgregarTema = function()
    {
        TEMA.AgregarTema();
    };
    
    $scope.$on('TerminarTema',function()
    {   
        $scope.mensaje = "Tema Agregado";
        $scope.EnviarAlerta('Modal');
        $scope.CambiarTema(TEMA.GetTema());
        $scope.tema.push(TEMA.GetTema());
    });
    
    //tipo de información
    $scope.AbrirAgregarTipoInformacion = function()
    {
        TIPOINFORMACION.AgregarTipoInformacion();
    };
    
    $scope.$on('TerminarTipoInformacion',function()
    {   
        $scope.mensaje = "Tipo de información Agregado";
        $scope.EnviarAlerta('Modal');
        $scope.CambiarTipoInformacion(TIPOINFORMACION.GetTipoInformacion());
        $scope.tipoInformacion.push(TIPOINFORMACION.GetTipoInformacion());
    });
    
    //fuente
    $scope.AbrirAgregarFuente = function()
    {
        FUENTE.AgregarFuente();
    };
    
    $scope.$on('TerminarFuente',function()
    {   
        $scope.mensaje = "Fuente Agregada";
        $scope.EnviarAlerta('Modal');
        
        var fuente = FUENTE.GetFuente();
        $scope.CambiarFuente(fuente);
        $scope.fuente.push(fuente);
    });
    
    $scope.LimpiarInterfaz = function()
    {
        $scope.buscarEtiquetaOperacion = "";
        $scope.buscarFuenteOperacion = "";
        $scope.buscarTemaOperacion = "";
        $scope.buscarTipoInformacion = "";
        
        $scope.mostrarEtiqueta = false;
        $scope.mostrarTema = false;
        $scope.mostrarTipoInformacion = false;
        $scope.mostrarFuenteInf = false;
        
    };
    
    /*---------- Termianar Informaocion -----------------*/
    $scope.TerminarInformacion = function(contenidoInvalido)
    {
        if(!$scope.ValidarDatos(contenidoInvalido))
        {
             $('#mensajeInformacion').modal('toggle');
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
                
                $scope.mensaje = "Información agregada.";
                $scope.GetInformacion();
                $scope.LimpiarInterfaz();
                $scope.EnviarAlerta('Vista');
                
                $('#informacionModal').modal('toggle');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeInformacion').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeInformacion').modal('toggle');
        });
    };
    
    $scope.EditarInformacion = function()
    {
        EditarInformacion($http, CONFIG, $q, $scope.nuevaInformacion).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.GetInformacion();
                $('#informacionModal').modal('toggle');
                $scope.mensaje = "Información editada.";
                $scope.EnviarAlerta('Vista');
                $scope.LimpiarInterfaz();
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeInformacion').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeInformacion').modal('toggle');
        });
    };
    
    $scope.ValidarDatos = function(contenidoInvalido)
    {
        $scope.mensajeError = [];
        
        /*if($scope.nuevaInformacion.Tema.TemaId.length == 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona un tema.";
            $scope.claseInformacion.tema = "dropdownListModalError";
        }
        else
        {
            $scope.claseInformacion.tema = "dropdownListModal";
        }*/
        
        if($scope.nuevaInformacion.Etiqueta.length == 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona al menos una etiqueta.";
            $scope.claseInformacion.etiqueta = "dropdownListModalError";
        }
        else
        {
            $scope.claseInformacion.etiqueta = "dropdownListModal";
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
        $('#cerrarInformacionModal').modal('toggle');
    };
    
    $scope.ConfirmarCerrarInformacion = function()
    {
        $('#informacionModal').modal('toggle');
        $scope.LimpiarInterfaz();
        $scope.archivo = [];
        $scope.archivoSeleccionado = false; 
        $scope.mensajeError = [];
        $scope.claseInformacion = {tema:"dropdownListModal", etiqueta:"dropdownListModal", tipo:"dropdownListModal", fuente:"dropdownListModal", origen:"dropdownListModal", contenido:"contenidoArea"};
    };
    
    
    document.getElementById('informacionModal').onclick = function(e) 
    {
        if($scope.mostrarEtiqueta)
        {
            if(!(e.target.id == "etiquetaPanel" || e.target.id == "etiquetasAgregadas" || $(e.target).parents("#etiquetaPanel").size()))
            { 
                $scope.mostrarEtiqueta = false;
                $scope.$apply();
            }
        }

        if($scope.mostrarTema)
        {
            if(!(e.target.id == "temaPanel" || $(e.target).parents("#temaPanel").size()))
            { 
                $scope.mostrarTema = false;
                $scope.$apply();
            }
        }
        
        if($scope.mostrarTipoInformacion)
        {
            if(!(e.target.id == "tipoInformacionPanel" || $(e.target).parents("#tipoInformacionPanel").size()))
            { 
                $scope.mostrarTipoInformacion = false;
                $scope.$apply();
            }
        }
        
        if($scope.mostrarFuente)
        {
            if(!(e.target.id == "fuentePanel" || $(e.target).parents("#fuentePanel").size()))
            { 
                $scope.mostrarFuente = false;
                $scope.$apply();
            }
        }
    };
    
    /*-------Archivo-------*/
    $scope.CargarArchivo = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            if(element.files.length >0 )
            {
                $scope.nuevaInformacion.Archivo = element.files[0];
                $scope.nuevaInformacion.NombreArchivo = element.files[0].name;
                $scope.archivoSeleccionado = true;
            
                $scope.nuevaInformacion.OrigenInformacion = $scope.posibleOrigen;
            }
        });
    };
    
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 2:
                $scope.buscarEtiquetaOperacion = "";
                break;
            case 3:
                $scope.buscarTemaOperacion = "";
                break;
            case 4:
                $scope.buscarEtiqueta = "";
                break;
            case 5:
                $scope.buscarTema = "";
                break;
            case 6:
                $scope.buscarFuente = "";
                break;
            case 7:
                $scope.buscarAutor = "";
                break;
            case 8:
                $scope.buscarTipoInformacion = "";
                break;
            case 9:
                $scope.buscarTipoInformacionOperacion = "";
                break;
             case 10:
                $scope.buscarFuenteOperacion = "";
                break;
            default: 
                break;
        }
    };
    
     //--------------------- Alertas --------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoInfo").alert();

            $("#alertaExitosoInfo").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoInfo").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoInfo").alert();

            $("#alertaEditarExitosoInfo").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoInfo").fadeOut();
            }, 2000)
        }
    };
    
    /*----------------------- Inicializar ---------------------------*/

    $scope.GetTema();
    $scope.GetTipoInformacion();
    $scope.GetFuente();
    $scope.GetOrigenInformacion();
    $scope.GetInformacion();
    $scope.GetEtiqueta();
    //$scope.GetAutor();
    
});