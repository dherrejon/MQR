class Informacion
{
    constructor()
    {
        this.InformacionId = "";
        this.Tema = new Tema();
        this.Fuente = new Fuente();
        this.OrigenInformacion = new OrigenInformacion();
        this.TipoInformacion = new TipoInformacion();
        this.Contenido = "";
        this.Archivo = "";
        this.Etiqueta = [];
        
        this.NombreArchivo = [];
        this.ExtensionArchivo = [];
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
    informacion.Archivo = data.Archivo;
    
    informacion.NombreArchivo = data.NombreArchivo;
    informacion.ExtensionArchivo = data.ExtensionArchivo;
    
    informacion.ContenidoOriginal = data.Contenido;
    
    if(data.Contenido != null)
    {
        informacion.Contenido = data.Contenido.replace(/\r?\n/g, "<br>");
    }
    else
    {
        informacion.Contenido = "";
    }
    
    informacion.Tema.TemaId = data.TemaId;
    informacion.Tema.Nombre = data.NombreTema; 
    
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
                q.resolve("Fallo");
            }
            
            
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}

function EditarInformacion($http, CONFIG, $q, informacion)
{
    var q = $q.defer();
    
    var fd = new FormData();
    
    if(informacion.OrigenInformacion.OrigenInformacionId == "2" || informacion.OrigenInformacion.OrigenInformacionId == "3" && informacion.ArchivoSeleccionado)
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
                q.resolve("Fallo");
            }  
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
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
    origen[0].Nombre = "Comentario";
    
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





  