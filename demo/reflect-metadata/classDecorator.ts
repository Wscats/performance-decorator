// metadata的实际函数定义为此
// function metadata (metadataKey:any, metadataValue:any): {
//   (target: Function):void;
//   (target:Object, propertyKey: string | symbol): void;
// };
import 'reflect-metadata'

const classDecorator:ClassDecorator = target => {
  target.prototype.sayName = () => console.log('override');
  // return target
}

export class TestClassDecrator {
  public name = ''
  constructor(name: string) {
    this.name = name
  }
  sayName() {
    console.log(this.name)
  }
}
Reflect.decorate([classDecorator], TestClassDecrator)


const t = new TestClassDecrator('nihao')

t.sayName()

