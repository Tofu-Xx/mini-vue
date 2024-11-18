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
    const vElements = [...el.querySelectorAll('*')].map(el => {
      const attrs = el.getAttributeNames().map(attr => {
        const type = attr[0];
        const name = attr.replace(type, '');
        const value = el.getAttribute(attr);
        return /@|:/.test(type) && { type, name, value };
      }).filter(Boolean);
      return attrs.length && {el,attrs};
    }).filter(Boolean);
    vElements.forEach(({ el, attrs }) => {
      attrs.forEach(({ type, name, value }) => {
        switch (type) {
          case '@':el.addEventListener(name, this.methods[value].bind(this.data));break;
          case ':':el.setAttribute(name, this.data[value]);break;
        }
      });
    });
  }
}
