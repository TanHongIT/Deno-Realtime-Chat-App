import { v4 } from "https://deno.land/std/uuid/mod.ts"

export default async function chat(ws){
    console.log('Connected');

    const userId = v4.generate();

    for await (let data of ws){
        console.log(data, typeof data);
    }
}