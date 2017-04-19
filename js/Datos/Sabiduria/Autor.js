/*------Autor---------*/
class Autor
{
    constructor()
    {
        this.AutorId = "";
        this.Nombre = "";
        this.Apellidos = "";
        this.Prefijo = new Prefijo();
    }
}

function GetAutor($http, $q, CONFIG)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetAutor',

      }).success(function(data)
        {
            var autor = []; 
            for(var k=0; k<data.length; k++)
            {
                autor[k] = new Autor();
                autor[k] = SetAutor(data[k]);
            }
    
            q.resolve(autor);  
        }).error(function(data, status){
            q.resolve(status);
     }); 
    return q.promise;
}

function SetAutor(data)
{
    var autor = new Autor();
    
    autor.AutorId = data.AutorId;
    autor.Nombre = data.Nombre;
    autor.Apellidos = data.Apellidos;
    
    autor.Prefijo.Abreviacion = data.Abreviacion;
    autor.Prefijo.PrefijoId = data.PrefijoId;
    
    return autor;
}

function AgregarAutor($http, CONFIG, $q, autor)
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarAutor',
          data: autor

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}

//edita un consumible
function EditarAutor($http, CONFIG, $q, autor)
{
    var q = $q.defer();

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarAutor',
          data: autor

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}



  