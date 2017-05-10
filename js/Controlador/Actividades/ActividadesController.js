app.controller("ActividadesController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce, FRECUENCIA)
{   
    $scope.titulo = "Actividades";
    
    $scope.permiso = false;
    
    $scope.ValidarPermiso = function()
    {
        for(var k=0; k<$scope.usuarioLogeado.Permiso.length; k++)
        {
            if($scope.usuarioLogeado.Permiso[k] == "ActividadesCon")
            {
                $scope.permiso = true;
                break;
            }
        }
    };
    
    $scope.actividad = [];
    $scope.etiquetaActividad = [];
    $scope.temaActividad = [];
    $scope.mensajeError = [];
    
    $scope.tema = [];
    $scope.frecuencia = [];
    $scope.tema = [];
    
    $scope.buscarActividad = "";
    $scope.detalle = new Actividad();
    $scope.verDetalle = false;
    $scope.nuevaActividad = new Actividad();
    
    $scope.buscarTema = "";
    $scope.buscarEtiqueta = "";
    
    //filtro
    $scope.buscarTemaFiltro = "";
    $scope.buscarEtiquetaFiltro = "";
    $scope.buscarFrecuenciaFiltro = "";
    
    $scope.mostrarFiltro = "etiqueta";
    $scope.filtro = {tema:[], etiqueta:[], frecuencia:[]};

    
    /*------------------ Catálogos -----------------------------*/
    $scope.GetActividad = function()              
    {
        GetActividad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.actividad = data;
            $scope.GetEtiquetaPorActividad();
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetEtiquetaPorActividad = function()              
    {
        GetEtiquetaPorActividad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.etiquetaActividad = data[1].Etiqueta;
            }
            else
            {
                alert(data[0].Estatus);
            }
            
            $scope.GetTemaPorActividad();
        
        }).catch(function(error)
        {
            alert(data[0].Estatus);
        });
    };
    
    $scope.GetTemaPorActividad = function()              
    {
        GetTemaPorActividad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.temaActividad = data[1].Tema;
                $scope.SetActividaDatos();
            }
            else
            {
                alert(data[0].Estatus);
            }
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.SetActividaDatos = function()
    {
        var sqlBaseTema = "SELECT * FROM ? WHERE ActividadId = '";
        var sqlBaseEtiqueta = "SELECT * FROM ? WHERE ActividadId = '";
        var sql;
        
        for(var k=0; k<$scope.actividad.length; k++)
        {
            //tema
            sql = sqlBaseTema;
            sql += ($scope.actividad[k].ActividadId + "'");
            $scope.actividad[k].Tema = alasql(sql, [$scope.temaActividad]);
            
            //etiqueta
            sql = sqlBaseEtiqueta;
            sql += ($scope.actividad[k].ActividadId + "'");
            $scope.actividad[k].Etiqueta = alasql(sql, [$scope.etiquetaActividad]);
            
            //Notas
            $scope.actividad[k].NotasHTML = $sce.trustAsHtml($scope.actividad[k].NotasHTML);
        }
    };
    
    
    /*------- Otros catálogos ---------------*/
    $scope.GetTemaActividad = function()              
    {
        GetTemaActividad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.tema = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetFrecuencia = function()              
    {
        GetFrecuencia($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.frecuencia = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
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
    
    //----------- Detalles -------------------
    $scope.VerDetalles = function(actividad)
    {
        $scope.detalle = actividad;
        $scope.verDetalle = false;
        
        if($rootScope.anchoPantalla <= 767)
        {
            $scope.buscarActividad = "";
        }
    };
    
    $scope.GetClaseActividad = function(id)
    {
        if(id == $scope.detalle.ActividadId)
        {
            return "active";
        }
        else
        {
            return "";
        }
    };
    
    $scope.CambiarVerDetalle = function()
    {
        $scope.verDetalle = !$scope.verDetalle;
    };
    
    $scope.CambiarVerBarra = function()
    {
        $scope.detalle = new Actividad();
    };
    
    //------------------------------- Filtrar -------------------------
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
    
    $scope.FitroActividad = function(info)
    {        
        var cumple = false;
        
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
        
        cumple = false;
        
        if($scope.filtro.tema.length > 0)
        {
            for(var i=0; i<$scope.filtro.tema.length; i++)
            {
                if($scope.filtro.tema != "0")
                {
                    cumple = false;
                    for(var j=0; j<info.Tema.length; j++)
                    {
                        if($scope.filtro.tema[i] == info.Tema[j].TemaActividadId)
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
                else
                {
                    if(info.Tema.length > 0)
                    {
                        return false;
                    }
                }
                
            }
        }
        
        cumple = false;
        
        if($scope.filtro.frecuencia.length === 0)
        {
            cumple = true;
        }
        else
        {
            for(var k=0; k<$scope.filtro.frecuencia.length; k++)
            {
                
                if(info.Frecuencia.FrecuenciaId == $scope.filtro.frecuencia[k])
                {
                    cumple = true;
                    break;
                }
            }
        }
        
        if(cumple)
        {
            return true;
        }
        else
        {
            return false;
        }
        
    };

    $scope.BuscarActividad = function(actividad)
    {
        if($scope.buscarActividad.length > 0)
        {
            var index = actividad.Nombre.toLowerCase().indexOf($scope.buscarActividad.toLowerCase());
            
            
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
                    if(actividad.Nombre[index-1] == " ")
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
    
    $scope.FiltrarBuscarTema = function(tema, buscar)
    {
        if(buscar !== undefined)
        {
            if(buscar.length > 0)
            {
                var index = tema.Tema.toLowerCase().indexOf(buscar.toLowerCase());


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
                        if(tema.Tema[index-1] == " ")
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
    
    $scope.FiltrarBuscarFrecuencia = function(frecuencia, buscar)
    {
        if(buscar !== undefined)
        {
            if(buscar.length > 0)
            {
                var index = frecuencia.Nombre.toLowerCase().indexOf(buscar.toLowerCase());


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
                        if(frecuencia.Nombre[index-1] == " ")
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
    
    $scope.BuscarTema = function(tema)
    {
        return $scope.FiltrarBuscarTema(tema, $scope.buscarTema);
    };
    
    $scope.BuscarTemaFiltro = function(tema)
    {
        return $scope.FiltrarBuscarTema(tema, $scope.buscarTemaFiltro);
    };
    
    $scope.BuscarEtiqueta = function(etiqueta)
    {
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarEtiqueta);
    };
    
    $scope.BuscarEtiquetaFiltro = function(etiqueta)
    {
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarEtiquetaFiltro);
    };
    
    $scope.BuscarFrecuenciaFiltro = function(frecuencia)
    {
        return $scope.FiltrarBuscarFrecuencia(frecuencia, $scope.buscarFrecuenciaFiltro);
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
    
    $scope.SetFiltroFrecuencia = function(frecuencia)
    {
        for(var k=0; k<$scope.filtro.frecuencia.length; k++)
        {
            if(frecuencia == $scope.filtro.frecuencia[k])
            {
                $scope.filtro.frecuencia.splice(k,1);
                return;
            }
        }
        
        $scope.filtro.frecuencia.push(frecuencia);
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
    
    
    
    $scope.LimpiarFiltro = function()
    {
        $scope.filtro = {tema:[], etiqueta:[], frecuencia:[]};
        
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            $scope.etiqueta[k].Filtro = false;
        }
        
        for(var k=0; k<$scope.tema.length; k++)
        {
            $scope.tema[k].Filtro = false;
        }
        
        for(var k=0; k<$scope.frecuencia.length; k++)
        {
            $scope.frecuencia[k].Filtro = false;
        }
        
        $scope.buscarEtiquetaFiltro = "";
        $scope.buscarTemaFiltro = "";
        $scope.buscarFrecuenciaFiltro = "";
    };
    
    
    /*-----------------Abrir Panel Agregar-Editar termino-------------------*/
    $scope.AbrirActividad = function(operacion, actividad)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevaActividad = new Actividad();
            $scope.ActivarDesactivarTema([]);
            $scope.ActivarDesactivarEtiqueta([]);
        }
        else if(operacion == "Editar")
        {
            $scope.nuevaActividad = $scope.SetActvidad(actividad);
            $scope.ActivarDesactivarTema(actividad.Tema);
            $scope.ActivarDesactivarEtiqueta(actividad.Etiqueta);
        }
    
        $('#modalFiltro').modal('toggle');
    };
    
    $scope.ActivarDesactivarTema = function(tema)
    {
        for(var i=0; i<$scope.tema.length; i++)
        {
            $scope.tema[i].show = true;
            for(var j=0; j<tema.length; j++)
            {
                if($scope.tema[i].TemaActividadId == tema[j].TemaActividadId)
                {
                    $scope.tema[i].show = false;
                    break;
                }
            }
        }
    };
    
    $scope.ActivarDesactivarEtiqueta = function(etiqueta)
    {
        for(var i=0; i<$scope.etiqueta.length; i++)
        {
            $scope.etiqueta[i].show = true;
            for(var j=0; j<etiqueta.length; j++)
            {
                if($scope.etiqueta[i].EtiquetaId == etiqueta[j].EtiquetaId)
                {
                    $scope.etiqueta[i].show = false;
                    break;
                }
            }
        }
    };
    
    $scope.SetActvidad = function(data)
    {
        var actividad = new Actividad();
        
        actividad.ActividadId = data.ActividadId;
        actividad.Nombre = data.Nombre;
        actividad.FechaCreacion = data.FechaCreacion;
        actividad.Notas = data.Notas;
        
        if(data.Notas !== null && data.Notas !== undefined)
        {
            actividad.NotasHTML = data.Notas.replace(/\r?\n/g, "<br>");
            actividad.NotasHTML = $sce.trustAsHtml(actividad.NotasHTML);
        }
        else
        {
            actividad.NotasHTML = "";
        }
        
        
        actividad.Frecuencia.FrecuenciaId = data.Frecuencia.FrecuenciaId;
        actividad.Frecuencia.Nombre = data.Frecuencia.Nombre;
        
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            actividad.Etiqueta[k] = new Etiqueta();
            
            actividad.Etiqueta[k].EtiquetaId = data.Etiqueta[k].EtiquetaId;
            actividad.Etiqueta[k].Nombre = data.Etiqueta[k].Nombre;
        }
        
        for(var k=0; k<data.Tema.length; k++)
        {
            actividad.Tema[k] = new TemaActividad();
            
            actividad.Tema[k].TemaActividadId = data.Tema[k].TemaActividadId;
            actividad.Tema[k].Tema = data.Tema[k].Tema;
        }
        
        return actividad;
    };
     
    $scope.CerrarActividad = function()
    {
        $('#cerrarActividad').modal('toggle');
    };
    
    $scope.ConfirmarCerrarActividad = function()
    {
        $('#modalActividad').modal('toggle');
        $scope.mensajeError = [];
        $scope.LimpiarInterfaz();
    };
    
    $scope.LimpiarInterfaz = function()
    {
        $scope.buscarEtiqueta = "";
        $scope.buscarTema = "";
    };
    
    //---------- Operaciones Actividad ------------------------------
    
    //Tema
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
        $scope.nuevaActividad.Tema.push(tema);
        
        tema.show = false;
        $scope.buscarTema = "";
    };
    
    $scope.AgregarNuevoTema = function()
    {
        if($scope.buscarTema.length > 0)
        {
            if(!$scope.ValidarTemaAgregado())
            {
                $scope.$apply();
                return;    
            }
            else
            {
                var tema = new TemaActividad();
                tema.Tema = $scope.buscarTema;
                tema.TemaActividadId = "-1";
                $scope.buscarTema = "";
                
                $scope.nuevaActividad.Tema.push(tema);
                $scope.$apply();
            }
        }
    };
    
    $scope.ValidarTemaAgregado = function()
    {
        if($rootScope.erTema.test($scope.buscarTema))
        {
            for(var k=0; k<$scope.tema.length; k++)
            {
                if($scope.tema[k].Tema.toLowerCase() == $scope.buscarTema.toLowerCase())
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
                        $scope.buscarTema = "";
                        $('#mensajeActividad').modal('toggle');
                        return false;
                    }
                }
            }

            for(var k=0; k<$scope.nuevaActividad.Tema.length; k++)
            {
                if($scope.nuevaActividad.Tema[k].Tema.toLowerCase() == $scope.buscarTema.toLowerCase())
                {
                    $scope.mensajeError = [];
                    $scope.mensajeError[$scope.mensajeError.length] = "*Este tema ya fue agregado.";
                    $scope.buscarTema = "";
                    $('#mensajeActividad').modal('toggle');
                    return false;
                }
            }
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un tema válido.";
            $scope.buscarTema = "";
            $('#mensajeActividad').modal('toggle');
            
            return false;
        }
        
        
        return true;
    };
    
    $scope.QuitarTema = function(tema)
    {
        
        for(var k=0; k<$scope.nuevaActividad.Tema.length; k++)
        {
            if(tema == $scope.nuevaActividad.Tema[k])
            {
                $scope.nuevaActividad.Tema.splice(k,1);
                break;
            }
        }
        
        if(tema.TemaActividadId != "-1")
        {
            for(var k=0; k<$scope.tema.length; k++)
            {
                if($scope.tema[k].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.tema[k].show = true;
                    return;
                }
            }
        }
    };
    
    
    $scope.EditarTema = function(tema)
    {
        if(tema.TemaActividadId == "-1")
        {
            $scope.buscarTema = tema.Tema;
            
            for(var k=0; k<$scope.nuevaActividad.Tema.length; k++)
            {
                if($scope.nuevaActividad.Tema[k].Tema == tema.Tema)
                {
                    $scope.nuevaActividad.Tema.splice(k,1);
                    break;
                }
            }
            
            $("#nuevoTema").focus();
        }
    };
    
    //Etiqueta
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
        $scope.nuevaActividad.Etiqueta.push(etiqueta);
        
        etiqueta.show = false;
        $scope.buscarEtiqueta = "";
    };
    
    $scope.AgregarNuevaEtiqueta = function()
    {
        if($scope.buscarEtiqueta.length > 0)
        {
            if(!$scope.ValidarEtiquetaAgregado())
            {
                $scope.$apply();
                return;    
            }
            else
            {
                var etiqueta = new Etiqueta();
                etiqueta.Nombre = $scope.buscarEtiqueta;
                etiqueta.EtiquetaId = "-1";
                $scope.buscarEtiqueta = "";
                
                $scope.nuevaActividad.Etiqueta.push(etiqueta);
                $scope.$apply();
            }
        }
    };
    
    $scope.ValidarEtiquetaAgregado = function()
    {
        if($rootScope.erEtiqueta.test($scope.buscarEtiqueta))
        {
            for(var k=0; k<$scope.etiqueta.length; k++)
            {
                if($scope.etiqueta[k].Nombre.toLowerCase() == $scope.buscarEtiqueta.toLowerCase())
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
                        $scope.buscarEtiqueta = "";
                        $('#mensajeActividad').modal('toggle');
                        return false;
                    }
                }
            }

            for(var k=0; k<$scope.nuevaActividad.Etiqueta.length; k++)
            {
                if($scope.nuevaActividad.Etiqueta[k].Nombre.toLowerCase() == $scope.buscarEtiqueta.toLowerCase())
                {
                    $scope.mensajeError = [];
                    $scope.mensajeError[$scope.mensajeError.length] = "*Esta etiqueta ya fue agregada.";
                    $scope.buscarEtiqueta = "";
                    $('#mensajeActividad').modal('toggle');
                    return false;
                }
            }
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una etiqueta válida.";
            $scope.buscarTema = "";
            $('#mensajeActividad').modal('toggle');
            
            return false;
        }
        
        
        return true;
    };
    
    $scope.QuitarEtiqueta = function(etiqueta)
    {
        
        for(var k=0; k<$scope.nuevaActividad.Etiqueta.length; k++)
        {
            if(etiqueta == $scope.nuevaActividad.Etiqueta[k])
            {
                $scope.nuevaActividad.Etiqueta.splice(k,1);
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
            $scope.buscarEtiqueta = etiqueta.Nombre;
            
            for(var k=0; k<$scope.nuevaActividad.Etiqueta.length; k++)
            {
                if($scope.nuevaActividad.Etiqueta[k].Nombre == etiqueta.Nombre)
                {
                    $scope.nuevaActividad.Etiqueta.splice(k,1);
                    break;
                }
            }
            
            $("#nuevaEtiqueta").focus();
        }
    };
    
    
    //Frecuencia
    $scope.CambiarFrecuencia = function(frecuencia)
    {
        $scope.nuevaActividad.Frecuencia = frecuencia;
    };
    
    //-------------------- Terminar Actividad -------------------
    $scope.TerminarActividad = function(actividadInvalida)
    {
        if(!$scope.ValidarActividad(actividadInvalida))
        {
            $('#mensajeActividad').modal('toggle');
            return;
        }
        else
        {
            $scope.nuevaActividad.UsuarioId = $rootScope.UsuarioId;
            if($scope.operacion == "Agregar")
            {
                var d = new Date();
                $scope.nuevaActividad.FechaCreacion = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();
                
                
                $scope.AgregarActividad();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarActividad();
            }
        }
    };
    
    $scope.AgregarActividad = function()    
    {
        AgregarActividad($http, CONFIG, $q, $scope.nuevaActividad).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                
                $scope.mensaje = "Actividad agregada.";
                $scope.EnviarAlerta('Vista');
                
                $scope.nuevaActividad.ActividadId = data[1].ActividadId;
                $scope.nuevaActividad.FechaCreacion = data[2].FechaCreacion;
                
                $scope.SetNuevaActividad($scope.nuevaActividad);
                
                //$scope.actividad.push($scope.nuevaActividad);
                //$scope.VerDetalles($scope.actividad[$scope.actividad.length-1]);
                
                
                $scope.nuevaActividad = new Actividad();
                $('#modalActividad').modal('toggle');
                $scope.LimpiarInterfaz();
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeActividad').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeActividad').modal('toggle');
        });
    };
    
    $scope.EditarActividad = function()    
    {
        EditarActividad($http, CONFIG, $q, $scope.nuevaActividad).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.mensaje = "Actividad editada.";
                $scope.SetNuevaActividad($scope.nuevaActividad);
                $scope.LimpiarInterfaz();
                $scope.EnviarAlerta('Vista');
                
                $('#modalActividad').modal('toggle');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeActividad').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeActividad').modal('toggle');
        });
    };
    
    $scope.SetNuevaActividad = function(actividad)
    {
        if($scope.operacion == "Agregar")
        {
            var index = $scope.actividad.length;
            $scope.actividad[index] = $scope.SetActvidad(actividad);
            $scope.VerDetalles($scope.actividad[index]);
        }
        else if($scope.operacion == "Editar")
        {
            for(var k=0; k<$scope.actividad.length; k++)
            {
                if($scope.actividad[k].ActividadId == actividad.ActividadId)
                {
                    $scope.actividad[k] = $scope.SetActvidad(actividad);
                    $scope.VerDetalles($scope.actividad[k]);
                    break;
                }
            }
        }
    };
    
    $scope.ValidarActividad = function(actividadInvalida)
    {
        $scope.mensajeError = [];
        
        if(actividadInvalida)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una actividad válida.";
        }
        
        if($scope.nuevaActividad.Etiqueta.length === 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona al menos una etiqueta.";
        }
        
        if($scope.nuevaActividad.Frecuencia.FrecuenciaId.length === 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona una frecuencia.";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;
        }
        
        for(var k=0; k<$scope.actividad.length; k++)
        {
            if($scope.actividad[k].Nombre.toLowerCase() == $scope.nuevaActividad.Nombre.toLowerCase()  && $scope.actividad[k].ActividadId != $scope.nuevaActividad.ActividadId)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*La actividad  \"" + $scope.nuevaActividad.Nombre + "\" ya existe.";
                $scope.nuevaActividad.Nombre = "";
                return false;
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
    
    //------------------------  Borrar --------------------------------------
    $scope.BorrarActividad = function(actividad)
    {
        $scope.borrarActividad = actividad.ActividadId;
        
        $scope.mensajeBorrar = "¿Estas seguro de eliminar " + actividad.Nombre + "?";
        
        $("#borrarActividad").modal('toggle');
    };
    
    $scope.ConfirmarBorrarActividad = function()
    {
        BorrarActividad($http, CONFIG, $q, $scope.borrarActividad).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {                
                for(var k=0; k<$scope.actividad.length; k++)
                {
                    if($scope.actividad[k].ActividadId == $scope.borrarActividad)
                    {
                        $scope.actividad.splice(k,1);
                        break;
                    }
                }
                
                $scope.detalle = new Actividad();
                $scope.verDetalle = false;
                
                $scope.mensaje = "Actividad borrada.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeActividad').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeActividad').modal('toggle');
        });
    };
    
    //----------------Limpiar------------------
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarActividad = "";
                $("#buscarActividad").focus();
                break;
            case 2:
                $scope.nuevaActividad.Nombre = "";
                break;
            case 3:
                $scope.buscarTema = "";
                break;
            case 4:
                $scope.buscarEtiqueta = "";
                break;
            case 5:
                $scope.buscarEtiquetaFiltro = "";
                break;
            case 6:
                $scope.buscarTemaFiltro = "";
                break;
            case 7:
                $scope.buscarFrecuenciaFiltro = "";
                break;
            default: 
                break;
        }
    };
    
    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        $scope.ValidarPermiso();
        if($scope.permiso)
        {
            if($scope.usuarioLogeado.Aplicacion != "Actividades")
            {
                $rootScope.IrPaginaPrincipal();
            }
            else
            {
                $rootScope.UsuarioId = $scope.usuarioLogeado.UsuarioId;
                $scope.GetActividad();
                $scope.GetTemaActividad();
                $scope.GetEtiqueta();
                $scope.GetFrecuencia();
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
    
    //-------- Agregar Nueva Frecuencia----------
    $scope.AbrirAgregarFrecuencia = function()
    {
        FRECUENCIA.AgregarFrecuencia();
    };
    
    $scope.$on('TerminarFrecuencia',function()
    {   
        $scope.mensaje = "Frecuencia Agregada";
        $scope.EnviarAlerta('Modal');
        
        $scope.CambiarFrecuencia(FRECUENCIA.GetFrecuencia());
        $scope.frecuencia.push(FRECUENCIA.GetFrecuencia());
    });
    
    //------------------- Alertas ---------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoActividad").alert();

            $("#alertaExitosoActividad").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoActividad").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoActividad").alert();

            $("#alertaEditarExitosoActividad").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoActividad").fadeOut();
            }, 2000)
        }
    };
    
});
