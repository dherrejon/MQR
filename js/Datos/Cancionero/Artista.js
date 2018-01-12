class Artista
{
    constructor()
    {
        this.ArtistaId = "";
        this.Nombre = "";
        this.UsuarioId = "";
    }
}

function GetArtista($http, $q, CONFIG, usuarioId)
{
    var q = $q.defer();

    $http({
          method: 'GET',
          url: CONFIG.APIURL + '/GetArtista/' + usuarioId,

      }).then(function(response)
        {
            if(response.data[0].Estatus == "Exito")
            {
                var artista = [];
                for(var k=0; k<response.data[1].Artista.length; k++)
                {
                    artista[k] = SetArtista(response.data[1].Artista[k]);
                }
                q.resolve(artista);
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

function SetArtista(data)
{
    var artista = new Artista();

    artista.ArtistaId = data.ArtistaId;
    artista.Nombre = data.Nombre;
    artista.UsuarioId = data.UsuarioId;

    return artista;
}

function AgregarArtista($http, CONFIG, $q, artista)
{
    var q = $q.defer();

    $http({
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarArtista',
          data: artista

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

function EditarArtista($http, CONFIG, $q, artista)
{
    var q = $q.defer();

    $http({
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarArtista',
          data: artista

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

function BorrarArtista($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarArtista',
          data: id

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}
