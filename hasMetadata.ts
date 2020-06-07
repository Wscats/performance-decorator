import 'reflect-metadata'
const type = 'type'
class HasMetadataClass {
  @Reflect.metadata(type, 'staticProperty')
  static staticProperty = ''
}
Reflect.defineMetadata(type, 'class', HasMetadataClass)
const t1 = Reflect.hasMetadata(type, HasMetadataClass)
const t2 = Reflect.hasMetadata(type, HasMetadataClass, 'staticProperty')
console.log(t1, t2)
