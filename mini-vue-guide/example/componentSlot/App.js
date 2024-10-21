import { h,createTextVNode } from "../../lib/mini-vue-guide.esm.js"
import { Foo } from "./Foo.js"


//Fragment 以及 Text 节点
export const App = {
    name: "App",
    render() {
        const app = h("div", {}, "App")
        //object key
        const foo = h(Foo, {},
            {
                header: ({ age }) => [
                    h("p", {}, "header" + age),
                    createTextVNode("你好呀")
                ],
                footer: () => h("p", {}, "footer")
            }
        )

        //数组 和 单值vnode 都可以使用

        return h("div", {}, [app, foo])
    },
    setup() {
        return {}
    }
}
