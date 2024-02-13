type Ctx<Data, Eval extends Function> = {
    [k: string]: (str: TemplateStringsArray) => Ctx<Data, Eval>
} & Eval

interface Elem<Data, Eval extends Function> {
    addAttribute(key: string | symbol, val: string): (data: Data) => Data
    eval: (data: Data) => Eval
}

const ctxGenGen =
<Data, Eval extends Function>
(impl: Elem<Data, Eval>) => {
    const f = (data: Data): Ctx<Data, Eval> =>
        new Proxy(
            () => data,
            {
                get(_target, prop, _reciever) {
                    return ([val]: TemplateStringsArray) => f(
                        impl.addAttribute(prop, val)(data)
                    )
                }
            },
        ) as unknown as Ctx<Data, Eval>
    return f
}
const elemGen = ctxGenGen<
    Record<string, string>,
    () => Record<string, string>
>({
    addAttribute:
    (k, v) =>
    data => ({
        ...data,
        [k]: v,
    }),
    eval: data => () => data,
})

export const div = elemGen({})