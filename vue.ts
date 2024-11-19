// declare const VueReactivity: any;
// const { reactive, effect } = VueReactivity;

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
/* reactive */
function reactive<T extends object>(target: T): T{
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      return result;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return result;
    }
  });
}

/* effect */
type Key = string | symbol;
let activeEffect: any = null;
function effect(fn: Function) {
  const _effect = function () {
    activeEffect = _effect;
    fn();
  };
  _effect();
}

// const targetMap = new WeakMap();
const depsMap = new Map();
function track(target: any, key: Key) {
  // let depsMap = targetMap.get(target);
  // depsMap || targetMap.set(target, depsMap = new Map());
  let deps = depsMap.get(key);
  deps || depsMap.set(key, deps = new Set());
  deps.add(activeEffect);
}

function trigger(target: any, key: Key) {
  // const depsMap = targetMap.get(target);
  const deps = depsMap.get(key);
  deps.forEach((effect: Function) => effect());
}
