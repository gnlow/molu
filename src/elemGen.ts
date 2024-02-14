import { ctxGenGen } from "./ctxGenGen.ts"

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

export const elemGen = ctxGenGen<
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