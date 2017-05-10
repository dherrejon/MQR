class Actividad
{
    constructor()
    {
        this.ActividadId = "";
        this.Nombre = "";
        this.FechaCreacion = "";
        this.Notas = "";
        this.Frecuencia = new Frecuencia();
        this.Tema = [];
        this.Etiqueta = [];
        this.Imagen = [];
    }
}

function GetActividad($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetActividad/' + usuarioId,

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                var actividad = []; 
                for(var k=0; k<data[1].Actividad.length; k++)
                {
                    actividad[k] = SetActividad(data[1].Actividad[k]);
                }
                q.resolve(actividad); 
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

function SetActividad(data)
{
    var actividad = new Actividad();
    
    actividad.ActividadId = data.ActividadId;
    actividad.Nombre = data.Nombre;
    actividad.FechaCreacion = data.FechaCreacion;
    actividad.Notas = data.Notas;
    
    if(data.Notas !== null)
    {
         actividad.NotasHTML = data.Notas.replace(/\r?\n/g, "<br>");
    }
    else
    {
         actividad.NotasHTML = "";
    }
    
    if(data.FrecuenciaId != null)
    {
        actividad.Frecuencia.FrecuenciaId = data.FrecuenciaId;
        actividad.Frecuencia.Nombre = data.NombreFrecuencia;
    }
    
    return actividad;
}

function AgregarActividad($http, CONFIG, $q, actividad)
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarActividad',
          data: actividad

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function EditarActividad($http, CONFIG, $q, actividad)
{
    var q = $q.defer();

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarActividad',
          data: actividad

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function BorrarActividad($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({      
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarActividad',
          data: id

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}


//---------- Otras operaciones ---------------
function GetTemaPorActividad($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetTemaPorActividad/' + usuarioId,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}

function GetEtiquetaPorActividad($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetEtiquetaPorActividad/' + usuarioId,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}


  