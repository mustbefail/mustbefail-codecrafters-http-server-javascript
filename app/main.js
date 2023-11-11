const net = require('net')
const { resolve } = require('path')
const fs = require('fs')


// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log('Logs from your program will appear here!')

const DIR = process.argv[process.argv.length - 1]

const getParams = (reqPath) => {
  const [path, ...params] = reqPath.split('/').filter(Boolean)
  if(params.length) {
    return {
      path,
      id: params.join('/'),
    }
  }

  return { path }

}

const parseHttpRequest = (data) => {
  const [startLine, ...lines] = data.toString().trim().split('\r\n')
  const [method, path, version] = startLine.split(' ')
  const userAgent = lines?.find((header) => header.includes('User-Agent'))
  const headers = {
    host: lines?.[0]?.split(' ')[1],
    userAgent: userAgent?.split(' ')[1],
  }
  const req = {
    method,
    path,
    version,
    headers,
    params: {},
  }
  return { req }
}

const errorHandler = (req, socket) => {
  socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`)
}

const fileHandler = (req, socket) => {
  const fileName = req.params.id
  const {readFileSync} = fs


  try {
    const filePath = resolve(`${DIR}/${fileName}`)
    const content = readFileSync(filePath, {encoding: 'utf8'})
    console.log(content)
    const response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}\r\n\r\n`
    socket.write(response)
  } catch (e) {
    console.error(e)
    errorHandler(req, socket)
  }

}

const routes = {
  '/': {
    GET: (req, socket) => {
      socket.write(`HTTP/1.1 200 OK\r\n\r\n`)
    },
  },
  '/echo/:id': {
    GET: (req, socket) => {
      const { params } = req
      const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${params.id.length}\r\n\r\n${params.id}\r\n\r\n`
      socket.write(response)
    },
  },
  '/user-agent': {
    GET: (req, socket) => {
      const { headers } = req
      const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${headers.userAgent.length}\r\n\r\n${headers.userAgent}\r\n\r\n`
      socket.write(response)
    },
  },
  '/files/:id': {
    GET: fileHandler,
  },
}

const router = (req, socket) => {
  const {
    method,
    path,
  } = req
  const {
    path: routePath,
    id,
  } = getParams(path)
  const route = routes[`/${routePath || ''}${id ? '/:id' : ''}`]
  req.params.id = id

  if(route && route[method]) {
    route[method](req, socket)
  } else {
    errorHandler(req, socket)
  }
  socket.end()
}

const handleRequest = (socket) => {
  socket.on('data', (data) => {
    const { req } = parseHttpRequest(data)
    router(req, socket)
  })
}

const server = net.createServer((socket) => {
  handleRequest(socket)

  socket.on('close', () => {
    socket.end()
    // server.close()
  })
})

server.listen(4221, 'localhost')
