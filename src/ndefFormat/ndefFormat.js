var ndef = require('@taptrack/ndef');
var toArrayBuffer = require('to-arraybuffer')


function UTIL_StringToBytes(s, bytes) {
  bytes = bytes || new Array(s.length);
  for (var i = 0; i < s.length; ++i)
    bytes[i] = s.charCodeAt(i);
  return bytes;
}

function UTIL_BytesToHex(b) {
  if (!b) return '(null)';
  var hexchars = '0123456789ABCDEF';
  var hexrep = new Array(b.length * 2);

  for (var i = 0; i < b.length; ++i) {
    hexrep[i * 2 + 0] = hexchars.charAt((b[i] >> 4) & 15);
    hexrep[i * 2 + 1] = hexchars.charAt(b[i] & 15);
  }
  return hexrep.join('');
}

compose_RTD_TEXT = function(lang, text) {
  var l = lang.length;
  l = (l > 0x3f) ? 0x3f : l;
  return new Uint8Array([l].concat(
                        UTIL_StringToBytes(lang.substring(0, l))).concat(
                        UTIL_StringToBytes(text)));
}
console.log('CHROME', compose_RTD_TEXT('fr', '24chars012345678901234567'))
console.log("CHROME.toArrayBuffer();", toBuffer(compose_RTD_TEXT('fr', '24chars012345678901234567')))



// language code is optional, defaults to 'en'
var textRecord = ndef.Utils.createTextRecord("24chars012345678901234567","fr"); 
var message = new ndef.Message([textRecord]);

console.log("message", message);


var data = Buffer.allocUnsafe(32);
data.fill(0);
console.log("data", data, data[0])


console.log("data.toArrayBuffer();", toArrayBuffer(data))
data.write("message");
console.log("data", data)




// console.log(JSON.stringify(message))
// Uint8Array for storing, writing to a tag, etc.
var bytes = message.toByteArray();

// console.log(bytes);

let messagex = ndef.Message.fromBytes(bytes);

let parsedRecords = messagex.getRecords();
// console.log("records", parsedRecords)

var buffer = toBuffer(bytes);

console.log("ab.byteLength", bytes.byteLength)
console.log("buffer", buffer)
console.log("buffer.toString", buffer.toString())
console.log("buffer", buffer.length)


var buffer2 = Buffer.allocUnsafe(1);
buffer2.fill(1);
Buffer.concat([buffer, buffer2]);

// buffer[buffer.length] = 0;
// buffer[31] = 12;

for (let i = 0; i < buffer.length; i++) {
  console.log(buffer[i], i)
  // buf[i] = str.charCodeAt(i);
}

console.log("buffer2", buffer2)
console.log("buffer", buffer)
console.log("buffer.toString", buffer.toString())
console.log("buffer", buffer.length)

/**
 * READ
 */
console.log('******READ*******')

parsedRecords.forEach(parsedRecord => {
  let recordContents = ndef.Utils.resolveTextRecord(parsedRecord);
  console.log('recordContents', recordContents)
});

// var records = message.getRecords();
// console.log(records)

/*

Uint8Array [
  209,
  1,
  27,
  84,
  2,
  102,
  114,
  50,
  52,
  99,
  104,
  97,
  114,
  115,
  48,
  49,
  50,
  51,
  52,
  53,
  54,
  55,
  56,
  57,
  48,
  49,
  50,
  51,
  52,
  53,
  54 ]


  */

  function toBuffer(ab) {
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
  }
  
//   function toArrayBuffer(buf) {
//     var ab = new ArrayBuffer(buf.length);
//     var view = new Uint8Array(ab);
//     for (var i = 0; i < buf.length; ++i) {
//         view[i] = buf[i];
//     }
//     return ab;
// }