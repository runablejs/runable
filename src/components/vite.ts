import unplugin from './index'
import type { Options } from './types'

export default (options: Options = {}) => unplugin.vite(options)
export type { ComponentInfo, ComponentResolver, Options } from './types'
