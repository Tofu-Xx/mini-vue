The original intention was to recreate Vue's core functionality with very little code,   
So I set a target of 50 lines or less,   
But the rules of line feed are not easy to define,
And I found ...   
   
You can replace all `if-else` statements with ternary operators,   
All `for` loops are replaced by methods,   
All variable declarations are placed in the properties of a object...   

This is where things get weird,   
The code will become difficult to read and maintain.   
Performance is also affected.   

But I did the stupid thing anyway.   