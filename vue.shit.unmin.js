/* 0.0.3 */
function Vue(opt) {
  window.vueey = Object.create(null),
  vueey._deps = Object.create(null),
  vueey.el = opt.el?.at ? document.querySelector(opt.el) : opt.el ?? document,
  vueey.trace = (key) => (vueey._deps[key] ??= new Set()).add(vueey._active),
  vueey.tirgger = (key) => vueey._deps[key]?.forEach((f) => f?.()),
  vueey.effect = (fn) => (vueey._active = fn, fn()),
  vueey.This = Object.assign(
    new Proxy(
      'object' == typeof opt.data ? opt.data : opt.data?.() ?? Object.create(null),
      Object.fromEntries([
        ["get", (...args) => [Reflect.get(...args), vueey.trace(args[1])][0]],
        ["set", (...args) => [Reflect.set(...args), vueey.tirgger(args[1])][0]],
      ])
    ),
    opt.methods,
    Object.fromEntries([
      ["$el", vueey.el,],
      ["$refs", Object.create(null)]
    ])
  ), 
  vueey.infuse = (energy , raw, preCode = 'return ') => Function(
    '$event',
    preCode + raw.trim().replace(
      RegExp(
        Object.keys(energy).join('\\b|').replaceAll('$', '\\$'),
        'g'
      ),
      (k) => 'this.' + k
    )
  ).bind(energy),
  vueey.forof = (iterable, callback) => (
    vueey.forof.iterable = Object.create(null),
    vueey.forof.iterable[iterable] = iterable[Symbol.iterator](),
    vueey.forof.next = () => (
      vueey.forof.result = Object.create(null),
      vueey.forof.result[iterable] = vueey.forof.iterable[iterable].next(),
      vueey.forof.result[iterable].done || (
        callback(vueey.forof.result[iterable].value),
        vueey.forof.next()
      )
    ),
    vueey.forof.next()
  ),
  vueey._binds = [],
  vueey.compiler = (node, walker = document.createTreeWalker(node, NodeFilter.SHOW_ALL)) => (
    node.nodeType == Node.ELEMENT_NODE && vueey.forof(node.attributes, (attr) => (
      'ref' == attr.name && (
        vueey.This.$refs[attr.value] = node
      ),
      '@' == attr.name[0] && (
        node[attr.name.replace('@', 'on')] = 
          /[^\s\w$]/.test(attr.value)
            ? vueey.infuse(vueey.This, attr.value, '')
            : vueey.This[attr.value.trim()].bind(vueey.This)
      ),
      ':' == attr.name[0] && (
        vueey._binds.push(attr.name.slice(1)),  
        vueey.effect(
          () => node.setAttribute(
            vueey._binds.at(-1),
            node[vueey._binds.at(-1)] = vueey.infuse(vueey.This, attr.value)()
          )
        )
      )
    )),
    node.nodeType == Node.TEXT_NODE && (
      node.__raw_tem__ = node.data,
      vueey.effect(() => (
        node.data = node.__raw_tem__.replace(
          /\{\{(.*?)\}\}/g,
          (_, raw) => vueey.infuse(vueey.This, raw)()
        ))
      )
    ),
    walker.nextNode()
      ? vueey.compiler(walker.currentNode, walker)
      : opt.mounted?.call(vueey.This)
  ),
  vueey.compiler(vueey.el),
  vueey.forof(
    Object.entries(opt.watch ?? Object.create(null)),
    ([key, fn]) => (
      vueey.watchedOldVal = Object.create(null),
      vueey.watchedOldVal[key] = vueey.This[key],
      vueey._deps[key].add(
        () => Promise.resolve().then(
          () => (
            vueey.watchedVal = Object.create(null),
            vueey.watchedVal[key] = vueey.This[key],
            fn.call(
              vueey.This,
              vueey.watchedVal[key],
              vueey.watchedOldVal[key]
            ),
            vueey.watchedOldVal[key] = vueey.watchedVal[key]
          )
        )
      )
    )
  );
}