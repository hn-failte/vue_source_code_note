/* @flow */
/* Vue的一些全局配置项 */

import {
  no,
  noop,
  identity
} from 'shared/util'

import { LIFECYCLE_HOOKS } from 'shared/constants'

export type Config = {
  // 用户可配置
  optionMergeStrategies: { [key: string]: Function };
  silent: boolean;
  productionTip: boolean;
  performance: boolean;
  devtools: boolean;
  errorHandler: ?(err: Error, vm: Component, info: string) => void;
  warnHandler: ?(msg: string, vm: Component, trace: string) => void;
  ignoredElements: Array<string | RegExp>;
  keyCodes: { [key: string]: number | Array<number> };

  // 平台配置
  isReservedTag: (x?: string) => boolean;
  isReservedAttr: (x?: string) => boolean;
  parsePlatformTagName: (x: string) => string;
  isUnknownElement: (x?: string) => boolean;
  getTagNamespace: (x?: string) => string | void;
  mustUseProp: (tag: string, type: ?string, name: string) => boolean;

  // 私有配置
  async: boolean;

  // 遗留配置
  _lifecycleHooks: Array<string>;
};

export default ({
  /**
   * 选项合并策略（用于core / util / options）
   */
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * 在启动时显示生产模式提示消息？
   */
  productionTip: process.env.NODE_ENV !== 'production',

  /**
   * 是否启用devtools
   */
  devtools: process.env.NODE_ENV !== 'production',

  /**
   * 是否记录性能
   */
  performance: false,

  /**
   * 观察者错误的错误处理程序
   */
  errorHandler: null,

  /**
   * 观察者的警告处理程序警告
   */
  warnHandler: null,

  /**
   * 忽略某些自定义元素
   */
  ignoredElements: [],

  /**
   * v-on的自定义用户按键别名
   */
  keyCodes: Object.create(null),

  /**
   * 检查标签是否已保留，以便不能将其注册为组件。 这与平台有关，可能会被覆盖。
   */
  isReservedTag: no,

  /**
   * 检查属性是否已保留，以便不能用作组件属性。 这与平台有关，可能会被覆盖。
   */
  isReservedAttr: no,

  /**
   * 检查标签是否为未知元素。 与平台有关。
   */
  isUnknownElement: no,

  /**
   * 获取元素的命名
   */
  getTagNamespace: noop,

  /**
   * 解析特定平台的真实标签名称。
   */
  parsePlatformTagName: identity,

  /**
   * 检查是否必须使用属性来绑定属性，例如：依赖于平台的值。
   */
  mustUseProp: no,

  /**
   * 异步执行更新。 打算由Vue Test Utils使用。如果设置为false，这将大大降低性能。
   */
  async: true,

  /**
   * 由于遗留原因而暴露
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
}: Config)
