const input = document.querySelector('input');
const form = document.querySelector('#message-form')
const button = document.querySelector('#send-location')
const messages =document.querySelector('#messages')

const messageTemplates = document.querySelector('#message-template').innerHTML
const locationTemplates = document.querySelector('#location-message-template').innerHTML
const sideBarTemplates =  document.querySelector("#sidebar-template").innerHTML

const { username, room } =Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () =>{

    //new message element
   const newMessage = messages.lastElementChild

   //new message height
   const newMessageStyles = getComputedStyle(newMessage)
   const newMessageMargin = parseInt(newMessageStyles.marginBottom)
   const newMessageHeight = newMessage.offsetHeight + newMessageMargin

   // visible height
   const visibleHeight = messages.offsetHeight
   //height of the message container //total height we can scroll upto
    const containerHeight = messages.scrollHeight

    //how far i scrolled // amount of numbetr i have scrolled from top
    const scrollOffset = (messages.scrollTop + visibleHeight)*2

    if(containerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop =messages.scrollHeight
    }
}

const socket =io()

socket.on('sendWelcome', (data) =>{
    console.log(data)
    const html = Mustache.render(messageTemplates,{
        username: data.username,
        data: data.text,
        createdAt: moment(data.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('sendLocation', (location) =>{
    console.log(location)
    const html = Mustache.render(locationTemplates, {
        username: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sideBarTemplates,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

document.querySelector('#message').addEventListener('click', (e) =>{
    e.preventDefault()
    input.setAttribute('disabled', 'disabled')
    const received = input.value;
    socket.emit('receivedMessage', (received), (error) => {
        input.removeAttribute('disabled')
        input.focus()
        input.value='';
        if(error){
            console.log(error)
        }
        console.log('Message delivered')
    })
})
document.querySelector('#send-location').addEventListener('click', (e) => {
    e.preventDefault()
    button.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const location= {
            "latitude": position.coords.latitude,
            "longitude": position.coords.longitude
        }
      socket.emit('sendLocation', (location),() =>{
        button.removeAttribute('disabled')
          console.log("Location Shared")
      })
    })
})
socket.emit('join', {username, room} , (error) => {
    if(error) {
        alert(error)
        location.href ='/'
    }
})