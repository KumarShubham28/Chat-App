const path = require('path')
const http = require('http')
const express =require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/message')
const { generateLocationMessage } = require('./utils/message')

const app =express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) =>{

     socket.on('join', ({username, room}) => {
      
        socket.join(room)
        socket.emit('sendWelcome', generateMessage('Welocme to the server') )
        socket.broadcast.to(room).emit('sendWelcome',generateMessage(`${username} has joined!`)) 
        
        socket.on('disconnect', () =>{
            io.emit('sendWelcome', generateMessage(`${username} has left!`))
        })

     })

     socket.on('receivedMessage', (received, callback) =>{
         const filter = new Filter()

         if(filter.isProfane(received)){
              return callback('Profanity is not allowed')
         }
         io.emit('sendWelcome', generateMessage(received))
         callback ()
     })
     socket.on('sendLocation', (location, callback) => {
     const latitude = location.latitude
     const longitude = location.longitude
     io.emit('sendLocation', generateLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`))
     callback()
    })

    //  socket.on('disconnect', () =>{
    //      io.emit('sendWelcome', generateMessage('A user has left!'))
    //  })
})

port= process.env.PORT || 3000

server.listen(port, () =>{
    console.log("port is up on "+ port)
} )