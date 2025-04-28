const { GoogleGenAI } = require('@google/genai');

// Print out all methods and properties
console.log('GoogleGenAI class methods and properties:');
console.log(Object.getOwnPropertyNames(GoogleGenAI.prototype));

// Create an instance and check its methods
const genAI = new GoogleGenAI('dummy-key');
console.log('\ngenAI instance methods and properties:');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(genAI)));