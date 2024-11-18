function reactive(obj) {
  const listeners = new Set();

  const proxy = new Proxy(obj, {
    get(target, property, receiver) {
      if (typeof target[property] === 'object' && target[property] !== null) {
        return reactive(target[property]);
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      const isSet = Reflect.set(target, property, value, receiver);
      listeners.forEach(fn => fn());
      return isSet;
    }
  });

  proxy.track = function (fn) {
    listeners.add(fn);
  };

  proxy.trigger = function (fn) {
    listeners.delete(fn);
  };

  return proxy;
}

class Vue {
  constructor (options) {
    this.el = options.el;
    this.data = reactive(options.data());
    this.methods = options.methods;
    this.template = options.template
    this.init();
    // this.data.track(this.render.bind(this));
    // this.render();
  }

  // compileTemplate(template) {
  //   console.log(template);
  //   const mustacheList = template.match(/{{\s*(\w+)\s*}}/g) ?? [];
  //   mustacheList.forEach(mustache => {
  //     const key = mustache.replace(/{{\s*|\s*}}/g, '');
  //     template = template.replace(mustache, this.data[key]);
  //   });
  //   return template;
  // }

  // render() {
  //   const el = document.querySelector(this.el);
  //   if (el) {
  //     el.innerHTML = this.compileTemplate(this.template);
  //     // this.applyVAttr(el);
  //   }
  // }

  init() {
    const el = document.querySelector(this.el);
    if (!el) return;
    el.innerHTML = this.template ?? el.innerHTML;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      [...node.attributes].filter(attr => {
        if (/^@/.test(attr.name)) {
          node.addEventListener(attr.name.slice(1), this.methods[attr.value].bind(this.data));
        }
        if (/^:/.test(attr.name)) {
          const bindAttr = () => node.setAttribute(attr.name.slice(1), this.data[attr.value]);
          bindAttr();
          this.data.track(bindAttr);
        }
      });
      // const hasVAttr = node.getAttributeNames().some(name => /^@|^:/.test(name));
      // const hasMustache = [...node.childNodes].filter(e=>e.nodeType === Node.TEXT_NODE).some(e=>/{{\s*\w+\s*}}/.test(e?.wholeText))
    }
  }

  applyVAttr(el) {
    const attrWalker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT, (node) => node.getAttributeNames().some(name => /@|:/.test(name)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP);
    const vAttr = {
      '@': (node, name, value) => node.addEventListener(name, this.methods[value].bind(this.data)),
      ':': (node, name, value) => node.setAttribute(name, this.data[value])
    };
    while (attrWalker.nextNode()) {
      const node = attrWalker.currentNode;
      node.getAttributeNames().forEach(attrName => {
        const name = attrName.slice(1);
        const value = node.getAttribute(attrName);
        vAttr[attrName[0]]?.(node, name, value);
      });
    }
  }
}
