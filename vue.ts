/* effect */
type Key = string | symbol;
let activeEffect: any = null;
const effect = (fn: Function) => (function _effect() {
  activeEffect = _effect,fn();
})();
const depsMap = Object.create(null);
const track = (key: Key) => (depsMap[key] ||= new Set()).add(activeEffect);
const trigger = (key: Key) => depsMap[key].forEach((effect: Function) => effect());
/* reactive */
type HandlerMap = ["get" | "set", (key: Key) => void][];
const reactive = <T extends object>(target: T) => new Proxy(target, ([['get',track],['set',trigger]] as HandlerMap).reduce((acc,[type,toDeps])=>(acc[type] = (...args: [any, any, any])=>{
  const res = Reflect[type](...args);
  return toDeps(args[1]), res;
}, acc),{}));
/* Vue */
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
    this.el = opt.el instanceof Element? opt.el: document.querySelector(opt.el) 
    if (!this.el) return
    this.data = reactive(opt.data);
    this.methods = opt.methods;
    this.#init();
  }
  #init() {
    const walker = document.createTreeWalker(this.el, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      const node = walker.currentNode as Element;
      [...node.attributes].forEach((attr) => {
        if (attr.name.startsWith("@")) 
          node[attr.name.replace("@", "on")] = this.methods[attr.value].bind(this.data);
        if (attr.name.startsWith(":")) {
          const attrName = attr.name.slice(1);
          effect(() => attrName in node? (node[attrName] = this.data[attr.value]): node.setAttribute(attrName, this.data[attr.value]));
        }
      });
      node.childNodes.forEach((child) => {
        if (child.nodeType !== Node.TEXT_NODE) return;
        const tem = child.textContent ?? "";
        effect(() => child.textContent = [...tem.matchAll(/\{\{(.*?)\}\}/g)].reduce((acc, cur) => acc.replace(cur[0], this.data[cur[1].trim()]), tem))
      });
    }
  }
};
