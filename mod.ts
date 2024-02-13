type Ctx<T> = {
    [k: string]: (str: TemplateStringsArray) => Ctx<T>
    (str: TemplateStringsArray): T
}
interface Elem<T> {
    addAttribute(key: string | symbol, val: string): (data: T) => T 
}

const ctxGenGen =
<T>(impl: Elem<T>) => {
    const f = (data: T): Ctx<T> =>
        new Proxy(
            () => data,
            {
                get(_target, prop, _reciever) {
                    return ([val]: TemplateStringsArray) => f(
                        impl.addAttribute(prop, val)(data)
                    )
                }
            },
        ) as unknown as Ctx<T>
    return f
}
const elemGen = ctxGenGen<Record<string, string>>({
    addAttribute:
    (k, v) =>
    data => ({
        ...data,
        [k]: v,
    })
})

export const div = elemGen({})