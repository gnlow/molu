import { ctxGenGen } from "./ctxGenGen.ts"

type ElemInfo<State extends "attr" | "children"> = {
    state: State
    attributes: Record<string, string>
    children: (string | Node)[]
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
        attributes: {
            ...data.attributes,
            [k]: v,
        },
    }),
    evalGen:
        <State extends "attr" | "children">
        (
            data: ElemInfo<State>,
            ctxGen: (newData: ElemInfo<"children">) => ElemCtx<"children">,
        ) => ((arg?: TemplateStringsArray) => {
            if (!arg) {
                console.log(data)
                const el = document.createElement("div")

                Object.entries(data.attributes).forEach(([k, v]) => {
                    if (typeof k == "string") {
                        el.setAttribute(k, v)
                    }
                })

                el.append(...data.children)

                return el
            } else {
                const [str] = arg
                return ctxGen({
                    ...data,
                    state: "children",
                    children: [
                        ...data.children,
                        str,
                    ]
                })
            }
        }) as ElemEval<State>,
})