import { NodeTypes } from "./ast";

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context, []));
}
function parseChildren(context, ancestors) {
  const nodes: any[] = [];

  while (!isEnd(context, ancestors)) {
    let node;
    const s = context.source;
    if (s.startsWith("{{")) {
      node = parseInterpolation(context);
    } else if (s[0] === "<") {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors);
      }
    }

    if (!node) {
      node = parseText(context);
    }

    nodes.push(node);
  }
  return nodes;
}
function isEnd(context, ancestors) {
  //2.遇到结束标签
  const s = context.source;
  if (s.startsWith("</")) {
    for (let i = ancestors.length-1; i >= 0; i--) { //优化，从栈顶去判断
      const tag = ancestors[i].tag;
      if (startsWithEndTagOpen(s,tag)) {
        return true;
      }
    }
  }
  //if (parentTag && s.startsWith(`</${parentTag}>`)) return true;
  //1.source有值
  return !s;
}

function parseText(context) {
  let endIndex = context.source.length;
  let endTokens = ["<", "{{"];
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i]);
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }
  //获取content
  const content = parseTextData(context, endIndex);

  console.log("——————", content);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}
function parseTextData(context, length) {
  //1.获取当前的内容
  const content = context.source.slice(0, length);
  //2.推进
  advanceBy(context, length);

  return content;
}

function parseElement(context: any, ancestors) {
  const element: any = parseTag(context, TagType.Start);
  ancestors.push(element);
  element.children = parseChildren(context, ancestors);
  ancestors.pop();

  if (startsWithEndTagOpen(context.source,element.tag)) {
    parseTag(context, TagType.End);
  }else{
    throw new Error(`缺少结束标签:${element.tag}`)
  }

  return element;
}

function startsWithEndTagOpen(source,tag){
    return source.startsWith("</") && source.slice(2,2+tag.length).toLowerCase() === tag.toLowerCase()
}

function parseTag(context, type: TagType) {
  //Implement
  //1.解析 tag
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  //2.删除处理完成的代码
  advanceBy(context, match[0].length);
  advanceBy(context, 1);

  if (type === TagType.End) return;

  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}

function parseInterpolation(context) {
  //{{message}}

  const openDelimiter = "{{";
  const closeDelimiter = "}}";

  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );

  advanceBy(context, openDelimiter.length);

  const rawContentLength = closeIndex - openDelimiter.length;

  const rawContent = parseTextData(context, rawContentLength);
  const content = rawContent.trim();

  advanceBy(context, closeDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  };
}
function advanceBy(context, length) {
  context.source = context.source.slice(length);
}

function createParserContext(content: string) {
  return {
    source: content,
  };
}
function createRoot(children) {
  return {
    children,
    type:NodeTypes.ROOT
  };
}
