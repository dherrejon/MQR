/*------Medio Contacto---------*/

class Etiqueta
{
    constructor()
    {
        this.EtiquetaId = "";
        this.Nombre = "";
    }
}

//obtiene los tipos de módulos
function GetEtiqueta($http, $q, CONFIG, id)
{
    var q = $q.defer();

    $http({
          method: 'GET',
          url: CONFIG.APIURL + '/GetEtiqueta/' + id,

      }).then(function(response)
        {
            var etiqueta = [];
            for(var k=0; k<response.data.length; k++)
            {
                etiqueta[k] = new Etiqueta();
                etiqueta[k] = SetEtiqueta(response.data[k]);
            }

            q.resolve(etiqueta);
        }, function(response){
            q.resolve(response.status);
     });
    return q.promise;
}

//copia los datos de un material
function SetEtiqueta(data)
{
    var etiqueta = new Etiqueta();

    etiqueta.EtiquetaId = data.EtiquetaId;
    etiqueta.Nombre = data.Nombre;

    return etiqueta;
}

//agregaga un maqueo
function AgregarEtiqueta($http, CONFIG, $q, etiqueta)
{
    var q = $q.defer();

    etiqueta.Activo = CambiarBoolAInt(etiqueta.Activo);

    $http({
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarEtiqueta',
          data: etiqueta

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

//edita un consumible
function EditarEtiqueta($http, CONFIG, $q, etiqueta)
{
    var q = $q.defer();

    etiqueta.Activo = CambiarBoolAInt(etiqueta.Activo);

    $http({
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarEtiqueta',
          data: etiqueta

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

function ActivarDesactivarEtiqueta($http, $q, CONFIG, etiqueta)
{
    var q = $q.defer();

    $http({
          method: 'POST',
          url: CONFIG.APIURL + '/ActivarDesactivarEtiqueta',
          data: etiqueta

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });

    return q.promise;
}

function BorrarEtiqueta($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarEtiqueta',
          data: id

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve([{Estatus:response.status}]);

     });
    return q.promise;
}
