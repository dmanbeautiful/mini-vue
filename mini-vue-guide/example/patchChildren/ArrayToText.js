import { h,ref } from "../../lib/mini-vue-guide.esm.js"
const nextChildren = "newChildren"
const prevChildren = [h("div",{},"A"),h("div",{},"B")]

export default {
    name:"ArrayToText",
    setup(){
        const isChange = ref(false)
        window.isChange = isChange
        return {
            isChange
        }
    },
    render(){
        const self = this

        return self.isChange === true ? h("div",{},nextChildren) : h("div",{},prevChildren)
    }
}