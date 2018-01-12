class Usuario   //clase usuario
{
    constructor()           //inicializar datos
    {
        this.UsuarioId = "";
        this.Nombre = "";
        this.Apellidos = "";
        this.NombreUsuario = "";
        this.Correo = "";
        this.Password = "";
        this.Permiso = [];
        this.Aplicacion = "";
        this.EtiquetaMsn = "";
    }
}


//iniciar sesion
function IniciarSesion($http, usuario, $q, CONFIG, md5)
{
    var q = $q.defer();

    usuario.clave = md5.createHash( usuario.password );

    $http({
          method: 'POST',
          url: CONFIG.APIURL + '/Login',
          data: usuario

      }).then(function(response)
        {
            if(response.data[0].Estatus == "Iniciado")
            {
                usuario = SetUsuario(response.data[1].Usuario);
                usuario.Aplicacion = "";
                q.resolve(usuario);
            }
            else if(response.data[0].Estatus == "SesionInicada")
            {
                q.resolve(response.data[0].Estatus);
            }
            else
            {
                usuario.Password = "";
                usuario.UsuarioId = "";
                usuario.SesionIniciada = false;
                q.resolve(usuario);
            }
        }, function(response){
            q.resolve(response.status);
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

        }).then(function(response){
            if( response.data[0].Estatus)
            {
                usuario = new Usuario();
                usuario = SetUsuario(response.data[1].Usuario);
                usuario.Aplicacion = response.data[0].Aplicacion;
            }
            else
            {
                usuario = new Usuario();
                usuario.SesionIniciada = false;
            }

            q.resolve(usuario);

        }, function(response){
             alert("Ha fallado la petición, no se ha podido obtener el estado de sesion. Estado HTTP:"+response.status);
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

     }).then(function(response){

           if( response.data[0].Estatus )
           {
              q.resolve(true);
           }
           else
           {
              q.resolve(false);
           }

     }, function(response){

           alert("Ha fallado la petición. Estado HTTP:"+response.status);

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
    usuario.Activo = CambiarIntABool(data[0].Activo);
    usuario.Nombre = data[0].Nombre;
    usuario.Apellidos = data[0].Apellidos;
    usuario.Correo = data[0].Correo;
    usuario.EtiquetaMsn = data[0].EtiquetaMsn;
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

     }).then(function(response){


     }, function(response){

     });
}

//-----------Cambiar Contraseña-------------------------
function CambiarPasswordPorUsuario($http, CONFIG, $q, usuario)
{
    var q = $q.defer();

    $http({
          method: 'PUT',
          url: CONFIG.APIURL + '/CambiarPasswordPorUsuario',
          data: usuario

      }).then(function(response)
        {
            q.resolve(response.data[0].Estatus);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

function RecuperarPassword($http, CONFIG, $q, usuario)
{
    var q = $q.defer();

    $http({
          method: 'PUT',
          url: CONFIG.APIURL + '/RecuperarPassword',
          data: usuario

      }).then(function(response)
        {
            q.resolve(response.data[0].Estatus);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

function ValidarRecuperarPassword($http, $q, CONFIG, solicitud)
{
    var q = $q.defer();

    $http({
          method: 'POST',
          url: CONFIG.APIURL + '/ValidarRecuperarPassword',
          data: solicitud

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.data);
     });

    return q.promise;
}

function ReiniciarPassword($http, CONFIG, $q, usuario)
{
    var q = $q.defer();

    $http({
          method: 'PUT',
          url: CONFIG.APIURL + '/ReiniciarPassword',
          data: usuario

      }).then(function(response)
        {
            if(response.data[0].Estatus == "Exitoso")
            {
                q.resolve("Exitoso");
            }
            else
            {
                q.resolve("Fallido");
            }

        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

//-------Funciones cambio de valor----------
function CambiarIntABool(valor)
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

function CambiarBoolAInt(valor)
{
    if(valor)
    {
        return "1";
    }
    else
    {
        return "0";
    }
}
