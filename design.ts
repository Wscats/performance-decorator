import 'reflect-metadata'
@Reflect.metadata('type', 'class')
class A {
  constructor(public name: string, public age: number) {
  }
  @Reflect.metadata(undefined, undefined)
  method(): boolean {
    return true
  }
}

const t1 = Reflect.getMetadata('design:paramtypes', A)
const t2 = Reflect.getMetadata('design:returntype', A.prototype, 'method')
const t3 = Reflect.getMetadata('design:type', A.prototype, 'method')

// console.log(...t1, t2, t3)

console.log(...t1)
console.log(t2)
console.log(t3)
