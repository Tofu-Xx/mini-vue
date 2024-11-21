function Vue(opt = {}) {
  let _active;
  const _deps = {};
  const $el = opt.el?.at ? document.querySelector(opt.el) : opt.el ?? document;
  const This = Object.assign(new Proxy(typeof opt.data == 'object' ? opt.data : opt.data?.() ?? {}, {
    get: (...args) => [Reflect.get(...args), (_deps[args[1]] ??= new Set()).add(_active)][0],
    set: (...args) => [Reflect.set(...args), _deps[args[1]]?.forEach(f => f?.())][0],
  }), opt.methods, { $el, $refs: {} });
  const thatKeyRex = RegExp(Object.keys(This).join('\\b|').replaceAll('$', '\\$'), 'g');
  const parseExpression = (raw) => Function('$event', 'return ' + raw.replace(thatKeyRex, k => 'this.' + k));
  const effect = (fn) => (_active = fn, fn());
  const walk = (walker) => {
    const node = walker.currentNode;
    const { nodeType, data } = node;
    if (nodeType == Node.ELEMENT_NODE) for (const { name, value: raw } of node.attributes) {
      const bindName = name.slice(1);
      if (name[0] == '@')
        node['on' + bindName] = (/[^\s\w$]/.test(raw) ? parseExpression(raw) : This[raw.trim()])?.bind(This);
      if (name[0] == ':')
        effect(() => node.setAttribute(bindName, node[bindName] = parseExpression(raw).call(This)));
      if (name == 'ref')
        This.$refs[raw] = node;
    }
    if (nodeType == Node.TEXT_NODE)
      effect(() => node.data = data.replace(/\{\{(.*?)\}\}/g, (_, raw) => parseExpression(raw).call(This)));
    if (walker.nextNode()) walk(walker);
    else opt.mounted?.call(This);
  };
  walk(document.createTreeWalker($el, NodeFilter.SHOW_ALL));
  for (const [key, fn] of Object.entries(opt.watch ?? {})) {
    let oldVal = This[key];
    _deps[key].add(() => Promise.resolve().then(() => {
      const val = This[key];
      fn.call(This, val, oldVal);
      oldVal = val;
    }));
  }
};