let ws;

windows.addEventListener('DOMContentLoaded', ()=>{
    ws = new WebSocket('ws://localhost:3000/ws');
    ws.addEventListener('open', onConnectionOpen);
    ws.addEventListener('open', onMessageReceived);
})

function onConnectionOpen(){
    console.log('Connection Opened');
}

function onMessageReceived(event){
    console.log('Message Received ', event);
}