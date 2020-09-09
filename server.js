import { listenAndServe } from "https://deno.land/std@0.67.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.67.0/http/file_server.ts";
import { acceptWebSocket, acceptable } from "https://deno.land/std@0.67.0/ws/mod.ts";
import chat from './public/js/chat.js';
listenAndServe({ port: 3000 }, async req => {
    let url = req.url;
    const position = url.indexOf('?');
    if(position > -1 ){
        url = url.substring(0, position);
    }
    const path = `${Deno.cwd()}/public${url}`;
    if (await fileExist(path)) {
        const content = await serveFile(req, path);
        req.respond(content);
        return;
    }

    if (acceptable(req)) {
        acceptWebSocket({
            conn: req.conn,
            bufReader: req.r,
            bufWriter: req.w,
            headers: req.headers
        }).then(chat);
    }
});

async function fileExist(path) {
    try {
        const start = await Deno.lstat(path);
        return start && start.isFile;
    } catch (e) {
        if (e && e instanceof Deno.errors.NotFound) {
            return false;
        } else {
            throw e;
        }
    }
}
console.log('Server started on port 3000');