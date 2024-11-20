function Vue(opt) {
  let _active;
  const _deps = {};
  const $el = opt.el?.at ? document.querySelector(opt.el) : opt.el ?? document;
  const that = Object.assign(new Proxy(typeof opt.data == 'object' ? opt.data : opt.data?.() ?? {}, {
    get: (...args) => [Reflect.get(...args), (_deps[args[1]] ??= new Set()).add(_active)][0],
    set: (...args) => [Reflect.set(...args), _deps[args[1]]?.forEach(f => f?.())][0],
  }), opt.methods, { $el, $refs: {} });
  const thatKeyRex = new RegExp(Object.keys(that).join('\\b|').replaceAll('$', '\\$'), 'g');
  const toExpression = (raw) => new Function('$event', 'return ' + raw.replace(thatKeyRex, k => 'this.' + k));
  const walk = (walker, effect) => {
    const node = walker.currentNode;
    const { nodeType, data: tem } = node;
    if (nodeType == 1) for (const { name, value: raw } of node.attributes) {
      const bindName = name.slice(1);
      if (name[0] == '@')
        node['on' + bindName] = (/[^\s\w$]/.test(raw) ? toExpression(raw) : that[raw.trim()])?.bind(that);
      if (name[0] == ':')
        effect(() => node.setAttribute(bindName, node[bindName] = toExpression(raw).call(that)));
      name == 'ref' && (that.$refs[raw] = node);
    }
    if (nodeType == 3)
      effect(() => node.data = tem.replace(/\{\{(.*?)\}\}/g, (_, raw) => toExpression(raw).call(that)));
    walker.nextNode() ? walk(walker, effect) : opt.mounted?.call(that);
  };
  walk(document.createTreeWalker($el, 7), fn => (_active = fn, fn()));
  for (const [key, fn] of Object.entries(opt.watch ?? {})) {
    let oldVal = that[key];
    _deps[key].add(() => Promise.resolve().then(() => {
      const val = that[key];
      fn.call(that, val, oldVal);
      oldVal = val;
    }));
  }
};