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

      }).success(function(data)
        {
            var tema = []; 
            for(var k=0; k<data.length; k++)
            {
                tema[k] = new Tema();
                tema[k] = SetTema(data[k]);
            }
    
            q.resolve(tema);  
        }).error(function(data, status){
            q.resolve(status);
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

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve(status);

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

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}



  