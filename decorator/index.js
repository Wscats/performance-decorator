class Model1 {
    getData() {
        setTimeout(() => {
            let b = 1 + 2 + 3 + 4 + 5
        }, 1000)

        return [{
            id: 1,
            name: 'Niko'
        }, {
            id: 2,
            name: 'Bellic'
        }]
    }
}

function wrap(Model, key) {
    // 获取Class对应的原型
    let target = Model.prototype

    // 获取函数对应的描述符
    let descriptor = Object.getOwnPropertyDescriptor(target, key)

    // 生成新的函数，添加耗时统计逻辑
    let log = function (...arg) {
        console.time("log");
        let start = new Date().valueOf()
        // In NodeJS you would need to use process.hrtime() instead of performance.now() and it behaves a little differently.
        let t0 = performance && performance.now()
        try {
            return descriptor.value.apply(this, arg) // 调用之前的函数
        } finally {
            let end = new Date().valueOf()
            let t1 = performance && performance.now()
            console.timeEnd("log");
            // console.log(`start: ${start} end: ${end} consume: ${end - start}`)
            // console.log(t1 - t0, 'milliseconds')
            console.table([{
                key,
                start,
                end,
                performance: t1 - t0
            }])
        }
    }

    // 将修改后的函数重新定义到原型链上
    Object.defineProperty(target, key, {
        ...descriptor,
        // 覆盖描述符重的value
        value: log,
        // 设置属性不可被修改    
        // writable: false
    })
}

wrap(Model1, 'getData')

// start: XXX end: XXX consume: XXX
console.log(new Model1().getData())     // [ { id: 1, name: 'Niko'}, { id: 2, name: 'Bellic' } ]
// start: XXX end: XXX consume: XXX
// console.log(Model1.prototype.getData()) // [ { id: 1, name: 'Niko'}, { id: 2, name: 'Bellic' } ]


