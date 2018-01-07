var toggleEndianness = require('endian-toggle');
var tapTrackNdef = require('@taptrack/ndef');

var ndef = {
  
  getBufferForText : function (payloadText, language, blockSize = 4) { // blockSize = 4 (ntag 21x)
    
    // var rawData = Buffer.from([ // "abcd","fr"
    //   0x03, 0x0B, 0xD1, 0x01, 
    //   0x07, 0x54, 0x02, 0x66,
    //   0x72, 0x61, 0x62, 0x63,
    //   0x64, 0xFE, 0x00, 0x00
    // ]);
    // console.log("LSBFirst:", rawData);
  
    // var rawDataMSBFirst = toggleEndianness(rawData, 32); // => <Buffer 01 d1 0b 03 66 02 54 07 63 62 61 72 00 00 fe 64>
  
    // console.log("MSBFirst:", rawDataMSBFirst);
  
  
    // language code is optional, defaults to 'en'
    var textRecord = tapTrackNdef.Utils.createTextRecord(payloadText, language); 
    // var textRecord = ndef.Utils.createTextRecord("24chars012345678901234567","fr"); 
    var message = new tapTrackNdef.Message([textRecord]);
    var bytes = message.toByteArray();
  
    var hexaPayloadLength = "0x"+`${(bytes.length).toString(16)}`
  
    console.log('NDEFUtil:', hexaPayloadLength)
    console.log('NDEFUtil:', toBuffer(bytes))
  
    var header = Buffer.from([ // Header
      0x03, hexaPayloadLength
    ]);
    var ME = Buffer.from([ // Message End
    0xFE
    ]);
  
    var totalLength = header.length + bytes.length + ME.length;
    var bytes = Buffer.concat([header, bytes, ME], totalLength);
  
    if(bytes.length % blockSize !== 0) { // we need to writes blocks (eg. ntag21x = 4 Bytes) - we fill with 0x00
      while(bytes.length % blockSize !== 0) {
        var filler = Buffer.from([
          0x00
        ]);
        var totalLength = bytes.length + filler.length;
        var bytes = Buffer.concat([bytes, filler], totalLength);
      }
    }
  
    console.log('NDEFUtil:', bytes, "(concat)");
  
    var buffer = toBuffer(bytes);
    
    console.log("NDEFUtil:", buffer, '(buffer)');
  
  
    var reversedBuffer = toggleEndianness(buffer, 32);
    
    console.log("NDEFUtil:", reversedBuffer, '(reversedBuffer)');
  
    // return reversedBuffer;
    return buffer;
  }
}

  


function toBuffer(ab) {
  var buf = new Buffer(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
  }
  return buf;
}

module.exports = ndef;

// console.log("FINAL BUFFER:", ndef.getBufferForText("abcdabcdabcd","fr"));