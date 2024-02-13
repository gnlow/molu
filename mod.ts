type Ctx<Data, Eval extends (...args: any) => any> = {
    [k: string]: (str: TemplateStringsArray) => Ctx<Data, Eval>
} & Eval

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
    const f = (data: Data): Ctx<Data, Eval> =>
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

const elemGen = ctxGenGen<
    ElemInfo,
    () => ElemInfo,
    Ctx<ElemInfo, () => ElemInfo>
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