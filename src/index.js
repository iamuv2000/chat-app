const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,locationGenerateMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')
 
app.use(express.static(publicDirectoryPath))
-

io.on('connection',(socket)=>{
    console.log('New web socket connection')
     
    socket.on('join',({username,room},callback)=>{
        
        const {error,user} = addUser({
            id:socket.id,
            username,
            room
        })

        if(error){
            return callback(error)
        }
        
        socket.join(user.room)

        socket.emit('message',generateMessage('Welcome!','Admin')) 
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined`,'Admin'))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage',(message,callback)=>{
        const filter = new Filter()
        const user = getUser(socket.id)
        if(filter.isProfane(message)){
            return callback('I will tell your parents')
        }
        io.to(user.room).emit('message',generateMessage(message,user.username))  
        callback()  
    })

    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',locationGenerateMessage(coords.latitude,coords.longitude,user.username))
        callback()
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage(`${user.username} has left`,'Admin'))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            }) 
        }
           
    })

})



server.listen(port,()=>{
    console.log('Server is up on ',port)
})
