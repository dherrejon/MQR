app.controller("AdministrarInformacionController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce, TIPOINFORMACION, FUENTE, $timeout)
{
   $scope.titulo = "Informacion";

    $scope.permiso = false;

    $scope.informacion = [];
    $scope.etiqueta = [];
    $scope.tema = [];
    $scope.fuente = [];
    $scope.origenInformacion = [];
    $scope.tipoInformacion = [];

    $scope.buscarInformacion = "";
    $scope.buscarEtiqueta = "";
    $scope.buscarTema = "";
    $scope.buscarConcepto = "";



    $scope.campoBuscar = "Conceptos";
    $scope.verFiltro = true;
    $scope.filtro = {tema:[], etiqueta: [], origen: {texto:false, imagen:false, archivo:false}, tipoInformacion:[], fuente:[]};

    $scope.ValidarPermiso = function()
    {
        for(var k=0; k<$scope.usuarioLogeado.Permiso.length; k++)
        {
            if($scope.usuarioLogeado.Permiso[k] == "SabiduriaCon")
            {
                $scope.permiso = true;
                break;
            }
        }
    };

    $scope.GetInformacion = function()
    {
        GetInformacion($http, $q, CONFIG).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {
                data[k].Contenido = $sce.trustAsHtml(data[k].Contenido);
                data[k].ObservacionHTML = $sce.trustAsHtml(data[k].ObservacionHTML);
            }

            $scope.informacion = data;

            $scope.GetEtiquetasInformacion();
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
            $scope.GetTemaInformacion();

        }).catch(function(error)
        {
            alert(error);
        });
    };

    $scope.GetTemaInformacion = function()
    {
        GetTemaInformacion($http, $q, CONFIG).then(function(data)
        {
            $scope.temaInformacion = data;
            $scope.SetEtiquetaInformacion();

        }).catch(function(error)
        {
            alert(error);
        });
    };

    $scope.SetEtiquetaInformacion = function()
    {
        var sqlBase = "Select EtiquetaId, Nombre From ? WHERE InformacionId = '";
        var sqlBaseTema = "Select TemaId, Nombre From ? WHERE InformacionId = '";
        var sql = "";
        for(var k=0; k<$scope.informacion.length; k++)
        {
            //etiqueta
            sql = sqlBase + $scope.informacion[k].InformacionId + "'";
            $scope.informacion[k].Etiqueta = alasql(sql,[$scope.etiquetasInformacion]);

            //tema
            sql = sqlBaseTema +  $scope.informacion[k].InformacionId + "'";
            $scope.informacion[k].Tema = alasql(sql,[$scope.temaInformacion]);
        }

        var sql = "SELECT DISTINCT EtiquetaId, Nombre FROM ?";
        $scope.etiquetaF = alasql(sql, [$scope.etiquetasInformacion]);

        var sql = "SELECT DISTINCT TemaId, Nombre FROM ?";
        $scope.temaF = alasql(sql, [$scope.temaInformacion]);

        for(var k=0; k<$scope.temaF.length; k++)
        {
            $scope.temaF[k].mostrar = true;
        }

        for(var k=0; k<$scope.etiquetaF.length; k++)
        {
            $scope.etiquetaF[k].mostrar = true;
        }
    };

    $scope.GetArchivoInformacion = function(informacion)
    {
        GetArchivoInformacion($http, $q, CONFIG, informacion.InformacionId).then(function(data)
        {
            informacion.Archivo = data.Archivo;
            informacion.NombreArchivo = data.NombreArchivo;
            informacion.ExtensionArchivo = data.ExtensionArchivo;

        }).catch(function(error)
        {
            alert(error);
        });
    };


    //------------- Catálogos --------------------------
    $scope.GetEtiqueta = function()
    {
        GetEtiqueta($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.etiqueta = data;

        }).catch(function(error)
        {
            alert(error);
        });
    };

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


    /*------------ General -------------------*/
    $scope.CambiarCampoBuscar = function(campo)
    {
        if(campo != $scope.campoBuscar)
        {
            $scope.buscarInformacion = "";
            //$scope.buscarEtiqueta = "";
            //$scope.buscarTema = "";
            $scope.buscarConcepto = "";

            $scope.campoBuscar = campo;

        }
    };

    $scope.LimpiarBuscar2 = function()
    {
        //$scope.buscarTema = "";
        //$scope.buscarEtiqueta = "";
        $scope.buscarInformacion = "";
        $scope.buscarConcepto = "";
    };

    //------------- Detalles --------------------
    $scope.verDetalle  =function(info)
    {
        $scope.detalle = info;
        $scope.verMasDetalle = false;

        if(info.OrigenInformacion.OrigenInformacionId != "1")
        {
            $scope.GetArchivoInformacion(info);
        }

        $('#DetalleInformacion').modal('toggle');
    };

    $scope.CambiarMasDetalles = function()
    {
        $scope.verMasDetalle = !$scope.verMasDetalle;
    };

    $scope.VerPDF = function(informacion)
    {
        var url = 'data:application/PDF;base64,' + informacion.Archivo;
        window.open(url, '_blank');
    };

    /*----- filtro -------------*/
    $scope.FiltroInformacion = function(info)
    {
        if($scope.filtro.origen.archivo || $scope.filtro.origen.imagen || $scope.filtro.origen.texto)
        {
            if($scope.filtro.origen.archivo && info.OrigenInformacion.OrigenInformacionId != '3')
            {
                return false;
            }

            if($scope.filtro.origen.imagen && info.OrigenInformacion.OrigenInformacionId != '2')
            {
                return false;
            }

            if($scope.filtro.origen.texto && info.OrigenInformacion.OrigenInformacionId != '1')
            {
                return false;
            }
        }

        var cumple = false;


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

        cumple = false;

        if($scope.filtro.tema.length > 0)
        {
            for(var i=0; i<$scope.filtro.tema.length; i++)
            {
                cumple = false;
                for(var j=0; j<info.Tema.length; j++)
                {
                    if($scope.filtro.tema[i] == info.Tema[j].TemaId)
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

        return true;
    };

    $scope.CambiarFiltroOrigen = function(filtro, valor)
    {
        if(valor)
        {
            switch(filtro)
            {
                case 1:
                    $scope.filtro.origen.texto = !$scope.filtro.origen.texto;
                    break;
                case 2:
                    $scope.filtro.origen.imagen = !$scope.filtro.origen.imagen;
                    break;
                case 3:
                    $scope.filtro.origen.archivo = !$scope.filtro.origen.archivo;
                    break;
                default:
                    break;
            }
        }
        else
        {
            switch(filtro)
            {
                case 1:
                    $scope.filtro.origen.texto = !$scope.filtro.origen.texto;
                    $scope.filtro.origen.imagen = false;
                    $scope.filtro.origen.archivo = false;
                    break;
                case 2:
                    $scope.filtro.origen.imagen = !$scope.filtro.origen.imagen;
                    $scope.filtro.origen.texto = false;
                    $scope.filtro.origen.archivo = false;
                    break;
                case 3:
                    $scope.filtro.origen.archivo = !$scope.filtro.origen.archivo;
                    $scope.filtro.origen.texto = false;
                    $scope.filtro.origen.imagen = false;
                    break;
                default:
                    break;
            }
        }
    };

    $scope.FiltroInformacionContenido = function(info)
    {
        if($scope.buscarInformacion !== null && $scope.buscarInformacion !== null)
        {
            if($scope.buscarInformacion.length > 0)
            {
                var contenido = info.ContenidoOriginal.toLowerCase().indexOf($scope.buscarInformacion.toLocaleLowerCase());
                var titulo = info.Titulo.toLowerCase().indexOf($scope.buscarInformacion.toLocaleLowerCase());

                if(contenido > -1 || titulo > -1)
                {
                    return true;
                }
            }
            else
            {
                return true;
            }
        }
        else
        {
            return true;
        }
    };

    $scope.SetFiltroEtiqueta = function(etiqueta)
    {
        etiqueta.mostrar = false;
        $scope.filtro.etiqueta.push(etiqueta.EtiquetaId);

        //$scope.buscarEtiqueta = "";
        $scope.buscarConcepto = "";

        $scope.GetEtiquetasFiltradas();
        document.getElementById('buscarConcepto').focus();
        //document.getElementById('bucarEtiqueta').focus();
    };

    $scope.SetFiltroTema = function(tema)
    {
        tema.mostrar = false;
        $scope.filtro.tema.push(tema.TemaId);

        //$scope.buscarTema = "";
        $scope.buscarConcepto = "";

        $scope.GetTemasFiltrados();
        document.getElementById('buscarConcepto').focus();
        //document.getElementById('bucarTema').focus();
    };

    $scope.LimpiarFiltro = function()
    {
        $scope.filtro = {tema:[], etiqueta: [], origen: {texto:false, imagen:false, archivo:false}, tipoInformacion:[], fuente:[]};

        for(var k=0; k<$scope.etiquetaF.length; k++)
        {
            $scope.etiquetaF[k].mostrar = true;
        }

        for(var k=0; k<$scope.temaF.length; k++)
        {
            $scope.temaF[k].mostrar = true;
        }

        for(var k=0; k<$scope.tipoInformacion.length; k++)
        {
            $scope.tipoInformacion[k].Filtro = false;
        }

        for(var k=0; k<$scope.fuente.length; k++)
        {
            $scope.fuente[k].Filtro = false;
        }

        $scope.verFiltro = true;

        //$scope.buscarEtiqueta = "";
        //$scope.buscarTema = "";
        $scope.buscarConcepto = "";
        $scope.buscarFuente = "";
        $scope.buscarTipoInformacion = "";
    };

    $scope.CambiarVerFiltro = function()
    {
        $scope.verFiltro = !$scope.verFiltro;
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

    //------ etiqueta ------
    $scope.FiltrarBuscarEtiqueta = function(etiqueta, buscar)
    {
        if(buscar !== undefined)
        {
            if(buscar.length > 0)
            {
                var index = etiqueta.Nombre.toLowerCase().indexOf(buscar.toLowerCase());


                if(index < 0)
                {
                    return false;
                }
                else
                {
                    if(index === 0)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
            else
            {
                return true;
            }
        }
    };

    $scope.BuscarEtiquetaFiltro = function(etiqueta)
    {
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarConcepto);
    };

    $('#buscarConcepto').keydown(function(e)
    {
        switch(e.which) {
            case 13:
               var index = $scope.buscarConcepto.indexOf(" ");

               if(index == -1)
                {
                    $scope.buscarEtiqueta = $scope.buscarConcepto;
                    $scope.AgregarEtiquetaFiltro();
                }
                else
                {
                    $scope.buscarTema = $scope.buscarConcepto;
                    $scope.AgregarTemaFiltro();
                }

              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });

    $scope.AgregarEtiquetaFiltro = function()
    {
        for(var k=0; k<$scope.etiquetaF.length; k++)
        {
            if($scope.etiquetaF[k].Nombre.toLowerCase() == $scope.buscarEtiqueta.toLowerCase())
            {
                if($scope.etiquetaF[k].mostrar)
                {
                    $scope.SetFiltroEtiqueta($scope.etiquetaF[k]);
                }
                else
                {
                    $scope.buscarConcepto = "";

                }
                $scope.$apply();
            }
        }
    };


    $scope.QuitarTemaFiltro = function(tema)
    {
        for(var k=0; k<$scope.temaF.length; k++)
        {
            if($scope.temaF[k].TemaId == tema.TemaId)
            {
                $scope.temaF[k].mostrar = true;
                break;
            }
        }

        for(var k=0; k<$scope.filtro.tema.length; k++)
        {
            if($scope.filtro.tema[k] == tema.TemaId)
            {
                $scope.filtro.tema.splice(k,1);
                break;
            }
        }

        for(var k=0; k<$scope.temaFiltrado.length; k++)
        {
            if($scope.temaFiltrado[k].TemaId == tema.TemaId)
            {
                $scope.temaFiltrado.splice(k,1);
                break;
            }
        }
    };

    $scope.QuitaretiqeutaFiltro = function(etiqueta)
    {
        for(var k=0; k<$scope.etiquetaF.length; k++)
        {
            if($scope.etiquetaF[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.etiquetaF[k].mostrar = true;
                break;
            }
        }

        for(var k=0; k<$scope.filtro.etiqueta.length; k++)
        {
            if($scope.filtro.etiqueta[k] == etiqueta.EtiquetaId)
            {
                $scope.filtro.etiqueta.splice(k,1);
                break;
            }
        }

        for(var k=0; k<$scope.etiquetaFiltrada.length; k++)
        {
            if($scope.etiquetaFiltrada[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.etiquetaFiltrada.splice(k,1);
                break;
            }
        }
    };

    $scope.GetEtiquetasFiltradas = function()
    {

        var sql = "SELECT Nombre, EtiquetaId FROM ? WHERE mostrar = false";

        $scope.etiquetaFiltrada = alasql(sql, [$scope.etiquetaF]);
    };

    $scope.GetTemasFiltrados = function()
    {

        var sql = "SELECT Nombre, TemaId From ? WHERE mostrar = false";

        $scope.temaFiltrado = alasql(sql, [$scope.temaF]);
    };


    //------ Tema --------
    $scope.FiltrarBuscarTema = function(tema, buscar)
    {
        if(buscar !== undefined)
        {
            if(buscar.length > 0)
            {
                var index = tema.Nombre.toLowerCase().indexOf(buscar.toLowerCase());


                if(index < 0)
                {
                    return false;
                }
                else
                {
                    if(index === 0)
                    {
                        return true;
                    }
                    else
                    {
                        if(tema.Nombre[index-1] == " ")
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
        }
    };

    $scope.BuscarTemaFiltro = function(tema)
    {
        return $scope.FiltrarBuscarTema(tema, $scope.buscarConcepto);
    };


    $scope.AgregarTemaFiltro = function()
    {
        for(var k=0; k<$scope.temaF.length; k++)
        {
            if($scope.temaF[k].Nombre.toLowerCase() == $scope.buscarTema.toLowerCase())
            {
                if($scope.temaF[k].mostrar)
                {
                    $scope.SetFiltroTema($scope.temaF[k]);
                }
                else
                {
                    $scope.buscarTema = "";

                }
                $scope.$apply();
            }
        }
    };

    //------------- Administrar
    $scope.mostrarFiltro = "fuente";
    $scope.ordenarInformacion = "Titulo";
     $scope.claseInformacion = {tema:"dropdownListModal", etiqueta:"dropdownListModal", tipo:"dropdownListModal", fuente:"dropdownListModal", origen:"dropdownListModal", contenido:"contenidoArea"};

    $scope.AbrirDropDownBarraPrincipal = function(dropdown)
    {
        $scope.dropdownAbrir = dropdown;
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

    //Filtro
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


    //Abrir
    // --------------------- Abrir Modal de agregar-editar informacion ----------------
    $scope.AbrirInformacion = function(operacion, objeto)
    {
        $scope.operacion = operacion;

        if(operacion == "Agregar")
        {
            $scope.nuevaInformacion = new Informacion();
            $scope.ValidarEtiqueta($scope.nuevaInformacion.Etiqueta);
            $scope.ValidarTema([]);
        }
        if(operacion == "Editar")
        {
            $scope.nuevaInformacion = $scope.SetInformacion(objeto);
            $scope.ValidarEtiqueta(objeto.Etiqueta);
            $scope.ValidarTema(objeto.Tema);

            if(objeto.OrigenInformacion.OrigenInformacionId != "1")
            {
                $scope.archivoSeleccionado = false;
                $scope.GetArchivoInformacion($scope.nuevaInformacion);
            }
        }

        $('#informacionModal').modal('toggle');
    };

    $scope.AbrirDropDownBarraPrincipal = function(dropdown)
    {
        $scope.dropdownAbrir = dropdown;
    };

    $scope.SetInformacion = function(data)
    {
        var informacion = new Informacion();

        informacion.Hecho = data.Hecho;
        informacion.InformacionId = data.InformacionId;
        informacion.Contenido = data.ContenidoOriginal;
        informacion.ContenidoOriginal = data.ContenidoOriginal;
        informacion.Observacion = data.Observacion;
        informacion.Seccion = data.Seccion;
        informacion.Titulo = data.Titulo;

        informacion.Archivo = data.Archivo;

        informacion.NombreArchivo = data.NombreArchivo;
        informacion.ExtensionArchivo = data.ExtensionArchivo;

        informacion.Fuente.FuenteId = data.Fuente.FuenteId;
        informacion.Fuente.Nombre = data.Fuente.Nombre;

        informacion.Fuente.TipoFuente.TipoFuenteId = data.Fuente.TipoFuente.TipoFuenteId;
        informacion.Fuente.TipoFuente.Nombre = data.Fuente.TipoFuente.Nombre;

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

        for(var k=0; k<data.Tema.length; k++)
        {
            informacion.Tema[k] = new Tema();
            informacion.Tema[k].TemaId = data.Tema[k].TemaId;
            informacion.Tema[k].Nombre = data.Tema[k].Nombre;
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

    $scope.ValidarTema = function(tema)
    {
        for(var k=0; k<$scope.tema.length; k++)
        {
            $scope.tema[k].show = true;
            for(var i=0; i<tema.length; i++)
            {
                if(tema[i].TemaId == $scope.tema[k].TemaId)
                {
                    $scope.tema[k].show = false;
                    break;
                }
            }
        }
    };

    $scope.ModalConfirmacionCambiarNoHecho = function (callback) {

      $('#modalConfirmacionCambiarNoHecho').modal('show');

      $("#btn_cambiar_si").unbind('click').click( function(){
        callback(true);
        $('#modalConfirmacionCambiarNoHecho').modal('hide');
      });

      $("#btn_cambiar_no").unbind('click').click( function(){
        callback(false);
        $('#modalConfirmacionCambiarNoHecho').modal('hide');
      });

    };

    $scope.CambiarEstadoHecho = function () {

      if ('1'===$scope.nuevaInformacion.Hecho) {
        $scope.ModalConfirmacionCambiarNoHecho(
          function(confirmado){
            if(confirmado){
              $timeout(function () {
                $scope.nuevaInformacion.Hecho = ($scope.nuevaInformacion.Hecho === '1')?'0':'1';
                $scope.$apply();
              }, 0);
            }
          }
        );
      }
      else {
        $scope.nuevaInformacion.Hecho = ($scope.nuevaInformacion.Hecho === '1')?'0':'1';
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

    $scope.MostrarTipoInformacion = function()
    {
        $scope.mostrarTipoInformacion = !$scope.mostrarTipoInformacion;
    };

    $scope.MostrarFuente = function()
    {
        $scope.mostrarFuente = !$scope.mostrarFuente;
    };

    //--------- etiqueta--------------------
    $('#nuevaEtiqueta').keydown(function(e)
    {
        switch(e.which) {
            case 13:
               $scope.AgregarNuevaEtiqueta();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });

    $scope.AgregarEtiqueta = function(etiqueta)
    {
        $scope.nuevaInformacion.Etiqueta.push(etiqueta);

        etiqueta.show = false;
        $scope.buscarEtiquetaOperacion = "";
    };

    $scope.AgregarNuevaEtiqueta = function()
    {
        if($scope.buscarEtiquetaOperacion.length > 0)
        {
            if(!$scope.ValidarEtiquetaAgregado())
            {
                $scope.$apply();
                return;
            }
            else
            {
                var etiqueta = new Etiqueta();
                etiqueta.Nombre = $scope.buscarEtiquetaOperacion;
                etiqueta.EtiquetaId = "-1";
                $scope.buscarEtiquetaOperacion = "";

                $scope.nuevaInformacion.Etiqueta.push(etiqueta);
                $scope.$apply();
            }
        }
    };

    $scope.ValidarEtiquetaAgregado = function()
    {
        if($rootScope.erEtiqueta.test($scope.buscarEtiquetaOperacion))
        {
            for(var k=0; k<$scope.etiqueta.length; k++)
            {
                if($scope.etiqueta[k].Nombre.toLowerCase() == $scope.buscarEtiquetaOperacion.toLowerCase())
                {
                    if($scope.etiqueta[k].show)
                    {
                        $scope.AgregarEtiqueta($scope.etiqueta[k]);
                        return false;
                    }
                    else
                    {
                        $scope.mensajeError = [];
                        $scope.mensajeError[$scope.mensajeError.length] = "*Esta etiqueta ya fue agregada.";
                        $scope.buscarEtiquetaOperacion = "";
                        $('#mensajeInformacion').modal('toggle');
                        return false;
                    }
                }
            }

            for(var k=0; k<$scope.nuevaInformacion.Etiqueta.length; k++)
            {
                if($scope.nuevaInformacion.Etiqueta[k].Nombre.toLowerCase() == $scope.buscarEtiquetaOperacion.toLowerCase())
                {
                    $scope.mensajeError = [];
                    $scope.mensajeError[$scope.mensajeError.length] = "*Esta etiqueta ya fue agregada.";
                    $scope.buscarEtiqueta = "";
                    $('#mensajeInformacion').modal('toggle');
                    return false;
                }
            }
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una etiqueta válida.";
            $scope.buscarEtiquetaOperacion = "";
            $('#mensajeInformacion').modal('toggle');

            return false;
        }


        return true;
    };

    $scope.QuitarEtiqueta = function(etiqueta)
    {

        for(var k=0; k<$scope.nuevaInformacion.Etiqueta.length; k++)
        {
            if(etiqueta == $scope.nuevaInformacion.Etiqueta[k])
            {
                $scope.nuevaInformacion.Etiqueta.splice(k,1);
                break;
            }
        }

        if(etiqueta.EtiquetaId != "-1")
        {
            for(var k=0; k<$scope.etiqueta.length; k++)
            {
                if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.etiqueta[k].show = true;
                    return;
                }
            }
        }
    };

    $scope.EditarEtiqueta = function(etiqueta)
    {
        if(etiqueta.EtiquetaId == "-1")
        {
            $scope.buscarEtiquetaOperacion = etiqueta.Nombre;

            for(var k=0; k<$scope.nuevaInformacion.Etiqueta.length; k++)
            {
                if($scope.nuevaInformacion.Etiqueta[k].Nombre == etiqueta.Nombre)
                {
                    $scope.nuevaInformacion.Etiqueta.splice(k,1);
                    break;
                }
            }

            $("#nuevaEtiqueta").focus();
        }
    };

    $scope.BuscarEtiquetaOperacion = function(etiqueta)
    {
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarEtiquetaOperacion);
    };

     $('#nuevoTema').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                $scope.AgregarNuevoTema();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });

    $scope.AgregarTema = function(tema)
    {
        $scope.nuevaInformacion.Tema.push(tema);

        tema.show = false;
        $scope.buscarTemaOperacion = "";
    };

    $scope.AgregarNuevoTema = function()
    {
        if($scope.buscarTemaOperacion.length > 0)
        {
            if(!$scope.ValidarTemaAgregado())
            {
                $scope.$apply();
                return;
            }
            else
            {
                var tema = new Tema();
                tema.Nombre = $scope.buscarTemaOperacion;
                tema.TemaId = "-1";
                $scope.buscarTemaOperacion = "";

                $scope.nuevaInformacion.Tema.push(tema);
                $scope.$apply();
            }
        }
    };

    $scope.ValidarTemaAgregado = function()
    {
        if($rootScope.erTema.test($scope.buscarTemaOperacion))
        {
            for(var k=0; k<$scope.tema.length; k++)
            {
                if($scope.tema[k].Nombre.toLowerCase() == $scope.buscarTemaOperacion.toLowerCase())
                {
                    if($scope.tema[k].show)
                    {
                        $scope.AgregarTema($scope.tema[k]);
                        return false;
                    }
                    else
                    {
                        $scope.mensajeError = [];
                        $scope.mensajeError[$scope.mensajeError.length] = "*Este tema ya fue agregado.";
                        $scope.buscarTemaOperacion = "";
                        $('#mensajeInformacion').modal('toggle');
                        return false;
                    }
                }
            }

            for(var k=0; k<$scope.nuevaInformacion.Tema.length; k++)
            {
                if($scope.nuevaInformacion.Tema[k].Nombre.toLowerCase() == $scope.buscarTemaOperacion.toLowerCase())
                {
                    $scope.mensajeError = [];
                    $scope.mensajeError[$scope.mensajeError.length] = "*Este tema ya fue agregado.";
                    $scope.buscarTemaOperacion = "";
                    $('#mensajeInformacion').modal('toggle');
                    return false;
                }
            }
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un tema válido.";
            $scope.buscarTemaOperacion = "";
            $('#mensajeInformacion').modal('toggle');

            return false;
        }


        return true;
    };

    $scope.QuitarTema = function(tema)
    {

        for(var k=0; k<$scope.nuevaInformacion.Tema.length; k++)
        {
            if(tema == $scope.nuevaInformacion.Tema[k])
            {
                $scope.nuevaInformacion.Tema.splice(k,1);
                break;
            }
        }

        if(tema.TemaId != "-1")
        {
            for(var k=0; k<$scope.tema.length; k++)
            {
                if($scope.tema[k].TemaId == tema.TemaId)
                {
                    $scope.tema[k].show = true;
                    return;
                }
            }
        }
    };

    $scope.EditarTema = function(tema)
    {
        if(tema.TemaId == "-1")
        {
            $scope.buscarTemaOperacion = tema.Nombre;

            for(var k=0; k<$scope.nuevaInformacion.Tema.length; k++)
            {
                if($scope.nuevaInformacion.Tema[k].Nombre == tema.Nombre)
                {
                    $scope.nuevaInformacion.Tema.splice(k,1);
                    break;
                }
            }

            $("#nuevoTema").focus();
        }
    };

    $scope.BuscarTemaOperacion = function(tema)
    {
        return $scope.FiltrarBuscarEtiqueta(tema, $scope.buscarTemaOperacion);
    };

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
    $scope.TerminarInformacion = function(tituloInvalido, contenidoInvalido)
    {
        if(!$scope.ValidarDatos(tituloInvalido, contenidoInvalido))
        {
             $('#mensajeInformacion').modal('toggle');
            return;
        }
        else
        {
            $scope.nuevaInformacion.UsuarioId = $rootScope.UsuarioId;
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
                //$scope.GetInformacion();
                $scope.LimpiarInterfaz();
                $scope.EnviarAlerta('Vista');

                $scope.nuevaInformacion.InformacionId = data[1].Id;
                $scope.nuevaInformacion.Etiqueta = data[2].Etiqueta;
                $scope.nuevaInformacion.Tema = data[3].Tema;
                $scope.SetNuevaInformacion($scope.nuevaInformacion);

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
                //$scope.GetInformacion();
                $('#informacionModal').modal('toggle');
                $scope.mensaje = "Información editada.";
                $scope.EnviarAlerta('Vista');
                $scope.LimpiarInterfaz();

                $scope.nuevaInformacion.Etiqueta = data[1].Etiqueta;
                $scope.nuevaInformacion.Tema = data[2].Tema;
                $scope.SetNuevaInformacion($scope.nuevaInformacion);
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

    $scope.SetNuevaInformacion = function(informacion)
    {
        //tema
        var sqlBase = "SELECT COUNT(*) as num FROM ? WHERE TemaId = '";
        for(var k=0; k<informacion.Tema.length; k++)
        {
            sql = sqlBase + informacion.Tema[k].TemaId + "'";

            //tema Filtro
            count = alasql(sql, [$scope.temaF]);

            if(count[0].num === 0)
            {
                informacion.Tema[k].mostrar = true;
               $scope.temaF.push(informacion.Tema[k]);
            }

            //tema Dropdownlist
            count = alasql(sql, [$scope.tema]);

            if(count[0].num === 0)
            {
                $scope.tema.push(informacion.Tema[k]);
            }
        }

        //etiqueta
        sqlBase = "SELECT COUNT(*) as num FROM ? WHERE EtiquetaId= '";
        for(var k=0; k<informacion.Etiqueta.length; k++)
        {
            sql = sqlBase + informacion.Etiqueta[k].EtiquetaId + "'";

            //etiqueta Filtro
            count = alasql(sql, [$scope.etiquetaF]);

            if(count[0].num === 0)
            {
                informacion.Etiqueta[k].mostrar = true;
                $scope.etiquetaF.push(informacion.Etiqueta[k]);
            }


            //etiqueta Dropdownlist
            count = alasql(sql, [$scope.etiqueta]);

            if(count[0].num === 0)
            {
               $scope.etiqueta.push(informacion.Etiqueta[k]);
            }

        }

        informacion.ContenidoOriginal = informacion.Contenido;
        var info = $scope.SetInformacion(informacion);

        if(info.Contenido !== null && info.Contenido !== undefined)
        {
            info.Contenido = info.Contenido.replace(/\r?\n/g, "<br>");
            info.Contenido = $sce.trustAsHtml(info.Contenido);
        }
        else
        {
            info.Contenido = $sce.trustAsHtml("");
        }

        if(info.Observacion !== null && info.Observacion !== undefined)
        {
            info.ObservacionHTML = info.Observacion.replace(/\r?\n/g, "<br>");
            info.ObservacionHTML = $sce.trustAsHtml(info.ObservacionHTML);
        }
        else
        {
            info.ObservacionHTML = $sce.trustAsHtml("");
        }

        if($scope.operacion == "Agregar")
        {
            $scope.informacion.push(info);
        }
        if($scope.operacion == "Editar")
        {
            for(var k=0; k<$scope.informacion.length; k++)
            {
                if($scope.informacion[k].InformacionId == informacion.InformacionId)
                {
                    $scope.informacion[k] = info;
                }
            }
        }
    };

    $scope.ValidarDatos = function(tituloInvalido, contenidoInvalido)
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

        if(tituloInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Debes indicar un titulo.";
        }

        if($scope.nuevaInformacion.Etiqueta.length === 0 && $scope.nuevaInformacion.Tema.length === 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona al menos una etiqueta o un tema.";
            $scope.claseInformacion.etiqueta = "dropdownListModalError";
        }
        else
        {
            $scope.claseInformacion.etiqueta = "dropdownListModal";
        }

        /*if($scope.nuevaInformacion.TipoInformacion.TipoInformacionId.length == 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona un tipo de información.";
            $scope.claseInformacion.tipo = "dropdownListModalError";
        }
        else
        {
            $scope.claseInformacion.tipo = "dropdownListModal";
        }*/

        if($scope.nuevaInformacion.OrigenInformacion.OrigenInformacionId.length === 0)
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
            /*case 4:
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

                break;*/
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


    // Recomendar información
    $scope.RecomendarInformacion = function (elemento) {

      $rootScope.$broadcast(
        'mostrar_modal_enviar_recurso',
        {
          titulo:'Recomendar la información "'+elemento.Titulo+'" a:',
          tipo:'informacion',
          operacion:'recomendacion',
          elemento_id: elemento.InformacionId,
          nombre_recurso: elemento.Titulo
        }
      );

    };


    //Inicializar Catalogos
    $scope.GetTema();
    $scope.GetTipoInformacion();
    $scope.GetFuente();
    $scope.GetOrigenInformacion();
    $scope.GetInformacion();
    $scope.GetEtiqueta();

});
