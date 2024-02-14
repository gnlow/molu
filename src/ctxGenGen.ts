interface Elem<
    Data,
    Eval extends (...args: any) => any,
    Ctx extends {
        [k: string]: (...args: any) => any
    } & Eval
> {
    addAttribute(key: string | symbol, val: string): (data: Data) => Data
    eval: (data: Data, ctxGen: () => Ctx) => Eval
}

export const ctxGenGen =
<
    Data,
    Eval extends (...args: any) => any,
    Ctx extends {
        [k: string]: (...args: any) => any
    } & Eval
>
(impl: Elem<Data, Eval, Ctx>) => {
    const ctxGen = (data: Data): Ctx =>
        new Proxy(
            impl.eval(data, () => ctxGen(data)),
            {
                get(_target, prop, _reciever) {
                    return ([val]: TemplateStringsArray) => ctxGen(
                        impl.addAttribute(prop, val)(data)
                    )
                }
            },
        ) as unknown as Ctx
    return ctxGen
}