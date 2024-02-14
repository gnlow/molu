import { ctxGenGen } from "./ctxGenGen.ts"

export const STATE = Symbol("state")

type ElemInfo<State extends "attr" | "children"> = Record<string, string> & {
    [STATE]: State
}

type ElemEval<State extends "attr" | "children"> = {
    (): HTMLElement
    (str: TemplateStringsArray): ElemCtx<"children">
}

type ElemCtx<State extends "attr" | "children"> = {
    [k: string]: (str: TemplateStringsArray) => ElemCtx<State>
} & ElemEval<State>

export const elemGen = ctxGenGen<
    ElemInfo<"attr">,
    ElemEval<"attr">,
    ElemCtx<"attr">
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
        ) => ((arg?: TemplateStringsArray) => {
            if (!arg) {
                const el = document.createElement("div")
                Object.entries(data).forEach(([k, v]) => {
                    if (typeof k == "string") {
                        el.setAttribute(k, v)
                    }
                })
                return el
            }
            return ctxGen({
                ...data,
                [STATE]: "children",
            })
        }) as ElemEval<State>,
})