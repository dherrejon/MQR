class Cancion
{
    constructor()
    {
        this.CancionId = "";
        this.Titulo = "";
        this.Cancionero = "";
        this.NombreArchivo = "";
        
        this.Artista = [];
    }
}

function GetCancion($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetCancion/' + usuarioId,

      }).success(function(data)
        {
            
            if(data[0].Estatus = "Exito")
            {
                var cancion = []; 
                
                for(var k=0; k<data[1].Cancion.length; k++)
                {
                    cancion[k] = new Cancion();
                    cancion[k] = SetCancion(data[1].Cancion[k]);
                }
                
                q.resolve(cancion); 
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

function SetCancion(data)
{
    var cancion = new Cancion();
    
    cancion.CancionId = data.CancionId;
    cancion.Titulo = data.Titulo;
    //cancion.Cancionero = data.Cancionero;
    //cancion.NombreArchivo = data.NombreArchivo;
    
    return cancion;
}

function AgregarCancion($http, CONFIG, $q, cancion)
{
   var q = $q.defer();
    
    var fd = new FormData();
    
    if(cancion.ArchivoSeleccionado)
    {
        var file = cancion.Cancionero;
        fd.append('file', file);
    }
    
    fd.append('cancion', JSON.stringify(cancion));
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarCancion',
          data: fd,
          headers: 
          {
            "Content-type": undefined 
          }

      }).success(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                q.resolve(data);
            }
            else
            {
                q.resolve(data);
            }
            
            
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}

function EditarCancion($http, CONFIG, $q, cancion)
{
    
    var q = $q.defer();
    
    
    var fd = new FormData();
    
    if(cancion.ArchivoSeleccionado)
    {
        var file = cancion.Cancionero;
        fd.append('file', file);
    }
    
    fd.append('cancion', JSON.stringify(cancion));

    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/EditarCancion',
          data: fd,
          headers: 
          {
            "Content-type": undefined 
          }

      }).success(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                q.resolve(data);
            }
            else
            {
                q.resolve(data);
            }  
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise
}

function BorrarCancion($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({      
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarCancion',
          data: id

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}

//---------------- Datos cancion
function GetCancionero($http, $q, CONFIG, id)     
{
    var q = $q.defer();
    
    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetCancionero/'+id,
      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                q.resolve(data[1].Cancionero[0]);  
            }
            else
            {
                q.resolve([]);      
            }
            
        }).error(function(data, status){
            q.resolve([]);
     }); 
    return q.promise;
}

function GetArtistaPorCancion($http, $q, CONFIG, id)     
{
    var q = $q.defer();
    
    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetArtistaPorCancion/'+id,
      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                q.resolve(data[1].Artista);  
            }
            else
            {
                q.resolve([]);      
            }
            
        }).error(function(data, status){
            q.resolve([]);
     }); 
    return q.promise;
}



  