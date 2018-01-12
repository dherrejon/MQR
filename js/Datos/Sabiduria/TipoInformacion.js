class TipoInformacion
{
    constructor()
    {
        this.TipoInformacionId = "";
        this.Nombre = "";
    }
}

function GetTipoInformacion($http, $q, CONFIG)
{
    var q = $q.defer();

    $http({
          method: 'GET',
          url: CONFIG.APIURL + '/GetTipoInformacion',

      }).then(function(response)
        {
            var tipoInformacion = [];
            for(var k=0; k<response.data.length; k++)
            {
                tipoInformacion[k] = new TipoInformacion();
                tipoInformacion[k] = SetTipoInformacion(response.data[k]);
            }

            q.resolve(tipoInformacion);
        }, function(response){
            q.resolve(response.status);
     });
    return q.promise;
}

function SetTipoInformacion(data)
{
    var tipoInformacion = new TipoInformacion();

    tipoInformacion.TipoInformacionId = data.TipoInformacionId;
    tipoInformacion.Nombre = data.Nombre;

    return tipoInformacion;
}

function AgregarTipoInformacion($http, CONFIG, $q, tipo)
{
    var q = $q.defer();

    $http({
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarTipoInformacion',
          data: tipo

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}

function EditarTipoInformacion($http, CONFIG, $q, tipo)
{
    var q = $q.defer();

    $http({
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarTipoInformacion',
          data: tipo

      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);

     });
    return q.promise;
}
