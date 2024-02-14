import { div } from "./mod.ts"

const elem = 
    div
        .class`hi`
        .asdf`lol`
        `hi`
        

console.log(elem()) // { class: "hi", asdf: "lol" }