const path = require('path')
const http = require('http')
const express =require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/message')
const { generateLocationMessage } = require('./utils/message')
const { addUser, removeUser, getUsersInRoom, getUser } = require('./utils/user')

const app =express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) =>{

     socket.on('join', ({username, room}, callback) => {
              
        const {error, user} = addUser({ id: socket.id, username, room})

        if(error){
            return callback(error)
        }
      
        socket.join(user.room)
        socket.emit('sendWelcome', generateMessage('Admin','Welocme') )
        socket.broadcast.to(user.room).emit('sendWelcome',generateMessage('Admin',`${user.username} has joined!`)) 
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        socket.on('disconnect', () =>{
          const user = removeUser(socket.id)

          if(user){
            io.to(user.room).emit('sendWelcome', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })  
        }
        })
         
        callback()
     })

     socket.on('receivedMessage', (received, callback) =>{
         const filter = new Filter()

        const user = getUser(socket.id)

        
           io.to(user.room).emit('sendWelcome', generateMessage(user.username, received))
    

         callback ()
     })
     socket.on('sendLocation', (location, callback) => {
     const latitude = location.latitude
     const longitude = location.longitude

     const user = getUser(socket.id)
       
     io.to(user.room).emit('sendLocation', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        
     callback()
    })
})

port= process.env.PORT || 3000

server.listen(port, () =>{
    console.log("port is up on "+ port)
} )