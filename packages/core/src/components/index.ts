import { createUnplugin } from 'unplugin'
import type { ComponentInfo, Options, ResolvedOptions } from './types'
import { scanComponents } from './scan'
import { transformVueFile } from './transform'
import { createResolverEngine } from './resolvers'
import { generateDts } from './dts'

const DEFAULT_OPTIONS: ResolvedOptions = {
  dirs: 'src/components',
  extensions: ['vue'],
  exclude: ['**/node_modules/**', '**/.git/**'],
  dts: 'components.d.ts',
  verbose: false,
}

export type {
  ComponentInfo,
  ComponentResolveResult,
  ComponentResolver,
  ComponentResolverObject,
  Options,
} from './types'

export default createUnplugin((rawOptions: Options = {}) => {
  const options: ResolvedOptions = { ...DEFAULT_OPTIONS, ...rawOptions }
  const resolve = createResolverEngine(options.resolvers)

  let root = process.cwd()
  let componentsMap = new Map<string, ComponentInfo>()

  const rescan = (): void => {
    componentsMap = scanComponents(root, options)
    if (options.dts !== false)
      generateDts(root, componentsMap, options.dts ?? true)
  }

  return {
    name: 'unplugin-vue-components-rename',
    enforce: 'post',

    vite: {
      configResolved(config) {
        root = config.root
        rescan()
      },
      // Rescans local components whenever a .vue file is added/removed/edited,
      // so new files are picked up during dev without restarting the server.
      handleHotUpdate({ file }) {
        if (file.endsWith('.vue'))
          rescan()
      },
    },

    transformInclude(id) {
      return id.endsWith('.vue') && !id.includes('node_modules')
    },

    async transform(code, id) {
      try {
        return await transformVueFile(code, id, componentsMap, resolve)
      }
      catch (err) {
        this.error(err as Error)
      }
    },
  }
})
