# 1、core（/src/core/）

然后，我们转移注意力到从最核心的地方core，查看index.js（/src/core/index.js）

可以看出instance就是Vue类，initGlobalAPI处理Vue初始化全局api，相关渲染方式处理，最后导出的是一个Vue构造函数。

除次之外，还有一个config.js（/src/core/config.js）的文件，可以看到里面的都是vue的全局配置项。目录下也有一个util工具库，最为核心的vdom等等。后面再谈这些。

## 1.1 instance（/src/core/instance）

instance与vue实例相关，通过index.js（/src/core/instance/index.js），可以发现，这里导出的是一个Vue构造函数，而这个构造函数分成了五个过程注入元素：

```js
initMixin(Vue) // 初始化
stateMixin(Vue) // 状态
eventsMixin(Vue) // 事件
lifecycleMixin(Vue) // 生命周期
renderMixin(Vue) // 渲染
```

根据命名，我们可以初步理解各个过程的含义。随后我们对对应的部分进行查看

### 1.1.1 init（/src/core/instance/init.js）

init用于初始化Vue实例。

首先为vue提供了`_init`方法，这个方法提供了`_uid`、`_isVue`、`$options`、`_renderProxy`、`_self`一系列属性

*注：这里的函数此时查看不一定能全懂，建议看的差不多了再回头看*

其中若传入的是组件，即传入值存在`_isComponent`会调用`initInternalComponent`进行处理

同样，在Vue中很重要的`$options`，经过了`mergeOptions`、`resolveConstructorOptions`的嵌套处理

而后是`initProxy`进行属性代理初始化

再对实例进行数据注入：

```js
initLifecycle(vm) // 初始化生命周期
initEvents(vm) // 初始化事件
initRender(vm) // 初始化渲染
callHook(vm, 'beforeCreate') // 执行beforeCreate钩子
initInjections(vm) // 初始化注入，此时数据和传值还未注入
initState(vm) // 初始化状态
initProvide(vm) // 解析数据和传值
callHook(vm, 'created') // 执行created钩子
```

可以很容易看出，我们在这里有执行两个生命周期，而能获取到this的生命周期便是created，那么我们晚会可以看看是在哪个过程中注入了this

紧随其后，如果绑定元素是存在的，会开始进行绑定。

```js
if (vm.$options.el) {
    vm.$mount(vm.$options.el)
}
```

### 1.1.2 lifecycle（/src/core/instance/lifecycle.js）



## 1.2 component

展开component目录，发现下面只有一个keep-alive。而keep-alive作用时候使组件不被销毁

keep-alive:

