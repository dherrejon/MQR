
app.service('Amistad',Amistad);

Amistad.$inject = ['$http', '$q', 'CONFIG'];

function Amistad ($http, $q, CONFIG) {

  return {
    enviarSolicitud: enviarSolicitud,
    consultarSolicitud: consultarSolicitud,
    consultarSolicitudesEnviadas: consultarSolicitudesEnviadas,
    consultarSolicitudesRecibidas: consultarSolicitudesRecibidas,
    obtenerSolicitudRecibida: obtenerSolicitudRecibida,
    consultarListaAmigos: consultarListaAmigos,
    obtenerDatosAmigo: obtenerDatosAmigo,
    aceptarSolicitud: aceptarSolicitud,
    cancelarSolicitud: cancelarSolicitud,
    eliminarAmigo: eliminarAmigo
  };

  function enviarSolicitud(datos) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'POST',
      url: CONFIG.APIURL + '/EnviarSolicitudAmistad',
      data: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;
  }

  function consultarSolicitud(datos) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/ConsultarSolicitudAmistad',
      params: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;
  }

  function consultarSolicitudesEnviadas() {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerSolicitudesEnviadas'
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;
  }


  function consultarSolicitudesRecibidas() {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerSolicitudesRecibidas'
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;
  }


  function obtenerSolicitudRecibida(datos) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerSolicitudRecibida',
      params: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;
  }


  function consultarListaAmigos() {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerListaAmigos'
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;
  }


  function obtenerDatosAmigo(datos) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerDatosAmigo',
      params: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;
  }


  function aceptarSolicitud(datos) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'PUT',
      url: CONFIG.APIURL + '/AceptarSolicitudAmistad',
      data: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;
  }


  function cancelarSolicitud(datos) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'DELETE',
      url: CONFIG.APIURL + '/CancelarSolicitudAmistad',
      data: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;
  }


  function eliminarAmigo(datos) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'DELETE',
      url: CONFIG.APIURL + '/EliminarAmigo',
      data: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;
  }

}
