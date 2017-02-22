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

      }).success(function(data)
        {
            var prefijo = []; 
            for(var k=0; k<data.length; k++)
            {
                prefijo[k] = new Prefijo();
                prefijo[k] = SetPrefijo(data[k]);
            }
    
            q.resolve(prefijo);  
        }).error(function(data, status){
            q.resolve(status);
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

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve(status);

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

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}


  