<script setup lang="ts">
  // const { isDark } = useColorMode(true)
  import io from 'socket.io-client'
  const socket = io('http://localhost:8000')
  socket.on('connect', () => {
    console.log('Connected to server')
  })
  socket.on('welcome', (message) => {
    alert('Received welcome message: ' + message)
    socket.emit('message', 'Hello from the client!')
  })

  socket.on('ping', () => {
    console.log('Received ping from server')
    socket.emit('pong')
  })
</script>

<template>
  <div>
    Welcome to AdoNuxt!
  </div>
</template>