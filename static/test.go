package main

import (
	"fmt"
	"os"
	// "strconv"
)

// import flag "flag"
// import "os"
var(
	bat int = 8
	cad string = "cad"
)
const(
	B float64 = 1 << (iota * 10)
	KB
	MB
	GB
	TB
	PB
	EB
	ZB
	YB
)
func main() {
	fmt.Println(B)
	fmt.Println(KB)
	fmt.Println(MB)
	fmt.Println(GB)
	fmt.Println(TB)
	fmt.Println(PB)
	fmt.Println(EB)
	fmt.Println("hello world!")
	// fmt.Println(flag)
	os.Stdout.WriteString("this is os package \n")
	// fmt.Println(bat, cad)
	// var a [2]int
	// fmt.Println(a)
	// var c int = 65

	// b := string(c) // 65 --unicode编码--> A
	// 如何 65 --> '65'呢 
	// b := strconv.Itoa(c)  反过来是strconv.Atoi

	// var d bool = true
	// e := bool(c) //报错！布尔值跟数字之间不能相互转化
	// fmt.Println(c,b,d,e)

	// var a , b = 2, 'a'
	// fmt.Println(a, b) //2, 97 'a' --unicode编码-->  97

	// var a string = "sdk"
	// fmt.Println(a[1]) //字符创能像js数组一样 用下标访问

	// var a int = 10
	// var p *int = &a  //跟C语言的指针写法有些出入
	// fmt.Println(p)
	// fmt.Println(&p)
	// fmt.Println(*p)

	// var a = 1
	// var b = a++ //报错 a++只能另起一行写 不能写在表达式中 且没有++a的写法
	// fmt.Println(a,b)

	// if 1 > 2 {  //大括号必须放在if同一行
	// 	fmt.Println("条件表达式不能加括号！")  //会跟let一样形成块级作用域
	// }else{
	// 	fmt.Println("123")
	// }

	// 循环语句 go语言中只有for循环
	// var a = 0
	// var str string = "asdfg"
	// for i := 0; i < 5; i++ {
	// 	//somecoding
	// 	fmt.Println(string(str[i])) //a s d f g
	// }
	// for{
	// 	if condition {
	// 		break
	// 	}
	// 	//somecoding
	// }
	// for condition {
	// 	//somecoding
	// }

	//break continue goto
	// LABEL:
	// 	for{
	// 		for i := 0; i < 10; i++ {
	// 			if i > {
	// 				break //跳出当前层循环
	// 				break LABEL //结束指定层层循环
	// 				goto  LABEL //进入指定层的下一次循环
	// 				continue //结束当前循环体	 并进入当前层循环继续		
	// 				continue LABEL //结束当前循环体 跳出当前层循环 并进入指定层循环继续
	// 			}
	// 		}
	// 	}
	// LABEL:
		// for i := 0; i < 10; i++ {
		// 	for {
		// 		fmt.Println(i)
		// 		// break
		// 		// break LABEL  
		// 		// goto  LABEL
		// 		// continue 
		// 		// continue LABEL 
		// 	}
		// }

	//switch 语句
	// var sb int = 8
	// switch { //switch后面跟变量的话case后面不能有表达式 但是能加初始化变量 跟for一样 为块级作用域 没有的话case后面可以跟表达式
	// 	case sb == 8:
	// 		fmt.Println("sb=8")
	// 		fallthrough //没有break语句 默认有一条case符合就跳出判断 加fallthrough才能继续判断
	// 	case sb > 0:
	// 		fmt.Println("sb=0")
	// 	default:
	// 		fmt.Println("sb=null")
	// }

	// var c bool = 1<2
	// fmt.Println(1<2)  //true
	// fmt.Println(c)       //true 

	//----------------------数组 申明方式  go中数组为值类型 不是引用类型 类型和长度相同时可以用 == 和 != 进行比较
	// var arr1  [2]int   
	// var arr2 = [3]int {1,2,3}
	// var arr3 = [...]int{1, 2, 3, 4}
	// var arr4 = [5]int {1,2,3,4,4:4} //指定索引赋值
	// fmt.Println(arr4)   
	// for i := 0; i < len(arr4); i++ {
	//    	fmt.Println(arr4[i])      
	// }   

	//指向数组的指针 
	// var arr = [...]int{4: 5}
	// var p *[5]int = &arr
	// fmt.Println(p, &p, *p)

	//指针数组
	// var x, y = 4, 5
	// var p = [...]*int{&x, &y}
	// fmt.Println(p, &p, *p[0], *p[1])

	//new 关键字创建数组返回指向该指针的数组,而且能通过 p[index] = 123 改变新数组
	// var p = new([10]int)
	// p[9] = 10
	// fmt.Println(p, *p)

	//多维数组
	// var arr = [2][3]int{{1,2,3},{3,2,1}}
	// var arr1 = [...][3]int{{1,2,3},{3,2,1}} //顶层数组才能用 ...
	// fmt.Println(arr)
	// fmt.Println(arr1)

	// var a int = 3
	// var p *int = &a
	// fmt.Println(p, &p, *p, *&p)

	//-----------------------------------切片 跟数组很相似 引用类型
	// var srr []int //相当于js中申明了一个空数组
	// var srr = []int{1,2,3}
	// fmt.Println(srr)

	// var arr = []int{1,2,3,4,5,6,7,8,9,0}
	// var srr = arr[5:8] //[6,7,8] 指向的地址为arr[5] 容量一直到arr末尾 所以新切片能获取老切片中没有的值
	// var srr1 = arr[5:] //[6,7,8,9,0] 
	// var srr2 = arr[:5] //[1,2,3,4,5]
	// var srr3 = make([]int, len(arr), len(arr))
	// copy(srr3, arr)
	// fmt.Println(srr, srr1, srr2, srr3)
	// srr3[1] = 11
	// fmt.Println(arr)



	//make申明slice
	// var srr = make([]int, 3, 10) //类型 长度 容量分配的内存地址
	// fmt.Println(len(srr), cap(srr))

	// var arr = [10]int{1,2,3,4,5,6,7,8,9,0}
	// var srr = arr[5:8] //[6,7,8]
	// fmt.Println(srr)   //[6,7,8]
	// arr[5] = 10
	// fmt.Println(srr)   //[10,7,8]
	// srr[0] = 11
	// fmt.Println(arr)   //[1,2,3,4,5,11,7,8,9,0] 会相互影响

	// var srr = make([]int, 3, 6)
	// var srr1 = srr[2:]
	// fmt.Println(srr,srr1)
	// fmt.Printf("%v %p",srr[2], srr[2]) 	//fmt.Printf("v% %p",srr srr) 可以打印变量的值和内存地址 和fmt.Println不同      
	// fmt.Printf("%v %p",srr1[0], srr1[0])   
	// fmt.Printf("%v %p",srr1, srr1) //[0] 地址1
	// srr1 = append(srr1,1,2,3)      //[0,1,2,3]
	// srr1[0] = 1                    //[0,1,2,3]
	// fmt.Println(srr)               //[0, 0, 1]
	// fmt.Printf("%v %p",srr1, srr1) //地址1
	// srr1 = append(srr1, 4)         
	// fmt.Printf("%v %p",srr1, srr1) //[0, 1, 2, 3, 4] 地址2
	// srr1[0] = 1  				   //[1, 1, 2, 3, 4]
	// fmt.Println(srr) 				//[0, 0, 1]

	//-----------------------------对象类型map
	var m = map[string]string{"1": "ok"}  // var m = make(map[int]string)
	// m["1"] = "ok"
	// m["name"] = "xiaolin"
	fmt.Println(m)
	// fmt.Println(m["1"])
	// fmt.Println(m["name"])



}


/*
变量申明：
变量申明了必须调用，跟包的引入一样

var a string = 'abc'
var b int
var c int8  //(int8 别名为 byte 其他还有int64 float32) 初始零值为 0
var d bool = true  //布尔值与数字不兼容 不能互相转换 
e := 1  //不申明类型或由其他类型转换过来的时候可以用 := 代替 var 关键字
// var ( a int = 1 ) 只能用来定义全局变量 函数体内不行 应该并发申明 var a, b, c = 1, 2, 3

*/

/*
常量申明： 
申明后面的值只能为常量 不能有变量的值计算而得 函数也只能是内置函数
var(
	a = 1     
	b = 2
	c = iota    //2 前面定义过两个常量
	d           //2 没有赋值的话引用前一个
)
*/

/*
位运算符 将数字转为二进制 再对每一位进行运算
& | ^ &^ >> <<
*/