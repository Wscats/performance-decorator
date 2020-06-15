import 'reflect-metadata'

const type = 'type'
class DefineMetadata {
  @Reflect.metadata(type, 'staticMathod')
  static staticMethod() {}
  static staticProperty = 'static'
  getName() {}
}
Reflect.defineMetadata(type, 'class', DefineMetadata)
Reflect.defineMetadata(type, 'staticMethod', DefineMetadata.staticMethod)
Reflect.defineMetadata(type, 'staticMethos', DefineMetadata, 'staticMethod')
Reflect.defineMetadata(type, 'method', DefineMetadata.prototype.getName)
Reflect.defineMetadata(type, 'staticProperty', DefineMetadata, 'staticProperty')
const t1 = Reflect.getMetadata(type, DefineMetadata)
const t2_1 = Reflect.getMetadata(type, DefineMetadata.staticMethod)
const t2 = Reflect.getMetadata(type, DefineMetadata, 'staticMethod')
const t3 = Reflect.getMetadata(type, DefineMetadata.prototype.getName)
const t4 = Reflect.getMetadata(type, DefineMetadata,'staticProperty')
console.log(t1,t2,t2_1,t3,t4)
