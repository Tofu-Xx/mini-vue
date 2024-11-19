function Vue(opt) {
  const $ = { deps: Object.create(null) };
  const $el = opt.el instanceof Element ? opt.el : document.querySelector(opt.el) ?? document.createDocumentFragment();
  const $data = new Proxy(opt.data instanceof Function ? opt.data() : opt.data, {
    get: (...args) => [Reflect.get(...args), ($.deps[args[1]] ||= new Set()).add($.active)][0],
    set: (...args) => [Reflect.set(...args), $.deps[args[1]].forEach(f => f())][0],
  });
  Object.assign(this, opt.methods, { $el, $data });
  (function entry(node, walker, effect) {
    if (node instanceof Element) for (let attr of node.attributes) {
      attr.name[0] === '@' && node.addEventListener(attr.name.slice(1), this[attr.value].bind($data));
      attr.name[0] === ':' && effect(() => node.setAttribute(attr.__v__ = attr.name.slice(1), node[attr.__v__] = $data[attr.value]));
    }
    if (node instanceof Text && (node.__v_tem__ = node.textContent) && (node.__v__ = Array(...node.__v_tem__.matchAll(/\{\{(.*?)\}\}/g))).length)
      effect(() => node.textContent = node.__v__.reduce((acc, cur) => acc.replace(cur[0], $data[cur[1].trim()]), node.__v_tem__));
    walker.nextNode() && entry.bind(this)(walker.currentNode, walker, effect);
  }).bind(this)($el, document.createTreeWalker($el, NodeFilter.SHOW_ALL), fn => ($.active = fn, fn()));
  Object.keys(opt.watch).forEach(k => $.deps[k].add(() => setTimeout(() => opt.watch[k].bind($data)($data[k]), 0)));
};