This was the challenge of keeping the compressed code under 1KB while restoring as much of Vue's core functionality as possible.

In fact, I don't want to require the number of lines in the source code, 
because the rules for line breaks are hard to define, 
and I can replace all if-else statements with ternary operators, 
all for loops with forEach methods, 
and all variable declarations in a top-level object property.

Then things will get boring and the code will become harder to read and maintain. 
Even the compressed code may be larger, 
and performance will suffer.