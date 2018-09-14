

interface SquareConfig {
  color?: string;
  width: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  // ...
  if (config.color) {
    console.log(config.color)    
  }
  return {
    color: 'aaa',
    area: 12
  }
}

// let mySquare = createSquare({ width: 100, color: 'aaa', coluor: 'aaa' }); 
// 字面量对象在申明和传参时存在的额外类型检查
let mySquare1 = createSquare({width: 12});

let obj = { width: 100, color: 'aaa' }

let mySquare2 = createSquare(obj);
