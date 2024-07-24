const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

// HTTP 서버 설정
const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end("Error loading index.html");
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (req.method === "GET" && req.url === "/favicon.ico") {
    res.writeHead(204);
    res.end();
  } else {
    res.writeHead(404);
    res.end();
  }
});

// 웹소켓 서버 설정
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", (socket) => {
  clients.push(socket);

  socket.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
          console.log("접속");
        }
      });
    } catch (e) {
      console.error("Error parsing message", e);
    }
  });

  socket.on("close", () => {
    clients = clients.filter((client) => client !== socket);
  });
});

// 서버 시작
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
