import { h } from "../../lib/mini-vue-guide.esm.js"
import { Foo } from "./Foo.js"

export const App = {
    name:"App",
    render(){
        //emit
        return h("div",{},[h("div",{},"App"),h(Foo,{
            //on + Event
            onAdd(a,b){
                console.log("onAdd",a,b);
            },
            onAddFoo(){
                console.log("onAddFoo");
            }
        })])
    },

    setup(){
        return {}
    }
}