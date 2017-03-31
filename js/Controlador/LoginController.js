app.controller("LoginController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.mensajeError = "";
    $scope.mensajeErrorPassword = "";
    $scope.usuarioLogin = {nombreUsuario:"", password:""};
    
    $scope.usuario = datosUsuario.getUsuario();
    /*------------------Indentifica cuando los datos del usuario han cambiado-------------------*/
    $scope.$on('cambioUsuario',function()
    {
        $scope.usuario =  datosUsuario.getUsuario();    
        if($scope.usuario.SesionIniciada)
        {
            $rootScope.IrPaginaPrincipal();
        }
    });
    
    $scope.IniciarSesion = function(usuarioInvalido, passwordInvalido)
    {
        if(!$scope.ValidarDatos(usuarioInvalido, passwordInvalido))
        {
            return;
        }
        else
        {
            IniciarSesion($http, $scope.usuarioLogin, $q, CONFIG, md5).then(function(data) //iniciar sesion
            {
                if(data == "SesionInicada")     //Verifica que la sesión no este iniciada
                {
                    $scope.usuarioLogin = {nombreUsuario:"", password:""};
                    $scope.mensajeError = "Hay una sesión conectada, cierra la sesión para que puedas iniciar sesión.";
                    return;
                }

                //$scope.usuario = data;
                if(data.SesionIniciada)
                {   
                    $window.location = "#Aplicacion";
                    $scope.messageError = "";
                    datosUsuario.enviarUsuario(data);
                }
                else if(!data.SesionIniciada)
                {
                    $scope.usuarioLogin.password = "";
                    $scope.mensajeError = "*Verifica que tu usuario y contraseña sean correctas";
                }
                else
                {
                     $scope.usuarioLogin = {nombreUsuario:"", password:""};
                     $scope.mensajeError = "*Error de conexión. Intenta más tarde.";
                }


            }).catch(function(error){
                $scope.usuarioLogin = {nombreUsuario:"", password:""};
                alert(error);
            });
        }
    };
    
    $scope.ValidarDatos = function(usuarioInvalido, passwordInvalido)
    {
        if(usuarioInvalido) //verifica que los campos de nombre de usuario y de password contengan datos
        {
            $scope.mensajeError = "*Debes escribir un usuario"; 
            return false;
        }
        
        if(passwordInvalido)
        {
            $scope.mensajeError = "*Debes escribir una contraseña"; 
            return false;
        }
        
        return true;
    };
    
    if($scope.usuario !== null)
    {
        if($scope.usuario.SesionIniciada)
        {
            $scope.IrPaginaPrincipal();
        }
    }
    
    //------------------- Recuperar contraseña ----------------------
    $scope.RecuperarPassword = function(usuarioInvalido)
    {
        $scope.mensajeErrorPassword = "";
        if(usuarioInvalido)
        {
            $scope.mensajeErrorPassword = "*Escribe un usuario válido.";
            return;
        }
        
        var usuario = new Object();
        usuario.Nombre = $scope.usuarioLogin.nombreUsuario;
        
        RecuperarPassword($http, CONFIG, $q, usuario).then(function(data)
        {
            if(data == "Exitoso")
            {
                $scope.mensaje = "Se te ha enviado un correo para que puedas reiniciar tu contraseña.";
                $('#recuperarPasswordModal').modal('toggle');
                $('#mensajeLogin').modal('toggle');
            }
            else if(data == "ErrorUsuario")
            {
                $scope.mensajeErrorPassword = "*El usuario no es válido.";
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
    
    $scope.CerrarRecuperarPasswordForma = function()
    {
        $scope.mensajeErrorPassword = "";
    };

});

