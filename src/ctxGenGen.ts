interface Elem<
    Data,
    Eval extends (...args: any) => any,
    Ctx extends {
        [k: string]: (...args: any) => any
    } & Eval,
    EvalGen extends (data: Data, ctxGen: (...args: any) => any) => Eval
> {
    addAttribute(key: string | symbol, val: string): (data: Data) => Data
    evalGen: EvalGen
}

export const ctxGenGen =
<
    Data,
    Eval extends (...args: any) => any,
    Ctx extends {
        [k: string]: (...args: any) => any
    } & Eval,
    EvalGen extends (data: Data, ctxGen: (...args: any) => any) => Eval
>
(impl: Elem<Data, Eval, Ctx, EvalGen>) => {
    const ctxGen = (data: Data): Ctx =>
        new Proxy(
            impl.evalGen(data, (newData) => ctxGen(newData)),
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