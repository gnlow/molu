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
        ctxGen: (data: ElemInfo<"children">) => ElemCtx<"children">,
    ): {
        (): ElemInfo<"attr">
        (str: TemplateStringsArray): ElemCtx<"children">
    }

    (
        data: ElemInfo<"children">,
        ctxGen: (data: ElemInfo<"children">) => ElemCtx<"children">,
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
    evalGen:
        <State extends "attr" | "children">
        (
            data: ElemInfo<State>,
            ctxGen: (newData: ElemInfo<"children">) => ElemCtx<"children">,
        ) => ((arg: undefined | TemplateStringsArray) => {
            if (!arg) return data
            return ctxGen({
                ...data,
                [STATE]: "children",
            })
        }) as ElemEval<State>,
})