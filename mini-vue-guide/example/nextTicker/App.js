import { h, ref, nextTick, getCurrentInstance } from "../../lib/mini-vue-guide.esm.js"

export default {
    name: "APP",
    setup() {
        const count = ref(1)
        const instance = getCurrentInstance()

        function onClick() {
            for (let i = 0; i < 100; i++) {
                console.log("update");
                count.value = i
            }
            console.log(instance);
            nextTick(() => {
                console.log(instance);
            })


        }
        return {
            onClick, count
        }
    },
    render() {
        const button = h("button", { onClick: this.onClick }, "update")
        const p = h("p", {}, "count:" + this.count)
        return h("div", {}, [button, p])
    }
}