import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  failOnWarn: false,
  declaration: false,
  clean: true,
  entries: ['src/main.ts'],
  rollup: {
    inlineDependencies: true,
    output: {
      format: 'iife',
    },
    esbuild: {
      minify: false,
      target: 'esnext',
    },
  },
})
