import { div } from "./mod.ts"

const elem = 
    div
        .class`hi`
        .asdf`lol`
        ``

console.log(elem) // { class: "hi", asdf: "lol" }