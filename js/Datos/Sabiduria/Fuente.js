class Fuente
{
    constructor()
    {
        this.FuenteId = "";
        this.Nombre = "";
        this.Frase = "";
        this.Posicion = "";
        this.Nota = "";
        this.TipoFuente = new TipoFuente();
        this.Autor = [];
        this.Etiqueta = [];
    }
}

function GetFuente($http, $q, CONFIG)
{
    var q = $q.defer();

    $http({
          method: 'GET',
          url: CONFIG.APIURL + '/GetFuente',

      }).then(function(response)
        {
            var fuente = [];
            for(var k=0; k<response.data.length; k++)
            {
                fuente[k] = new Fuente();
                fuente[k] = SetFuente(response.data[k]);
            }

            q.resolve(fuente);
        }, function(response){
            q.resolve(response.status);
     });
    return q.promise;
}

function SetFuente(data)
{
    var fuente = new Fuente();

    fuente.FuenteId = data.FuenteId;
    fuente.Nombre = data.Nombre;
    fuente.Frase = data.Frase;
    fuente.Posicion = data.Posicion;
    fuente.Nota = data.Nota;

    fuente.TipoFuente.TipoFuenteId = data.TipoFuenteId;
    fuente.TipoFuente.Nombre = data.NombreTipoFuente;

    return fuente;
}

function AgregarFuente($http, CONFIG, $q, fuente)
{
    var q = $q.defer();

    $http({
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarFuente',
          data: fuente

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

//edita un consumible
function EditarFuente($http, CONFIG, $q, fuente)
{
    var q = $q.defer();

    $http({
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarFuente',
          data: fuente

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

/*------------ datos de la fuente----------------*/
function GetFuenteAutor($http, $q, CONFIG, id)
{
    var q = $q.defer();

    $http({
          method: 'GET',
          url: CONFIG.APIURL + '/GetFuenteAutor/'+id,
      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);
     });
    return q.promise;
}

function GetFuenteEtiqueta($http, $q, CONFIG, id)
{
    var q = $q.defer();

    $http({
          method: 'GET',
          url: CONFIG.APIURL + '/GetFuenteEtiqueta',
      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);
     });
    return q.promise;
}

function GetAutoresFuente($http, $q, CONFIG)
{
    var q = $q.defer();

    $http({
          method: 'GET',
          url: CONFIG.APIURL + '/GetAutoresFuente'
      }).then(function(response)
        {
            if(response.data[0].Estatus == "Exito")
            {
                q.resolve(response.data[1].Autor);
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
