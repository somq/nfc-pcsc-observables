

const fs = require('fs');
const split = require('split');
 
const streamToObservable = require('stream-to-observable');
 
const readStream = fs
  .createReadStream('./hello-world.txt', {encoding: 'utf8'})
  .pipe(split());
 
  fs.on('readStream', txt => {
    console.log(txt);
  });

streamToObservable(readStream)
  // .filter(chunk => /hello/i.test(chunk))
  // .map(chunk => chunk.toUpperCase())
  .forEach(chunk => {
    console.log(chunk); // only the lines containing "hello" - and they will be capitalized 
  });