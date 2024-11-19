class Vue {
    static #depsMap = Object.create(null);
    static #activeEffect = null;
    constructor (opt) {
        this.el = opt.el instanceof Element ? opt.el : document.querySelector(opt.el) ?? document.createDocumentFragment();
        this.data = new Proxy(opt.data, {
            get: (...args) => [Reflect.get(...args),(Vue.#depsMap[args[1]] ||= new Set()).add(Vue.#activeEffect)][0],
            set: (...args) => [Reflect.set(...args),Vue.#depsMap[args[1]].forEach((effect) => effect())][0]
        })
        this.methods = opt.methods;
        this.#entry(this.el, document.createTreeWalker(this.el, NodeFilter.SHOW_ELEMENT));
    }
    #entry(node, walker) {
        [...node.attributes].forEach((attr) => attr.name[0] === "@" ? node.addEventListener(attr.name.slice(1), this.methods[attr.value].bind(this.data)) : attr.name[0] === ":" && this.#effect(() => node.setAttribute(node.slot = attr.name.slice(1), node[node.slot] = this.data[attr.value])));
        node.childNodes.forEach((child) => (node.slot = child.nodeType === Node.TEXT_NODE && child.textContent) && this.#effect(() => child.textContent = [...node.slot.matchAll(/\{\{(.*?)\}\}/g)].reduce((acc, cur) => acc.replace(cur[0], this.data[cur[1].trim()]), node.slot)));
        walker.nextNode() && this.#entry(walker.currentNode, walker);
    }
    #effect(fn) {
        return (function _effect() {
            Vue.#activeEffect = _effect, fn();
        })();
    }
};
