var server     = require('http').createServer(),
io         = require('socket.io')(server),
logger     = require('winston'),
port       = 4040;

var socketioJwt = require('socketio-jwt');

var usuarios = {};

// Logger config
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { colorize: true, timestamp: true });
logger.info('SocketIO > listening on port ' + port);

io.sockets
.on('connection', socketioJwt.authorize({
    secret: '2017.s1St3m4MQr.M4R10Qu1J4DarZ',
    callback: false,
    timeout: 15000 //15000 15 seconds to send the authentication message
  })).on('authenticated', function(socket) {

    if (socket.decoded_token.hasOwnProperty('usr')) {
      if ('api'!=socket.decoded_token.usr) {
        usuarios[socket.decoded_token.usr] = socket.id;
      }
    }
    else {
      socket.disconnect();
    }

    logger.info('SocketIO > Connected socket ' + socket.id);

    socket.on('emitir_notificacion', function (contenido) {
      // logger.info('ElephantIO notificacion > ' + JSON.stringify(contenido));

      if (usuarios.hasOwnProperty(contenido.destinatario_id)) {
        logger.info('destinatario_id > ' + contenido.destinatario_id);
        socket.to(usuarios[contenido.destinatario_id]).emit(contenido.nombre_evento, contenido.datos);
      }

    });

    socket.on('disconnect', function () {

      logger.info('SocketIO > Disconnected socket ' + socket.id);

      if (usuarios.hasOwnProperty(socket.decoded_token.usr)) {
        delete usuarios[socket.decoded_token.usr];
      }

    });

});

server.listen(port);
