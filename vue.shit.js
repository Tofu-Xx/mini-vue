function Vue(opt) {
  let _active;
  const _deps = {};
  const $el = opt.el?.at ? document.querySelector(opt.el) : opt.el ?? document;
  const This = Object.assign(new Proxy(typeof opt.data == 'object' ? opt.data : opt.data?.() ?? {}, {
    get: (...args) => [Reflect.get(...args), (_deps[args[1]] ??= new Set()).add(_active)][0],
    set: (...args) => [Reflect.set(...args), _deps[args[1]]?.forEach(f => f?.())][0],
  }), opt.methods, { $el, $refs: {} });
  const thatKeyRex = new RegExp(Object.keys(This).join('\\b|').replaceAll('$', '\\$'), 'g');
  const parseExpression = (raw) => new Function('$event', 'return ' + raw.replace(thatKeyRex, k => 'this.' + k));
  const walk = (walker, effect) => {
    const node = walker.currentNode;
    const { nodeType, data } = node;
    if (nodeType == 1) for (const { name, value: raw } of node.attributes) {
      const bindName = name.slice(1);
      name[0] == '@'&& node['on' + bindName] = (/[^\s\w$]/.test(raw) ? parseExpression(raw) : This[raw.trim()])?.bind(This);
      name[0] == ':'&& effect(() => node.setAttribute(bindName, node[bindName] = parseExpression(raw).call(This)));
      name == 'ref' && (This.$refs[raw] = node);
    }
    if (nodeType == 3)
      effect(() => node.data = data.replace(/\{\{(.*?)\}\}/g, (_, raw) => parseExpression(raw).call(This)));
    walker.nextNode() ? walk(walker, effect) : opt.mounted?.call(This);
  };
  walk(document.createTreeWalker($el, 7), fn => (_active = fn, fn()));
  for (const [key, fn] of Object.entries(opt.watch ?? {})) {
    let oldVal = This[key];
    _deps[key].add(() => Promise.resolve().then(() => {
      const val = This[key];
      fn.call(This, val, oldVal);
      oldVal = val;
    }));
  }
};