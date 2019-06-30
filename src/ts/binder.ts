type Obj = {
    [key: string]: any
};

type BindTarget = {
    value: any,
    targets: Array<{
        target: Obj,
        key: string,
        processor?: (val: any) => any
    }>
};

/**
 * オブジェクトの特定プロパティを他のオブジェクトのプロパティにバインドする
 */
export class Binder {
    /**
     * @private self - バインド元のオブジェクト
     */
    private self: Obj;
    private targets: {
        [prop: string]: BindTarget;
    }
    /**
     * コンストラクタ
     */
    constructor(self: Obj) {
        this.self = self;
        this.targets = {};
    }
    /**
     * 自身が保有しているバインド元に与えられた
     * 文字列キーのプロパティが存在するかを確認する
     * @param key - 検査対象のプロパティキー
     */
    has(key: string): boolean {
        return this.self.hasOwnProperty(key);
    }
    /**
     * selfの特定プロパティ
     * @param key - バインド元のプロパティキー
     * @param target - バインド先オブジェクト
     * @param prop - バインド先のプロパティキー
     * @param processor - バインドされた値を送る際にデータを加工する関数
     */
    bindTo(
        key: string,
        target: Obj,
        prop: string,
        options?: {
            processor?: (val: any) => any,
            initValue?: any
        }       
    ): void {
        if (!this.targets.hasOwnProperty(key)) {
            this.targets[key] = {
                value: (
                    options && typeof options.initValue !== "undefined" ? 
                        options.initValue : 
                        this.self[key]
                ),
                targets: [{
                    target,
                    key: prop,
                    processor: options ? options.processor : undefined
                }]
            };
            const { targets } = this;
            Object.defineProperty(this.self, key, {
                set(val: any): void {
                    const target = targets[key];
                    if (!Object.is(target.value, val)) {
                        target.value = val;
                        target.targets.forEach(tar => {
                            if (typeof tar.processor === "function") {
                                tar.target[tar.key] = tar.processor(val);
                            } else {
                                tar.target[tar.key] = val;
                            }
                        });
                    }
                },
                get(): any {
                    return targets[key].value;
                }
            });
            target[prop] = this.targets[key].value;
        } else {
            this.targets[key].targets.push({
                target,
                key: prop,
                processor: options ? options.processor : undefined
            });
            target[prop] = this.targets[key].value;
        }
    }
}