type Elem = {
    [k: string]: (str: TemplateStringsArray) => Elem
    (str: TemplateStringsArray): Record<string, string>
}

const procgen = (obj: Record<string, string>): Elem => {
    return new Proxy(
        Object.assign(
            () => obj,
            obj,
        ) as unknown as Elem,
        {
            get(target, prop, reciever) {
                return ([val]: TemplateStringsArray) => procgen({
                    ...obj,
                    [prop]: val,
                })
            }
        },
    )
}

const div = procgen({})

const elem = 
    div
        .class`hi`
        .asdf`lol`
        ``

console.log(elem) // { class: "hi", asdf: "lol" }