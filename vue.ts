declare const VueReactiveity: any;
const {reactive,effect} = VueReactiveity 

type Opt = {
  el: string;
  data: Record<string, any>;
  methods: Record<string, Function>;
};
class Vue {
  el: Opt["el"];
  data: Opt["data"];
  methods: Opt["methods"];
  constructor(opt: Opt) {
    this.el = opt.el;
    this.data = opt.data;
    this.methods = opt.methods;
    this._init();
  }
  _init() {
    const el = typeof this.el === "string" && document.querySelector(this.el);
    if (!el) return;
  }
}
/*  */
