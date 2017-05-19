class Diario
{
    constructor()
    {
        this.DiarioId = "";
        this.Fecha = "";
        this.Notas = "";
        
        this.Etiqueta = [];
        this.Tema = [];
    }
}

function GetDiario($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetDiario/' + usuarioId,

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                q.resolve(data[1].Diario); 
            }
            else
            {
                q.resolve([], []);
            }
             
        }).error(function(data, status){
            q.resolve([], []);
     }); 
    return q.promise;
}

function SetDiario(data)
{
    var diario = new Diario();
    
    diario.DiarioId = data.DiarioId;
    diario.Fecha = data.Fecha;
    diario.Notas = data.Notas;
    
    diario.FechaFormato = TransformarFecha(data.Fecha);
    
    if(data.Notas !== null)
    {
         diario.NotasHTML = data.Notas.replace(/\r?\n/g, "<br>");
    }
    else
    {
         diario.NotasHTML = "";
    }
    
    return diario;
}

function AgregarDiario($http, CONFIG, $q, actividad)
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

/*function EditarActividad($http, CONFIG, $q, actividad)
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
}*/


//---------- Otras operaciones ---------------
function GetTemaPorDiario($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetTemaPorDiario/' + usuarioId,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}

function GetEtiquetaPorDiario($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetEtiquetaPorDiario/' + usuarioId,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}


  