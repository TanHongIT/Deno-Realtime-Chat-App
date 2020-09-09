let ws;
let chatUsersCtr = document.querySelector("#chatUsers");
let chatUsersCount = document.querySelector("#chatUsersCount");
let groupName = document.querySelector("#groupName");
let sendMessageForm = document.querySelector("#messageSendForm");
let chatMessagesCtr = document.querySelector("#chatMessages");

window.addEventListener("DOMContentLoaded", () => {
    ws = new WebSocket(`ws://localhost:3000/ws`);
    ws.addEventListener("open", onConnectionOpen);
    ws.addEventListener("message", onMessageReceived);
});

sendMessageForm.onsubmit = (ev) => {
    ev.preventDefault();
    if (!messageInput.value) {
        return;
    }
    const event = {
        event: "message",
        data: messageInput.value,
    };
    ws.send(JSON.stringify(event));
    messageInput.value = "";
};

function onConnectionOpen() {
    console.log('Connection Opened');
    const queryParams = getQueryParams();
    console.log(queryParams);
    if (!queryParams.name || !queryParams.group) {
        window.location.href = 'chat.html';
        return;
    }
    groupName.innerHTML = queryParams.group;
    const event = {
        event: 'join',
        groupName: queryParams.group,
        name: queryParams.name
    }
    ws.send(JSON.stringify(event));
}

function onMessageReceived(event) {
    console.log('Message Received ');
    event = JSON.parse(event.data);
    console.log(event);
    switch (event.event) {
        case "users":
            chatUsersCount.innerHTML = event.data.length;
            chatUsersCtr.innerHTML = "";
            event.data.forEach((u) => {
                const userEl = document.createElement("div");
                userEl.className = "chat-user";
                userEl.innerHTML = u.name;
                chatUsersCtr.appendChild(userEl);
            });
            break;
        case "message":
            const el = document.createElement('div');
            el.className = `message message-${event.data.sender === "me" ? "to" : "from"}`;
            el.innerHTML = `
                ${event.data.sender === "me" ? "" : `<h4>${event.data.name}</h4>`}
                <p class="message-text">Lorem ipsum smth</p>`;
                chatMessagesCtr.appendChild(el);
            break;
    }
}


function getQueryParams() {
    const search = window.location.search.substring(1);
    const pairs = search.split("&");
    const params = {};
    for (const pair of pairs) {
        const parts = pair.split("=");
        params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    }

    return params;
}