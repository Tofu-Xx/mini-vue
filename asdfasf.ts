interface Options  {
  el: Element|string,
  data: Function|Object,
  methods: Record<string, Function>,
  watch: Record<string, (val: any, oldVal: any) => void>,
  mounted: Function,
}