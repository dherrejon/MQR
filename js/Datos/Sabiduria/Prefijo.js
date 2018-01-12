/*------Prefijo---------*/

class Prefijo
{
    constructor()
    {
        this.PrefijoId = "";
        this.Nombre = "";
        this.Abreviacion = "";
    }
}

//obtiene los tipos de módulos
function GetPrefijo($http, $q, CONFIG)
{
    var q = $q.defer();

    $http({
          method: 'GET',
          url: CONFIG.APIURL + '/GetPrefijo',

      }).then(function(response)
        {
            var prefijo = [];
            for(var k=0; k<response.data.length; k++)
            {
                prefijo[k] = new Prefijo();
                prefijo[k] = SetPrefijo(response.data[k]);
            }

            q.resolve(prefijo);
        }, function(response){
            q.resolve(response.status);
     });
    return q.promise;
}

function SetPrefijo(data)
{
    var prefijo = new Prefijo();

    prefijo.PrefijoId = data.PrefijoId;
    prefijo.Nombre = data.Nombre;
    prefijo.Abreviacion = data.Abreviacion;

    return prefijo;
}

//agregaga un prefijo
function AgregarPrefijo($http, CONFIG, $q, prefijo)
{
    var q = $q.defer();

    $http({
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarPrefijo',
          data: prefijo

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

function EditarPrefijo($http, CONFIG, $q, prefijo)
{
    var q = $q.defer();


    $http({
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarPrefijo',
          data: prefijo

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}
