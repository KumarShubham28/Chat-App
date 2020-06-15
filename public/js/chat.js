const input = document.querySelector('input');
const form = document.querySelector('#message-form')
const button = document.querySelector('#send-location')
const messages =document.querySelector('#messages')

const messageTemplates = document.querySelector('#message-template').innerHTML
const locationTemplates = document.querySelector('#location-message-template').innerHTML

const { username, room } =Qs.parse(location.search, { ignoreQueryPrefix: true });

const socket =io()

socket.on('sendWelcome', (data) =>{
    console.log(data)
    const html = Mustache.render(messageTemplates,{
        data: data.text,
        createdAt: moment(data.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
})

socket.on('sendLocation', (location) =>{
    console.log(location)
    const html = Mustache.render(locationTemplates, {
        location: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
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
socket.emit('join', {username, room})