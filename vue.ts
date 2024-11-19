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
  [key: string]: any;
  constructor(opt: Opt) {
    this.el = opt.el instanceof Element? opt.el: document.querySelector(opt.el) ?? document.createDocumentFragment();
    this.data = reactive(opt.data);
    this.methods = opt.methods;
    this.#init();
  }
  #init() {
    const walker = document.createTreeWalker(this.el, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      const node = walker.currentNode as Element;
      [...node.attributes].forEach((attr) => {
        attr.name.startsWith("@") && node.addEventListener(attr.name.slice(1), this.methods[attr.value].bind(this.data))
        attr.name.startsWith(":") && effect(() => node.setAttribute(node.slot = attr.name.slice(1), node[node.slot] = this.data[attr.value]));
      });
      node.childNodes.forEach((child) => {
        const tem = child.nodeType === Node.TEXT_NODE && child.textContent
        tem && effect(() => child.textContent = [...tem.matchAll(/\{\{(.*?)\}\}/g)].reduce((acc, cur) => acc.replace(cur[0], this.data[cur[1].trim()]), tem))
      });
    }
  }
};
