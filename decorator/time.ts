function time(target, name, descriptor) {
    const func = descriptor.value;
    if (typeof func === 'function') {
        descriptor.value = function (...args) {
            console.time();
            const results = func.apply(this, args);
            console.timeEnd();
            return results;
        }
    }
}
class Person {
    @time
    say() {
        console.log('hello')
    }
}
const person = new Person();
person.say();
