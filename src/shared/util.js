/* @flow */
// Vue使用了flow检测，该语法类似Typescript。而在Vue3.0中，Typescript替换了flow做类型检测。

// 定义空对象，该对象不可修改
export const emptyObject = Object.freeze({})

// 是否是undefined或null
export function isUndef (v: any): boolean %checks {
  return v === undefined || v === null
}

// isUndef的非
export function isDef (v: any): boolean %checks {
  return v !== undefined && v !== null
}

// 是否全等true
export function isTrue (v: any): boolean %checks {
  return v === true
}

// 是否全等false
export function isFalse (v: any): boolean %checks {
  return v === false
}

// 是否是原始类型，不包括undefined和null，但包括ES6的Symbol
export function isPrimitive (value: any): boolean %checks {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

// 是否是对象，不包括null
export function isObject (obj: mixed): boolean %checks {
  return obj !== null && typeof obj === 'object'
}

// 获取原始数据类型字符串
const _toString = Object.prototype.toString

export function toRawType (value: any): string {
  return _toString.call(value).slice(8, -1)
}

// 判断是否是纯JS对象。纯JS对象是指直接原型为Object的对象。Array、Function等均不是纯JS对象。
export function isPlainObject (obj: any): boolean {
  return _toString.call(obj) === '[object Object]'
}

// 是否是正则对象
export function isRegExp (v: any): boolean {
  return _toString.call(v) === '[object RegExp]'
}

// 判断数组的下标是否合法
export function isValidArrayIndex (val: any): boolean {
  const n = parseFloat(String(val))
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

// 是否是Promise对象
export function isPromise (val: any): boolean {
  return (
    isDef(val) &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
  )
}

// 将一个值转换成字符串，对象、数组会转换成JSON字符串。
export function toString (val: any): string {
  return val == null
    ? ''
    : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
      ? JSON.stringify(val, null, 2)
      : String(val)
}

// 转换成数字，针对字符串。
export function toNumber (val: string): number | string {
  const n = parseFloat(val)
  return isNaN(n) ? val : n
}

// 生成映射，用于检测一个键是否在映射中。
export function makeMap (
  str: string,
  expectsLowerCase?: boolean
): (key: string) => true | void {
  const map = Object.create(null)
  const list: Array<string> = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val]
}

// 是否是在标签中生成的，这里指slot和component是否在在模板字符串中。
export const isBuiltInTag = makeMap('slot,component', true)

// 检测一个属性是否是保留属性。包括key、ref、slot、slot-scope、is。
export const isReservedAttribute = makeMap('key,ref,slot,slot-scope,is')

// 从数组中移除任意该项内容。
export function remove (arr: Array<any>, item: any): Array<any> | void {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

// 是hasOwnProperty的简写，检测对象是否有该键。
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj: Object | Array<*>, key: string): boolean {
  return hasOwnProperty.call(obj, key)
}

// 创建一个可以缓存的纯函数。在第一次执行后，后面会读取缓存。（有没有想到计算属性）
export function cached<F: Function> (fn: F): F {
  const cache = Object.create(null)
  return (function cachedFn (str: string) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }: any)
}

// 驼峰化一个连字符，基于缓存函数cached
const camelizeRE = /-(\w)/g
export const camelize = cached((str: string): string => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
})

// 将第一个字符大写化，基于缓存函数cached
export const capitalize = cached((str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
})

// 连字符化一个驼峰，基于缓存函数cached
const hyphenateRE = /\B([A-Z])/g
export const hyphenate = cached((str: string): string => {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
})

// bind兼容，不兼容时用apply模拟。比如：PhantomJS 1.x.
function polyfillBind (fn: Function, ctx: Object): Function {
  function boundFn (a) {
    const l = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }

  boundFn._length = fn.length
  return boundFn
}

function nativeBind (fn: Function, ctx: Object): Function {
  return fn.bind(ctx)
}

export const bind = Function.prototype.bind
  ? nativeBind
  : polyfillBind

// 将类数组转换成数组
export function toArray (list: any, start?: number): Array<any> {
  start = start || 0
  let i = list.length - start
  const ret: Array<any> = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

// 将一个对象扩展另一个对象的属性
export function extend (to: Object, _from: ?Object): Object {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

// 将一个数组转换成一个对象
export function toObject (arr: Array<any>): Object {
  const res = {}
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}

// 无具体作用，用于flow的检测
export function noop (a?: any, b?: any, c?: any) {}

// 总是返回false
export const no = (a?: any, b?: any, c?: any) => false

// 返回自身
export const identity = (_: any) => _

// 从编译器模块中返回包含静态键的字符串
export function genStaticKeys (modules: Array<ModuleOptions>): string {
  return modules.reduce((keys, m) => {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

// 判断两个变量是否全等，包括对象与数组
export function looseEqual (a: any, b: any): boolean {
  if (a === b) return true
  const isObjectA = isObject(a)
  const isObjectB = isObject(b)
  if (isObjectA && isObjectB) {
    try {
      const isArrayA = Array.isArray(a)
      const isArrayB = Array.isArray(b)
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every((e, i) => {
          return looseEqual(e, b[i])
        })
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
      } else if (!isArrayA && !isArrayB) {
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        return keysA.length === keysB.length && keysA.every(key => {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

// 返回数组中包含变量的序号
export function looseIndexOf (arr: Array<mixed>, val: mixed): number {
  for (let i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) return i
  }
  return -1
}

// 单次执行函数
export function once (fn: Function): Function {
  let called = false
  return function () {
    if (!called) {
      called = true
      fn.apply(this, arguments)
    }
  }
}
