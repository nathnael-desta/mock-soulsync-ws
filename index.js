import { jwtDecode } from 'jwt-decode';
import { WebSocketServer } from "ws";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import url from "url";

const server = http.createServer();
const wsServer = new WebSocketServer({ server });

const port = 8000;
const connections = {};
const users = {};

const handleMessage = (bytes) => {
  const message = JSON.parse(bytes.toString());
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
  const { token } = url.parse(request.url, true).query;
  const decoded = jwtDecode(token);
  console.log(`connected`, decoded);
  const userId = decoded.sub;
  connections[userId] = connection;

  connection.on("message", (message) => handleMessage(message, userId));
  connection.on("close", () => handleClose(userId));
});

server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});
