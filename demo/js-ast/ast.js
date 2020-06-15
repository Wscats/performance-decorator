const {
    transform
} = require("@babel/core");
const t = require("babel-types");
const fs = require('fs');


const allScript = `
    const arr = [1,2,3];
    const a = function cba(){
        function abc(x){
            function abc(b){}
        }
    }
    function abc(){
        function abc(){}
    }
    class RequestApi {
        constructor() {
        }
        undo() {
        }
        redo() {
        }
        applyCollab(params) {
        }
        applyOffline(params) {
        }
    }
    class RequestApi2 {
        constructor() {
        }
        undo() {
        }
        redo() {
        }
        applyCollab(params) {
        }
        applyOffline(params) {
        }
    }
    class RequestApi3 {
        constructor() {
        }
        undo() {
        }
        redo() {
        }
        applyCollab(params) {
        }
        applyOffline(params) {
        }
    }
    class RequestApi4 {
        constructor() {
        }
        undo() {
        }
        redo() {
        }
        applyCollab(params) {
        }
        applyOffline(params) {
        }
    }
`

transform(allScript, {
    plugins: [
        {
            visitor: {
                "FunctionDeclaration"(path) {
                    // console.log(path.node.id.name)
                    // path.insertBefore(t.expressionStatement(t.stringLiteral("@abc")))
                    // path.insertAfter(t.classMethod(
                    //     "constructor",
                    //     t.identifier("constructor"),
                    //     [],
                    //     t.blockStatement([])
                    // ))
                    // path.insertAfter(t.callExpression(t.Expression("abc"), []))
                    path.insertAfter(t.callExpression(t.identifier("abc"), [t.identifier(path.node.id.name)]))
                    // console.log(path.get('body'));
                    // path.insertBefore([t.identifier('abc(')])
                    // path.insertAfter([t.identifier(')')])
                },
                "ClassDeclaration"(path) {
                    // if (path.node.id.name === 'RequestApi') {
                    //     console.log(path)
                    // }
                    // console.log(path)
                    // path.insertAfter(t.callExpression(t.identifier("abc"), [t.identifier(path.node.id.name)]))
                    // path.insertBefore([t.identifier('@log')])
                    path.insertBefore([t.identifier('window.abc(')])
                    path.insertAfter([t.identifier(');')])
                }
            },
        }
    ]
}, (err, result) => {
    if (err) {
        console.log(err)
    } else {
        // console.log(result)
        console.log(result.code)
        fs.writeFile('./index.js', result.code, () => { })
    }
});