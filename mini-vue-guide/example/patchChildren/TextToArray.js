import { h,ref } from "../../lib/mini-vue-guide.esm.js"
const nextChildren = [h("div",{},"A"),h("div",{},"B")]
const prevChildren = "oldChild"

export default {
    name:"TextToText",
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