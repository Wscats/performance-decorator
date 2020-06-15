import 'reflect-metadata'
const type = 'type'
@Reflect.metadata('parent', 'parent')
class Parent {
  getName() {}
}
@Reflect.metadata(type, 'class')
class HasOwnMetadataClass extends Parent{
  @Reflect.metadata(type, 'static')
  static staticProperty() {}
  @Reflect.metadata('bbb', 'method')
  @Reflect.metadata('aaa', 'method')
  method() {}
}

const t1 = Reflect.getMetadataKeys(HasOwnMetadataClass)
const t2 = Reflect.getMetadataKeys(HasOwnMetadataClass.prototype, 'method')
console.log(t1, t2)

