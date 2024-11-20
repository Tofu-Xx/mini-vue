function Vue(opt) {
  let active;
  const deps = {};
  const $el = opt.el?.at ? document.querySelector(opt.el) : opt.el ?? document;
  const that = Object.assign(new Proxy(typeof opt.data == 'object' ? opt.data : opt.data?.() ?? {}, {
    get: (...args) => [Reflect.get(...args), (deps[args[1]] ??= new Set()).add(active)][0],
    set: (...args) => [Reflect.set(...args), deps[args[1]]?.forEach(f => f?.())][0],
  }), opt.methods, { $el, $refs: {} });
  const thatKeyRex = new RegExp(Object.keys(that).join('\\b|').replaceAll('$', '\\$'), 'g');
  const toExpression = (raw, it) => it ? raw.replace(thatKeyRex, k => it + '.' + k) : eval(toExpression(raw, 'that'));
  const walk = (walker, effect) => {
    const node = walker.currentNode;
    const { nodeType, data: tem } = node;
    if (nodeType == 1) for (const { name, value: raw } of node.attributes) {
      name == 'ref' && (that.$refs[raw] = node);
      if (name[0] == '@')
        node[name.replace('@', 'on')] = (/[^\s\w$]/.test(raw) ? (new Function('$event', toExpression(raw, 'this'))) : that[raw.trim()])?.bind(that);
      if (name[0] == ':') {
        const bindName = name.slice(1);
        effect(() => node.setAttribute(bindName, node[bindName] = toExpression(raw)));
      }
    }
    if (nodeType == 3) {
      effect(() => node.data = tem.replace(/\{\{(.*?)\}\}/g, (_, raw) => toExpression(raw)));
    }
    walker.nextNode() ? walk(walker, effect) : opt.mounted?.call(that);
  };
  walk(document.createTreeWalker($el, 7), fn => (active = fn, fn()));
  for (const [k, f] of Object.entries(opt.watch ?? {})) {
    let oldVal = that[k];
    deps[k].add(() => Promise.resolve().then(() => {
      const val = that[k];
      f.call(that, val, oldVal);
      oldVal = val;
    }));
  }
};