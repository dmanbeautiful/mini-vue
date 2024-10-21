import { h } from "../../lib/mini-vue-guide.esm.js"
// import ArrayToArray from "./ArrayToArray.js"
// import ArrayToText from "./ArrayToText.js"
import TextToArray from './TextToArray.js';
// import TextToText from "./TextToText.js"

export default{
    name:"App",
    setup(){},
    render(){
        return h("div",{tId:1},[
            h("p",{},"主页"),
            //老的是array新的是text
            // h(ArrayToText),
            //老的是text新的是text
            // h(TextToText),
            //老的是text新的是array
            h(TextToArray),
            //老的是array新的是array
            //h(ArrayToArray),
        ])
    }
}