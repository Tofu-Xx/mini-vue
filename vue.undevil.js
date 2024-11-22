/* Stop updating at v0.0.3 */
function Vue(opt) {
  (
    this.opt = opt,
    this.reactivity = Object.create(null),
    this.reactivity._deps = Object.create(null),
    this.reactivity.trace = (key) => (this.reactivity._deps[key] ??= new Set()).add(this.reactivity._active),
    this.reactivity.tirgger = (key) => this.reactivity._deps[key]?.forEach((f) => f?.()),
    this.reactivity.effect = (fn) => (this.reactivity._active = fn, fn()),
    this.el = opt?.el?.at ? document.querySelector(opt?.el) : opt?.el ?? document,
    this.This = Object.assign(
      new Proxy(
        'object' == typeof opt?.data ? opt?.data : opt?.data?.() ?? Object.create(null),
        Object.fromEntries([
          ["get", (...args) => [Reflect.get(...args), this.reactivity.trace(args[1])][0]],
          ["set", (...args) => [Reflect.set(...args), this.reactivity.tirgger(args[1])][0]],
        ])
      ),
      opt?.methods,
      Object.fromEntries([
        ["$el", this.el,],
        ["$refs", Object.create(null)]
      ])
    ),
    this.infuse = (energy, raw, preCode = 'return ') => Function(
      '$event',
      preCode + raw.trim().replace(
        RegExp(
          Object.keys(energy).join('\\b|').replaceAll('$', '\\$'),
          'g'
        ),
        (k) => 'this.' + k
      )
    ).bind(energy),
    this.forof = (iterable, callback) => (
      this.forof._iterable = iterable[Symbol.iterator](),
      this.forof._next = () => (
        this.forof._result = this.forof._iterable.next(),
        this.forof._result.done ? (
          Reflect.deleteProperty(this.forof, '_iterable'),
          Reflect.deleteProperty(this.forof, '_next'),
          Reflect.deleteProperty(this.forof, '_result')
        ) : (
          callback(this.forof._result.value),
          this.forof._next()
        )
      ),
      this.forof._next()
    ),
    this.compiler = (node = this.el, walker = document.createTreeWalker(node, NodeFilter.SHOW_ALL)) => (
      node.nodeType == Node.ELEMENT_NODE && this.forof(node.attributes, (attr) => (
        this.compiler._bind = attr.name.slice(1),
        'ref' == attr.name && (
          this.This.$refs[attr.value] = node
        ),
        '@' == attr.name[0] && (
          node['on' + this.compiler._bind] = /[^\s\w$]/.test(attr.value)
            ? this.infuse(this.This, attr.value, '')
            : this.This[attr.value.trim()].bind(this.This)
        ),
        ':' == attr.name[0] && (
          this.reactivity.effect(
            () => node.setAttribute(
              this.compiler._bind,
              node[this.compiler._bind] = this.infuse(this.This, attr.value)()
            )
          )
        ),
        Reflect.deleteProperty(this.compiler, '_bind')
      )),
      node.nodeType == Node.TEXT_NODE && (
        node.__tem__ = node.data,
        this.reactivity.effect(() => (
          node.data = node.__tem__.replace(
            /\{\{(.*?)\}\}/g,
            (_, raw) => this.infuse(this.This, raw)()
          ))
        )
      ),
      walker.nextNode()
        ? this.compiler(walker.currentNode, walker)
        : opt?.mounted?.call(this.This)
    ),
    this.opt && this.compiler(),
    this.forof(
      Object.entries(opt?.watch ?? Object.create(null)),
      ([key, fn]) => (
        this.watchedOldVal = Object.create(null),
        this.watchedOldVal[key] = this.This[key],
        this.reactivity._deps[key].add(
          () => Promise.resolve().then(
            () => (
              this.watchedVal = Object.create(null),
              this.watchedVal[key] = this.This[key],
              fn.call(
                this.This,
                this.watchedVal[key],
                this.watchedOldVal[key]
              ),
              this.watchedOldVal[key] = this.watchedVal[key]
            )
          )
        )
      )
    )
  );
}