app.factory('Chat',Chat);

Chat.$inject = ['$http', '$q', 'CONFIG'];

function Chat ($http, $q, CONFIG) {

  return {
    obtenerConversacionPorId: obtenerConversacionPorId,
    obtenerConversacionPorHashUsuario: obtenerConversacionPorHashUsuario,
    actualizarEstadoVistaConversacion: actualizarEstadoVistaConversacion,
    agregarConversacionPersonal:agregarConversacionPersonal,
    eliminarConversacionPersonal: eliminarConversacionPersonal,
    obtenerMensajesPorConversacion: obtenerMensajesPorConversacion,
    agregarMensaje: agregarMensaje
  };


  function obtenerConversacionPorId(datos) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      ignoreLoadingBar: true,
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerConversacionPorId',
      params: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;

  }

  function obtenerConversacionPorHashUsuario(datos) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      ignoreLoadingBar: true,
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerConversacionPorHashUsuario',
      params: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;

  }

  function actualizarEstadoVistaConversacion(datos) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      ignoreLoadingBar: true,
      method: 'PUT',
      url: CONFIG.APIURL + '/ActualizarEstadoVistaConversacion',
      data: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;

  }

  function agregarConversacionPersonal(datos, conversacion, mensaje) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      ignoreLoadingBar: true,
      method: 'POST',
      url: CONFIG.APIURL + '/AgregarConversacionPersonal',
      data:datos
    }).then(function successCallback(response) {

      response.data.conversacion = conversacion;
      response.data.mensaje = mensaje;
      defered.resolve(response.data);

    }, function errorCallback(response) {

      response.data = {
        conversacion:conversacion,
        mensaje:mensaje
      };
      defered.reject(response);

    });

    return promise;

  }

  function eliminarConversacionPersonal(datos) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'DELETE',
      url: CONFIG.APIURL + '/EliminarConversacionPersonal',
      data: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;

  }

  function obtenerMensajesPorConversacion(datos) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      ignoreLoadingBar: true,
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerMensajesPorConversacion',
      params: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;

  }

  function agregarMensaje(datos, conversacion, mensaje) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      ignoreLoadingBar: true,
      method: 'POST',
      url: CONFIG.APIURL + '/AgregarMensaje',
      data:datos
    }).then(function successCallback(response) {

      response.data.conversacion = conversacion;
      response.data.mensaje = mensaje;
      defered.resolve(response.data);

    }, function errorCallback(response) {

      response.data = {
        conversacion:conversacion,
        mensaje:mensaje
      };
      defered.reject(response);

    });

    return promise;

  }

}
