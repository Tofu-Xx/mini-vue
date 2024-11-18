import path from 'node:path'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  failOnWarn: false,
  declaration: true,
  clean: true,
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
  entries: ['src/main.ts'],
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    esbuild: {
      globalName: 'ph_reponame',
      minify: true,
    },
  },
})
