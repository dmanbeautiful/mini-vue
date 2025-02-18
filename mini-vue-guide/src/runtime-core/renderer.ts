import { effect } from "../reactivity/effect";
import { EMPTY_OBJ, isObject } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { createAppAPI } from "./createApp";
import { queueJobs } from "./scheduler";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostpatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(n2, container, parentComponent) {
    //patch
    //方便后续进行递归处理
    patch(null, n2, container, parentComponent, null);
  }

  //n1 -> 老的
  //n2 -> 新的
  function patch(n1, n2, container, parentComponent, anchor) {
    //去处理组件

    //ShapeFlags
    //n2 -> flag
    //element

    //判断是不是一个element类型
    //如何区分element类型和component类型
    const { shapeFlag, type } = n2;

    //Fragment -> 只渲染children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);

          //STATEFUL_COMPONENT
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processText(n1, n2, container) {
    const { children } = n2;
    const textNode = document.createTextNode(children);
    container.append(textNode);
  }

  function processFragment(
    n1,
    n2: any,
    container: any,
    parentComponent: any,
    anchor
  ) {
    //Implement
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processElement(
    n1,
    n2: any,
    container: any,
    parentComponent: any,
    anchor
  ) {
    //mount->update
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    const el = (n2.el = n1.el);
    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }
  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag;
    const c1 = n1.children;
    const { shapeFlag } = n2;
    const c2 = n2.children;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        //1.把老的 children清空
        unmountChildren(n1.children);
      }
      if (c1 !== c2) {
        //2.设置 text
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        //array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }
  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    function isSomeVNodeType(n1, n2) {
      //type -- key
      return n1.type === n2.type && n1.key === n2.key;
    }
    //左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }

    //右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    //新的比老的多 创建
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = e2 + 1 < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      //老的比新的多
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      //乱序--中间对比
      let s1 = i; //老节点的开始
      let s2 = i;

      const toBePatched = e2 - s2 + 1;
      let patched = 0;
      const keyToNewIndexMap = new Map(); //映射表
      const newIndexToOldInexMap = new Array(toBePatched);
      let moved = false;
      let maxNewIndexSoFar = 0;

      for (let i = 0; i < toBePatched; i++) newIndexToOldInexMap[i] = 0;
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }

        let newIndex;
        //null undefined
        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSomeVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            newIndex = maxNewIndexSoFar;
          } else {
            moved = true;
          }

          newIndexToOldInexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldInexMap)
        : [];
      let j = increasingNewIndexSequence.length - 1;

      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;

        if (newIndexToOldInexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            //移动位置
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      //remove
      hostRemove(el);
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          hostpatchProp(el, key, prevProp, nextProp);
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostpatchProp(el, key, oldProps[key], null);
          }
        }
      }
    }
  }

  function mountElement(n2: any, container: any, parentComponent: any, anchor) {
    //canvas
    //new Element()

    //n2 -> element -> div
    const el = (n2.el = hostCreateElement(n2.type));
    //string array
    const { children, shapeFlag } = n2;

    //children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      //text_children
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      //array_children
      mountChildren(n2.children, el, parentComponent, anchor);
    }

    //props
    const { props } = n2;
    for (const key in props) {
      const val = props[key];

      //具体 -> 通用
      //on + Event name
      hostpatchProp(el, key, null, val);
    }

    // container.append(el);
    //addChild()
    hostInsert(el, container, anchor);
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }

  function processComponent(
    n1,
    n2: any,
    container: any,
    parentComponent: any,
    anchor
  ) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      updateComponent(n1, n2);
    }
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      n2.vnode = n2;
    }
  }

  function mountComponent(
    initialVNode: any,
    container: any,
    parentComponent: any,
    anchor
  ) {
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ));

    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  }

  function setupRenderEffect(
    instance: any,
    initialVNode,
    container: any,
    anchor
  ) {
    //n2 Tree
    //n2 Tree -> patch
    //n2 -> element -> mountElement

    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          console.log("init");
          const { proxy } = instance;
          const subTree = (instance.subTree = instance.render.call(proxy,proxy));

          patch(null, subTree, container, instance, anchor);

          //element->mount
          initialVNode.el = subTree.el;
          instance.isMounted = true;
        } else {
          console.log("update");
          //需要一个 更新后的vnode
          const { next, vnode } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          }

          const { proxy } = instance;
          const subTree = instance.render.call(proxy,proxy);
          const preSubTree = instance.subTree;
          instance.subTree = subTree;

          patch(preSubTree, subTree, container, instance, anchor);
        }
      },
      {
        scheduler() {
          console.log("update-scheduler");
          queueJobs(instance.update)
        },
      }
    );
  }

  return {
    createApp: createAppAPI(render),
  };
}

function updateComponentPreRender(instance, nextVNode) {
  instance.vnode = nextVNode;
  instance.next = null;

  instance.props = nextVNode.props;
}

function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
