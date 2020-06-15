import 'reflect-metadata'

const nameSymbol = Symbol('lorry')
// 类元数据
@Reflect.metadata('class', 'class')
class MetaDataClass {
  // 实例属性元数据
  @Reflect.metadata(nameSymbol, 'nihao')
  public name = 'origin'
  // 实例方法元数据
  @Reflect.metadata('getName', 'getName')
  public getName () {
  }
  // 静态方法元数据
  @Reflect.metadata('static', 'static')
  static staticMethod () {
  }
}
const value = Reflect.getMetadata('name', MetaDataClass);
const metadataInstance = new MetaDataClass
const name = Reflect.getMetadata(nameSymbol, metadataInstance, 'name')
const methodVal = Reflect.getMetadata('getName', metadataInstance, 'getName')
const staticVal = Reflect.getMetadata('static', MetaDataClass, 'staticMethod')
console.log(value,name,methodVal,staticVal)
