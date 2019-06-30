import { Binder } from "./binder";

export class Mvc {
    public data: any;
    private controler: Binder;
    constructor(root: HTMLElement, options: {
        data: any
    }) {
        const selfToData = new Binder(this);
        this.data = { ...options.data };
        Object.entries(options.data).forEach(([key, value]) => {
            selfToData.bindTo(key, this.data, key, { initValue: value });
        });
        this.controler = new Binder(this.data);
        bindText(this.controler, root);
    }
}

function bindText(controler: Binder, root: HTMLElement) {
    const nodeHash = [root];
    while (nodeHash.length) {
        const node = nodeHash.pop();
        if (node) {
            node.childNodes.forEach(child => {
                if (child instanceof HTMLElement) {
                    nodeHash.push(node);
                }
                if (child instanceof Text && child.nodeValue) {
                    let matches: RegExpMatchArray | null;
                    while (matches = child.nodeValue.match(/\{\{.+?\}\}/)) {
                        const parent = child.parentNode as Node;
                        const { length } = matches[0];
                        const index = matches.index as number;
                        const head = child.nodeValue.slice(0, index + length);
                        child.nodeValue = child.nodeValue.slice(head.length);
                        if (index > 0) {
                            parent.insertBefore(new Text(head.slice(0, index)), child);
                        }
                        const expression = matches[0].replace(/[{}]/g, "").trim();
                        const textNode = new Text();
                        controler.bindTo(expression, textNode, "nodeValue");
                        parent.insertBefore(textNode, child);
                    }
                }
            });
        }
    }
}
