/**
 * EXAMPLES
 *    CREATE
 *    PARSE
 */

/**
 * Creating ndef record(s) in a ndef message
 */

// language code is optional, defaults to 'en'
var textRecord = ndef.Utils.createTextRecord("sirop","fr"); 
var textRecord2 = ndef.Utils.createTextRecord("orange","en"); 
var message = new ndef.Message([textRecord, textRecord2]);

// Uint8Array for storing, writing to a tag, etc.
var ndefMessageAsByteArray = message.toByteArray(); 
var ndefMessageAsBuffer = new Buffer(ndefMessageAsByteArray)

console.log(ndefMessageAsBuffer) // <Buffer 91 01 08 54 02 66 72 73 69 72 6f 70 51 01 09 54 02 65 6e 6f 72 61 6e 67 65>

/**
 * Parsing ndef record(s) in a ndef message
 */

var ndefMessageToParseAsByteArray = Buffer.from(ndefMessageAsBuffer); 

var message = ndef.Message.fromBytes(ndefMessageToParseAsByteArray);
var parsedRecords = message.getRecords();

for(var i=0; i<parsedRecords.length; i++) {
  var recordContents = ndef.Utils.resolveTextRecord(parsedRecords[i]);
  console.log("Language: "+recordContents.language);
  console.log("Content: "+recordContents.content);
}
