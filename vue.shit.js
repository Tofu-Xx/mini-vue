/* 0.0.2 */
function Vue(opt) {
  window.vueey = Object.create(null);
  let _active;
  const _deps = {};
  const $el = opt.el?.at ? document.querySelector(opt.el) : opt.el ?? document;
  const This = Object.assign(new Proxy('object' == typeof opt.data ? opt.data : opt.data?.() ?? {}, {
    get: (...args) => [
      Reflect.get(...args),
      (_deps[args[1]] ??= new Set()).add(_active)
    ][0],
    set: (...args) => [
      Reflect.set(...args),
      _deps[args[1]]?.forEach((f) => f?.())
    ][0]
  }), opt.methods, {
    $el,
    $refs: {}
  });
  const thatKeyRex = RegExp(Object.keys(This).join('\\b|').replaceAll('$', '\\$'), 'g');
  const parseExpression = (raw) => Function('$event', 'return ' + raw.replace(thatKeyRex, (k) => 'this.' + k));
  const effect = (fn) => (_active = fn, fn());
  const walk = (walker) => {
    const node = walker.currentNode;
    const { nodeType, data } = node;
    if (nodeType == Node.ELEMENT_NODE) for (const { name, value: raw } of node.attributes) {
      vueey[name + 'bindName'] = name.slice(1);
      '@' == name[0] && (node['on' + vueey[name + 'bindName']] = (/[^\s\w$]/.test(raw) ? parseExpression(raw) : This[raw.trim()])?.bind(This)), ':' == name[0] && effect(() => node.setAttribute(vueey[name + 'bindName'], node[vueey[name + 'bindName']] = parseExpression(raw).call(This))), 'ref' == name && (This.$refs[raw] = node);
    }
    nodeType == Node.TEXT_NODE && effect(() => node.data = data.replace(/\{\{(.*?)\}\}/g, (_, raw) => parseExpression(raw).call(This))), walker.nextNode() ? walk(walker) : opt.mounted?.call(This);
  };
  for (const [key, fn] of (walk(document.createTreeWalker($el, NodeFilter.SHOW_ALL)), Object.entries(opt.watch ?? {}))) {
    vueey['watch' + key + 'oldVal'] = This[key];
    _deps[key].add(() => Promise.resolve().then(() => {
      const val = This[key];
      fn.call(This, val, vueey['watch' + key + 'oldVal']), vueey['watch' + key + 'oldVal'] = val;
    }));
  }
}

