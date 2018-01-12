class Cancion
{
    constructor()
    {
        this.CancionId = "";
        this.Titulo = "";
        this.Cancionero = "";
        this.NombreArchivo = "";

        this.Artista = [];
    }
}

function GetCancion($http, $q, CONFIG, usuarioId)
{
    var q = $q.defer();

    var servicio = "";
    if(usuarioId == "todos")
    {
        servicio = "/GetCancionTodas";
    }
    else
    {
        servicio = "/GetCancion/" + usuarioId;
    }

    $http({
          method: 'GET',
          url: CONFIG.APIURL + servicio,

      }).then(function(response)
        {

            if(response.data[0].Estatus == "Exito")
            {
                var cancion = [];

                for(var k=0; k<response.data[1].Cancion.length; k++)
                {
                    cancion[k] = new Cancion();
                    cancion[k] = SetCancion(response.data[1].Cancion[k]);
                }

                q.resolve(cancion);
            }
            else
            {
                q.resolve([]);
            }

        }, function(response){
            q.resolve(response.status);
     });
    return q.promise;
}

function SetCancion(data)
{
    var cancion = new Cancion();

    cancion.CancionId = data.CancionId;
    cancion.Titulo = data.Titulo;
    //cancion.Cancionero = data.Cancionero;
    //cancion.NombreArchivo = data.NombreArchivo;

    return cancion;
}

function AgregarCancion($http, CONFIG, $q, cancion)
{
   var q = $q.defer();

    var fd = new FormData();

    if(cancion.ArchivoSeleccionado)
    {
        var file = cancion.Cancionero;
        fd.append('file', file);
    }

    fd.append('cancion', JSON.stringify(cancion));

    $http({
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarCancion',
          data: fd,
          headers:
          {
            "Content-type": undefined
          }

      }).then(function(response)
        {
            if(response.data[0].Estatus == "Exitoso")
            {
                q.resolve(response.data);
            }
            else
            {
                q.resolve(response.data);
            }


        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

function EditarCancion($http, CONFIG, $q, cancion)
{

    var q = $q.defer();


    var fd = new FormData();

    if(cancion.ArchivoSeleccionado)
    {
        var file = cancion.Cancionero;
        fd.append('file', file);
    }

    fd.append('cancion', JSON.stringify(cancion));

    $http({
          method: 'POST',
          url: CONFIG.APIURL + '/EditarCancion',
          data: fd,
          headers:
          {
            "Content-type": undefined
          }

      }).then(function(response)
        {
            if(response.data[0].Estatus == "Exitoso")
            {
                q.resolve(response.data);
            }
            else
            {
                q.resolve(response.data);
            }
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

function BorrarCancion($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarCancion',
          data: id

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

//---------------- Datos cancion
function GetCancionero($http, $q, CONFIG, id)
{
    var q = $q.defer();

    $http({
          method: 'GET',
          url: CONFIG.APIURL + '/GetCancionero/'+id,
      }).then(function(response)
        {
            if(response.data[0].Estatus == "Exito")
            {
                q.resolve(response.data[1].Cancionero[0]);
            }
            else
            {
                q.resolve([]);
            }

        }, function(response){
            q.resolve([]);
     });
    return q.promise;
}

function GetArtistaPorCancion($http, $q, CONFIG, id)
{
    var q = $q.defer();

    var servicio = "";

    if(id == "todos")
    {
        servicio = "/GetArtistaPorCancionTodos";
    }
    else
    {
        servicio = "/GetArtistaPorCancion/" + id;
    }

    $http({
          method: 'GET',
          url: CONFIG.APIURL + servicio,
      }).then(function(response)
        {
            if(response.data[0].Estatus == "Exito")
            {
                q.resolve(response.data[1].Artista);
            }
            else
            {
                q.resolve([]);
            }

        }, function(response){
            q.resolve([]);
     });
    return q.promise;
}
