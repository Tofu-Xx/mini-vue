declare const VueReactivity: any;
const { reactive, effect } = VueReactivity;

type Opt = {
  el: string | Element;
  data: Record<string, any>;
  methods: Record<string, Function>;
};
interface Window {
  Vue: any;
}
window.Vue = class Vue {
  el: Element;
  data: Opt["data"];
  methods: Opt["methods"];
  constructor(opt: Opt) {
    this.el = opt.el instanceof Element
      ? opt.el
      : document.querySelector(opt.el) ?? document.body;
    this.data = reactive(opt.data);
    this.methods = opt.methods;
    this.#init();
  }
  #init() {
    const walker = document.createTreeWalker(this.el, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      const node = walker.currentNode as Element;
      /* vAttr */
      [...node.attributes].forEach((attr) => {
        if (attr.name.startsWith("@")) {
          node[attr.name.replace("@", "on")] = this.methods[attr.value].bind(
            this.data,
          );
        }
        if (attr.name.startsWith(":")) {
          const attrName = attr.name.slice(1);
          effect(() =>
            attrName in node
              ? (node[attrName] = this.data[attr.value])
              : node.setAttribute(attrName, this.data[attr.value])
          );
        }
      });
      /* mustache */
      node.childNodes.forEach((child) => {
        if (child.nodeType !== Node.TEXT_NODE) return;
        const tem = child.textContent ?? "";
        effect(() => {
          child.textContent = [...tem.matchAll(/\{\{(.*?)\}\}/g)].reduce(
            (acc, cur) => {
              return acc.replace(cur[0], this.data[cur[1].trim()]);
            },
            tem,
          );
        });
      });
    }
  }
};
/*  */
