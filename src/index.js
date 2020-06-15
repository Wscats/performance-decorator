class BaseTrace {
    traceId; // 标记本次Trace
    traceInfo = {};
    constructor(traceInfo) {
        this.traceId = this.getRandomId();
        if (traceInfo !== undefined) {
            this.traceInfo = traceInfo;
        }
    }

    getRandomId() {
        // 时间戳（9位） + 随机串（10位）
        return (Date.now()).toString(32) + Math.random().toString(32).substring(2);
    }
}

class FunctionTraceStash {
    level; // 当前层级，默认为0
    traceList; // Trace数组

    constructor() {
        this.level = 0;
        this.traceList = [];
    }

    // 开始本次 Trace
    // 添加该 Trace 之后将 level + 1，便于记录当前 Trace 的层次
    start(trace) {
        const { level } = this;
        this.add(trace, level);
        // 深入一层
        this.level = level + 1;
    }

    // 结束本次 Trace
    end() {
        // 回到当前层次
        this.level = this.level - 1;
    }

    add(trace, level) {
        this.traceList.push({
            trace,
            traceLevel: level,
        });
    }

    // 获取某个 Trace 对象
    getTrace(traceId) {
        return this.traceList.find((stashTrace) => stashTrace.trace.traceId === traceId) || null;
    }

    // 打印 Trace 堆栈信息
    printTraceList() {
        const traceStringList = [];
        this.traceList.forEach((stashTrace) => {
            let prefix = '';
            if (stashTrace.traceLevel && stashTrace.traceLevel > 0) {
                // 根据层次，前置 tab
                prefix = new Array(stashTrace.traceLevel).join('\t');
            }
            traceStringList.push(prefix + stashTrace.trace.print());
        });
        return traceStringList.join('\n');
    }

    // 打印函数调用次数统计
    printTraceCount(className, functionName) {
        let traceList = this.traceList;
        if (className && functionName) {
            traceList = this.traceList.filter(x => x.trace.traceInfo.className === className && x.trace.traceInfo.functionName === functionName);
        }
        const traceListCountInfo = {};
        traceList.forEach((stashTrace) => {
            const countKey = `${stashTrace.trace.traceInfo.className} -> ${stashTrace.trace.traceInfo.functionName}`;
            if (traceListCountInfo[countKey] === undefined) {
                traceListCountInfo[countKey] = 1;
            } else {
                traceListCountInfo[countKey] += 1;
            }
        });
        const traceCountStringList = [];
        Object.keys(traceListCountInfo).forEach(countInfoKey => {
            traceCountStringList.push(`${countInfoKey}: ${traceListCountInfo[countInfoKey]}`);
        });
        return traceCountStringList.join('\n');
    }

    // 重放该堆栈
    replay() {
        // TODO 考虑执行逻辑，是否只需要执行最外层即可
        // 此处先简单处理
        this.traceList[0].trace.exec();
    }

    // 移除
    clear() {
        this.traceList = [];
    }
}

class FunctionTrace extends BaseTrace {
    traceInfo;

    constructor(traceInfo) {
        super();
        this.traceInfo = traceInfo;
    }

    // 更新该函数的一些信息
    update(traceInfo) {
        this.traceInfo = {
            ...this.traceInfo,
            ...traceInfo,
        };
    }

    // 执行该函数
    exec() {
        const { inParams, originFunction } = this.traceInfo;
        // 判断是否可执行
        if (originFunction && typeof originFunction === 'function') {
            originFunction(...(inParams || []));
        }
    }

    // 打印该函数的一些信息
    print() {
        const { className, functionName, timeConsuming } = this.traceInfo;
        return `${className} -> ${functionName}(${this.traceId}): ${timeConsuming}`;
    }
}

const functionTraceStash = new FunctionTraceStash();
// 暂时存储在一个全局变量里面
window.functionTraceStash = functionTraceStash;

function traceClassDecorator(options) {
    return function (Class) {
        // 获取类对应的原型
        const target = Class.prototype;
        // 获取类名
        const className = Class.name;
        // 获取函数所有的属性名
        const propertyNames = Object.getOwnPropertyNames(target);
        // 遍历每个属性名
        Object.keys(propertyNames).forEach((property) => {
            const functionName = propertyNames[Number(property)];
            if (functionName.indexOf('-decorator') > -1) {
                return;
            }
            // 根据属性名，获取函数对应的描述符
            const descriptor = Object.getOwnPropertyDescriptor(target, functionName);
            // 帅选掉 get xxx(){} 的函数
            if (descriptor && descriptor.get) {
                return;
            }
            // 排除构造函数，和非函数的属性
            const isMethod = target[functionName] instanceof Function && functionName != 'constructor';
            if (!isMethod) {
                return;
            }
            // 生成新的函数，添加耗时统计逻辑
            const wrapFunction = function (...inParams) {
                const functionTrace = new FunctionTrace({
                    // 类名
                    className,
                    // 函数名
                    functionName,
                    // 入参 如果开关 inParamsIsOpen 值为 true 记录传入的参数
                    inParams: options && options.isInParamsOpen === true ? inParams : null,
                    // 原函数
                    originFunction: descriptor && descriptor.value.bind(this),
                });
                functionTraceStash.start(functionTrace);
                const timeStart = performance && performance.now();
                const outParams = descriptor && descriptor.value.apply(this, inParams);
                const originFunction = descriptor && descriptor.value.bind(this);
                try {
                    // 调用原函数逻辑
                    return outParams;
                } finally {
                    const timeEnd = performance && performance.now();
                    const timeConsuming = timeEnd - timeStart;
                    // console.table({
                    //     className,
                    //     timeConsuming
                    // })
                    functionTrace.update({
                        // 出参 如果开关 outParamsIsOpen 值为 true 记录出参的参数
                        outParams: options && options.isOutParamsOpen === true ? outParams : null,
                        // 耗时
                        timeConsuming,
                        // 原函数
                        originFunction,
                    });
                    functionTraceStash.end();
                }
            };

            // 将修改后的函数重新定义到原型链上
            Object.defineProperty(target, functionName, {
                ...descriptor,
                // 如果打开了监听,则使用覆盖后的函数，否则使用原函数
                value: (options && options.isTraceDecoratorOpen) || !options ? wrapFunction : descriptor && descriptor.value,
                // 设置属性不可被修改
                // writable: false
            });
        });
    };
}


