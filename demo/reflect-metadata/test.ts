import 'reflect-metadata'
function logType(target: any, key: string) {
    var t = Reflect.getMetadata("design:type", target, key);
    console.log(`${key} type: ${t.name}`);
}

// class Demo {
//     @logType // apply property decorator
//     public attr1: string;
// }

function logParamTypes(target: any, key: string) {
    var types = Reflect.getMetadata("design:paramtypes", target, key);
    var s = types.map(a => a.name).join();
    console.log(`${key} param types: ${s}`);
}

function logReturnTypes(target: any, key: string) {
    var types = Reflect.getMetadata("design:returntype", target, key);
    console.log(types);
}

function cls(): Function {
    return function (object: Function) {
        console.dir(object)
        object.prototype.init = function () {
            console.log("user app is init");
        }
        return object;
    };
}

function log(target: any, key: string, value: any) {
    return {
        value: function (...args: any[]) {
            var a = args.map(a => JSON.stringify(a)).join();
            var result = value.value.apply(this, args);
            var r = JSON.stringify(result);
            console.log(`Call: ${key}(${a}) => ${r}`);
            return result;
        }
    };
}

// class Foo { }
// interface IFoo { }

// class Demo {
//     @logParamTypes // apply parameter decorator
//     @logReturnTypes
//     doSomething(
//         param1: string,
//         param2: number,
//         param3: Foo,
//         param4: { test: string },
//         param5: IFoo,
//         param6: Function,
//         param7: (a: number) => void,
//     ): number {
//         return 1
//     }

//     @logParamTypes // apply parameter decorator
//     @logReturnTypes
//     doSomething2(
//         param1: string,
//         param2: number,
//         param3: Foo,
//         param4: { test: string },
//         param5: IFoo,
//         param6: Function,
//         param7: (a: number) => void,
//     ): number {
//         return 1
//     }

//     @logParamTypes // apply parameter decorator
//     @logReturnTypes
//     abc(a: string) {
//         return 2
//     }
// }

@cls()
class C {
    @log
    @logParamTypes
    @logReturnTypes
    foo(n: number) {
        return n * 2;
    }

    @log
    @logParamTypes
    plus(a: number, b: number) {
        return a + b
    }

}

var c = new C();
// let value = Reflect.getMetadata('foo', c, "method");

// console.log(value)
var r = c.foo(23); //  "Call: foo(23) => 46"
console.log(r);    // 46

// console.log(Reflect.getMetadata('inMethod', new C(), 'foo')) // 'B'

// var r = c.plus(45, 67); //  "Call: foo(23) => 46"
// console.log(r);    // 46



// const metadataKey = 'some-key'

// const Decorate = (): ClassDecorator => {
//     return (target: Function) => {
//         Reflect.getMetadata('design:paramtypes', target); // '/test'
//         console.log(Reflect.getMetadata('design:paramtypes', target))
//         console.log(target)
//     }
// }

// @Decorate()
// class C {
//     get name(): string {
//         return 'text'
//     }
// }