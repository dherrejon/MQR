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

      }).success(function(data)
        {
            var tipoInformacion = []; 
            for(var k=0; k<data.length; k++)
            {
                tipoInformacion[k] = new TipoInformacion();
                tipoInformacion[k] = SetTipoInformacion(data[k]);
            }
    
            q.resolve(tipoInformacion);  
        }).error(function(data, status){
            q.resolve(status);
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

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve(status);

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

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}


  