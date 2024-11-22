The initial motivation was to replicate Vue's core features with minimal code,   
so I set a goal of keeping it under 50 lines.   
But I realized...   
   
can replace all 'if-else' statements with ternary operators,   
all `for` loops with `forEach` functions,   
and storing all variable declarations as properties of a top-level object...   
   
Would make things boring,   
and the code harder to read and maintain.   
Performance might also be affected.    
   
For now, the goal is to keep the bundled code size within 1024 bytes.   
