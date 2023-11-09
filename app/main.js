const net = require('net')

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log('Logs from your program will appear here!')

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const pattern = new RegExp(/\/(?<=\/echo\/)(.*)/)
    const dataString = data.toString()
    const headers = dataString.trim().split('\r\n')
    const protocol = headers.find((header) => header.includes('HTTP'))
    const userAgent = headers.find((header) => header.includes('User-Agent'))
    const [method, path, version] = protocol?.split(' ')
    const resPath = path?.match(pattern)?.[1]

    if(path === '/') {
      socket.write(`HTTP/1.1 200 OK\r\n\r\n`)
      socket.end()
    } else if(resPath) {
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${resPath.length}\r\n\r\n${resPath}\r\n\r\n`)
      socket.end()
    } else if(path === '/user-agent') {
      const res = userAgent?.split(' ')[1];
      socket.write("HTTP/1.1 200 OK\r\n" +
        "Content-Type: text/plain\r\n" +
        `Content-Length: ${res.length}\r\n\r\n` +
        `${res}`);
      socket.end()
    } else {
      socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`)
      socket.end()
    }
  })
  socket.on('close', () => {
    socket.end()
    // server.close()
  })
})

server.listen(4221, 'localhost')
