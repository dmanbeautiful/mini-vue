
const ShapeFlags = {
    element:0,
    stateful_component:0,
    text_children:0,
    array_children:0
}
//vnode -> stateful_component -> 

ShapeFlags.stateful_component = 1 


//位运算--高效
//0001 -> element
//0010 -> stateful
//0100 -> text_children
//1000 -> array_children


//修改 |

//查找 &
