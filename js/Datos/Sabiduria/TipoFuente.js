class TipoFuente
{
    constructor()
    {
        this.TipoFuenteId = "";
        this.Nombre = "";
    }
}

function GetTipoFuente($http, $q, CONFIG)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetTipoFuente',

      }).success(function(data)
        {
            var tipoFuente = []; 
            for(var k=0; k<data.length; k++)
            {
                tipoFuente[k] = new TipoFuente();
                tipoFuente[k] = SetTipoFuente(data[k]);
            }
    
            q.resolve(tipoFuente);  
        }).error(function(data, status){
            q.resolve(status);
     }); 
    return q.promise;
}

function SetTipoFuente(data)
{
    var tipoFuente = new TipoFuente();
    
    tipoFuente.TipoFuenteId = data.TipoFuenteId;
    tipoFuente.Nombre = data.Nombre;
    
    return tipoFuente;
}

function AgregarTipoFuente($http, CONFIG, $q, tipo)
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarTipoFuente',
          data: tipo

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}

//edita un consumible
function EditarTipoFuente($http, CONFIG, $q, tipo)
{
    var q = $q.defer();

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarTipoFuente',
          data: tipo

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}



  