/*------Autor---------*/
class Autor
{
    constructor()
    {
        this.AutorId = "";
        this.Nombre = "";
        this.Apellidos = "";
        this.Prefijo = new Prefijo();
    }
}

function GetAutor($http, $q, CONFIG)
{
    var q = $q.defer();

    $http({
          method: 'GET',
          url: CONFIG.APIURL + '/GetAutor',

      }).then(function(response)
        {
            var autor = [];
            for(var k=0; k<response.data.length; k++)
            {
                autor[k] = new Autor();
                autor[k] = SetAutor(response.data[k]);
            }

            q.resolve(autor);
        }, function(response){
            q.resolve(response.status);
     });
    return q.promise;
}

function SetAutor(data)
{
    var autor = new Autor();

    autor.AutorId = data.AutorId;
    autor.Nombre = data.Nombre;
    autor.Apellidos = data.Apellidos;

    autor.Prefijo.Abreviacion = data.Abreviacion;
    autor.Prefijo.PrefijoId = data.PrefijoId;

    return autor;
}

function AgregarAutor($http, CONFIG, $q, autor)
{
    var q = $q.defer();

    $http({
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarAutor',
          data: autor

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

//edita un consumible
function EditarAutor($http, CONFIG, $q, autor)
{
    var q = $q.defer();

    $http({
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarAutor',
          data: autor

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}
