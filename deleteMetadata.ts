import 'reflect-metadata'
const type = 'type'
@Reflect.metadata(type, 'class')
class DeleteMetadata {
  @Reflect.metadata(type, 'static')
  static staticMethod() {}
}

const res1 = Reflect.deleteMetadata(type, DeleteMetadata)
const res2 = Reflect.deleteMetadata(type, DeleteMetadata, 'staticMethod')
const res3 = Reflect.deleteMetadata(type, DeleteMetadata)
console.log(res1, res2, res3)
