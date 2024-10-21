import { createVNode } from "./vnode";


//render
export function createAppAPI(render){
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        //先 vnode 虚拟节点
        //component -> vnode
        //后续所有逻辑操作 都会基于Vnode处理
  
        const vnode = createVNode(rootComponent);
        render(vnode, rootContainer);
      },
    };
  }
 
}