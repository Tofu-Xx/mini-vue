/* 0.0.2 */
function Vue(opt) {
  window.vueey = Object.create(null)
   vueey["_active"]
   vueey["_deps"] = {}
   vueey["$el"] = opt.el?.at ? document.querySelector(opt.el) : opt.el ?? document
    vueey["This"] = Object.assign(new Proxy('object' == typeof opt.data ? opt.data : opt.data?.() ?? {}, {
    get: (...args) => [Reflect.get(...args), (vueey["_deps"][args[1]] ??= new Set()).add(vueey["_active"])][0],
    set: (...args) => [Reflect.set(...args), vueey["_deps"][args[1]]?.forEach((f) => f?.())][0]
  }), opt.methods, {
    $el: vueey["$el"],
    $refs: {}
  })
    vueey["thisKeyRex"] = RegExp(Object.keys(vueey["This"]).join('\\b|').replaceAll('$', '\\$'), 'g')
   vueey["parseExpression"] = (raw) => Function('$event', 'return ' + raw.replace(vueey["thisKeyRex"], (k) => 'this.' + k))
   vueey["effect"] = (fn) => (vueey["_active"] = fn, fn())
   vueey["walk"] = (node,walker) => {
    if (node.nodeType == Node.ELEMENT_NODE) for (const { name, value: raw } of node.attributes) {
      vueey[name + 'bindName'] = name.slice(1)
      '@' == name[0] && (node['on' + vueey[name + 'bindName']] = (/[^\s\w$]/.test(raw) ? vueey["parseExpression"](raw) : vueey["This"][raw.trim()])?.bind(vueey["This"])), ':' == name[0] && vueey["effect"](() => node.setAttribute(vueey[name + 'bindName'], node[vueey[name + 'bindName']] = vueey["parseExpression"](raw).call(vueey["This"]))), 'ref' == name && (vueey["This"].$refs[raw] = node)
    }
    node.nodeType == Node.TEXT_NODE && (
      node.__v_tem__ = node.data,
      vueey["effect"](() => node.data = node.__v_tem__.replace(/\{\{(.*?)\}\}/g, (_, raw) => vueey["parseExpression"](raw).call(vueey["This"])))
    ),
      walker.nextNode() ? vueey["walk"](walker.currentNode,walker) : opt.mounted?.call(vueey["This"])
  }
  vueey["walk"](vueey["$el"],document.createTreeWalker(vueey["$el"], NodeFilter.SHOW_ALL))
  Object.entries(opt.watch ?? {}).forEach(([key, fn]) => {
    vueey['watch' + key + 'oldVal'] = vueey["This"][key],
    vueey["_deps"][key].add(() => Promise.resolve().then(() => {
      vueey['watch' + key + 'val'] = vueey["This"][key],
        fn.call(vueey["This"], vueey['watch' + key + 'val'], vueey['watch' + key + 'oldVal']), vueey['watch' + key + 'oldVal'] = vueey['watch' + key + 'val']
    }))
  })
}

