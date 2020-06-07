import 'reflect-metadata'

const propertyDecorator:PropertyDecorator = (target, propertyKey) => {
  const origin = target[propertyKey]
  target[propertyKey] = (...args: any[]) => {
    origin(args)
    console.log('added override')
  }
}

const methodDecorator:MethodDecorator = (target, propertyKey, descriptor) => {
  console.log(descriptor)
  // const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey)
  descriptor.configurable = false
  descriptor.writable = false
  return descriptor
}

class PropertyAndMethodExample {
  @propertyDecorator
  static staticProperty() {
      console.log('im static property')
  }
  @methodDecorator
  method() {
      console.log('im one instance method')
  }
}
// Reflect.decorate([propertyDecorator], PropertyAndMethodExample, 'staticProperty')
// let descriptor = Object.getOwnPropertyDescriptor(PropertyAndMethodExample.prototype, 'method')
// descriptor = Reflect.decorate([methodDecorator], PropertyAndMethodExample, 'method', descriptor)
// Object.defineProperty(PropertyAndMethodExample.prototype, 'method', descriptor)
// test property decorator
PropertyAndMethodExample.staticProperty()
// test method decorator
const example = new PropertyAndMethodExample
try {
  example.method = () => console.log('override')
} catch(e) {
  console.log(e)
}
example.method()


