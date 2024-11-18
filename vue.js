var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
function reactive(obj) {
    var listeners = new Set();
    var proxy = new Proxy(obj, {
        get: function (target, property, receiver) {
            if (typeof target[property] === 'object' && target[property] !== null) {
                return reactive(target[property]);
            }
            return Reflect.get(target, property, receiver);
        },
        set: function (target, property, value, receiver) {
            var isSet = Reflect.set(target, property, value, receiver);
            listeners.forEach(function (fn) { return fn(); });
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
var Vue = /** @class */ (function () {
    function Vue(options) {
        this.el = options.el;
        this.data = reactive(options.data());
        this.methods = options.methods;
        this.template = options.template;
        this._activeDom = [];
        this.init();
        this.data.track(this.render.bind(this));
        this.render();
    }
    Vue.prototype.render = function () {
        var _this = this;
        this._activeDom.forEach(function (_a) {
            var text = _a.text, tem = _a.tem;
            tem.matchAll(/{{\s*(\w+)\s*}}/g).forEach(function (m) {
                tem = tem.replace(m[0], _this.data[m[1]]);
            });
            text.textContent = tem;
        });
    };
    Vue.prototype.init = function () {
        var _this = this;
        var _a;
        var el = document.querySelector(this.el);
        if (!el)
            return;
        el.innerHTML = (_a = this.template) !== null && _a !== void 0 ? _a : el.innerHTML;
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT);
        var _loop_1 = function () {
            var node = walker.currentNode;
            __spreadArray([], node.attributes, true).filter(function (attr) {
                if (/^@/.test(attr.name)) {
                    node.addEventListener(attr.name.slice(1), _this.methods[attr.value].bind(_this.data));
                }
                if (/^:/.test(attr.name)) {
                    var bindAttr = function () { return node.setAttribute(attr.name.slice(1), _this.data[attr.value]); };
                    _this.data.track(bindAttr);
                    bindAttr();
                }
            });
            var MustacheTextList = __spreadArray([], node.childNodes, true).filter(function (e) { return e.nodeType === Node.TEXT_NODE; }).filter(function (e) { var _a; return /{{\s*\w+\s*}}/.test((_a = e.textContent) !== null && _a !== void 0 ? _a : ''); });
            MustacheTextList.forEach(function (text) {
                _this._activeDom.push({ text: text, tem: text.textContent });
            });
        };
        while (walker.nextNode()) {
            _loop_1();
        }
    };
    return Vue;
}());
