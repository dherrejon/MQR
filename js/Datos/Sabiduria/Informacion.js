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
        this.Hecho = '0';

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

      }).then(function(response)
        {
            var informacion = [];
            if(response.data[0].Estatus == "Exito")
            {
                for(var k=0; k<response.data[1].Informacion.length; k++)
                {
                    informacion[k] = new Informacion();
                    informacion[k] = SetInformacion(response.data[1].Informacion[k]);
                }
            }

            q.resolve(informacion);
        }, function(response){
            q.resolve(response.status);
     });
    return q.promise;
}


function EliminarInformacion($http, $q, CONFIG, datos)
{
    var q = $q.defer();

    $http({
          method: 'DELETE',
          url: CONFIG.APIURL + '/EliminarInformacion',
          data: datos
      }).then(function(response)
        {
            q.resolve(response.data);
        }, function(response){
            q.resolve(response.status);
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
    informacion.Hecho = data.Hecho;

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

      }).then(function(response)
        {
            if(response.data[0].Estatus == "Exitoso")
            {
                q.resolve(response.data);
            }
            else
            {
                q.resolve(response.data);
            }


        }, function(response){
            q.resolve(response.status);

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

      }).then(function(response)
        {
            if(response.data[0].Estatus == "Exitoso")
            {
                q.resolve(response.data);
            }
            else
            {
                q.resolve(response.data);
            }
        }, function(response){
            q.resolve(response.status);

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
      }).then(function(response)
        {
            if(response.data[0].Estatus == "Exito")
            {
                q.resolve(response.data[1].Etiqueta);
            }
            else
            {
                q.resolve([]);
            }

        }, function(response){
            q.resolve(response.status);
     });
    return q.promise;
}


function GetEtiquetasInformacion($http, $q, CONFIG)
{
    var q = $q.defer();

    $http({
          method: 'GET',
          url: CONFIG.APIURL + '/GetEtiquetasInformacion'
      }).then(function(response)
        {
            if(response.data[0].Estatus == "Exito")
            {
                q.resolve(response.data[1].Etiqueta);
            }
            else
            {
                q.resolve([]);
            }

        }, function(response){
            q.resolve(response.status);
     });
    return q.promise;
}

function GetTemaInformacion($http, $q, CONFIG)
{
    var q = $q.defer();

    $http({
          method: 'GET',
          url: CONFIG.APIURL + '/GetTemaInformacion'
      }).then(function(response)
        {
            if(response.data[0].Estatus == "Exito")
            {
                q.resolve(response.data[1].Tema);
            }
            else
            {
                q.resolve([]);
            }

        }, function(response){
            q.resolve(response.status);
     });
    return q.promise;
}

function GetArchivoInformacion($http, $q, CONFIG, id)
{
    var q = $q.defer();

    $http({
          method: 'GET',
          url: CONFIG.APIURL + '/GetArchivoInformacion/'+id,
      }).then(function(response)
        {
            if(response.data[0].Estatus == "Exito")
            {
                q.resolve(response.data[1].Archivo[0]);
            }
            else
            {
                q.resolve([]);
            }

        }, function(response){
            q.resolve([]);
     });
    return q.promise;
}
