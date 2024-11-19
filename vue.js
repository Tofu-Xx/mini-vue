let activeEffect = null;
const effect = (fn) => (function _effect() {
    activeEffect = _effect, fn();
})();
const depsMap = Object.create(null);
const track = (key) => (depsMap[key] ||= new Set()).add(activeEffect);
const trigger = (key) => depsMap[key].forEach((effect) => effect());
const reactive = (target) => new Proxy(target, [['get', track], ['set', trigger]].reduce((acc, [type, toDeps]) => (acc[type] = (...args) => {
    const res = Reflect[type](...args);
    return toDeps(args[1]), res;
}, acc), {}));
window.Vue = class Vue {
    constructor (opt) {
        this.el = opt.el instanceof Element ? opt.el : document.querySelector(opt.el) ?? document.createDocumentFragment();
        this.data = reactive(opt.data);
        this.methods = opt.methods;
        this.#entry(this.el, document.createTreeWalker(this.el, NodeFilter.SHOW_ELEMENT));
    }
    #entry(node, walker) {
        [...node.attributes].forEach((attr) => attr.name[0] === "@" ? node.addEventListener(attr.name.slice(1), this.methods[attr.value].bind(this.data)) : attr.name[0] === ":" && effect(() => node.setAttribute(node.slot = attr.name.slice(1), node[node.slot] = this.data[attr.value])));
        node.childNodes.forEach((child) => (node.slot = child.nodeType === Node.TEXT_NODE && child.textContent) && effect(() => child.textContent = [...node.slot.matchAll(/\{\{(.*?)\}\}/g)].reduce((acc, cur) => acc.replace(cur[0], this.data[cur[1].trim()]), node.slot)));
        walker.nextNode() && this.#entry(walker.currentNode, walker);
    }
};
