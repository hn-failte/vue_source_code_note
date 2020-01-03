/* @flow */

import config from '../config'
import Watcher from '../observer/watcher'
import { mark, measure } from '../util/perf'
import { createEmptyVNode } from '../vdom/vnode'
import { updateComponentListeners } from './events'
import { resolveSlots } from './render-helpers/resolve-slots'
import { toggleObserving } from '../observer/index'
import { pushTarget, popTarget } from '../observer/dep'

import {
  warn,
  noop,
  remove,
  emptyObject,
  validateProp,
  invokeWithErrorHandling
} from '../util/index'

// 激活的实例。
export let activeInstance: any = null
//是否正在更新子组件。
export let isUpdatingChildComponent: boolean = false

// 设置激活实例。
export function setActiveInstance(vm: Component) {
  const prevActiveInstance = activeInstance
  activeInstance = vm
  return () => {
    activeInstance = prevActiveInstance
  }
}

// 初始化生命周期。
export function initLifecycle (vm: Component) {
  const options = vm.$options

  // 找到第一位非抽象父实例。
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }

  vm.$parent = parent
  // 第一位非抽象父节点可以获取根实例，或当前就是根实例。
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

// 生命周期接入。
export function lifecycleMixin (Vue: Class<Component>) {
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const restoreActiveInstance = setActiveInstance(vm)
    vm._vnode = vnode
    // Vue.prototype.__patch__基于在使用的渲染后端入口点被注入。
    if (!prevVnode) {
      // 初始渲染。
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // 更新。
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    restoreActiveInstance()
    // 更新 __vue__ 引用。
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // 如果父项是高阶函数，则也更新其$el。
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
    // 调度程序将调用updated钩子，以确保在父组件实例的updated钩子中更新子组件实例。
  }

  // 全局方法Vue.$forceUpdate的定义。
  Vue.prototype.$forceUpdate = function () {
    const vm: Component = this
    if (vm._watcher) {
      vm._watcher.update()
    }
  }

  // 全局方法Vue.$destroy的定义。
  Vue.prototype.$destroy = function () {
    const vm: Component = this
    // destroy防抖。
    if (vm._isBeingDestroyed) {
      return
    }
    // 执行$destroy，会触发beforeDestroy钩子。
    callHook(vm, 'beforeDestroy')
    vm._isBeingDestroyed = true
    // remove self from parent
    const parent = vm.$parent
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm)
    }
    // 销毁watchers。
    if (vm._watcher) {
      vm._watcher.teardown()
    }
    let i = vm._watchers.length
    while (i--) {
      vm._watchers[i].teardown()
    }
    // 移除引用。不移除引用计数，不会被垃圾回收。
    // 冻结的对象可能没有观察者。
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--
    }
    // 执行最后一个钩子。
    vm._isDestroyed = true
    // 在当前渲染的树上调用销毁钩子
    vm.__patch__(vm._vnode, null)
    // 执行destroyed钩子。
    callHook(vm, 'destroyed')
    // 关闭所有实例侦听器。
    vm.$off()
    // 移除 __vue__ 引用
    if (vm.$el) {
      vm.$el.__vue__ = null
    }
    // 释放循环引用(#6759)
    if (vm.$vnode) {
      vm.$vnode.parent = null
    }
  }
}

// 绑定组件
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      /* 是否忽略istanbul单元测试检查 */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        )
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        )
      }
    }
  }
  // 执行beforeMount钩子
  callHook(vm, 'beforeMount')

  let updateComponent
  /* 是否忽略istanbul单元测试检查 */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`vue ${name} render`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

  // 我们将其设置为观察者构造函数中的vm._watcher，因为观察者的初始补丁可能会调用$forceUpdate（例如，在子组件的已挂接钩子内部），这取决于已经定义的vm._watcher
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // 手动安装的实例，调用安装在自安装实例上的调用将为其插入的挂钩中的渲染创建的子组件调用
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}

export function updateChildComponent (
  vm: Component,
  propsData: ?Object,
  listeners: ?Object,
  parentVnode: MountedComponentVNode,
  renderChildren: ?Array<VNode>
) {
  if (process.env.NODE_ENV !== 'production') {
    isUpdatingChildComponent = true
  }

  // 确定组件是否具有插槽子代，我们需要在覆盖$options._renderChildren之前执行此操作。

  // 检查是否有动态scopedSlot（手写或编译的但具有动态插槽名称）。 从模板编译的静态作用域插槽具有“ $stable”标记。
  const newScopedSlots = parentVnode.data.scopedSlots
  const oldScopedSlots = vm.$scopedSlots
  const hasDynamicScopedSlot = !!(
    (newScopedSlots && !newScopedSlots.$stable) ||
    (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
    (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key)
  )

  // 父级的任何静态插槽子级可能在父级更新期间已更改。 动态范围的插槽也可能已更改。 在这种情况下，必须进行强制更新以确保正确性。
  const needsForceUpdate = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    hasDynamicScopedSlot
  )

  vm.$options._parentVnode = parentVnode
  vm.$vnode = parentVnode // 更新虚拟机的占位符节点，而无需重新渲染

  if (vm._vnode) { // 更新子树的父级
    vm._vnode.parent = parentVnode
  }
  vm.$options._renderChildren = renderChildren

  // 更新$attrs和$listeners哈希
  // 这些也是响应式的，因此如果子组件在渲染期间使用了它们，它们可能会触发子组件的更新
  vm.$attrs = parentVnode.data.attrs || emptyObject
  vm.$listeners = listeners || emptyObject

  // 更新props传值
  if (propsData && vm.$options.props) {
    toggleObserving(false)
    const props = vm._props
    const propKeys = vm.$options._propKeys || []
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i]
      const propOptions: any = vm.$options.props // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm)
    }
    toggleObserving(true)
    // 保留原始propsData的副本
    vm.$options.propsData = propsData
  }

  // 更新监听器
  listeners = listeners || emptyObject
  const oldListeners = vm.$options._parentListeners
  vm.$options._parentListeners = listeners
  updateComponentListeners(vm, listeners, oldListeners)

  // 解决插槽，若有子组件实例则强制更新
  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context)
    vm.$forceUpdate()
  }

  if (process.env.NODE_ENV !== 'production') {
    isUpdatingChildComponent = false
  }
}

// 是否在不活跃的树上
function isInInactiveTree (vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) return true
  }
  return false
}

// 激活子组件（当组件使用keep-alive时）
export function activateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = false
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false
    for (let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i])
    }
    // 执行activated钩子
    callHook(vm, 'activated')
  }
}

// 休眠子组件（当组件使用keep-alive时）
export function deactivateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = true
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i])
    }
    // 执行deactivated钩子
    callHook(vm, 'deactivated')
  }
}

// 执行钩子
export function callHook (vm: Component, hook: string) {
  // #7573 调用生命周期挂钩时禁用dep收集
  pushTarget()
  const handlers = vm.$options[hook]
  const info = `${hook} hook`
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info)
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
  popTarget()
}
