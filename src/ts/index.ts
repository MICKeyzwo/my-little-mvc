import { Mvc } from "./mvc";

function main() {
    let app = null;
    const target = document.getElementById("app1");
    if (target) {
        app = new Mvc(target, {
            data: {
                message: "hello"
            }
        });
        Object.defineProperty(window, "app", {
            value: app
        });
    }
}

main();

console.log("page loaded!")
