
app.service('Notificaciones', Notificaciones);

Notificaciones.$inject = ['$rootScope', '$window', '$http', '$q', 'CONFIG'];

function Notificaciones ($rootScope, $window, $http, $q, CONFIG) {

  var socket = null;
  var inicializando = false;
  var conectado = false;

  return {
    conectar: conectar,
    desconectar: desconectar,
    obtenerNotificacionesIniciales: obtenerNotificacionesIniciales,
    obtenerNotificaciones: obtenerNotificaciones,
    almacenarNotificacionEnviarRecurso: almacenarNotificacionEnviarRecurso,
    marcarNotificacionLeida: marcarNotificacionLeida,
    eliminarNotificacion: eliminarNotificacion
  };

  function conectar() {

    if (conectado || inicializando) {
      return false;
    }

    inicializando = true;

    socket = io.connect('http://localhost:4040', {
      forceNew:true
    });

    socket.on('connect', function(){
      // console.log("conect");
      inicializando = false;
      conectado = true;

      socket.on('authenticated', function () {
        // console.log("auth");
        // console.log(socket.id);
        obtenerNotificacionesIniciales();
      });

      socket.on('unauthorized', function(msg) {
        // console.log("unauthorized: " + JSON.stringify(msg.data));
      });

      socket.emit('authenticate', {
        token:$window.sessionStorage.getItem('Sistema_MQR')
      });

    });

    socket.on('disconnect', function(){
      // console.log("desc");
      conectado = false;
      inicializando = false;
    });

  }

  function desconectar() {

    socket.disconnect();
    conectado = false;
    inicializando = false;

  }

  function inicializarNotificaciones(estado_respuesta, contenido_respuesta) {

    $rootScope.$broadcast(
      'cargar_notificaciones_iniciales',
      {
        estado:estado_respuesta,
        contenido:contenido_respuesta.notifiaciones,
        noleidas: contenido_respuesta.notifiaciones_noleidas,
        obtener_mas: contenido_respuesta.notifiaciones_restantes,
        ultimo_id: contenido_respuesta.ultimo_id
      }
    );

    socket.on('nueva_notificacion', function(datos) {
      $rootScope.$broadcast('nueva_notificacion',datos);
    });

  }

  function obtenerNotificacionesIniciales() {

    $http({
      ignoreLoadingBar: true,
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerNotificacionesPorUsuario',
      params: {ultima_notificacion_id: -1}
    }).then(function successCallback(response) {

      inicializarNotificaciones(true, response.data);

    }, function errorCallback(response) {

      inicializarNotificaciones(false, response);

    });

  }


  function obtenerNotificaciones(datos) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/ObtenerNotificacionesPorUsuario',
      params: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;

  }


  function almacenarNotificacionEnviarRecurso(datos) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'POST',
      url: CONFIG.APIURL + '/EnviarRecurso',
      data: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;

  }


  function marcarNotificacionLeida(datos) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      ignoreLoadingBar: true,
      method: 'PUT',
      url: CONFIG.APIURL + '/MarcarNotificacionLeida',
      data: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;
  }

  function eliminarNotificacion(datos) {

    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'DELETE',
      url: CONFIG.APIURL + '/EliminarNotificacion',
      data: datos
    }).then(function successCallback(response) {

      defered.resolve(response.data);

    }, function errorCallback(response) {

      defered.reject(response);

    });

    return promise;
  }

}
