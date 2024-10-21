import { h } from "../../lib/mini-vue-guide.esm.js";

export const Foo = {
    setup(props,{emit}) {
        const emitAdd = ()=>{
            console.log("emit add");
            emit("add",1,2)           
            //add-foo
            emit("add-foo")                                    
        }

        return {
            emitAdd
        }
    },
    render() {
        const btn = h("button", {
            onClick: this.emitAdd
        }, "emitAdd")
        const foo = h("p",{},"foo")
        return h("div", {}, [foo,btn])
    },
}