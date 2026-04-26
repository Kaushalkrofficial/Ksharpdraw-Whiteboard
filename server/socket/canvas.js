// server/socket/canvas.js
module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-board', ({ boardId, user }) => {
      socket.join(boardId);
      socket.data = { boardId, user };
      socket.to(boardId).emit('user-joined', user);
    });

    socket.on('canvas-update', ({ boardId, delta }) => {
      socket.to(boardId).emit('canvas-update', delta);
    });

    socket.on('cursor-move', ({ boardId, user, x, y }) => {
      socket.to(boardId).emit('cursor-move', { user, x, y });
    });

    socket.on('chat-message', ({ boardId, user, text }) => {
      io.to(boardId).emit('chat-message', {
        user, text, time: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      const { boardId, user } = socket.data || {};
      if (boardId && user)
        socket.to(boardId).emit('user-left', user);
    });
  });
};