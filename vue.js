function Vue(opt = {}) {
  const doc = document, obj = Object, rft = Reflect;
  let _active;
  let isUpdating = false;
  const _deps = {};
  const $refs = {};
  const $el = doc.querySelector(opt.el) ?? doc;
  const This = obj.assign(new Proxy(opt.data, {
    get: (...args) => [rft.get(...args), (_deps[args[1]] ??= new Set()).add(_active)][0],
    set: (...args) => [rft.set(...args), queueMicrotask(() => _deps[args[1]]?.forEach(f => f?.()))][0],
  }), opt.methods, { $el, $refs });
  const thisKeyRex = RegExp(obj.keys(This).map(k => `(?<![\\w$])${k}(?![\\w$])`).join('|').replace(/\$/g, '\\$'), 'g');
  const infuse = (raw, preCode = 'return ') => Function('$event', preCode + raw.trim().replace(thisKeyRex, k => 'this.' + k)).bind(This);
  const effect = (fn) => (_active = fn, fn());
  const compiler = (node, walker = doc.createTreeWalker(node, NodeFilter.SHOW_ALL)) => {
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
  for (const [key, fn] of obj.entries(opt.watch ?? {})) {
    let oldVal = This[key];
    _deps[key].add(() => queueMicrotask(() => {
      const val = This[key];
      if (val == oldVal) return;
      fn.call(This, val, oldVal);
      oldVal = val;
    }));
  }
  opt.created?.call(This);
  compiler($el);
  _active = () => {
    if (isUpdating) return;
    isUpdating = true;
    setTimeout(() => {
      isUpdating = false;
      opt.updated?.call(This);
    });
  };
  opt.mounted?.call(This);
};