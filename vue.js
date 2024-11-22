function Vue(opt = {}) {
  let _active;
  const _deps = {};
  const $el = opt.el?.at ? document.querySelector(opt.el) : opt.el ?? document;
  const $refs = {};
  const This = Object.assign(new Proxy(typeof opt.data == 'object' ? opt.data : opt.data?.() ?? {}, {
    get: (...args) => [Reflect.get(...args), (_deps[args[1]] ??= new Set()).add(_active)][0],
    set: (...args) => [Reflect.set(...args), _deps[args[1]]?.forEach(f => f?.())][0],
  }), opt.methods, { $el, $refs });
  const thisKeyRex = RegExp(Object.keys(This).map(k=>`\\b${k}\\b`).join('|').replaceAll('$', '\\$'), 'g');
  const infuse = (raw, preCode = 'return ') => Function('$event', preCode + raw.trim().replace(thisKeyRex, k => 'this.' + k)).bind(This);
  const effect = (fn) => (_active = fn, fn());
  const compiler = (node, walker = document.createTreeWalker(node, NodeFilter.SHOW_ALL)) => {
    const { nodeType, data } = node;
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
      effect(() => node.data = data.replace(/\{\{([^]*?)\}\}/g, (_, raw) => infuse(raw)()));
    if (walker.nextNode()) compiler(walker.currentNode, walker);
    else opt.mounted?.call(This);
  };
  compiler($el);
  for (const [key, fn] of Object.entries(opt.watch ?? {})) {
    let oldVal = This[key];
    _deps[key].add(() => Promise.resolve().then(() => {
      const val = This[key];
      fn.call(This, val, oldVal);
      oldVal = val;
    }));
  }
};