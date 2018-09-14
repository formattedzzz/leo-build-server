function createSquare(config) {
    // ...
    if (config.color) {
        console.log(config.color);
    }
    return {
        color: 'aaa',
        area: 12
    };
}
// let mySquare = createSquare({ width: 100, color: 'aaa', coluor: 'aaa' }); 
// 字面量对象在申明和传参时存在的额外类型检查
var mySquare1 = createSquare({ width: 12 });
var obj = { width: 100, color: 'aaa' };
var mySquare2 = createSquare(obj);
//# sourceMappingURL=build.js.map