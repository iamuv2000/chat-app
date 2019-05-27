const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages') //Selectinwe will render the messageg the position where 
const $sidebar = document.querySelector('#sidebar') 

//templates
const $messageTemplate = document.querySelector('#message-template').innerHTML  //Selecting the html of the template
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoScroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the last message, ie, height od new message
    const newMessageStyles = getComputedStyle($newMessage)  //styles
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)    //margin value
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin    //total heigth, message height+margin
    
    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const contentHeight = $messages.scrollHeight //total height we can scroll


    //How far have I scrolled
    const scrollOffset= $messages.scrollTop + visibleHeight //how far from bottom are we?

    if(contentHeight - newMessageHeight <= scrollOffset){ //before the message were we at the bottom?
        $messages.scrollTop = $messages.scrollHeight //scroll to down
    } 

}

socket.on('message',(message)=>{
    console.log(message.text)
    const html = Mustache.render($messageTemplate,{
        message: message.text, //html contains the message templae and what to render to it, ie the object
        createdAt: moment(message.createdAt).format('h:mm a'),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend',html)  //We put the new message at the bottom of the message div
    autoScroll()

})

socket.on('locationMessage',(message)=>{
    console.log(message.url)
    const html = Mustache.render($locationTemplate,{
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable the form
    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
    
    socket.emit('sendMessage',message,(error)=>{
        
        //enable form

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },(ack)=>{
            $sendLocationButton.removeAttribute('disabled')
        
            console.log('Location shared!')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData',({room, users})=>{
    const html = Mustache.render($sidebarTemplate,{
        room,
        users,
    })
    $sidebar.innerHTML = html
})