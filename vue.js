// declare const VueReactivity: any;
// const { reactive, effect } = VueReactivity;
window.Vue = class Vue {
    el;
    data;
    methods;
    constructor(opt) {
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
            const node = walker.currentNode;
            /* vAttr */
            [...node.attributes].forEach((attr) => {
                if (attr.name.startsWith("@")) {
                    node[attr.name.replace("@", "on")] = this.methods[attr.value].bind(this.data);
                }
                if (attr.name.startsWith(":")) {
                    const attrName = attr.name.slice(1);
                    effect(() => attrName in node
                        ? (node[attrName] = this.data[attr.value])
                        : node.setAttribute(attrName, this.data[attr.value]));
                }
            });
            /* mustache */
            node.childNodes.forEach((child) => {
                if (child.nodeType !== Node.TEXT_NODE)
                    return;
                const tem = child.textContent ?? "";
                effect(() => {
                    child.textContent = [...tem.matchAll(/\{\{(.*?)\}\}/g)].reduce((acc, cur) => {
                        return acc.replace(cur[0], this.data[cur[1].trim()]);
                    }, tem);
                });
            });
        }
    }
};
/* reactive */
function reactive(target) {
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
let activeEffect = null;
function effect(fn) {
    const _effect = function () {
        activeEffect = _effect;
        fn();
    };
    _effect();
}
// const targetMap = new WeakMap();
const depsMap = new Map();
function track(target, key) {
    // let depsMap = targetMap.get(target);
    // depsMap || targetMap.set(target, depsMap = new Map());
    let deps = depsMap.get(key);
    deps || depsMap.set(key, deps = new Set());
    deps.add(activeEffect);
}
function trigger(target, key) {
    // const depsMap = targetMap.get(target);
    const deps = depsMap.get(key);
    deps.forEach((effect) => effect());
}
