import { h } from "../../lib/mini-vue-guide.esm.js"

export const Foo = {
    setup(props){
        //props.count
        console.log(props);
        props.count++ //被锁住了 shallowReadonly
        //props -> readonly
    },
    render(){
        return h("div",{},"foo: "+this.count)
    }
}