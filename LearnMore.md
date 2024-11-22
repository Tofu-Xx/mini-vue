The original intention was to recreate Vue's core functionality with very little code,   
So I set a target of 50 lines or less,   
But the rules of line feed are not easy to define,
And I found ...   
   
You can replace all `if-else` statements with ternary operators,   
All `for` loops are replaced by methods,   
All variable declarations are placed in the properties of a top-level object...   

This is where things get weird,   
The code will become difficult to read and maintain.   
Performance is also affected.   
   
I think it makes more sense to control code size out of pragmatism.

But I did the stupid thing anyway,   
See [vue.devil.js](./vue.devil.js)
I know this seems a little unfriendly,
So I prepared the expanded version [vue.undevil.js](./vue.undevil.js)

The difference is that this version has a global vueey object,   
Specially designed. Kind of interesting