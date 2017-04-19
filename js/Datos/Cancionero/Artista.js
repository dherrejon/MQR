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

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                var artista = []; 
                for(var k=0; k<data[1].Artista.length; k++)
                {
                    artista[k] = SetArtista(data[1].Artista[k]);
                }
                q.resolve(artista); 
            }
            else
            {
                q.resolve([]);
            }
             
        }).error(function(data, status){
            q.resolve(status);
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

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve(status);

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

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve(status);

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

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}


  