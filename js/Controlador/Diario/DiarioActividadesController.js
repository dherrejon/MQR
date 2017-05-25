app.controller("DiarioController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce)
{   
    $scope.titulo = "Diario";
    
    $scope.permiso = false;
    
    $scope.ValidarPermiso = function()
    {
        for(var k=0; k<$scope.usuarioLogeado.Permiso.length; k++)
        {
            if($scope.usuarioLogeado.Permiso[k] == "DiarioCon")
            {
                $scope.permiso = true;
                break;
            }
        }
    };
    
    $scope.diario = [];
    $scope.fecha = [];
    $scope.etiquetaDiario = [];
    $scope.temaDiario = [];
    $scope.mensajeError = [];
    
    $scope.tema = [];
    $scope.etiqueta = [];
    
    $scope.buscarEtiqueta = "";
    $scope.buscarTema = "";
    
    $scope.etiquetaF = [];
    $scope.temaF = [];
    $scope.detalle = new Diario();
    
    $scope.buscarFecha = "";
    
    //filtro
    $scope.buscarTemaFiltro = "";
    $scope.buscarEtiquetaFiltro = "";
    $scope.verFiltro = true;
    
    $scope.filtro = {tema:[], etiqueta:[], frecuencia:[]};
    
    /*------------------ Catálogos -----------------------------*/
    $scope.GetDiario = function()              
    {
        GetDiario($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            var diario = []; 
            for(var k=0; k<data.length; k++)
            {
                diario[k] = SetDiario(data[k]);
                
                //Notas
                diario[k].NotasHTML = $sce.trustAsHtml(diario[k].NotasHTML);
            }
            
            $scope.diario = diario;
            
            $scope.GetEtiquetaPorDiario();
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetEtiquetaPorDiario = function()              
    {
        GetEtiquetaPorDiario($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.etiquetaDiario = data[1].Etiqueta;
            }
            else
            {
                $scope.etiquetaDiario = [];
            }
            
            $scope.GetTemaPorDiario();
        
        }).catch(function(error)
        {
            alert(data[0].Estatus);
        });
    };
    
    $scope.GetTemaPorDiario = function()              
    {
        GetTemaPorDiario($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.temaDiario = data[1].Tema;
                
            }
            else
            {
                $scope.temaDiario = [];
            }
            
            $scope.SetDiarioDatos();
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.SetDiarioDatos = function()
    {   
        var sql;
        var sqlBase;
        
        sql = "SELECT DISTINCT Fecha, FechaFormato FROM ?";
        var fecha = alasql(sql, [$scope.diario]);
        //eventos fecha 
        sqlBase = "SELECT DiarioId, Notas, Fecha, FechaFormato, NotasHTML FROM ? WHERE Fecha = '";
        
        for(var k=0; k<fecha.length; k++)
        {
            sql = sqlBase + fecha[k].Fecha + "'";
            fecha[k].Diario = alasql(sql, [$scope.diario]);
        }
    
        sqlBase = "SELECT * FROM ? WHERE DiarioId = '";
        
        for(var k=0; k<fecha.length; k++)
        {
            for(var i=0; i<fecha[k].Diario.length; i++)
            {
                
                sql =  sqlBase + fecha[k].Diario[i].DiarioId + "'";
                //tema
                fecha[k].Diario[i].Tema = alasql(sql, [$scope.temaDiario]);

                //etiqueta
                fecha[k].Diario[i].Etiqueta = alasql(sql, [$scope.etiquetaDiario]);
            }
        }
        
        $scope.fecha = fecha;
        
        $scope.SetDiarioFiltros();
    };
    
    $scope.SetDiarioFiltros = function()
    {
        var sql = "SELECT DISTINCT EtiquetaId, Nombre  FROM ? ";
        $scope.etiquetaF = alasql(sql, [$scope.etiquetaDiario]);
        
        sql = "SELECT DISTINCT TemaActividadId, Tema  FROM ? ";
        $scope.temaF = alasql(sql, [$scope.temaDiario]);
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
    $scope.VerDetalles = function(fecha)
    {
        $scope.detalle = fecha;
        
    };
    
    $scope.GetClaseDiario = function(fecha)
    {
        if(fecha == $scope.detalle.Fecha)
        {
            return "active";
        }
        else
        {
            return "";
        }
    };
    
    $scope.VerDetallesDiario = function(diario)
    {
        $scope.detalleDiario = diario;
        $('#detalleDiario').modal('toggle');
    };
    
    $scope.CambiarVerBarra = function()
    {
        $scope.detalle = new Diario();
    };
    
    //------------------------------- Filtrar -------------------------
    $scope.FiltrarDiario = function(diario)
    {        
        var cumple = false;
        
        if($scope.filtro.etiqueta.length > 0)
        {
            for(var i=0; i<$scope.filtro.etiqueta.length; i++)
            {
                cumple = false;
                for(var j=0; j<diario.Etiqueta.length; j++)
                {
                    if($scope.filtro.etiqueta[i] == diario.Etiqueta[j].EtiquetaId)
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
        
        cumple = false;
        
        if($scope.filtro.tema.length > 0)
        {
            for(var i=0; i<$scope.filtro.tema.length; i++)
            {
                if($scope.filtro.tema != "0")
                {
                    cumple = false;
                    for(var j=0; j<diario.Tema.length; j++)
                    {
                        if($scope.filtro.tema[i] == diario.Tema[j].TemaActividadId)
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
        else
        {
            cumple = true;
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
    
    $scope.BuscarTemaFiltro = function(tema)
    {
        return $scope.FiltrarBuscarTema(tema, $scope.buscarTemaFiltro);
    };
    
    $scope.BuscarEtiquetaFiltro = function(etiqueta)
    {
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarEtiquetaFiltro);
    };
    
    $scope.SetFiltroTema = function(tema)
    {
        var sql = "SELECT * FROM ? WHERE Filtro = true";
        
        $scope.temaFiltrado = alasql(sql, [$scope.temaF]);
        
        $scope.buscarTemaFiltro = "";
        
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
    
    $scope.SetFiltroEtiqueta = function(etiqueta)
    {
        var sql = "SELECT * FROM ? WHERE Filtro = true";
        
        $scope.EtiquetaFiltrada = alasql(sql, [$scope.etiquetaF]);
        
        $scope.buscarEtiquetaFiltro = "";
        
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
        $scope.filtro = {tema:[], etiqueta:[]};
        
        for(var k=0; k<$scope.etiquetaF.length; k++)
        {
            $scope.etiquetaF[k].Filtro = false;
        }
        
        for(var k=0; k<$scope.temaF.length; k++)
        {
            $scope.temaF[k].Filtro = false;
        }
        
        $scope.sinTemaFiltro = false;
        
        $scope.verFiltro = true;
        
        $scope.buscarEtiquetaFiltro = "";
        $scope.buscarTemaFiltro = "";
    };
    
    $scope.LimpiarBuscarFiltro = function()
    {
        $scope.buscarEtiquetaFiltro = "";
        $scope.buscarTemaFiltro = "";
    };
    
    //Presionar enter etiqueta
    $('#bucarEtiquetaFiltro').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                $scope.CheckFiltroEtiqueta();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.CheckFiltroEtiqueta = function()
    {
        for(var k=0; k<$scope.etiquetaF.length; k++)
        {
            if($scope.etiquetaF[k].Nombre.toLowerCase() == $scope.buscarEtiquetaFiltro.toLowerCase() && !$scope.etiquetaF[k].Filtro)
            {
                $scope.etiquetaF[k].Filtro = true;
                $scope.SetFiltroEtiqueta($scope.etiquetaF[k].EtiquetaId);
                $scope.buscarEtiquetaFiltro = "";
                break;
            }
        }
        
        $scope.$apply();
    };
    
    $('#buscarTemaFiltro').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                $scope.CheckFiltroTema();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.CheckFiltroTema = function()
    {
        for(var k=0; k<$scope.temaF.length; k++)
        {
            if($scope.temaF[k].Tema.toLowerCase() == $scope.buscarTemaFiltro.toLowerCase() && !$scope.temaF[k].Filtro)
            {
                $scope.temaF[k].Filtro = true;
                $scope.SetFiltroTema($scope.temaF[k].TemaActividadId);
                $scope.buscarTemaFiltro = "";
                break;
            }
        }
        
        $scope.$apply();
    };
    
    $scope.CambiarVerFiltro = function()
    {
        $scope.verFiltro = !$scope.verFiltro;
    };
    
    //------------ Abrir - Editar -----------------
    $scope.AbrirDiario = function(operacion, objeto, fecha)
    {
        $scope.operacion = operacion;
    
        document.getElementById("fechaDiaria");
        
        if(operacion == "Agregar")
        {
            $scope.nuevoDiario = new Diario();
            $scope.IniciarDiario(fecha);
            $scope.ActivarDesactivarTema([]);
            $scope.ActivarDesactivarEtiqueta([]);
        }
        else if(operacion == "Editar")
        {
            $scope.nuevoDiario = objeto;   
            $scope.FechaDefinida = false;
            $scope.ActivarDesactivarTema($scope.nuevoDiario.Tema);
            $scope.ActivarDesactivarEtiqueta($scope.nuevoDiario.Etiqueta);
        }
        
        $('#modalDiario').modal('toggle');
    };
    
    $scope.SetDiario = function(data)
    {
        var diario = new Diario();
        
        diario.DiarioId = data.DiarioId;
        diario.Notas = data.Notas;
        diario.Fecha = data.Fecha;
        diario.FechaFormato = data.FechaFormato;
        
        if(diario.Notas !== null && diario !==undefined)
        {
             diario.NotasHTML = data.Notas.replace(/\r?\n/g, "<br>");
             diario.NotasHTML = $sce.trustAsHtml(diario.NotasHTML);
        }
        else
        {
            diario.NotasHTML = "";
        }
        
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            diario.Etiqueta[k] = SetEtiqueta(data.Etiqueta[k]);
        }
        
        for(var k=0; k<data.Tema.length; k++)
        {
            diario.Tema[k] = SetTemaActividad(data.Tema[k]);
        }
        
        return diario;
    };
    
    $scope.IniciarDiario = function(fecha)
    {
        if(fecha !== null)
        {
            $scope.FechaDefinida = true;
            $scope.nuevoDiario.Fecha = fecha.Fecha;
            $scope.nuevoDiario.FechaFormato = fecha.FechaFormato;
        }
        else
        {
            $scope.FechaDefinida = false;
            $scope.nuevoDiario.Fecha = GetDate();
            $scope.nuevoDiario.FechaFormato = TransformarFecha($scope.nuevoDiario.Fecha);
        }

        document.getElementById("fechaDiario").value = $scope.nuevoDiario.Fecha;
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
    
    //----------- Cerrar
    $scope.CerrarDiario = function()
    {
        $('#cerrarDiario').modal('toggle');
    };
    
    $scope.ConfirmarCerrarDiario = function()
    {
        $('#modalDiario').modal('toggle');
        $scope.mensajeError = [];
        $scope.LimpiarInterfaz();
    };
    
    $scope.LimpiarInterfaz = function()
    {
        $scope.buscarEtiqueta = "";
        $scope.buscarTema = "";
    };
    
    
    //_-------- Buscar Fecha Buscar -------------------
    $('#fechaBuscar').bootstrapMaterialDatePicker(
    { 
        weekStart : 0, 
        time: false,
        format: "DD-MM-YYYY",
    });
    
    $scope.CambiarFechaBuscar = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            $scope.buscarFecha = TransformarFecha2(element.value);
        });
    };
    
    //--------- Fecha -------------------
    $('#fechaDiario').bootstrapMaterialDatePicker(
    { 
        weekStart : 0, 
        time: false,
        format: "YYYY-MM-DD",
    });
    
    $scope.CambiarFechaDiario = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            $scope.nuevoDiario.Fecha = element.value;
            $scope.nuevoDiario.FechaFormato = TransformarFecha(element.value);
        });
    };
    
    //etiqueta
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
        $scope.nuevoDiario.Etiqueta.push(etiqueta);
        
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
                
                $scope.nuevoDiario.Etiqueta.push(etiqueta);
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
                        $('#mensajeDiario').modal('toggle');
                        return false;
                    }
                }
            }

            for(var k=0; k<$scope.nuevoDiario.Etiqueta.length; k++)
            {
                if($scope.nuevoDiario.Etiqueta[k].Nombre.toLowerCase() == $scope.buscarEtiqueta.toLowerCase())
                {
                    $scope.mensajeError = [];
                    $scope.mensajeError[$scope.mensajeError.length] = "*Esta etiqueta ya fue agregada.";
                    $scope.buscarEtiqueta = "";
                    $('#mensajeDiario').modal('toggle');
                    return false;
                }
            }
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una etiqueta válida.";
            $scope.buscarEtiqueta = "";
            $('#mensajeDiario').modal('toggle');
            
            return false;
        }
        
        
        return true;
    };
    
    $scope.QuitarEtiqueta = function(etiqueta)
    {
        
        for(var k=0; k<$scope.nuevoDiario.Etiqueta.length; k++)
        {
            if(etiqueta == $scope.nuevoDiario.Etiqueta[k])
            {
                $scope.nuevoDiario.Etiqueta.splice(k,1);
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
            
            for(var k=0; k<$scope.nuevoDiario.Etiqueta.length; k++)
            {
                if($scope.nuevoDiario.Etiqueta[k].Nombre == etiqueta.Nombre)
                {
                    $scope.nuevoDiario.Etiqueta.splice(k,1);
                    break;
                }
            }
            
            $("#nuevaEtiqueta").focus();
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
    
    $scope.BuscarEtiqueta = function(etiqueta)
    {
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarEtiqueta);
    };
    
    
    //----Tema-----
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
        $scope.nuevoDiario.Tema.push(tema);
        
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
                
                $scope.nuevoDiario.Tema.push(tema);
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
                        $('#mensajeDiario').modal('toggle');
                        return false;
                    }
                }
            }

            for(var k=0; k<$scope.nuevoDiario.Tema.length; k++)
            {
                if($scope.nuevoDiario.Tema[k].Tema.toLowerCase() == $scope.buscarTema.toLowerCase())
                {
                    $scope.mensajeError = [];
                    $scope.mensajeError[$scope.mensajeError.length] = "*Este tema ya fue agregado.";
                    $scope.buscarTema = "";
                    $('#mensajeDiario').modal('toggle');
                    return false;
                }
            }
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un tema válido.";
            $scope.buscarTema = "";
            $('#mensajeDiario').modal('toggle');
            
            return false;
        }
        
        
        return true;
    };
    
    $scope.QuitarTema = function(tema)
    {
        
        for(var k=0; k<$scope.nuevoDiario.Tema.length; k++)
        {
            if(tema == $scope.nuevoDiario.Tema[k])
            {
                $scope.nuevoDiario.Tema.splice(k,1);
                break;
            }
        }
        
        if(tema != "-1")
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
            
            for(var k=0; k<$scope.nuevoDiario.Tema.length; k++)
            {
                if($scope.nuevoDiario.Tema[k].Tema == tema.Tema)
                {
                    $scope.nuevoDiario.Tema.splice(k,1);
                    break;
                }
            }
            
            $("#nuevoTema").focus();
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
    
    $scope.BuscarTema = function(tema)
    {
        return $scope.FiltrarBuscarTema(tema, $scope.buscarTema);
    };
    
    
    //------------ terminar ---------
    $scope.TerminarDiario = function()
    {
        if(!$scope.ValidarDatos())
        {
            $('#mensajeDiario').modal('toggle');
            return;
        }
        else
        {
            $scope.nuevoDiario.UsuarioId = $scope.usuarioLogeado.UsuarioId;
            if($scope.operacion == "Agregar")
            {
                $scope.AgregarDiario();
            }
            if($scope.operacion == "Editar")
            {
                $scope.EditarDiario();
            }
        }
    };
    
    $scope.AgregarDiario = function()    
    {
        AgregarDiario($http, CONFIG, $q, $scope.nuevoDiario).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                
                $scope.mensaje = "Diario agregado.";
                $scope.EnviarAlerta('Vista');
                
                $scope.nuevoDiario.DiarioId = data[1].DiarioId;
                $scope.nuevoDiario.Etiqueta = data[2].Etiqueta;
                $scope.nuevoDiario.Tema = data[3].Tema;
                
                $scope.SetNuevoDiario($scope.nuevoDiario);
                
                
                $scope.nuevoDiario = new Diario();
                $('#modalDiario').modal('toggle');
                $scope.LimpiarInterfaz();
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeDiario').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeDiario').modal('toggle');
        });
    };
    
    $scope.EditarDiario = function()    
    {
        EditarDiario($http, CONFIG, $q, $scope.nuevoDiario).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.nuevoDiario.Etiqueta = data[1].Etiqueta;
                $scope.nuevoDiario.Tema = data[2].Tema;
                
                $scope.mensaje = "Diario editado.";
                $scope.SetNuevoDiario($scope.nuevoDiario);
                $scope.LimpiarInterfaz();
                $scope.EnviarAlerta('Vista');
                
                $('#modalDiario').modal('toggle');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeDiario').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeDiario').modal('toggle');
        });
    };
    
    $scope.SetNuevoDiario = function(diario)
    {
        var ndiario = $scope.SetDiario(diario);
        
        //tema
        var sqlBase = "SELECT COUNT(*) as num FROM ? WHERE TemaActividadId= '";
        for(var k=0; k<diario.Tema.length; k++)
        {
            sql = sqlBase + diario.Tema[k].TemaActividadId + "'";
            
            //tema Filtro
            count = alasql(sql, [$scope.temaF]);
            
            if(count[0].num === 0)
            {
               $scope.temaF.push(diario.Tema[k]);
            }
            
            //tema Dropdownlist
            count = alasql(sql, [$scope.tema]);
            
            if(count[0].num === 0)
            {
               $scope.tema.push(diario.Tema[k]);
            }
        }
        
        //etiqueta
        sqlBase = "SELECT COUNT(*) as num FROM ? WHERE EtiquetaId= '";
        for(var k=0; k<diario.Etiqueta.length; k++)
        {
            sql = sqlBase + diario.Etiqueta[k].EtiquetaId + "'";
            
            //etiqueta Filtro
            count = alasql(sql, [$scope.etiquetaF]);
            
            if(count[0].num === 0)
            {
               $scope.etiquetaF.push(diario.Etiqueta[k]);
            }
            
            //etiqueta Dropdownlist
            count = alasql(sql, [$scope.etiqueta]);
            
            if(count[0].num === 0)
            {
               $scope.etiqueta.push(diario.Etiqueta[k]);
            }
        
        }
        
        //agregar y editar
        if($scope.operacion == "Agregar")
        {
            var agregado = false;
            for(var k=0; k<$scope.fecha.length; k++)
            {
                if($scope.fecha[k].Fecha == diario.Fecha)
                {
                    agregado = true;
                    $scope.fecha[k].Diario.push(ndiario);
                    $scope.VerDetalles($scope.fecha[k]);
                    break;
                }
            }
            
            if(!agregado)
            {
                var fecha = new Object();
                fecha.Fecha = diario.Fecha;
                fecha.FechaFormato = diario.FechaFormato;
                fecha.Diario = [];
                fecha.Diario[0] = ndiario;
                $scope.fecha.push(fecha);
                $scope.VerDetalles($scope.fecha[$scope.fecha.length-1]);
            }
        }
        else if($scope.operacion == "Editar")
        {   
            var agregado = false;
            
            // eliminar fecha 
            for(var k=0; k<$scope.fecha.length; k++)
            {
                for(var i=0; i<$scope.fecha[k].Diario.length; i++)
                {
                    if($scope.fecha[k].Diario[i].DiarioId == diario.DiarioId)
                    {
                        if($scope.fecha[k].Fecha != diario.Fecha)
                        {
                            if($scope.fecha[k].Diario.length > 1)
                            {
                                $scope.fecha[k].Diario.splice(i,1);
                            }
                            else
                            {
                                $scope.fecha.splice(k,1);
                            }
                            break;
                        }
                        else
                        {
                            agregado = true;
                            $scope.fecha[k].Diario[i] = $scope.SetDiario(ndiario);
                        }
                    }
                }
            }
            
            if(!agregado)
            {
                for(var k=0; k<$scope.fecha.length; k++)
                {
                    if($scope.fecha[k].Fecha == diario.Fecha)
                    {
                        agregado = true;
                        $scope.fecha[k].Diario.push(ndiario);
                        $scope.VerDetalles($scope.fecha[k]);
                        break;
                    }
                }
            }
            
            if(!agregado)
            {
                var fecha = new Object();
                fecha.Fecha = diario.Fecha;
                fecha.FechaFormato = diario.FechaFormato;
                fecha.Diario = [];
                fecha.Diario[0] = ndiario;
                $scope.fecha.push(fecha);
                $scope.VerDetalles($scope.fecha[$scope.fecha.length-1]);
            }
        }
    };
    
    $scope.ValidarDatos = function()
    {
        $scope.mensajeError = [];
        
        if($scope.nuevoDiario.Fecha.length === 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona una fecha.";
        }
        
        if($scope.nuevoDiario.Notas !== undefined && $scope.nuevoDiario.Notas !== null)
        {
            if($scope.nuevoDiario.Notas.length === 0)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una nota del diario.";
            }
        }
        else
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una nota del diario.";
        }
        
        if($scope.nuevoDiario.Etiqueta.length === 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona al menos una etiqueta.";
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
    

    //----------------Limpiar------------------
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarFecha = "";
                document.getElementById("fechaBuscar").value = "";
                break;
            case 2:
                $scope.buscarEtiqueta = "";
                break;
            case 3:
                $scope.buscarTema = "";
                break;
            case 4:
                $scope.buscarEtiquetaFiltro = "";
                break;
            case 5:
                $scope.buscarTemaFiltro = "";
                break;
            default: 
                break;
        }
    };
    
    //-------------- Borrar Diario -----------------
    $scope.BorrarDiario= function(diario)
    {
        $scope.borrarDiario = diario;

        $scope.mensajeBorrar = "¿Estas seguro de eliminar el diario?";

        $("#borrarDiario").modal('toggle');
        
    };
    
    $scope.ConfirmarBorrarDiario = function()
    {
        BorrarDiario($http, CONFIG, $q, $scope.borrarDiario.DiarioId).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {                
                for(var k=0; k<$scope.fecha.length; k++)
                {
                    for(var i=0; i<$scope.fecha[k].Diario.length; i++)
                    {
                        if($scope.fecha[k].Diario[i].DiarioId == $scope.borrarDiario.DiarioId)
                        {
                            if($scope.fecha[k].Diario.length > 1)
                            {
                                $scope.fecha[k].Diario.splice(i,1);
                            }
                            else
                            {
                                $scope.fecha.splice(k,1);
                                $scope.detalle = new Diario();
                            }
                            
                            break;
                        }
                    }
                }
                
                $scope.mensaje = "Diario borrado.";
                $scope.EnviarAlerta('Vista');
                
                $scope.QuitarFiltros();
                
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
    
    $scope.QuitarFiltros = function()
     {
         var quitar = true;

                 
        for(var k=0; k<$scope.borrarDiario.Etiqueta.length; k++)
        {
            quitar = true;
            
            for(var i=0; i<$scope.fecha.length; i++)
            {
                for(var j=0; j<$scope.fecha[i].Diario.length; j++)
                {
                    for(var m=0; m<$scope.fecha[i].Diario[j].Etiqueta.length; m++)
                    {
                        if($scope.borrarDiario.Etiqueta[k].EtiquetaId == $scope.fecha[i].Diario[j].Etiqueta[m].EtiquetaId)
                        {
                            quitar = false;
                            break;
                        }
                    }
                    if(!quitar)
                    {
                        break;
                    }
                }
            }
            
            if(quitar)
            {
                for(var i=0; i<$scope.etiquetaF.length; i++)
                {
                    if($scope.etiquetaF[i].EtiquetaId == $scope.borrarDiario.Etiqueta[k].EtiquetaId)
                    {
                        $scope.etiquetaF.splice(i,1);
                        break;
                    }
                }
            }
        }
        
        for(var k=0; k<$scope.borrarDiario.Tema.length; k++)
        {
            quitar = true;
            
            for(var i=0; i<$scope.fecha.length; i++)
            {
                for(var j=0; j<$scope.fecha[i].Diario.length; j++)
                {
                    for(var m=0; m<$scope.fecha[i].Diario[j].Tema.length; m++)
                    {
                        if($scope.borrarDiario.Tema[k].TemaActividadId == $scope.fecha[i].Diario[j].Tema[m].TemaActividadId)
                        {
                            quitar = false;
                            break;
                        }
                    }
                    if(!quitar)
                    {
                        break;
                    }
                }
            }
            
            if(quitar)
            {
                for(var i=0; i<$scope.temaF.length; i++)
                {
                    if($scope.temaF[i].TemaActividadId == $scope.borrarDiario.Tema[k].TemaActividadId)
                    {
                        $scope.temaF.splice(i,1);
                        break;
                    }
                }
            }
        }
    };
    
    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        $scope.ValidarPermiso();
        if($scope.permiso)
        {
            if($scope.usuarioLogeado.Aplicacion != "Diario")
            {
                $rootScope.IrPaginaPrincipal();
            }
            else
            {
                $rootScope.UsuarioId = $scope.usuarioLogeado.UsuarioId;
                $scope.GetDiario();
                $scope.GetTemaActividad();
                $scope.GetEtiqueta();
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
    
    //------------------- Alertas ---------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoDiario").alert();

            $("#alertaExitosoDiario").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoDiario").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoDiario").alert();

            $("#alertaEditarExitosoDiario").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoDiario").fadeOut();
            }, 2000);
        }
    };
    
});
