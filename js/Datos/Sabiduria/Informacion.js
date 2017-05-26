class Informacion
{
    constructor()
    {
        this.InformacionId = "";
        this.Tema = [];
        this.Fuente = new Fuente();
        this.OrigenInformacion = new OrigenInformacion();
        this.TipoInformacion = new TipoInformacion();
        this.Contenido = "";
        this.Seccion = "";
        this.Observacion = "";
        this.Archivo = "";
        this.Etiqueta = [];
        
        this.NombreArchivo = [];
        this.ExtensionArchivo = [];
        
        //-------- Origen Informacion 
        this.OrigenInformacion.OrigenInformacionId = "1";
        this.OrigenInformacion.Nombre = "Texto";
    }
}

function GetInformacion($http, $q, CONFIG)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetInformacion',

      }).success(function(data)
        {
            var informacion = [];
            if(data[0].Estatus == "Exito")
            {
                for(var k=0; k<data[1].Informacion.length; k++)
                {
                    informacion[k] = new Informacion();
                    informacion[k] = SetInformacion(data[1].Informacion[k]);
                }
            }
    
            q.resolve(informacion);  
        }).error(function(data, status){
            q.resolve(status);
     }); 
    return q.promise;
}

function SetInformacion(data)
{
    var informacion = new Informacion();
    
    informacion.InformacionId = data.InformacionId;
    
    informacion.Observacion = data.Observacion;
    informacion.Seccion = data.Seccion;
    informacion.Titulo = data.Titulo;
    
    informacion.ContenidoOriginal = data.Contenido;
    
    if(data.Contenido != null)
    {
        informacion.Contenido = data.Contenido.replace(/\r?\n/g, "<br>");
    }
    else
    {
        informacion.Contenido = "";
    }
    
    if(data.Observacion != null)
    {
        informacion.ObservacionHTML = data.Observacion.replace(/\r?\n/g, "<br>");
    }
    else
    {
        informacion.ObservacionHTML = "";
    }
    
    informacion.Fuente.FuenteId = data.FuenteId;
    informacion.Fuente.Nombre = data.NombreFuente;
    informacion.Fuente.TipoFuente.TipoFuenteId = data.TipoFuenteId;
    informacion.Fuente.TipoFuente.Nombre = data.NombreTipoFuente;
    
    informacion.TipoInformacion.TipoInformacionId = data.TipoInformacionId;
    informacion.TipoInformacion.Nombre = data.NombreTipoInformacion;
    
    informacion.OrigenInformacion.OrigenInformacionId = data.OrigenInformacionId;
    
    return informacion;
}

function AgregarInformacion($http, CONFIG, $q, informacion)
{
    var q = $q.defer();
    
    ChecarNulos(informacion, "Agregar");
    
    var fd = new FormData();
    
    if(informacion.OrigenInformacion.OrigenInformacionId == "2" || informacion.OrigenInformacion.OrigenInformacionId == "3" && informacion.ArchivoSeleccionado)
    {
        var file = informacion.Archivo;
        fd.append('file', file);
    }
    
    fd.append('informacion', JSON.stringify(informacion));
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarInformacion',
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

function EditarInformacion($http, CONFIG, $q, informacion)
{
    var q = $q.defer();
    ChecarNulos(informacion, "Editar");
    
    var fd = new FormData();
    
    if((informacion.OrigenInformacion.OrigenInformacionId == "2" || informacion.OrigenInformacion.OrigenInformacionId == "3") && informacion.ArchivoSeleccionado)
    {
        var file = informacion.Archivo;
        fd.append('file', file);
    }
    
    fd.append('informacion', JSON.stringify(informacion));
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/EditarInformacion',
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


function ChecarNulos(data, operacion)
{
    if(operacion == "Agregar")
    {
        if(data.Fuente.FuenteId.length == 0)
        {
            data.Fuente.FuenteId = null;
        }
        
        if(data.TipoInformacion.TipoInformacionId.length == 0)
        {
            data.TipoInformacion.TipoInformacionId = null;
        }
    }
    else if(operacion == "Editar")
    {   
        if(data.Fuente.FuenteId == null)
        {
            data.Fuente.FuenteId = "null";
        }
        else if(data.Fuente.FuenteId.length == 0 || data.Fuente.FuenteId == "0")
        {
            data.Fuente.FuenteId = "null";
        }
        
        if(data.TipoInformacion.TipoInformacionId.length == 0)
        {
            data.TipoInformacion.TipoInformacionId = null;
        }
    }
        
}

//------------------ Origen Informacion --------------------
class OrigenInformacion
{
    constructor()
    {
        this.OrigenInformacionId = "";
        this.Nombre = "";
    }
}

function GetOrigenInformacion()
{
    var origen = [];
    
    origen[0] = new OrigenInformacion();
    origen[0].OrigenInformacionId = "1";
    origen[0].Nombre = "Texto";
    
    origen[1] = new OrigenInformacion();
    origen[1].OrigenInformacionId = "2";
    origen[1].Nombre = "Imagen";
    
    origen[2] = new OrigenInformacion();
    origen[2].OrigenInformacionId = "3";
    origen[2].Nombre = "Archivo";
    
    return origen;
}

/*--------------------- Datos de la informacion ----------------------*/
function GetInformacionEtiqueta($http, $q, CONFIG, id)     
{
    var q = $q.defer();
    
    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetInformacionEtiqueta/'+id,
      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                q.resolve(data[1].Etiqueta);  
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


function GetEtiquetasInformacion($http, $q, CONFIG)     
{
    var q = $q.defer();
    
    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetEtiquetasInformacion'
      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                q.resolve(data[1].Etiqueta);  
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

function GetTemaInformacion($http, $q, CONFIG)     
{
    var q = $q.defer();
    
    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetTemaInformacion'
      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                q.resolve(data[1].Tema);  
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

function GetArchivoInformacion($http, $q, CONFIG, id)     
{
    var q = $q.defer();
    
    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetArchivoInformacion/'+id,
      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                q.resolve(data[1].Archivo[0]);  
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



  