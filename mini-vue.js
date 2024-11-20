function Vue(opt) {
  let active;
  const deps = {};
  const $el = opt.el?.at ? document.querySelector(opt.el) : opt.el ?? document;
  const that = Object.assign(new Proxy(typeof opt.data == 'object' ? opt.data : opt.data?.() ?? {}, {
    get: (...args) => [Reflect.get(...args), (deps[args[1]] ??= new Set()).add(active)][0],
    set: (...args) => [Reflect.set(...args), deps[args[1]]?.forEach(f => f())][0],
  }), opt.methods, { $el, $refs: {} });
  const walk = (walker, node, effect) => {
    if (node.nodeType == 1) for (let attr of node.attributes) {
      attr.name == 'ref' && (that.$refs[attr.value] = node);
      attr.name[0] == '@' && node.addEventListener(attr.name.slice(1), that[attr.value].bind(that));
      if (attr.name[0] == ':') {
        const name = attr.name.slice(1);
        effect(() => node.setAttribute(name, node[name] = that[attr.value]));
      }
    }
    if (node.nodeType == 3) {
      const tem = node.data;
      const matches = Array(...tem.matchAll(/\{\{(.*?)\}\}/g));
      matches[0] && effect(() => node.data = matches.reduce((acc, cur) => acc.replace(cur[0], that[cur[1].trim()]), tem));
    }
    walker.nextNode() ? walk(walker, walker.currentNode, effect) : opt.mounted?.bind(that)();
  };
  walk(document.createTreeWalker($el, 7), $el, fn => (active = fn, fn()));
  for (const [k, f] of Object.entries(opt.watch ?? {})) {
    let oldVal = that[k];
    deps[k].add(() => Promise.resolve().then(() => {
      let val = that[k];
      f.bind(that)(val, oldVal);
      oldVal = val;
    }));
  }
};