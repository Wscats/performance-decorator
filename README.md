# 装饰器对类方法性能的监听

在很多时候我们项目越来越大的时候，我们希望去监听局部某些类方法的性能，这个时候我们既不想影响源代码的功能，但又想借助某些方案去窥探类方法内部的运行效能，此时我们就可以考虑使用装饰器对类方法性能进行监听。装饰器相信大家都不陌生了，虽然在 Javasript 里面它仍处于提议阶段，但是我们已经可以 TypeScript 里面运用这个特性，也可以借助 babel 的语法转换在 Javasript 里面使用。

## 那先简单讲讲什么是装饰器吧

装饰器其实是对类、方法、访问符(get 和 set 等)、参数和属性之类的一种装饰，可以针对其添加一些额外的行为，所以一般我们在项目里面常见有四种类型的装饰器：

- 类装饰器
- 方法装饰器
- 属性装饰器
- 参数装饰器

简单来讲就是在原代码外部包裹另一部分代码，而包裹的代码用于修饰源代码，从而使源代码在不受影响的情况下，拓展出新的功能，这是一种非入侵式的代码注入，是一种良好的代码拓展手段。我们常见的 React 里面经常也会遇到这种思路的代码，比如高阶组件和函数复合，很多第三方库也是用类似的方案来作为一种插件修改源代码，类似的有 Mobx 和 Redux。

如果该装饰器用于修饰拓展一个类，那它就是类装饰器，如果是用于修饰拓展一个函数，那么它就是一个函数装饰器，其他也如此，使用的是 TypeScript 的语法，使用`@`作为标识符，并放置在被装饰代码之前，由于该语法糖仍处于提议阶段，未来仍有可能改变，具体写法如下：

```ts
// 类装饰器
@sealed
class Greeter {
  constructor(message: string) {
    this.greeting = message;
  }

  // 属性装饰器
  @format("Hello, %s")
  greeting: string;

  // 访问器装饰器
  @configurable(false)
  get greeting() {
    return this.greeting;
  }

  // 方法装饰器
  @validate
  // 参数装饰器
  greet(@required name: string) {
    return "Hello " + name + ", " + this.greeting;
  }
}
```

## 用装饰器处理下业务代码吧

比如现在我有以下一段业务代码，是一个常用到的工具类：

```ts
class RequestApi {
  undo() {}
  redo() {}
  applyCollab() {}
  applyOffline() {}
  // ...
}
```

现在我们需要增加一个函数执行的耗时，我们可以直接在 undo 方法内部增加这些代码，本质其实是在 undo 方法执行前记录开始时间，执行后记录结束的计算，两者的差值就相当于该函数的运行时间了。

```js
class RequestApi {
  undo(a, b) {
+ // 函数执行前的时间
+ let start = new Date().valueOf();
+   try {
      console.log("undo");
+   } finally {
+     // 函数执行后的时间
+     let end = new Date().valueOf()
+     console.log([{ performance: end - start }]);
+   }
    // ...
  }
}
```

当然我们还可以查看该类方式在业务上调用的一些具体情况，诸如：入参和出参的情况，方法执行前后的内存变换，方法被调用的次数和方法是否出现未知错误等等。但如果我们直接修改该类方法，那么有可能会破坏该类的原有逻辑和理解，对函数结构造成不可逆的破坏，该函数调用次数也很多，在调用方耦合这部分监听的代码也不友好，后期如果有相似的类方法需要统计耗时，每个函数添加相似片段的代码，低效复用率低和维护成本高，那么怎么办呢，我们就可以在这里使用**装饰器**代替直接修改类方法，从而在不改变原有代码的固有逻辑和理解情况下，往类方法增加一些监听方法的装饰代码。

```ts
// 灵活封装方法装饰器，统计类方法的耗时
+ function logPerformance(target, name, descriptor) {
+   const original = descriptor && descriptor.value;
+   if (typeof original === "function") {
+     // 在 NodeJS 中你可以使用 process.hrtime() 代替 new Date() 实际测试 performance.now() 在浏览器端更精确
+     let start = new Date().valueOf();
+     descriptor.value = function (...args) {
+       try {
+         const result = original.apply(this, args);
+         return result;
+       } catch (e) {
+         throw e;
+       } finally {
+         // @ts-ignore
+         let end = new Date().valueOf();
+         console.log([{ args, performance: end - start }]);
+       }
+     };
+   }
+   return descriptor;
+ }

class RequestApi {
+ @logPerformance
  undo(a, b) {
    console.log("undo");
    // ...
  }
  // ...
}
```

我们把前面在 undo 方法内部增加的代码封装成`logPerformance`装饰器，这个装饰器主要逻辑如下，装饰器修饰的不是类本身，而是修饰类的方法，那么它的描述符 descriptor 会记录着这个方法的全部信息，我们可以对它任意的进行扩展和封装，而 descriptor.value 属性是描述符表示方法的默认返回值，这里我们可以直接覆盖一个新的返回值来修改该方法，如果返回值为 undefined 则会忽略，使用之前的 descriptor.value 引用作为方法的描述符，其实我们也可以修改 target 来达到同样的目的。

笔者这里建议在浏览器端使用`performance.now()`来做为测量，实践中`performance.now()`更为精确，`performance.now()`是相对于页面加载和更精确的数量级。用例包括基准测试和其他需要高分辨率时间的情况，如媒体（游戏、音频、视频等）。
需要注意的是，`performance.now()`仅在较新的浏览器（包括 IE10+）中可用。
`Date.now()`相对于 Unix epoch（1970-01-01t00:00:00z）并且依赖于系统时钟。在 NodeJS 中你可以使用 `process.hrtime()` 来代替。

这里其实还可以收集函数执行前后的内存变化，可以使用`performance.memory`来观察，不过`performance.memory`还没成为规范，并且实际操作有一定的误差，暂时还是不建议使用。也可以收集函数前后的入参`argument`和出参，并且在这里还可以加入上报等逻辑，来调查函数的使用频率和错误状态。

上面这段 TypeScript 代码经过编译最终会变成如下 JavaScript 代码：

```js
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
function logPerformance(target, name, descriptor) {
  var original = descriptor && descriptor.value;
  if (typeof original === "function") {
    // 在 NodeJS 中你可以使用 process.hrtime() 代替 performance.now()
    var start_1 = performance && performance.now();
    descriptor.value = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      try {
        var result = original.apply(this, args);
        return result;
      } catch (e) {
        throw e;
      } finally {
        var end = performance && performance.now();
        console.log([{ args: args, performance: start_1 - end }]);
      }
    };
  }
  return descriptor;
}
var RequestApi = /** @class */ (function () {
  function RequestApi() {}
  RequestApi.prototype.undo = function (a, b) {
    console.log("undo");
    // ...
  };
  __decorate([logPerformance], RequestApi.prototype, "undo");
  return RequestApi;
})();
new RequestApi().undo();
```

由于我们使用 TypeScript 解析的装饰器语法糖，从解析后的 JavaScript 代码我们可以分析出装饰器的原理是什么，我们可以看到方法装饰器实现的本质都在`__decorate()`方法里面，里面主要配合运用了`getOwnPropertyDescriptor()`方法和`Object.defineProperty()`方法，而 target 的本质其实是`RequestApi.prototype`，这里会使用 Object.getOwnPropertyDescriptor(RequestApi.prototype, "undo") 获取 descriptor 描述符信息，然后使用 Object.defineProperty(RequestApi.prototype, "undo", descriptor) 修改 descriptor 并修饰原函数，并使用 `Object.defineProperty()` 重新设置该类，一般来说我们也可以直接使用直接对对象原型方法来赋值去改变这个方法，但是使用 `Object.defineProperty()` 的好处是 writable、enumerable 和 configurable 这些值都可以重新修改了，有了上面这几个步骤我们就完成整个装饰器的功能，简化之后大概就是以下代码的思路。

- Object.getOwnPropertyDescriptor(obj, prop) 方法返回指定对象上一个自有属性对应的属性描述符。（自有属性指的是直接赋予该对象的属性，不需要从原型链上进行查找的属性）
- Object.defineProperty(obj, prop, descriptor) 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象

```js
class RequestApi {
  undo() {
    console.log("undo");
    // ...
  }
  // ...
}
const descriptor = Object.getOwnPropertyDescriptor(
  RequestApi.prototype,
  "undo"
);
Object.defineProperty(RequestApi.prototype, "undo", {
  ...descriptor,
  // 修改描述符
  value: () => console.log("undo descriptor"),
});
// 建议使用 Object.defineProperty 更改属性，不建议使用下面这种方法
// RequestApi.prototype.undo = descriptor.value;
new RequestApi().undo();
```

## 进一步优化我们的装饰器

由上面的分析之后，我们其实可以使用该原理在 JavaScript 中实现一个装饰器，因为众所周知的原因，我们很多业务还有很多非 TypeScript 的 JavaScript 代码，所以我们可以使用上面的原理做一个兼容性比较好的装饰器去处理各种复杂的业务代码。不仅如此，我们还可以根据业务需求改进我们的方法装饰器，因为代码中一个类有可能有几十个方法，如果我们往每个方法里面绑定一个装饰器，那么代码就会写成以下未改进前的样子，但这种写法在需要装饰比较多的方法之后显得有点低效。

```ts
// 未改进前
class RequestApi {
+ @logPerformance
  undo() {}
+ @logPerformance
  redo() {}
+ @logPerformance
  applyCollab() {}
+ @logPerformance
  applyOffline() {}
  // ...
}

// 改进后
=>
+ @logPerformance
class RequestApi {
  undo() {}
  redo() {}
  applyCollab() {}
  applyOffline() {}
  // ...
}
```

所以某些时候我们不止想装饰类里面的某几个方法，而是想修饰整个类里面的所有方法，那么我们可以考虑一下装饰整个类，扫描整个类里面所有的方法，并修改这些方法修改来装饰，期间我们还可以放入一些方法或者属性的匹配规则，从而有规律的去装饰特定的一些方法，那么我们以下就慢慢进行实现。首先可以先把装饰器放到类上面，使用 `Object.getOwnPropertyNames()` 方法获取该类所有的方法，并使用 `Object.keys` 遍历出每一个方法，然后根据上面刚才方法装饰器解析的思路，使用 `Object.getOwnPropertyDescriptor()` 取出每一个方法的描述符，重新修改和修饰，最后结合 `Object.defineProperty()` 方法重新整合出新的 RequestApi 类，最后而 RequestApi 类里面所有方法都被成功的装饰了一遍。

```js
class RequestApi {
  undo() {}
  redo() {}
  // ...
}
// 获取类所有的方法
const propertyNames = Object.getOwnPropertyNames(RequestApi.prototype);
// 遍历类所有的方法
Object.keys(propertyNames).forEach((key) => {
  // 获取描述符
  const descriptor = Object.getOwnPropertyDescriptor(
    RequestApi.prototype,
    propertyNames[key]
  );
  Object.defineProperty(RequestApi.prototype, propertyNames[key], {
    ...descriptor,
    value: descriptor.value.bind(this),
  });
});
```

有了上面的这个思路我们就只需要把它稍微封装一下，就可以封装出这个通用的装饰器，有了这个装饰器我们还可以继续丰富这个装饰器的接口，我们可以使用一个闭包来封装这个装饰器，让装饰器可以带参数来丰富更多的功能，我们可以在上面增加接口开关，控制装饰器的特定功能，比如下面我们可以使用 isTraceDecoratorOpen, isInParamsOpen, isOutParamsOpen 等来分别控制该装饰器是否要记录入参，是否要记录出参，是否使用装饰后的函数还是原函数，后续我们还可以使用 `Relfect Metadata` ，它强大的反射接口允许我们在运行时检查未知类并找出有关它的所有内容。我们可以使用它找到以下信息，比如：类的名称，类型，构造函数参数的名称和类型等，这里就不单独阐述这方面的知识了，有兴趣的同学可以查看 `Relfect Metadata` 库的相关文档和信息，甚者我们可以使用一个堆栈去维护装饰器返回的结果，这个堆栈可以提供一个 start 和 end 的方法分别放在函数执行前和执行后，一个完整的堆栈可以分析出局部某一部分的类的执行效率，并通过入参来推导和模拟出一次完整的类方法被调用的过程，从而复现问题和提升类方法的性能。

```ts
+ interface Options {
+     // 是否开启监听
+     isTraceDecoratorOpen?: boolean;
+     // 是否记录函数入参
+     isInParamsOpen?: boolean;
+     // 是否记录函数出参
+     isOutParamsOpen?: boolean;
+ }
+ function logPerformance(options: Options) {
+   return function (Class: any) {
+     // 获取类所有的方法
+     const propertyNames = Object.getOwnPropertyNames(Class.prototype);
+     // 这里可以对原函数进行装饰
+     const decorateFunction = (...inParams) => descriptor.value.apply(this, inParams);
+     // 遍历类所有的方法
+     Object.keys(propertyNames).forEach((key) => {
+       // 获取描述符
+       const descriptor = Object.getOwnPropertyDescriptor(
+         Class.prototype,
+         propertyNames[key]
+       );
+       Object.defineProperty(Class.prototype, propertyNames[key], {
+         ...descriptor,
+         // isTraceDecoratorOpen 开关控制是否要启用经过装饰的原函数
+         value: options.isTraceDecoratorOpen? decorateFunction : descriptor.value.bind(this),
+       });
+     });
+   };
+ }

+ @logPerformance(/*带参数的装饰器*/)
class RequestApi {
  undo() {}
  redo() {}
  applyCollab() {}
  applyOffline() {}
  // ...
}
```

## 配合 AST 把装饰范围延伸到全局

有时候类装饰器可能覆盖的范围还不够，我们可能想分析出全局所有的类方法的执行效率，那么我们可以考虑和 AST (Abstract Syntax Tree)抽象语法树合作一次，因为手动书写去注入装饰器，在几个文件里面还可以接受，但是往往我要整个模块去注入装饰器，此时手动注入就变得不靠谱，那么我们可以在 webpack 编译的时候通过 loader 这个阶段去分析源代码每一个有类的地方，然后自动帮我们在每一个类里面增加装饰器，AST 主要就是帮我们分析出特定的语法单元，比如类就是这个特定的语法单元，通过 AST 解析器我们会转化成一个抽象语法树：

```js
class RequestApi {
  undo() {}
  redo() {}
  applyCollab() {}
  applyOffline() {}
  // ...
}

// 经过 AST 分析后会解析成类似下面树状信息 =>
{
  "type": "File",
    'program': {
    "body": [
      {
        "type": "ClassDeclaration",
        "id": {
          "type": "Identifier"
        },
        "body": {
          "type": "ClassBody",
          "body": [
            { "type": "MethodDefinition" },
            { "type": "MethodDefinition" },
            { "type": "MethodDefinition" },
            { "type": "MethodDefinition" },
          ]
        }
      }
    ]
  }
}
```
