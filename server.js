import { listenAndServe } from "https://deno.land/std/http/server.js";
import { acceptWebSocket, acceptable} from 'https://deno.land/std/ws/mod.js'

import chat from './chat.js';
listenAndServe({port: 3000}, async req =>{
    if(acceptable(req)){
        acceptWebSocket({
            conn: req.conn,
            bufReader: req.r,
            bufWriter: req.w,
            headers: req.headers
        }).then(chat);
    }
})