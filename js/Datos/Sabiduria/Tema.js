class Tema
{
    constructor()
    {
        this.TemaId = "";
        this.Nombre = "";
    }
}

function GetTema($http, $q, CONFIG)
{
    var q = $q.defer();

    $http({
          method: 'GET',
          url: CONFIG.APIURL + '/GetTema',

      }).then(function(response)
        {
            var tema = [];
            for(var k=0; k<response.data.length; k++)
            {
                tema[k] = new Tema();
                tema[k] = SetTema(response.data[k]);
            }

            q.resolve(tema);
        }, function(response){
            q.resolve(response.status);
     });
    return q.promise;
}

function SetTema(data)
{
    var tema = new Tema();

    tema.TemaId = data.TemaId;
    tema.Nombre = data.Nombre;

    return tema;
}

function AgregarTema($http, CONFIG, $q, tema)
{
    var q = $q.defer();

    $http({
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarTema',
          data: tema

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

function EditarTema($http, CONFIG, $q, tema)
{
    var q = $q.defer();

    $http({
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarTema',
          data: tema

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}
