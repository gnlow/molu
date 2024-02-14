import { ctxGenGen } from "./ctxGenGen.ts"

export const STATE = Symbol("state")

type ElemInfo<State extends "attr" | "children"> = Record<string, string> & {
    [STATE]: State
}

type ElemEval<State extends "attr" | "children"> = {
    (): ElemInfo<State>
    (str: TemplateStringsArray): ElemCtx<"children">
}

type ElemCtx<State extends "attr" | "children"> = {
    [k: string]: (str: TemplateStringsArray) => ElemCtx<State>
} & ElemEval<State>

type ElemEvalGen = {
    (
        data: ElemInfo<"attr">,
        ctxGen: () => ElemCtx<"attr">,
    ): {
        (): ElemInfo<"attr">
        (str: TemplateStringsArray): ElemCtx<"children">
    }

    (
        data: ElemInfo<"children">,
        ctxGen: () => ElemCtx<"children">,
    ): {
        (): ElemInfo<"children">
        (str: TemplateStringsArray): ElemCtx<"children">
    }
}

export const elemGen = ctxGenGen<
    ElemInfo<"attr">,
    ElemEval<"attr">,
    ElemCtx<"attr">,
    ElemEvalGen
>({
    addAttribute:
    (k, v) =>
    data => ({
        ...data,
        [k]: v,
    }),
    evalGen: ((data, ctxGen) => (arg: undefined | TemplateStringsArray) => {
        if (!arg) return data
        return ctxGen() as ElemCtx<"children">
    }) as ElemEvalGen,
})