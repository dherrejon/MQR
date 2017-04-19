app.controller("FuenteController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, FUENTE, ETIQUETA, TIPOFUENTE, AUTOR)
{   
    $scope.fuente = [];
    $scope.autor = [];
    $scope.tipoFuente = [];
    $scope.etiqueta = [];
    
    $scope.ordenarFuente = "Nombre";
    $scope.buscarFuente = "";
    $scope.buscarEtiqueta = "";
    $scope.buscarTipoFuente = "";
    
    $scope.buscarAutorOperacion = "";
    $scope.buscarEtiquetaOperacion = "";
    
    $scope.nuevaFuente = null;
    $scope.detalleFuente = null;
    
    $scope.mensajeError = [];
    $scope.claseFuente = {tipoFuente:"dropdownListModal", nombre:"entrada", autor:"dropdownListModal", etiqueta:"dropdownListModal"};
    
    $scope.mostrarFiltro = "autor";
    $scope.filtro = {autor:[], tipoFuente:[], etiqueta:[]};
    
    $scope.detalle = "";
    
    $scope.GetFuente = function()              
    {
        GetFuente($http, $q, CONFIG).then(function(data)
        {
            $scope.fuente = data;
            

            $scope.GetFuenteEtiqueta();
            $scope.GetAutoresFuente();
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetAutoresFuente = function()              
    {
        GetAutoresFuente($http, $q, CONFIG).then(function(data)
        {
            $scope.autorFuente = data;
            $scope.SetAutoresFuentes();
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetFuenteEtiqueta = function()              
    {
        GetFuenteEtiqueta($http, $q, CONFIG).then(function(data)
        {
            $scope.etiquetaFuente = data;
            $scope.SetEtiquetaFuente();
        
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
    
    //-----------------Ordenar Catálogos --------------------------------
    $scope.SetEtiquetaFuente = function()
    {
        var sqlBase = "Select EtiquetaId, Nombre From ? WHERE FuenteId = '";
        var sql = "";
        
        for(var k=0; k<$scope.fuente.length; k++)
        {
            sql = sqlBase;
            sql +=  $scope.fuente[k].FuenteId + "'";
           
            $scope.fuente[k].Etiqueta = alasql(sql,[$scope.etiquetaFuente]);
        } 
    };
    
    $scope.SetAutoresFuentes = function()
    {
        var sqlBase = "Select Abreviacion, Nombre, AutorId From ? WHERE FuenteId = '";
        var sql = "";
        for(var k=0; k<$scope.fuente.length; k++)
        {
            sql = sqlBase;
            sql +=  $scope.fuente[k].FuenteId + "'";
            
            $scope.fuente[k].Autor = new Autor();
            $scope.fuente[k].Autor = alasql(sql,[$scope.autorFuente]);
        }

    };
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarFuente= function(campoOrdenar)
    {
        if($scope.ordenarFuente == campoOrdenar)
        {
            $scope.ordenarFuente = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarFuente = campoOrdenar;
        }
    };
    
    /*----------- Filtrar -------------*/
    $scope.FiltroFuente = function(fuente)
    {
        var cumple = false;
        
        if($scope.filtro.autor.length > 0)
        {
            for(var i=0; i<$scope.filtro.autor.length; i++)
            {
                cumple = false;
                for(var j=0; j<fuente.Autor.length; j++)
                {
                    if($scope.filtro.autor[i] == fuente.Autor[j].AutorId)
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
        
        cumple = false;
        
       if($scope.filtro.etiqueta.length > 0)
        {
            for(var i=0; i<$scope.filtro.etiqueta.length; i++)
            {
                cumple = false;
                for(var j=0; j<fuente.Etiqueta.length; j++)
                {
                    if($scope.filtro.etiqueta[i] == fuente.Etiqueta[j].EtiquetaId)
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
        
        cumple = false;
        
        if($scope.filtro.tipoFuente.length == 0)
        {
            cumple = true;
        }
        else
        {
            for(var k=0; k<$scope.filtro.tipoFuente.length; k++)
            {
                if(fuente.TipoFuente.TipoFuenteId == $scope.filtro.tipoFuente[k])
                {
                    cumple = true;
                    break;
                }
            }
        }
        
        return cumple;
        
    };
    
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
    
    $scope.SetFiltroTipoFuente = function(tipo)
    {
        for(var k=0; k<$scope.filtro.tipoFuente.length; k++)
        {
            if(tipo == $scope.filtro.tipoFuente[k])
            {
                $scope.filtro.tipoFuente.splice(k,1);
                return;
            }
        }
        
        $scope.filtro.tipoFuente.push(tipo);
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
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            $scope.etiqueta[k].Filtro = false;
            
        }
        
        for(var k=0; k<$scope.tipoFuente.length; k++)
        {
            $scope.tipoFuente[k].Filtro = false;
        }
        
        for(var k=0; k<$scope.autor.length; k++)
        {
            $scope.autor[k].Filtro = false;
        }
        
        $scope.filtro = {autor:[], tipoFuente:[], etiqueta:[]};
    };
    
    /*---------------------- Detalle --------------------------*/
    $scope.DetalleFuente = function(fuente)
    {
        $scope.detalleFuente = fuente;
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
            $scope.InicializarFuenteNuevo();
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
    
    $scope.InicializarFuenteNuevo = function()
    {
        $scope.nuevaFuente = new Fuente();
        $scope.nuevaFuente.Autor = [];
        $scope.nuevaFuente.Etiqueta = [];
        $scope.ValidarAutor($scope.nuevaFuente.Autor);
        $scope.ValidarEtiqueta($scope.nuevaFuente.Etiqueta);
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
        fuente.Frase = data.Frase;
        fuente.Nota = data.Nota;
        fuente.Posicion = data.Posicion;
        
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
        $('#cerrarFuenteModal').modal('toggle');
    };
    
    $scope.ConfirmarCerrarModalFuente = function()
    {
        $('#modalFuente').modal('toggle');
        $scope.LimpiarInterfaz();
        $scope.mensajeError = [];
        $scope.claseFuente = {tipoFuente:"dropdownListModal", nombre:"entrada", autor:"dropdownListModal", etiqueta:"dropdownListModal"};
    };
    
    $scope.LimpiarInterfaz = function()
    {
        $scope.buscarAutorOperacion = "";
        $scope.buscarEtiquetaOperacion = "";
        $scope.mostrarOpcionFuente = "";
    };
    
    document.getElementById('modalFuente').onclick = function(e) 
    {
        if($scope.mostrarOpcionFuente == "autor")
        {
            if(!(e.target.id == "autorPanel" || e.target.id == "autoresAgregadas"  || $(e.target).parents("#autorPanel").size()))
            { 
                $scope.mostrarOpcionFuente = "";
                $scope.$apply();
            }
        }
        
        if($scope.mostrarOpcionFuente == "etiqueta")
        {
            if( !(e.target.id == "etiquetaPanel" || e.target.id == "etiquetasAgregadas"  || $(e.target).parents("#etiquetaPanel").size())) 
            { 
                $scope.mostrarOpcionFuente = "";
                $scope.$apply();
            }
        }
    };
    
    $scope.AgregarAutor = function(autor)
    {
        $scope.nuevaFuente.Autor.push(autor);
        $scope.nuevaFuente.Autor[$scope.nuevaFuente.Autor.length-1].Abreviacion = autor.Prefijo.Abreviacion;
        autor.show = false;
    };
    
    $scope.AgregarEtiqueta = function(etiqueta)
    {
        $scope.buscarEtiquetaOperacion = "";
        
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
    $scope.TerminarFuente = function(nombreInvalido, posicionInvalido)
    {
        if(!$scope.ValidarDatos(nombreInvalido, posicionInvalido))
        {
            $('#mensajeFuente').modal('toggle');
            return;
        }
        else
        {
            if($scope.operacion == "Agregar" || $scope.operacion == "AgregarExterior")
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
                $scope.LimpiarInterfaz();
                
                if($scope.operacion == "Agregar")
                {
                    $scope.GetFuente();
                    $scope.EnviarAlerta('Modal');
                    $scope.mensaje = "La fuente se ha agregado.";
                    $scope.InicializarFuenteNuevo();
                }
                else
                {
                    $('#modalFuente').modal('toggle');
                    $scope.nuevaFuente.FuenteId = data[1].Id;
                    $scope.fuente.push($scope.nuevaFuente);
                    
                    FUENTE.TerminarFuente($scope.nuevaFuente);
                }
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeFuente').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
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
                $scope.LimpiarInterfaz();
                $scope.EnviarAlerta('Vista');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";  
                $('#mensajeFuente').modal('toggle');
            }
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length]= "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeFuente').modal('toggle');
        });
    };
    
    $scope.ValidarDatos = function(nombreInvalido, posicionInvalido)
    {
        $scope.mensajeError = [];
        
        if($scope.nuevaFuente.TipoFuente.TipoFuenteId.length === 0)
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
        
        if(posicionInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una posición válida.";
        }

        /*if($scope.nuevaFuente.Autor.length === 0)
        {
            $scope.claseFuente.autor = "dropdownListModalError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona al menos un autor.";
        }
        else
        {
             $scope.claseFuente.autor = "dropdownListModal";
        }*/
        
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
    
    //-----------------------Limpiar-------------------------
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarFuente = "";
                break;
            case 2:
                $scope.buscarEtiquetaOperacion = "";
                break;
            case 3:
                $scope.buscarAutorOperacion = "";
                break;
            case 4:
                $scope.buscarAutor = "";
                break;
            case 5:
                $scope.buscarTipoFuente = "";
                break;
            case 6:
                $scope.buscarEtiqueta = "";
                break;
            default: 
                break;
        }
    };
    
    //----------------------Inicializar---------------------------------
    $scope.GetFuente();
    $scope.GetAutor();
    $scope.GetTipoFuente();
    $scope.GetEtiqueta();
    
    
    //------------------------------------ Agregar Exterior ------------------------------
    //------------ Etiqueta
    $scope.AbrirAgregarEtiqueta = function()
    {
        ETIQUETA.AgregarEtiqueta();
    };
    
    $scope.$on('TerminarEtiqueta',function()
    {
        var etiqueta = SetEtiqueta(ETIQUETA.GetEtiqueta());
        etiqueta.show = false;
        $scope.nuevaFuente.Etiqueta.push(etiqueta);
        $scope.etiqueta.push(etiqueta);
        
        $scope.buscarEtiquetaOperacion = "";
    });
    
    $scope.$on('TerminarEtiquetaInformacion',function()
    {
        var etiqueta = ETIQUETA.GetEtiqueta();
        etiqueta.show = true;
        $scope.etiqueta.push(etiqueta);
    });
    
    //------------ Autor
    $scope.AbrirAgregarAutor = function()
    {
        AUTOR.AgregarAutor();
    };
    
    $scope.$on('TerminarAutor',function()
    {
        var autor = AUTOR.GetAutor();
        $scope.nuevaFuente.Autor.push(autor);
        $scope.autor.push(autor);
        $scope.autor[$scope.autor.length-1].show = false;
    });
    
    //----------- Tipo fuente
    $scope.AgregarTipoFuente = function()
    {
        TIPOFUENTE.AgregarTipoFuente();
    };
    
    $scope.$on('TerminarTipoFuente',function()
    {
        var tipo = TIPOFUENTE.GetTipoFuente();
        $scope.CambiarTipoFuente(tipo);
        $scope.tipoFuente.push(tipo);
        
        $scope.mensaje = "Tipo Fuente Agregado";
        $scope.EnviarAlerta('Modal');
    });
    
    //------------------------ Exterior ---------------------------
    $scope.$on('AgregarFuente',function()
    {
        $scope.operacion = "AgregarExterior";

        $scope.InicializarFuenteNuevo();
    
        $('#modalFuente').modal('toggle');
    });
    
    //--------------------- Alertas --------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoFuente").alert();

            $("#alertaExitosoFuente").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoFuente").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoFuente").alert();

            $("#alertaEditarExitosoFuente").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoFuente").fadeOut();
            }, 2000)
        }
    };
    
});

app.factory('FUENTE',function($rootScope)
{
  var service = {};
  service.fuente = null;
    
  service.AgregarFuente= function()
  {
      this.fuente = null;
      $rootScope.$broadcast('AgregarFuente');
  };
    
  service.TerminarFuente= function(fuente)
  {
      this.fuente = fuente;
      $rootScope.$broadcast('TerminarFuente');
  };
    
  service.GetFuente = function()
  {
      return this.fuente;
  };

  return service;
});