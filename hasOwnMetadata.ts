import 'reflect-metadata'
const type = 'type'
class Parent {
  @Reflect.metadata(type, 'getName')
  getName() {}
}
@Reflect.metadata(type, 'class')
class HasOwnMetadataClass extends Parent{
  @Reflect.metadata(type, 'static')
  static staticProperty() {}
  @Reflect.metadata(type, 'method')
  method() {}
}

const t1 = Reflect.hasOwnMetadata(type, HasOwnMetadataClass)
const t2 = Reflect.hasOwnMetadata(type, HasOwnMetadataClass, 'staticProperty')
const t3 = Reflect.hasOwnMetadata(type, HasOwnMetadataClass.prototype, 'method')
const t4 = Reflect.hasOwnMetadata(type, HasOwnMetadataClass.prototype, 'getName')
const t5 = Reflect.hasMetadata(type, HasOwnMetadataClass.prototype, 'getName')

console.log(t1, t2, t3, t4, t5)
