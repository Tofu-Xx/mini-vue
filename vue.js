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
    this.template = options.template ?? document.querySelector(options.el).innerHTML;
    this.data.track(this.render.bind(this));
    this.render();
  }

  compileTemplate(template) {
    // const mustacheList = template.match(/{{\s*(\w+)\s*}}/g) ?? [];
    // mustacheList.forEach(mustache => {
    //   const key = mustache.replace(/{{\s*|\s*}}/g, '');
    //   template = template.replace(mustache, this.data[key]);
    // });
    return template;
  }

  render() {
    const el = document.querySelector(this.el);
    if (el) {
      el.innerHTML = this.compileTemplate(this.template);
      this.applyVAttr(el);
    }
  }

  applyVAttr(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT, (node) => {
      return node.getAttributeNames().some(name => /@|:/.test(name)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    });
    const vAttr = {
      '@': (node, name, value) => node.addEventListener(name, this.methods[value].bind(this.data)),
      ':': (node, name, value) => node.setAttribute(name, this.data[value])
    };
    while (walker.nextNode()) {
      const node = walker.currentNode;
      node.getAttributeNames().forEach(attrName => {
        const name = attrName.slice(1);
        const value = node.getAttribute(attrName);
        vAttr[attrName[0]]?.(node, name, value);
      });
    }
  }
}
