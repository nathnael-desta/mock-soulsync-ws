const { WebSocketServer } = require("ws");
const http = require("http");
const uuidv4 = require("uuid").v4;
const url = require("url");

const server = http.createServer();
const wsServer = new WebSocketServer({ server });

const port = 8000;
const connections = {};
const users = {};

const handleMessage = (bytes) => {
  const message = JSON.parse(bytes.toString());
  // {
  //   id: uuidv4(),
  //   type: 'CHAT',
  //   metadata: {
  //     userId: socket.user.id,  // mentor or mentee id
  //     conversationId: chat.metadata.conversationId,
  //   },
  //   payload: chat.payload,
  //   socket: socket,
  // };
  // socket = {
  //       userId: dd36a143-19d9-4486-907d-0251cb5455b8,
  //       socketId: 6053b544-29df-4f8c-b047-61ac88b98738,
  //       entryId: a20beb76-6816-40fd-8b49-d862475236b2
  // }
  Object.keys(connections).forEach((senderId) => {
    const connection = connections[senderId];
    const messageJson = JSON.stringify(message);
    connection.send(messageJson);
  });
};

const handleClose = (userId) => {
  console.log(`${userId} disconnected`);
  delete connections[userId];
};

wsServer.on("connection", (connection, request) => {
  const { userId } = url.parse(request.url, true).query;
  console.log(`${userId} connected`);
  connections[userId] = connection;
  // mentors[conversationId] = {

  // }
  connection.on("message", (message) => handleMessage(message, userId));
  connection.on("close", () => handleClose(userId));
});

server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});
