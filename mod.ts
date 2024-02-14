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

const ctxGenGen =
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

const STATE = Symbol("state")

type ElemInfo = Record<string, string>

type ElemEval<State extends "attr" | "children" = "attr"> = {
    (): ElemInfo & {
        [STATE]: State
    }
    (str: TemplateStringsArray): ElemCtx<"children">
}

type ElemCtx<State extends "attr" | "children" = "attr"> = {
    [k: string]: (str: TemplateStringsArray) => ElemCtx<State>
} & ElemEval

const elemGen = ctxGenGen<
    ElemInfo,
    ElemEval,
    ElemCtx
>({
    addAttribute:
    (k, v) =>
    data => ({
        ...data,
        [k]: v,
    }),
    eval: (data, ctxGen) => ((arg: undefined | TemplateStringsArray) => {
        if (!arg) return data
        return ctxGen() as ElemCtx<"children">
    }) as ElemEval,
})

export const div = elemGen({})