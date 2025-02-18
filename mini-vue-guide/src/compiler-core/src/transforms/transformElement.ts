import { createVNodeCall, NodeTypes } from "../ast";
import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers";

export function transformElement(node, context) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      // context.helper(CREATE_ELEMENT_VNODE);
      //中间处理层

      //tag
      const vnodeTag = `'${node.tag}'`;

      //props
      let vnodeProps;

      //children
      const children = node.children[0];
      let vnodeChildren = children;

      node.codegenNode = createVNodeCall(context,vnodeTag, vnodeProps, vnodeChildren);
    };
  }
}
