app.controller("EncabezadoControlador", function($scope, $window, $http, $rootScope, $q, CONFIG, datosUsuario, $location, md5)
{   
    $scope.nuevoPassword = {nuevo:"", repetir:"", actual:""};
    $scope.clasePassword = {nuevo:"entrada", repetir:"entrada", actual:"entrada"};
    
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
            case "Sabiduría": 
                $scope.barraNavegacion = EncabezadoSabiduria;
                $scope.HabilitarOpcionesBarraNavegacionSabiduria();
                break;
            default:
                $scope.barraNavegacion = [];
                break;
        }   
    };
    
    /*----------------------Control de vista de clases de la barra de navegación----------------------------*/ 
    $scope.MouseClickElemento = function(opcion, funcion)
    {
        $('#'+ opcion.texto ).removeClass('open');
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
    
    $scope.MouseClickOpcion = function(opcion)
    {
        $('#'+ opcion.texto ).addClass('open');
    };
    
    //despliega las secciones del módulo donde esta el mouse
    $scope.MouseEnterarElemento = function(index)
    {

        $('.header-horizontal-menu .navbar-nav > li.dropdown').removeClass('open');
        $('#'+$scope.barraNavegacion.opcion[index].texto).addClass('open');
    };

    //oculta las secciones
    $scope.MouseSalirElemento = function(index)
    {
        $('#'+$scope.barraNavegacion.opcion[index].texto).removeClass('open'); 
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
        //console.log($scope.barraNavegacion);
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
        }
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
                $scope.CerrarCambiarPasswordForma();
                $('#mensajeEncabezado').modal('toggle');
                $('#CambiarPasswordModal').modal('toggle');
            }
            else if(data == "ErrorPassword")
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*Tu contraseña actual es incorrecta.";
            }
            else
            {
                alert("Ha ocurrido un error. Intente más tarde.");
            }
        }).catch(function(error)
        {
            alert("Ha ocurrido un error. Intente más tarde." +error);
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
        $scope.nuevoPassword = {nuevo:"", repetir:"", actual:""};
        $scope.clasePassword = {nuevo:"entrada", repetir:"entrada", actual:"entrada"};
        $scope.mensajeError = [];
    };
    
    /*---------------- Ir a pagina Principal ------------------*/
    $rootScope.IrPaginaPrincipal = function()
    {
        if($scope.usuario !== undefined || $scope.usuario !== null)
        {
            if($scope.usuario.Aplicacion.length === 0)
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
            }
        }
    });
});

var EncabezadoSabiduria =
{ 
    titulo:"Sabidulría", 
    opcion: [ 
                    { texto:"Información", tipo:"link", referencia:"#Informacion", show: false},
                    { texto:"Administrar", tipo:"dropdown", show: false,
                                            elemento:
                                            [
                                                {texto:"Usuario", referencia:"#Usuario", funcion:""},
                                                {texto:"Fuente", referencia:"#Fuente", funcion:""},
                                                {texto:"Autor", referencia:"#Autor", funcion:""},
                                                {texto:"Etiqueta", referencia:"#Etiqueta", funcion:""},
                                                {texto:"Información", referencia:"#ConfigurarInformacion", funcion:""}
                                            ]},
                    {texto:"Usuario", tipo:"dropdown", show: true, 
                                            elemento:
                                            [
                                                {texto:"Mis Aplicaciones", referencia:"#Aplicacion", funcion:""},
                                                {texto:"Cerrar Sesión", referencia:"", funcion:"CerrarSesion"},
                                                {texto:"Cambiar Contraseña", referencia:"", funcion:"CambiarPassword"},
                                            ]}
              ]                      
} ;
