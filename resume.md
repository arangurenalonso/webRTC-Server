# io.emit(event, data):

- Envía el evento a todos los clientes conectados al servidor, sin importar en
  qué sala estén.
- Ejemplo: Todos los usuarios conectados al servidor reciben el evento.
- Uso típico: Notificar a todos los usuarios de algo global, como un anuncio o
  una notificación pública.

# socket.emit(event, data):

- Envía el evento solo al socket específico que hizo la conexión (es decir, al
  usuario que está asociado a ese socket).
- Ejemplo: Solo el cliente que ha creado la conexión recibirá el evento.
- Uso típico: Responder solo al cliente que hizo una solicitud.

# io.to(roomId).emit(event, data):

- Envía el evento a todos los usuarios que están en la sala especificada con
  roomId. Los usuarios deben haberse unido - previamente a esa sala usando
  socket.join(roomId).
- Ejemplo: Solo los usuarios de la sala específica recibirán el evento.
- Uso típico: Para casos en los que solo los usuarios en una sala (como en un
  chat, una videollamada, o un juego) deben recibir el evento.

# socket.broadcast.emit(event, data):

- Envía el evento a todos los demás sockets conectados al servidor, excepto al
  socket que emitió el evento.
- Ejemplo: Si un usuario hace una acción (como escribir en un chat), todos los
  demás usuarios lo ven, pero el propio usuario no recibe su propio mensaje de
  vuelta.
- Uso típico: Notificar a todos los demás usuarios de algo, pero sin incluir al
  usuario que inició la acción.

```
socket.broadcast.emit('message', 'Un nuevo usuario se ha unido');
```

# socket.broadcast.to(roomId).emit(event, data):

- Envía el evento a todos los usuarios que están en la sala roomId, excepto al
  socket que emitió el evento.
- Ejemplo: En un juego multijugador, cuando un usuario se une a una sala, los
  demás jugadores de la sala reciben el evento, pero el propio usuario no.
- Uso típico: Enviar notificaciones a los usuarios de una sala sin incluir al
  usuario que realizó la acción.

```
socket.broadcast.to('game-room-1').emit('player-joined', 'Un jugador se ha unido');
```

# socket.to(roomId).emit(event, data):

- Similar a io.to(roomId).emit, pero solo envía el evento a los clientes en esa
  sala, excepto al propio socket que lo envía.
- Ejemplo: En un chat, el usuario envía un mensaje y todos los demás en la sala
  lo ven, pero el usuario que lo envió no lo recibe de vuelta. js

```
socket.to('chat-room').emit('new-message', 'Hola a todos en la sala');
```

# io.in(roomId).emit(event, data):

- Funcionalmente igual a io.to(roomId).emit, envía el evento a todos los sockets
  conectados en la sala roomId.
- Puedes usar in en lugar de to, dependiendo de tus preferencias, ya que tienen
  el mismo efecto.

```
io.in('chat-room').emit('new-message', 'Mensaje para todos en la sala');
```

# io.of(namespace).emit(event, data):

- Este se utiliza para enviar eventos a todos los sockets conectados en un
  namespace específico.
- Un namespace en Socket.IO es como una subdivisión dentro del servidor, y te
  permite agrupar conexiones por "canales" independientes.
- Ejemplo: Si tienes diferentes partes de tu aplicación que requieren
  comunicaciones aisladas, puedes tener un namespace para "juegos" y otro para
  "chat", y los eventos no se cruzarán entre ellos.

```

const gameNamespace = io.of('/game');
gameNamespace.emit('start-game', { message: 'Lapartida ha comenzado' });
```

- Uso típico: Cuando deseas aislar diferentes partes de tu aplicación con
  comunicaciones independientes.

# Resumen:

- socket.emit: Solo envía el evento al cliente que inició la conexión.
- io.emit: Envía el evento a todos los clientes conectados.
- io.to(roomId).emit: Envía el evento a todos los clientes conectados a una sala
  específica.
  - io.in(roomId).emit: Sinónimo de io.to(roomId).emit.
- socket.broadcast.emit: Envía el evento a todos los clientes excepto al que lo
  emitió.
- socket.to(roomId).emit: Envía el evento a todos los demás usuarios de la sala
  excepto al propio socket.
  - socket.broadcast.to(roomId).emit: Envía el evento a todos los clientes en
    una sala específica excepto al que lo emitió.
- io.of(namespace).emit: Envía el evento a todos los clientes dentro de un
  namespace específico.
