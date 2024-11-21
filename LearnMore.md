<strong id="简体中文">简体中文</strong> | <a href="#English">English</a>

这是将压缩后的代码体积保持在1KB以内,
同时还原出尽可能多的Vue核心功能的挑战。

其实我并不想对源代码的行数作要求，
因为换行的规则不好定义，
而且我可以把所有if-else语句换成三元运算符，
所有for循环都用forEach方法，
所有变量声明放在一个顶层对象的属性里。

那样事情将变得无聊，
代码将变得更加难以阅读和维护。
甚至压缩后的代码体积可能反而更大，性能也会受到影响。

<strong id="English">English</strong> | <a href="#简体中文">简体中文</a>
 
This was the challenge of keeping the compressed code under 1KB while restoring as much of Vue's core functionality as possible.

In fact, I don't want to require the number of lines in the source code, 
because the rules for line breaks are hard to define, 
and I can replace all if-else statements with ternary operators, 
all for loops with forEach methods, 
and all variable declarations in a top-level object property.

Then things will get boring and the code will become harder to read and maintain. 
Even the compressed code may be larger, 
and performance will suffer.