class Usuario   //clase usuario
{
    constructor()           //inicializar datos
    {
        this.UsuarioId = "";
        this.Nombre = "";
        this.Apellidos = "";
        this.NombreUsuario = "";
        this.Password = "";
        this.Permiso = [];
    }
}


//iniciar sesion
function IniciarSesion($http, usuario, $q, CONFIG, md5)     
{
    var q = $q.defer();
    
    usuario.password = md5.createHash( usuario.password );

    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/Login',
          data: usuario

      }).success(function(data)
        {
            if(data.length > 0)
            {
                usuario = SetUsuario(data);
                q.resolve(usuario);
            }
            else if(data[0].Estatus == "SesionInicada")
            {
                q.resolve(data[0].Estatus);
            }
            else
            {
                usuario.Password = "";
                usuario.UsuarioId = "";
                usuario.SesionIniciada = false;
                q.resolve(usuario);
            }
        }).error(function(data, status){
            q.resolve(status);
     }); 
    return q.promise;
}

//Verificar el estado de la sesion
function SesionIniciada($http, $q, CONFIG)          
{
    var q = $q.defer();
    var usuario = new Usuario();

    $http({

            method: 'GET',
            url: CONFIG.APIURL + '/GetEstadoSesion'

        }).success(function(data){
            if( data[0].Estatus)
            {
                usuario = new Usuario(); 
                usuario = SetUsuario(data[1].Usuario);
                usuario.Aplicacion = data[0].Aplicacion;
            }
            else
            {
                usuario = new Usuario(); 
                usuario.SesionIniciada = false;
            }

            q.resolve(usuario);

        }).error(function(data, Estatus){
             alert("Ha fallado la petición, no se ha podido obtener el estado de sesion. Estado HTTP:"+Estatus);
    });

    return q.promise;
}

//cerrar sesion
function CerrarSesion($http, $rootScope, $q, CONFIG)            
{
    var q = $q.defer();

     $http({

          method: 'GET',
          url: CONFIG.APIURL + '/CerrarSesion'

     }).success(function(data, status, headers, config){

           if( data[0].Estatus )
           {
              q.resolve(true);
           }
           else
           {
              q.resolve(false);
           } 

     }).error(function(data, status, headers, config){

           alert("Ha fallado la petición. Estado HTTP:"+status);

     });

    return q.promise;
}

 //Indicar los datos del usuario, periles y permisos
function SetUsuario(data)              
{
    var usuario = new Usuario();
    
    usuario.UsuarioId = data[0].UsuarioId;
    usuario.NombreUsuario = data[0].NombreUsuario;
    usuario.Password = "";
    usuario.Activo = CambiarBoolAInt(data[0].Activo);
    usuario.Nombre = data[0].Nombre;
    usuario.Apellidos = data[0].Apellidos;
    usuario.SesionIniciada = true;
    
    for(var k=0; k<data.length; k++)
    {
        usuario.Permiso[k] = data[k].Clave;
    }
    return usuario;
}

//Poner el perfil seleccionado por el usuario en session
function SetAplicacion(aplicacion, $http, CONFIG)       
{
    var datos = [];
    datos[0] = aplicacion;
    $http({

          method: 'PUT',
          url: CONFIG.APIURL + '/SetAplicacion',
          data: datos

     }).success(function(data){

           

     }).error(function(data){


     });
}

function CambiarBoolAInt(valor)
{
    if(valor == "1")
    {
        return true;
    }
    else
    {
        return false;
    }
}
