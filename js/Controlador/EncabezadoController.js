app.controller("EncabezadoControlador", function($scope, $window, $http, $rootScope, $q, CONFIG, datosUsuario, $location)
{   
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
        
        if(funcion == "CerrarSesion")
        {
            $rootScope.CerrarSesion();
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
    
    /*---------------- Ir a pagina Principal ------------------*/
    $rootScope.IrPaginaPrincipal = function()
    {
        for(var k=0; k<aplicaciones.length; k++)
        {
            if($scope.usuario.Aplicacion == aplicaciones[k].texto)
            {
                $location.path(aplicaciones[k].paginaPrincipal);
                break;
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
             $location.path('/Login');
        }
        else
        {
            if(!($scope.usuario.Aplicacion  === null ||  $scope.usuario.Aplicacion  === undefined))
            {
                $scope.CambiarBarraNavegacion();
                $scope.IrPaginaPrincipal();
            }
        }
    }
    
    //destecta cuando los datos del usuario cambian
    $scope.$on('cambioUsuario',function()
    {
        $scope.usuario =  datosUsuario.getUsuario();
    
        if(!$scope.usuario.SesionIniciada)
        {
            $location.path('/Login');
            return;
        }
        else
        {
            if(!($scope.usuario.Aplicacion  === null ||  $scope.usuario.Aplicacion  === undefined))
            {
                $scope.CambiarBarraNavegacion();
                $scope.IrPaginaPrincipal();
            }
        }
    });
});

var EncabezadoSabiduria =
{ 
    titulo:"Sabidulría", 
    opcion: [ 
                    { texto:"Información", tipo:"link", referencia:"#Informacion", show: false},
                    { texto:"Adminitrar", tipo:"dropdown", show: false,
                                            elemento:
                                            [
                                                {texto:"usuario", referencia:"#Usuario", funcion:""},
                                                {texto:"Fuente", referencia:"#Fuente", funcion:""},
                                                {texto:"Autor", referencia:"#Autor", funcion:""},
                                                {texto:"Etiqueta", referencia:"#Etiqueta", funcion:""},
                                                {texto:"Configurar Información", referencia:"#ConfigurarInformacion", funcion:""}
                                            ]},
                    {texto:"Usuario", tipo:"dropdown", show: true, 
                                            elemento:
                                            [
                                                {texto:"Mis Aplicaciones", referencia:"#Aplicacion", funcion:""},
                                                {texto:"Cerrar Sesión", referencia:"", funcion:"CerrarSesion"},
                                            ]}
              ]                      
} ;
