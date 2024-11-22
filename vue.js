function Vue(opt = {}) {
  let _active;
  const _deps = {};
  const $el = opt.el?.at ? document.querySelector(opt.el) : opt.el ?? document;
  const $refs = {};
  const This = Object.assign(new Proxy(opt.data, {
    get: (...args) => [Reflect.get(...args), (_deps[args[1]] ??= new Set()).add(_active)][0],
    set: (...args) => [Reflect.set(...args), _deps[args[1]]?.forEach(f => f?.())][0],
  }), opt.methods, { $el, $refs });
  const thisKeyRex = RegExp(Object.keys(This).map(k => `(?<![\\w$])${k}(?![\\w$])`).join('|').replace(/\$/g, '\\$'), 'g');
  const infuse = (raw, preCode = 'return ') => Function('$event', preCode + raw.trim().replace(thisKeyRex, k => 'this.' + k)).bind(This);
  const effect = (fn) => (_active = fn, fn());
  const compiler = (node, walker = document.createTreeWalker(node, NodeFilter.SHOW_ALL)) => {
    const { nodeType, data: tem } = node;
    if (nodeType == Node.ELEMENT_NODE) for (const { name, value: raw } of node.attributes) {
      const bindName = name.slice(1);
      if (name[0] == '@')
        node['on' + bindName] = /[^\s\w$]/.test(raw) ? infuse(raw, '') : This[raw.trim()]?.bind(This);
      if (name[0] == ':')
        effect(() => node.setAttribute(bindName, node[bindName] = infuse(raw)()));
      if (name == 'ref')
        This.$refs[raw] = node;
    }
    if (nodeType == Node.TEXT_NODE)
      effect(() => node.data = tem.replace(/\{\{(.*?)\}\}/gs, (_, raw) => infuse(raw)()));
    if (walker.nextNode())
      compiler(walker.currentNode, walker);
  };
  for (const [key, fn] of Object.entries(opt.watch ?? {})) {
    let oldVal = This[key];
    _deps[key].add(() => Promise.resolve().then(() => {
      const val = This[key];
      fn.call(This, val, oldVal);
      oldVal = val;
    }));
  }
  opt.created?.call(This);
  compiler($el);

  let pending = false;

 _active = () => {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    opt.updated?.call(This);
  });
};

  opt.mounted?.call(This);
};


// let isUpdating = false
// _active = () => {
//   if (isUpdating) return;
//   isUpdating = true;
//   return Promise.resolve().then(() => {
//     opt.updated?.call(This);
//     isUpdating = false;
//   });
// };

/* let timeoutId = null;

_active = () => {
 if (timeoutId) return;
 timeoutId = setTimeout(() => {
   timeoutId = null;
   opt.updated?.call(This);
 }, 0);
}; */

/* _active = () => {
    return Promise.resolve().then(() => {
      opt.updated?.call(This);
    });
  }; */