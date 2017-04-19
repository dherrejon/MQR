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

      }).success(function(data)
        {
            var fuente = []; 
            for(var k=0; k<data.length; k++)
            {
                fuente[k] = new Fuente();
                fuente[k] = SetFuente(data[k]);
            }
    
            q.resolve(fuente);  
        }).error(function(data, status){
            q.resolve(status);
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

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve(status);

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

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve(status);

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
      }).success(function(data)
        {
            q.resolve(data);  
        }).error(function(data, status){
            q.resolve(status);
     }); 
    return q.promise;
}

function GetFuenteEtiqueta($http, $q, CONFIG, id)     
{
    var q = $q.defer();
    
    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetFuenteEtiqueta',
      }).success(function(data)
        {
            q.resolve(data);  
        }).error(function(data, status){
            q.resolve(status);
     }); 
    return q.promise;
}

function GetAutoresFuente($http, $q, CONFIG)     
{
    var q = $q.defer();
    
    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetAutoresFuente'
      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                q.resolve(data[1].Autor);  
            }
            else
            {
                q.resolve([]); 
            }
            
        }).error(function(data, status){
            q.resolve(status);
     }); 
    return q.promise;
}


  