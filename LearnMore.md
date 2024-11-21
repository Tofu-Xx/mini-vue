The initial motivation was to replicate Vue's core features with minimal code,   
so I set a goal of keeping it under 50 lines.   
But I realized...   
   
 can replace all 'if-else' statements with ternary operators,   
all `for` loops with `forEach` functions,   
and storing all variable declarations as properties of a top-level object...   
   
Would make things boring,   
and the code harder to read and maintain.   
Performance might also be affected.   
   
However, I have also kept a version that is simply for fewer lines of code: [vue.shit.js](./vue.shit.js)   
*<small>For appreciation only, it won't be published on npm.</small>*   

Characters that require a newline: `{;}` and `,` in object literals   
Object destruct, empty object, except for semicolon in `for()`   
   
For now, the goal is to keep the bundled code size within 1024 bytes.   
