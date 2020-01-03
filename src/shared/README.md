# 1、shared

区分好了模块，就该开始办正事了。所有的模块都会用到公共模块，可以先从shared下手。

## 1.1 全局常量（/src/shared/constants.js）

```js
export const SSR_ATTR = 'data-server-rendered'; // ssr渲染时的属性名

export const ASSET_TYPES = [ // 断言类型
  'component',
  'directive',
  'filter'
]

export const LIFECYCLE_HOOKS = [ // 生命周期钩子
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed', // 以上的是我们最常见的8个基本钩子
  'activated',
  'deactivated', // 这两个钩子会在组件使用了keep-alive时存在
  'errorCaptured', // 错误捕获钩子
  'serverPrefetch' // 未知，待补充
]

```

## 1.2 工具库（/src/shared/utils.js）

说明：该文件采用了flow库，类ts语法。有很多有用的函数可以在这里看到，建议大家细读。下面我只发名称与对应的功能。**建议搭配源文件一起查看！**

emptyObject：空对象，该对象不可修改

isUndef：是否是undefined或null

isDef：isUndef的非

isTrue：是否全等true

isFalse：是否全等false

isPrimitive：是否是原始类型，不包括undefined和null，但包括ES6的Symbol

isObject：是否是对象，不包括null

toRawType：获取原始数据类型字符串

isPlainObject：判断是否是纯JS对象。纯JS对象是指直接原型为Object的对象。Array、Function等均不是纯JS对象。

isRegExp：是否是正则对象。

isValidArrayIndex：判断数组的下标是否合法

isPromise：是否是Promise对象

toString：将一个值转换成字符串，对象、数组会转换成JSON字符串。

toNumber：转换成数字，针对字符串。

makeMap：生成映射，用于检测一个键是否在映射中。

isBuiltInTag：是否是在标签中生成的，这里指slot和component是否在在模板字符串中。

isReservedAttribute：检测一个属性是否是保留属性。包括key、ref、slot、slot-scope、is。

remove：从数组中移除任意该项内容。

hasOwn：是hasOwnProperty的简写，检测对象是否有该键。

cached：创建一个可以缓存的纯函数。在第一次执行后，后面会读取缓存。（有没有想到计算属性）

camelize：驼峰化一个连字符，基于缓存函数cached

capitalize：将第一个字符大写化，基于缓存函数cached

hyphenate：连字符化一个驼峰，基于缓存函数cached

bind：bind兼容，不兼容时用apply模拟

toArray：将类数组转换成数组

extend：将一个对象扩展另一个对象的属性

toObject：将一个数组转换成一个对象

noop：无具体作用，用于flow的检测

no：总是返回false

identity：返回自身

genStaticKeys：从编译器模块中返回包含静态键的字符串

looseEqual：判断两个变量是否全等，包括对象与数组

looseIndexOf：返回数组中包含变量的序号

once：单次执行函数
