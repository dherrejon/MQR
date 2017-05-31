app.controller("EncabezadoControlador", function($scope, $window, $http, $rootScope, $q, CONFIG, datosUsuario, $location, md5)
{   
    $scope.nuevoPassword = {nuevo:"", repetir:"", actual:""};
    $scope.clasePassword = {nuevo:"entrada", repetir:"entrada", actual:"entrada"};
    
    $rootScope.apps = aplicaciones;
    $rootScope.apps.Grupo = "Inicio";
    
    /*------------------Indentifica cuando los datos del usuario han cambiado-------------------*/
    $scope.$on('cambioAplicaion',function()
    {
        $scope.usuario =  datosUsuario.getUsuario();
        
        if(!($scope.usuario.Aplicacion  === null ||  $scope.usuario.Aplicacion  === undefined))
        {
            $scope.CambiarBarraNavegacion();
        }
    });
    
    $scope.CambiarBarraNavegacion = function()
    {
        switch($scope.usuario.Aplicacion)
        {
            case "Enciclopedia MQR": 
                $scope.barraNavegacion = EncabezadoSabiduria;
                $scope.HabilitarOpcionesBarraNavegacionSabiduria();
                break;
                
            case "GuitarApp": 
                $scope.barraNavegacion = EncabezadoCancionero;
                $scope.HabilitarOpcionesBarraNavegacionCancionero();
                break;
                
            case "Mis Actividades": 
                $scope.barraNavegacion = EncabezadoActividades;
                $scope.HabilitarOpcionesBarraNavegacionActividades();
                break;
                
            case "Mi Diario":
                $scope.barraNavegacion = EncabezadoDiario;
                $scope.HabilitarOpcionesBarraNavegacionDiario();
                break;
                
            case "Aplicaciones": 
                $scope.barraNavegacion = EncabezadoAplicaciones;
                break;
            default:
                $scope.barraNavegacion = [];
                break;
        }   
    };
    
    /*----------------------Control de vista de clases de la barra de navegación----------------------------*/ 
    $scope.MouseClickElemento = function(opcion, funcion)
    {
        $('#'+ opcion ).removeClass('open');
        
        $scope.CerrarBarraNavegacion();
        
        if(funcion == "CerrarSesion")
        {
            $rootScope.CerrarSesion();
        }
        
        else if(funcion == "CambiarPassword")
        {
            $scope.CambiarPassword();
        }
    };
    
    $scope.MouseClickOpcion = function(opcion, tipo)
    {
        if(tipo == "opc")
        {
            $('#'+ opcion.texto ).addClass('open');
        }
        else if(tipo == "pre")
        {
            $('#'+ opcion ).addClass('open');
        }
        
    };
    
    //despliega las secciones del módulo donde esta el mouse
    $scope.MouseEnterarElemento = function(index)
    {

        $('.header-horizontal-menu .navbar-nav > li.dropdown').removeClass('open');
        $('#'+$scope.barraNavegacion.opcion[index].texto).addClass('open');
    };
    
    $scope.MouseEnterarElementoPredeterminado = function(id)
    {
        $("#" + id).addClass("open");
    };

    //oculta las secciones
    $scope.MouseSalirElemento = function(index)
    {
        $('#'+$scope.barraNavegacion.opcion[index].texto).removeClass('open'); 
    };
    
    $scope.MouseSalirElementoPredeterminado = function(id)
    {
        $('#'+ id).removeClass('open'); 
    };
    
    //Cierra la barra de navegacion en el tamaño xs 
    $scope.CerrarBarraNavegacion = function()
    {
        $('#navbarCollapse').removeClass('in');
    };
    
    /*-------------------------Cerrar Sesión-----------------------------------------*/    
    $rootScope.CerrarSesion = function()
    {
        $('#navbarCollapse').removeClass('in');
        
        CerrarSesion($http, $rootScope, $q, CONFIG).then(function(data)
        {
            if(data)
            {
                $window.sessionStorage.removeItem('KeyUser'); 
                $scope.usuario = new Usuario();
                datosUsuario.enviarUsuario($scope.usuario);
                $window.location = "#Login";
                $scope.barraNavegacion = [];
            }
            else
            {
                alert("Error. Intentelo más tarde");
            }
             
        }).catch(function(error){
            alert("Error. Intentelo más tarde, " + error );
        }); 
    };
    
    //Habilitar Opciones de la barra de navegacion
    $scope.HabilitarOpcionesBarraNavegacionSabiduria = function()
    {
        $scope.LimpiarBarraNavegacionInformacion();

        for(var k=0; k<$scope.usuario.Permiso.length; k++)
        {
            if($scope.usuario.Permiso[k] == "SabiduriaCon")
            {
                $scope.barraNavegacion.opcion[0].show = true;
            }
            if($scope.usuario.Permiso[k] == "SabiduriaAdm")
            {
                $scope.barraNavegacion.opcion[1].show = true;
            }
            
            if($scope.usuario.Permiso[k] == "AdmUsuarios")
            {
                $scope.permisoUsuario = true;
            }
        }
    };
    
    $scope.HabilitarOpcionesBarraNavegacionCancionero = function()
    {
        $scope.LimpiarBarraNavegacionCancionero();

        for(var k=0; k<$scope.usuario.Permiso.length; k++)
        {
            if($scope.usuario.Permiso[k] == "CancioneroCon")
            {
                $scope.barraNavegacion.opcion[0].show = true;
            }
            if($scope.usuario.Permiso[k] == "CancioneroAdm")
            {
                $scope.barraNavegacion.opcion[1].show = true;
            }
            
            if($scope.usuario.Permiso[k] == "AdmUsuarios")
            {
                $scope.permisoUsuario = true;
            }
        }
    };
    
    $scope.HabilitarOpcionesBarraNavegacionActividades = function()
    {
        $scope.LimpiarBarraNavegacionActividades();

        for(var k=0; k<$scope.usuario.Permiso.length; k++)
        {
            if($scope.usuario.Permiso[k] == "ActividadesCon")
            {
                $scope.barraNavegacion.opcion[0].show = true;
            }
            if($scope.usuario.Permiso[k] == "ActividadesAdm")
            {
                $scope.barraNavegacion.opcion[1].show = true;
            }
            
            if($scope.usuario.Permiso[k] == "AdmUsuarios")
            {
                $scope.permisoUsuario = true;
            }
        }
    };
    
    $scope.HabilitarOpcionesBarraNavegacionDiario = function()
    {
        $scope.LimpiarBarraNavegacionDiario();

        for(var k=0; k<$scope.usuario.Permiso.length; k++)
        {
            if($scope.usuario.Permiso[k] == "DiarioCon")
            {
                $scope.barraNavegacion.opcion[0].show = true;
                $scope.barraNavegacion.opcion[1].show = true;
            }
            
            if($scope.usuario.Permiso[k] == "AdmUsuarios")
            {
                $scope.permisoUsuario = true;
            }
        }
    };
    
    $scope.LimpiarBarraNavegacionInformacion = function()
    {
        $scope.barraNavegacion.opcion[0].show = false;
        $scope.barraNavegacion.opcion[1].show = false;
        
        $scope.permisoUsuario = false;
    };
    
    $scope.LimpiarBarraNavegacionCancionero = function()
    {
        $scope.barraNavegacion.opcion[0].show = false;
        $scope.barraNavegacion.opcion[1].show = false;
        
        $scope.permisoUsuario = false;
    };
    
    $scope.LimpiarBarraNavegacionActividades = function()
    {
        $scope.barraNavegacion.opcion[0].show = false;
        $scope.barraNavegacion.opcion[1].show = false;
        
        $scope.permisoUsuario = false;
    };
    
    $scope.LimpiarBarraNavegacionDiario = function()
    {
        $scope.barraNavegacion.opcion[0].show = false;
        $scope.barraNavegacion.opcion[1].show = false;
        
        $scope.permisoUsuario = false;
    };
    
    /*------------------------------Cambiar Contraseña--------------------------------------------*/
    $scope.CambiarPassword = function()
    {
        $('#CambiarPasswordModal').modal('toggle');
    };
    
    $scope.GuardarPassword = function(passwordInvalido)
    {
        if(!$scope.ValidarPassword(passwordInvalido))
        {
            $('#mensajeEncabezado').modal('toggle');
            return;
        }
        
        var datosUsuario = [];
        datosUsuario[0] = $scope.usuario.UsuarioId;
        datosUsuario[1] = md5.createHash( $scope.nuevoPassword.actual );
        datosUsuario[2] = md5.createHash( $scope.nuevoPassword.nuevo );
        
        CambiarPasswordPorUsuario($http, CONFIG, $q, datosUsuario).then(function(data)
        {
            if(data == "Exitoso")
            {
                $scope.mensaje = "La contraseña se ha actualizado correctamente.";
                $scope.LimpiarInterfaz();
                //$('#mensajeEncabezado').modal('toggle');
                $scope.EnviarAlerta('Modal');
                $('#CambiarPasswordModal').modal('toggle');
            }
            else if(data == "ErrorPassword")
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*Tu contraseña actual es incorrecta.";
                $('#mensajeEncabezado').modal('toggle');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeEncabezado').modal('toggle');
            }
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde." + error
            $('#mensajeEncabezado').modal('toggle');
            return;
        });
    };
    
    $scope.ValidarPassword = function(passwordInvalido)
    {
        $scope.mensajeError = [];
        if(passwordInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*La contraseña solo puede tener letras y números. Mínimo debe tener 6 carácteres.";
            $scope.clasePassword.nuevo = "entradaError"; 
            return false;
        }
        else
        {
            $scope.clasePassword.nuevo = "entrada";        
        }
        if($scope.nuevoPassword.nuevo != $scope.nuevoPassword.repetir)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Las contraseñas no coinciden.";
            $scope.clasePassword.repetir = "entradaError"; 
        }
        else
        {
            $scope.clasePassword.repetir = "entrada";        
        }
        if($scope.nuevoPassword.actual === "" || $scope.nuevoPassword.actual === undefined || $scope.nuevoPassword.actual === null)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe tu contraseña actual.";
            $scope.clasePassword.actual = "entradaError"; 
        }
        else
        {
            $scope.clasePassword.actual = "entrada";        
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
    
    $scope.CerrarCambiarPasswordForma = function()
    {
        $('#cerrarCambiarPassword').modal('toggle');
    };
    
    $scope.ConfirmarCerrarCambiarPasswordForma = function()
    {
        $('#CambiarPasswordModal').modal('toggle');
        $scope.LimpiarInterfaz();
        
    };
    
    $scope.LimpiarInterfaz = function()
    {
        $scope.nuevoPassword = {nuevo:"", repetir:"", actual:""};
        $scope.clasePassword = {nuevo:"entrada", repetir:"entrada", actual:"entrada"};
        $scope.mensajeError = [];
    };
    
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitoso").alert();

            $("#alertaExitoso").fadeIn();
            setTimeout(function () {
                $("#alertaExitoso").fadeOut();
            }, 2000);
        }
    };
    
    /*---------------- Ir a pagina Principal ------------------*/
    $rootScope.IrPaginaPrincipal = function()
    {
        if($scope.usuario !== undefined || $scope.usuario !== null)
        {
            //console.log($scope.usuario);
            if($scope.usuario.Aplicacion.length === 0 || $scope.usuario.Aplicacion == "Aplicaciones")
            {
                $location.path('/Aplicacion');
            }
            else
            {
               for(var k=0; k<aplicaciones.length; k++)
                {
                    if($scope.usuario.Aplicacion == aplicaciones[k].texto)
                    {
                        $location.path(aplicaciones[k].paginaPrincipal);
                        break;
                    }
                } 
            }
        }
        
    };
    
    //---------------------------- Aplicaciones ----------------------------
    $scope.IniciarApp = function(app)
    {
        $('#app').removeClass('open'); 
        $scope.CerrarBarraNavegacion();
        
        if(app != "Aplicaciones")
        { 
            datosUsuario.setAplicacion(app.texto);
        
            SetAplicacion(app.texto, $http, CONFIG);
            $location.path(app.paginaPrincipal);
        }
        else
        {
            datosUsuario.setAplicacion("Aplicaciones");
        
            SetAplicacion("Aplicaciones", $http, CONFIG);
        }
    };
    
    $rootScope.HabilitarAplicaciones = function()
    {
        for(var k=0; k<$rootScope.apps.length; k++)
        {
            $rootScope.apps[k].habilitada = false;
        }
        
        if($rootScope.apps.Grupo === "Inicio")
        {
            for(var k=0; k<$scope.usuario.Permiso.length; k++)
            {
                if($scope.usuario.Permiso[k] == "SabiduriaCon" || $scope.usuario.Permiso[k] == "SabiduriaAdm")
                {
                    $rootScope.apps[4].habilitada = true;
                }
                if($scope.usuario.Permiso[k] == "ActividadesCon" || $scope.usuario.Permiso[k] == "ActividadesAdm")
                {
                    $rootScope.apps[1].habilitada = true;
                }
                if($scope.usuario.Permiso[k] == "CancioneroCon" || $scope.usuario.Permiso[k] == "CancioneroAdm")
                {
                    $rootScope.apps[3].habilitada = true;
                }
                if($scope.usuario.Permiso[k] == "DiarioCon")
                {
                    $rootScope.apps[2].habilitada = true;
                }
                if($scope.usuario.Permiso[k] == "DiarioCon" || $scope.usuario.Permiso[k] == "ActividadesCon" || $scope.usuario.Permiso[k] == "ActividadesAdm")
                {
                    $rootScope.apps[0].habilitada = true;
                }
            }
        }
    };
    
   /*------------------Indentifica cuando los datos del usuario han cambiado-------------------*/
    $scope.usuario =  datosUsuario.getUsuario(); 
    
    //verifica que haya un usuario logeado
    if($scope.usuario !== null)
    {
        if(!$scope.usuario.SesionIniciada)
        {
             //$location.path('/Login');
            return;
        }
        else
        {
            if(!($scope.usuario.Aplicacion  === null ||  $scope.usuario.Aplicacion  === undefined))
            {
                $scope.CambiarBarraNavegacion();
                $scope.HabilitarAplicaciones();
            }
        }
    }
    
    //destecta cuando los datos del usuario cambian
    $scope.$on('cambioUsuario',function()
    {
        $scope.usuario =  datosUsuario.getUsuario();
    
        if(!$scope.usuario.SesionIniciada)
        {
            //$location.path('/Login');
            return;
        }
        else
        {
            if(!($scope.usuario.Aplicacion  === null ||  $scope.usuario.Aplicacion  === undefined))
            {
                $scope.CambiarBarraNavegacion();
                $scope.HabilitarAplicaciones();
            }
        }
    });
});

var EncabezadoSabiduria =
{ 
    titulo:"Enciclopedia MQR", 
    opcion: [ 
                    { texto:"Inicio", tipo:"link", referencia:"#Informacion", show: false},
                    { texto:"Administrar", tipo:"dropdown", show: false,
                                            elemento:
                                            [
                                                //{texto:"Usuarios", referencia:"#Usuario", funcion:"", show:false},
                                                {texto:"Fuentes", referencia:"#Fuente", funcion:"", show:true},
                                                {texto:"Autores", referencia:"#Autor", funcion:"", show:true},
                                                {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
                                                {texto:"Información", referencia:"#ConfigurarInformacion", funcion:"", show:true},
                                                {texto:"Temas", referencia:"#Tema", funcion:"", show:true}
                                            ]},
                   
              ]                      
};

var EncabezadoCancionero =
{ 
    titulo:"GuitarApp", 
    opcion: [ 
                    { texto:"Inicio", tipo:"link", referencia:"#Informacion", show: false},
                    { texto:"Administrar", tipo:"dropdown", show: false,
                                            elemento:
                                            [
                                                //{texto:"Usuarios", referencia:"#Usuario", funcion:"", show:false},
                                                {texto:"Artistas", referencia:"#Artista", funcion:"", show:true},
                                                {texto:"Canciones", referencia:"#Cancion", funcion:"", show:true},
                                            ]},
                    
              ]                       
};

var EncabezadoActividades =
{ 
    titulo:"Mis Actividades", 
    opcion: [ 
                    { texto:"Inicio", tipo:"link", referencia:"#Actividades", show: false},
                    { texto:"Administrar", tipo:"dropdown", show: false,
                                                elemento:
                                                [
                                                    //{texto:"Usuarios", referencia:"#Usuario", funcion:"", show:false},
                                                    {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
                                                    {texto:"Frecuencias", referencia:"#Frecuencia", funcion:"", show:true},
                                                    {texto:"Temas", referencia:"#TemaActividad", funcion:"", show:true},
                                                    {texto:"Personas", referencia:"#PersonaActividad", funcion:"", show:true},
                                                    {texto:"Lugares", referencia:"#Lugar", funcion:"", show:true},
                                                    {texto:"Unidades", referencia:"#Unidades", funcion:"", show:true},
                                                ]},
              ]                       
};

var EncabezadoDiario =
{ 
    titulo:"Mi Diario", 
    opcion: [ 
                    { texto:"Inicio", tipo:"link", referencia:"#Diario", show: false},
                    { texto:"Administrar", tipo:"dropdown", show: false,
                                            elemento:
                                            [
                                                //{texto:"Usuarios", referencia:"#Usuario", funcion:"", show:false},
                                                {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
                                                {texto:"Temas", referencia:"#TemaActividad", funcion:"", show:true}
                                            ]},
                    
              ]                       
};

var EncabezadoAplicaciones =
{ 
    titulo:"MQRSYS", 
                        
} ;
