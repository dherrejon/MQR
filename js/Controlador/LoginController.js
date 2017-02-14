app.controller("LoginController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.mensajeError = "";
    $scope.usuarioLogin = {nombreUsuario:"", password:""};
    
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
    
    /*------------------Indentifica cuando los datos del usuario han cambiado-------------------*/
    $scope.usuarioLogeado =  datosUsuario.getUsuario(); 
    
    //verifica que haya un usuario logeado
    if($scope.usuarioLogeado !== null)
    {
        if($scope.usuarioLogeado.SesionIniciada)
        {
            $rootScope.IrPaginaPrincipal();
        }
        else
        {
            $location.path('/Login');
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
            $location.path('/Aplicacion');
        }
    });

});

