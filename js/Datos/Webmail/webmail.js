app.factory('Webmail',Webmail);

Webmail.$inject = ['$http', '$q', 'CONFIG'];

function Webmail ($http, $q, CONFIG) {

  return {
    redireccionarServidor: redireccionarServidor,
    obtenerRegistroErrores: obtenerRegistroErrores,
    obtenerCuentas: obtenerCuentas,
    obtenerContactosPorCuenta: obtenerContactosPorCuenta,
    obtenerFoldersPorCuenta: obtenerFoldersPorCuenta,
    obtenerEstadoFoldersPorCuenta: obtenerEstadoFoldersPorCuenta,
    obtenerMensajesPorFolder: obtenerMensajesPorFolder,
    obtenerContenidoMensaje: obtenerContenidoMensaje,
    obtenerIdArchivoAdjunto: obtenerIdArchivoAdjunto,
    almacenarArchivoAdjunto: almacenarArchivoAdjunto,
    eliminarArchivoAdjunto: eliminarArchivoAdjunto,
    enviarMensaje: enviarMensaje,
    obtenerConfiguracionCuenta: obtenerConfiguracionCuenta,
    actualizarConfiguracionCuenta: actualizarConfiguracionCuenta,
    almacenarCredencialesCorreo: almacenarCredencialesCorreo,
    eliminarCuenta: eliminarCuenta,
    eliminarMensaje: eliminarMensaje,
    moverMensaje: moverMensaje,
    marcarMensajesComoLeidos: marcarMensajesComoLeidos,
    eliminarMensajes: eliminarMensajes
  };

  function redireccionarServidor (servidor) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/RedireccionarServidorWebmail',
      params: {servidor:servidor}
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {
      defered.reject(response);
    });

    return promise;

  }

  function obtenerRegistroErrores() {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerRegistroErroresWebmail'
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {
      defered.reject(response);
    });

    return promise;
  }

  function obtenerCuentas() {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerCuentasWebmail'
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {
      defered.reject(response);
    });

    return promise;
  }

  function obtenerContactosPorCuenta(correo_id) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerContactosPorCuentaWebmail',
      params: {correo_id:correo_id}
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {
      defered.reject(response);
    });

    return promise;
  }

  function obtenerFoldersPorCuenta(indice, correo_id, peticion, ignorar_carga) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      ignoreLoadingBar: ignorar_carga,
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerFoldersPorCuentaWebmail',
      params: {correo_id:correo_id},
      timeout: peticion.promise
    }).then(function successCallback(response) {

      response.data.indice = indice;
      defered.resolve(response.data);

    }, function errorCallback(response) {
      response.data = {indice:indice};
      defered.reject(response);
    });

    return promise;
  }

  function obtenerEstadoFoldersPorCuenta(correo_id, ind_cuenta, peticion, ignorar_carga) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      ignoreLoadingBar: ignorar_carga,
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerEstadoFoldersPorCuentaWebmail',
      params: {correo_id:correo_id},
      timeout: peticion.promise
    }).then(function successCallback(response) {

      response.data.ind_cuenta = ind_cuenta;
      defered.resolve(response.data);

    }, function errorCallback(response) {
      response.data = {ind_cuenta: ind_cuenta};
      defered.reject(response);
    });

    return promise;
  }

  function obtenerMensajesPorFolder(correo_id, folder_id, pagina, peticion, ignorar_carga, busqueda) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      ignoreLoadingBar: ignorar_carga,
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerMensajesPorFolderWebmail',
      params: {correo_id:correo_id, folder_id:folder_id, pagina:pagina, busqueda:busqueda},
      timeout: peticion.promise
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {
      defered.reject(response);
    });

    return promise;
  }

  function obtenerContenidoMensaje(correo_id, ruta_folder, mensaje_id) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerContenidoMensajeWebmail',
      params: {correo_id:correo_id, ruta_folder:ruta_folder, mensaje_id:mensaje_id}
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {
      defered.reject(response);
    });

    return promise;
  }

  function obtenerIdArchivoAdjunto(indice) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      ignoreLoadingBar: true,
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerIdArchivoAdjuntoWebmail'
    }).then(function successCallback(response) {

      response.data.indice = indice;
      defered.resolve(response.data);

    }, function errorCallback(response) {

      response.data = {indice:indice};
      defered.reject(response);

    });

    return promise;
  }

  function almacenarArchivoAdjunto (archivo, indice, cancelar) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      ignoreLoadingBar: true,
      method: 'POST',
      url: CONFIG.APIURL + '/AlmacenarArchivoAdjuntoWebmail',
      data:archivo,
      headers: {"Content-type": undefined},
      transformRequest: angular.identity,
      timeout: cancelar.promise,
      uploadEventHandlers: {
        progress: function(e) {
          if (e.lengthComputable) {
            defered.notify({indice: indice, progreso:Math.trunc((e.loaded / e.total) * 100) });
          }
        }
      }
    }).then(function successCallback(response) {

      response.data.indice = indice;
      defered.resolve(response.data);

    }, function errorCallback(response) {

      response.data = {indice:indice};
      defered.reject(response);

    });

    return promise;

  }

  function eliminarArchivoAdjunto (id) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      ignoreLoadingBar: true,
      method: 'DELETE',
      url: CONFIG.APIURL + '/EliminarArchivoAdjuntoWebmail',
      data:id
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;

  }

  function enviarMensaje (datos) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'POST',
      url: CONFIG.APIURL + '/EnviarMensajeWebmail',
      data:datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;

  }

  function obtenerConfiguracionCuenta (correo_id, tipo_servidor) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerConfiguracionCuentaWebmail',
      params: {correo_id:correo_id, tipo_servidor:tipo_servidor}
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {
      defered.reject(response);
    });

    return promise;
  }

  function actualizarConfiguracionCuenta (datos) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'PUT',
      url: CONFIG.APIURL + '/ActualizarConfiguracionCuentaWebmail',
      data:datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;

  }

  function almacenarCredencialesCorreo (datos) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'POST',
      url: CONFIG.APIURL + '/AlmacenarCredencialesCorreoWebmail',
      data:datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;

  }

  function eliminarCuenta (datos) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'DELETE',
      url: CONFIG.APIURL + '/EliminarCuentaWebmail',
      data:datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;

  }

  function eliminarMensaje(correo_id, ruta_folder, mensaje_id, papelera_id) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'DELETE',
      url: CONFIG.APIURL + '/EliminarMensajeWebmail',
      data: {correo_id:correo_id, ruta_folder:ruta_folder, mensaje_id:mensaje_id, papelera_id:papelera_id}
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {
      defered.reject(response);
    });

    return promise;
  }

  function moverMensaje(correo_id, ruta_folder, mensaje_id, destino_id) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'PUT',
      url: CONFIG.APIURL + '/MoverMensajeWebmail',
      data: {correo_id:correo_id, ruta_folder:ruta_folder, mensaje_id:mensaje_id, destino_id:destino_id}
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {
      defered.reject(response);
    });

    return promise;
  }

  function marcarMensajesComoLeidos(datos) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'POST',
      url: CONFIG.APIURL + '/MarcarMensajesComoLeidosWebmail',
      data:datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;

  }

  function eliminarMensajes(datos) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'DELETE',
      url: CONFIG.APIURL + '/EliminarMensajesWebmail',
      data: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {
      defered.reject(response);
    });

    return promise;
  }

}
