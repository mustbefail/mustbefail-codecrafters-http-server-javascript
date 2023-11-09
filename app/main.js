const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const pattern = new RegExp(/\/(?<=\/echo\/)(.*)/);
    const dataString = data.toString();
    const [startLine] = dataString.trim().split("\r\n");
    const [method, path, version] = startLine.split(" ");
    const res = path.match(pattern)?.[1];

    if(path === '/') {
      socket.write(`HTTP/1.1 200 OK\r\n`);
      socket.end();
    }

    if(res) {
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: test/plain\r\n\r\n${res}`)
      socket.end();
    }
  });
  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
