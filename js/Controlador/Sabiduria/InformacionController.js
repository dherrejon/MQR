app.controller("InformacionController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce, $timeout)
{
    $scope.titulo = "Informacion";

    $scope.permiso = false;

    $scope.informacion = [];

    $scope.buscarInformacion = "";
    $scope.buscarEtiqueta = "";
    $scope.buscarTema = "";
    $scope.buscarConcepto = "";



    $scope.campoBuscar = "Conceptos";
    $scope.verFiltro = true;
    $scope.filtro = {tema:[], etiqueta: [], origen: {texto:false, imagen:false, archivo:false}};

    $scope.evt_seleccionar_info = false;

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

        $rootScope.$broadcast('controlador_informacion_cargado',{});
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

    $scope.LimpiarBuscar = function()
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
        $scope.filtro = {tema:[], etiqueta: [], origen: {texto:false, imagen:false, archivo:false}};

        for(var k=0; k<$scope.etiquetaF.length; k++)
        {
            $scope.etiquetaF[k].mostrar = true;
        }

        for(var k=0; k<$scope.temaF.length; k++)
        {
            $scope.temaF[k].mostrar = true;
        }

        $scope.verFiltro = true;

        //$scope.buscarEtiqueta = "";
        //$scope.buscarTema = "";
        $scope.buscarConcepto = "";
    };

    $scope.CambiarVerFiltro = function()
    {
        $scope.verFiltro = !$scope.verFiltro;
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

    /*$('#bucarEtiqueta').keydown(function(e)
    {
        switch(e.which) {
            case 13:
               $scope.AgregarEtiquetaFiltro();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });*/


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

    /*$('#bucarTema').keydown(function(e)
    {
        switch(e.which) {
            case 13:
               $scope.AgregarTemaFiltro();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });*/


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
                    $scope.buscarConcepto = "";

                }
                $scope.$apply();
            }
        }
    };


    // Compartir información
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


    // if(!$rootScope.$$listenerCount['seleccionar_informacion_recomendada']){

      $rootScope.$on('seleccionar_informacion_recomendada', function (evento, datos) {

        if (!$scope.evt_seleccionar_info) {

          $scope.evt_seleccionar_info = true;

          var indice = -1;

          $scope.CambiarCampoBuscar('Contenido');

          $timeout(function () {

            for (var i = 0; i < $scope.informacion.length; i++) {

              if ($scope.informacion[i].InformacionId === datos.ElementoId) {
                $scope.buscarInformacion = $scope.informacion[i].Titulo;
                indice = i;
                break;
              }

            }

            $timeout(function () {

              if (-1!==indice) {
                $scope.verDetalle($scope.informacion[indice]);
              }

            }, 0);

          }, 0);

        }

      });

    // }


    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        $scope.ValidarPermiso();
        if($scope.permiso)
        {
            if($scope.usuarioLogeado.Aplicacion != "WikiMario")
            {
                $rootScope.IrPaginaPrincipal();
            }
            else
            {
                $scope.GetInformacion();
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
