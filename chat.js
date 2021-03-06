import { isWebSocketCloseEvent } from "https://deno.land/std@0.67.0/ws/mod.ts";
import { v4 } from "https://deno.land/std@0.67.0/uuid/mod.ts";

/**
 * userId: {
 *      userId: string,
 *      name: string,
 *      groupName: string,
 *      ws: WebSocket
 * }
 */

const usersMap = new Map();

/**
 * groupName: [user1, user2]
 * 
 * {
 *      userId: string,
 *      name: string,
 *      groupName: string,
 *      ws: WebSocket
 * }
 */

const groupsMap = new Map();

/**
 * groupName: [message1,message2]
 * 
 * {
 *    userId: string,
 *    name: string,
 *    message: string
 * }
 * 
 */
const messagesMap = new Map();

// This is called when user is connected
export default async function chat(ws) {
    console.log('Connected');

    // Generate unique userId
    const userId = v4.generate();

    // Listening of WebSocket events
    for await (let data of ws) {
        console.log(data, typeof data);
        const event = typeof data === "string" ? JSON.parse(data) : data;

        // If event is close,
        if (isWebSocketCloseEvent(data)) {
            console.log('Closing');
            // Take out user from usersMap
            leaveGroup(userId);
            break;
        }

        let userObj;
        switch (event.event) {
            case 'join':
                userObj = {
                    userId,
                    name: event.name,
                    groupName: event.groupName,
                    ws,
                };

                // Put userObj inside usersMap
                usersMap.set(userId, userObj);

                const users = groupsMap.get(event.groupName) || [];
                users.push(userObj);
                groupsMap.set(event.groupName, users);

                emitEvent(event.groupName);
                emitPreviousMessages(event.groupName, ws);
                break;

            // If it is message receive
            case "message":
                console.log("Message received ");
                userObj = usersMap.get(userId);
                const message = {
                    userId,
                    name: userObj.name,
                    message: event.data,
                };
                const messages = messagesMap.get(userObj.groupName) || [];
                messages.push(message);
                messagesMap.set(userObj.groupName, messages);
                emitMessage(userObj.groupName, message, userId);
                break;
            case 'leave':
                leaveGroup(userId);
                break;
        }
    }
}

function leaveGroup(userId) {
    console.log(userId);

    // Take out users from groupsMap
    const userObj = usersMap.get(userId);
    if (!userObj) {
        return;
    }

    let users = groupsMap.get(userObj.groupName) || [];

    // Remove current user from users and write users back into groupsMap
    users = users.filter((u) => u.userId !== userId);
    groupsMap.set(userObj.groupName, users);

    // Remove userId from usersMap
    usersMap.delete(userId);

    emitEvent(userObj.groupName);
}

function emitEvent(groupName) {
    const users = groupsMap.get(groupName) || [];

    for (const user of users) {
        const event = {
            event: 'users',
            data: getDisplayUsers(groupName),
        };
        user.ws.send(JSON.stringify(event));
    }
}

function getDisplayUsers(groupName) {
    const users = groupsMap.get(groupName) || [];
    return users.map((u) => {
        return { userId: u.userId, name: u.name };
    })
}

function emitMessage(groupName, message, senderId) {
    const users = groupsMap.get(groupName) || [];
    for (const user of users) {
        console.log(`User: ${user.name}`);
        const tmpMessage = {
            ...message,
            sender: user.userId === senderId ? "me" : senderId,
        };
        const event = {
            event: "message",
            data: tmpMessage,
        };
        user.ws.send(JSON.stringify(event));
    }
}

function emitPreviousMessages(groupName, ws) {
    const messages = messagesMap.get(groupName) || [];

    const event = {
        event: 'previousMessages',
        data: messages,
    };
    ws.send(JSON.stringify(event));
}