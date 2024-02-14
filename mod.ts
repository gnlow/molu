interface Elem<Data, Eval extends (...args: any) => any> {
    addAttribute(key: string | symbol, val: string): (data: Data) => Data
    eval: (data: Data) => Eval
}

const ctxGenGen =
<
    Data,
    Eval extends (...args: any) => any,
    MyCtx extends {
        [k: string]: (...args: any) => any
    } & Eval
>
(impl: Elem<Data, Eval>) => {
    const f = (data: Data) =>
        new Proxy(
            impl.eval(data),
            {
                get(_target, prop, _reciever) {
                    return ([val]: TemplateStringsArray) => f(
                        impl.addAttribute(prop, val)(data)
                    )
                }
            },
        ) as unknown as MyCtx
    return f
}

type ElemInfo = Record<string, string>

type ElemCtx<V extends string = ""> = {
    (): ElemInfo
    [k: string]: (str: TemplateStringsArray) => ElemCtx<`${V}v`>
}

const elemGen = ctxGenGen<
    ElemInfo,
    { (): ElemInfo },
    ElemCtx
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