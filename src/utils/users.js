const users = []

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id,username,room}) =>{
    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate data
    if(!username || !room){
        return {error: 'Username and room are required'}
    }

    //Check for existing user (unique)
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return {error: 'Username is already in use'}
    }

    //Store user
    const user = {
        id,
        username,
        room
    }
    users.push(user)
    return{user}
}

const removeUser = (id) =>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })
    if(index!== -1){
        return users.splice(index,1)[0]
    }
}

const getUser = (id) =>{
    const user = users.find((user)=> user.id === id)
    return user
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const usersInRoom = users.filter((user)=>user.room===room)
    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}