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
    constructor(opt) {
        this.el = opt.el instanceof Element ? opt.el : document.querySelector(opt.el) ?? document.createElement('main');
        this.data = reactive(opt.data);
        this.methods = opt.methods;
        this.#init();
    }
    #init() {
        const walker = document.createTreeWalker(this.el, NodeFilter.SHOW_ELEMENT);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            [...node.attributes].forEach((attr) => {
                if (attr.name.startsWith("@"))
                    node[attr.name.replace("@", "on")] = this.methods[attr.value].bind(this.data);
                if (attr.name.startsWith(":")) {
                    const attrName = attr.name.slice(1);
                    effect(() => attrName in node ? (node[attrName] = this.data[attr.value]) : node.setAttribute(attrName, this.data[attr.value]));
                }
            });
            node.childNodes.forEach((child) => {
                const tem = child.nodeType === Node.TEXT_NODE && child.textContent;
                tem && effect(() => child.textContent = [...tem.matchAll(/\{\{(.*?)\}\}/g)].reduce((acc, cur) => acc.replace(cur[0], this.data[cur[1].trim()]), tem));
            });
        }
    }
};
