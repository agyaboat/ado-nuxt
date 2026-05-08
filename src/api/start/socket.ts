// start/ws.ts
import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'

let io

app.ready(() => {
  io = new Server(server.getNodeServer(), {
    path: '/socket.io', // must match client
    cors: { origin: '*' },
  })

  io.on('connection', (socket) => {
    console.log('connected:', socket.data)
    socket.emit('welcome', 'Welcome to AdoNuxt Socket.IO server!')

    socket.on('message', (msg) => {
      console.log('Received message:', msg)
      socket.emit('ping', `Echo: ${msg}`)
    })

    socket.on('pong', () => {
      console.log('Received pong from client')
      socket.emit('ping', 'ping from server')
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected')
    })
  })
})

export { io }
