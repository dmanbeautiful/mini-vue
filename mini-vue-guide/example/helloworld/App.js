
import {h} from '../../lib/mini-vue-guide.esm.js';
import { Foo } from './Foo.js';

window.self = null

export const App = {
    //.vue
    //<template>
    //render
    name:'APP',
    render() {
        window.self = this
        //ui
        return h(
            "div",{
            id:"root",
            class:["red","hard"],
            onClick(){
                console.log("click");
            },
            onMousedown(){
                console.log("mousedown");
            }
        }, 
        [h("div",{},"hi, "+this.msg),h(Foo,{
            count:1
        })]
        //setupState
        //this.$el -> get root element
        // "hi, " + this.msg
        
        
        //string
        //"hi,mini-vue"


        //array    
        // [h("p",{class:'red'},"hi"),h("p",{class:'blue'},"mini-vue")]
    )
    },
    setup() {
        //composition api
        return {
            msg: "mini-vue-haha"
        }
    }
}