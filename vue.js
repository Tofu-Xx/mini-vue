var Vue = /** @class */ (function () {
    function Vue(opt) {
        this.el = opt.el;
        this.data = opt.data;
        this.methods = opt.methods;
        this._init();
    }
    Vue.prototype._init = function () {
        var el = document.querySelector(this.el);
        if (!el)
            return;
        this._proxyData(this.data);
        this._proxyMethods(this.methods);
        this._render(el);
    };
    Vue.prototype._proxyData = function (data) {
        var keys = Object.keys(data);
        var _loop_1 = function (key) {
            Object.defineProperty(this_1, key, {
                get: function () {
                    return data[key];
                },
                set: function (newValue) {
                    data[key] = newValue;
                    this._render();
                }
            });
        };
        var this_1 = this;
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            _loop_1(key);
        }
    };
    Vue.prototype._proxyMethods = function (methods) {
        var keys = Object.keys(methods);
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var key = keys_2[_i];
            this[key] = methods[key].bind(this);
        }
    };
    Vue.prototype._render = function (el) {
        el.innerHTML = this._compile(el.innerHTML);
    };
    Vue.prototype._compile = function (template) {
        var _this = this;
        var reg = /\{\{(.*?)\}\}/g;
        return template.replace(reg, function (match, key) {
            console.log(key);
            return _this._getValue(key.trim());
        });
    };
    Vue.prototype._getValue = function (exp) {
        return this._getObjValue(this, exp);
    };
    Vue.prototype._getObjValue = function (obj, exp) {
        var keys = exp.split('.');
        var result = obj;
        for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
            var key = keys_3[_i];
            if (result) {
                result = result[key];
            }
        }
        return result;
    };
    return Vue;
}());
