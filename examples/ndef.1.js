"use strict";

// #############
// example not finished, it in progress !!!
// Read NDEF formatted data
// #############

import { NFC, TAG_ISO_14443_3, TAG_ISO_14443_4, KEY_TYPE_A, KEY_TYPE_B } from '../src/index';
import pretty from './pretty';

import ndef from '@taptrack/ndef'; // ndef formater
import { endianness }  from 'endianness'; // MSB first converter
let isLittleEndian = ((new Uint32Array((new Uint8Array([1,2,3,4])).buffer))[0] === 0x04030201);



// minilogger for debugging

function log() {
	console.log(...arguments);
}

const minilogger = {
	log: log,
	debug: log,
	info: log,
	warn: log,
	error: log
};

const nfc = new NFC(minilogger); // const nfc = new NFC(minilogger); // optionally you can pass logger to see internal debug logs

let readers = [];

nfc.on('reader', async reader => {

	pretty.info(`device attached`, { reader: reader.name });

	readers.push(reader);

	// needed for reading tags emulated with Android HCE AID
	// see https://developer.android.com/guide/topics/connectivity/nfc/hce.html
	reader.aid = 'F222222222';

	reader.on('card', async card => {


		// standard nfc tags like Mifare
		if (card.type === TAG_ISO_14443_3) {
			// const uid = card.uid;
			pretty.info(`card detected`, { reader: reader.name, card });
		}
		// Android HCE
		else if (card.type === TAG_ISO_14443_4) {
			// process raw Buffer data
			const data = card.data.toString('utf8');
			pretty.info(`card detected`, { reader: reader.name, card: { ...card, data } });
		}
		// not possible, just to be sure
		else {
			pretty.info(`card detected`, { reader: reader.name, card });
		}

		// example reading 16 bytes assuming containing 16bit integer
		// !!! note that we don't need 16 bytes – 16bit integer takes just 2 bytes !!!
		try {

			// reader.read(blockNumber, length, blockSize = 4, packetSize = 16)
			// - blockNumber - memory block number where to start reading
			// - length - how many bytes to read
			// - blockSize - 4 for Mifare Ultralight, 16 for Mifare Classic
			// ! Caution! length must be divisible by blockSize
			// ! Caution! Mifare Classic cards have sector trailers
			//   containing access bits instead of data, each last block in sector is sector trailer
			//   (e.g. block 3, 7, 11, 14)
			//   see for more info https://github.com/pokusew/nfc-pcsc/issues/16#issuecomment-304989178

      // Read 12 blocks (48 Bytes) starting from block 4.
			var data = await reader.read(4, 900); // await reader.read(4, 16, 16); for Mifare Classic cards

			// pretty.info(`data read`, { reader: reader.name, data });
			let messageLength = data[1];
			pretty.info(`data read`, data);
			pretty.info(`message length`, messageLength);
			// <Buffer 03 14 d1 01 10 55 03 62 6c 6f 67 2e 7a 65 6e 69 6b 61 2e 63 6f 6d fe> uri= zenika.com

			// var data2 = await reader.read(5, messageLength)
			// pretty.info(`Data 2`, data2);


      // const payload = data.readInt16BE();

      /**
       * @description
       * if our system is LSB first, we swap each Bytes every 4 Bytes
       * 
       * @example
       * -Before swapping
       * <Buffer 01 91 1b 03 66 02 54 08 6f 62 61 72 01 51 65 76 66 02 54 0b 63 6e 61 72 72 74 73 65 00 00 fe 79 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00>
       * 
       * -After swapping
       * <Buffer 03 1b 91 01 08 54 02 66 72 61 62 6f 76 65 51 01 0b 54 02 66 72 61 6e 63 65 73 74 72 79 fe 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00>
       * recordContents { language: 'fr', content: 'above' }
       * recordContents { language: 'fr', content: 'ancestry' }
       * 
       */
       
      // if(isLittleEndian) {
      //   var data = endianness(data, 4); // Our block is 4 Bytes
      // }
			
			// console.log('Swapped Data:', data)

			// bufferTOWRITE: <Buffer d1 01 1b 54 02 66 72 32 34 63 68 61 72 73 30 31 32 33 34 35 36 37 38 39 30 31 32 33 34 35 36>
			// bufferWASREAD: <Buffer 03 1f d1 01 1b 54 02 66 72 32 34 63 68 61 72 73 30 31 32 33 34 35 36 37 38 39 30 31 32 33 34 35 36 fe 00 00 00 00 00 00 00 00 00 00 00 00 00 00>
			// recordContents { language: 'fr', content: '24chars01234567890123456' }

			// console.log('Raw data:', data)
			// let message = ndef.Message.fromBytes(data);
			
			// console.log('ByteArray message', message.toByteArray());
			// console.log(message.toByteArray().length);
      // let parsedRecords = message.getRecords();
			// console.log("records", parsedRecords)
// 
		
      parsedRecords.forEach((parsedRecord, i) => {
				console.log(i)
				var pl = "";
				var totalLength = 0;
				if(parsedRecord.isChunked) {
					pl += parsedRecord.type;
					// console.log('chunkedRecord',i, Buffer.from(parsedRecord.type).toString('hex'));	
					
					totalLength += Buffer.from(parsedRecord.type).length;
					console.log(totalLength);
				}

        // let recordContents = ndef.Utils.resolveTextRecord(parsedRecord);
        // console.log('recordContents', recordContents)
      });
     
			var buf = Buffer.concat([Buffer.from(parsedRecords[0]), Buffer.from(parsedRecords[1]), Buffer.from(parsedRecords[2])], totalLength);
			console.log('buf', buf)
			pretty.info(`data converted`, payload);

		} catch (err) {
			pretty.error(`error when reading data`, { reader: reader.name, err });
		}

	});

	reader.on('error', err => {

		pretty.error(`an error occurred`, { reader: reader.name, err });

	});

	reader.on('end', () => {

		pretty.info(`device removed`, { reader: reader.name });

		delete readers[readers.indexOf(reader)];

		console.log(readers);

	});


});

nfc.on('error', err => {

	pretty.error(`an error occurred`, err);

});









/* Input:
 *   raw is either ArrayBuffer.
 */
function NDEF(raw, cb) {
  this.ndef = [];
  this.prepending = [  /* for RTD_URI */
    "",
    "http://www.",
    "https://www.",
    "http://",
    "https://",
    "tel:",
    "mailto:",
    "ftp://anonymous:anonymous@",
    "ftp://ftp.",
    "ftps://",
    "sftp://",
    "smb://",
    "nfs://",
    "ftp://",
    "dav://",
    "news:",
    "telnet://",
    "imap:",
    "rtsp://",
    "urn:",
    "pop:",
    "sip:",
    "sips:",
    "tftp:",
    "btspp://",
    "btl2cpa://",
    "btgoep://",
    "tcpobex://",
    "irdaobex://",
    "file://",
    "urn:epc:id:",
    "urn:epc:tag:",
    "urn:epc:pat:",
    "urn:epc:raw:",
    "urn:epc:",
    "urn:nfc:"
  ];

  if (raw) {
    this.ndef = this.parse(raw, cb);
  }

}

/* Input:
 *   raw is either ArrayBuffer.
 *
 * Output:
 *   The callback function will get a JS structure for NDEF content.
 *
 * For the message format, please refer to Chapter 3 of NDEF spec.
 */
NDEF.prototype.parse = function(raw, cb) {
  var i;  /* index to access raw[] */
  var ret = [];
  raw = new Uint8Array(raw);

  for (i = 0; i < raw.length; i++) {
    var MB = (raw[i] & 0x80) >> 7;   /* Message Begin */
    var ME = (raw[i] & 0x40) >> 6;   /* Message End */
    var CF = (raw[i] & 0x20) >> 5;   /* Chunk Flag */
    var SR = (raw[i] & 0x10) >> 4;   /* Short Record */
    var IL = (raw[i] & 0x08) >> 3;   /* ID_LENGTH field is present */
		var TNF = (raw[i] & 0x07) >> 0;  /* Type Name Format */
    // var MB = (raw[i]);   /* Message Begin */
    // var ME = (raw[i+1])   /* Message End */
    // var CF = (raw[i+2]);   /* Chunk Flag */
    // var SR = (raw[i+4]);   /* Short Record */
    // var IL = (raw[i+5]);   /* ID_LENGTH field is present */
		// // var TNF = (raw[i+6]);  /* Type Name Format */
		var TNF = 0x02;  /* Type Name Format */ // 0x02=MIME
		
		console.log('raw', raw)
		console.log('i', i)
		console.log('raw[i]', raw[i]);

		console.log('MB', MB)
		console.log('ME', ME)
		console.log('CF', CF)
		console.log('SR', SR)
		console.log('IL', IL)
		console.log('TNF', TNF)

    var type_off;
    var type_len = raw[i + 1];
    var id;
    var type;
    var payload_off = 4 + type_len;
    var payload_len;
    var payload;

    if (SR) {
      type_off = 3;
      payload_off = 3 + type_len;
      payload_len = raw[i + 2];
    } else {
      type_off = 6;
      payload_off = 6 + type_len;
      payload_len = ((raw[i + 2] * 256 + raw[i + 3]) * 256 +
                      raw[i + 4]) * 256 + raw[i + 5];
    }
    if (IL) {
      type_off += 1;
      var id_len = raw[i + type_off - 1];
      payload_off += 1 + id_len;
      var id_off = type_off + type_len;
      id = raw.subarray(i + id_off, i + id_off + id_len);
    } else {
      id = null;
    }

    type = new Uint8Array(raw.subarray(i + type_off, i + type_off + type_len));
    payload = new Uint8Array(
                raw.subarray(i + payload_off, i + payload_off + payload_len));

    if (1) {  /* for DEBUG */
      console.log("raw[i]: " + raw[i]);
      console.log("MB: " + MB);
      console.log("ME: " + ME);
      console.log("SR: " + SR);
      console.log("IL: " + IL);
      console.log("TNF: " + TNF);
      console.log("type_off: " + type_off);
      console.log("type_len: " + type_len);
      console.log("payload_off: " + payload_off);
      console.log("payload_len: " + payload_len);
      console.log("type: " + UTIL_BytesToHex(type));
      console.log("payload: " + UTIL_BytesToHex(payload));
    }

    switch (TNF) {
    case 0x01:  /* NFC RTD - so called Well-known type */
      ret.push(this.parse_RTD(type[0], payload));
      break;
    case 0x02:  /* MIME - RFC 2046 */
      ret.push(this.parse_MIME(type, payload));
      break;
    case 0x04:  /* NFC RTD - so called External type */
      ret.push(this.parse_ExternalType(type, payload));
      break;
    default:
      console.error("Unsupported TNF: " + TNF);
      break;
    }

    i = payload_off + payload_len - 1;
    if (ME) break;
  }

  if (cb)
    cb(ret);

  return ret;
}


/* Input:
 *   None.
 *
 * Output:
 *   ArrayBuffer.
 *
 */
NDEF.prototype.compose = function() {
  var out = new Uint8Array();
  var arr = [];

  for (var i = 0; i < this.ndef.length; i++) {
    var entry = this.ndef[i];

    switch (entry["type"]) {
    case "TEXT":
    case "Text":
      arr.push({"TNF": 1,
                "TYPE": new Uint8Array([0x54 /* T */]),
                "PAYLOAD": this.compose_RTD_TEXT(entry["lang"],
                                                 entry["text"])});
      break;
    case "URI":
      arr.push({"TNF": 1,
                "TYPE": new Uint8Array([0x55 /* U */]),
                "PAYLOAD": this.compose_RTD_URI(entry["uri"])});
      break;
    case "MIME":
      arr.push({"TNF": 2, 
                "TYPE": new Uint8Array(UTIL_StringToBytes(entry["mime_type"])),
                "PAYLOAD": this.compose_MIME(entry["payload"])});
      break;
    case "AAR":
      arr.push({"TNF": 4,
                "TYPE": new Uint8Array(UTIL_StringToBytes('android.com:pkg')),
                "PAYLOAD": this.compose_AAR(entry["aar"])});
      break;
    default:
      console.error("Unsupported RTD type:" + entry["type"]);
      break;
    }
  }

  for (var i = 0; i < arr.length; i++) {
    var flags = 0x10 | arr[i]["TNF"];  /* SR and TNF */
    flags |= (i == 0) ? 0x80 : 0x00;  /* MB */
    flags |= (i == (arr.length - 1)) ? 0x40 : 0x00;  /* ME */

    var type = arr[i]["TYPE"];
    var payload = arr[i]["PAYLOAD"];
    out = UTIL_concat(out, [flags, type.length, payload.length]);
    out = UTIL_concat(out, type);
    out = UTIL_concat(out, payload);
  }

  return out.buffer;
}


/* Input:
 *   A dictionary, with "type":
 *     "Text": RTD Text. Require: "encoding", "lang" and "text".
 *     "URI": RTD URI. Require: "uri".
 *     "MIME": RFC 2046 media types. Require: "mime_type" and "payload".
 *     "AAR": Android Application Record. Require: "aar".
 *
 * Output:
 *   true for success.
 *
 */
NDEF.prototype.add = function(d) {
  // short-cut
  if ("uri" in d) {
    d["type"] = "URI";
  } else if ("text" in d) {
    d["type"] = "TEXT";
  } else if ("aar" in d) {
    d["type"] = "AAR";
  } else if ("payload" in d) {
    d["type"] = "MIME";
  }

  switch (d["type"]) {
  case "TEXT":
  case "Text":
    /* set default values */
    if (!("encoding" in d)) {
      d["encoding"] = "utf8";
    }
    if (!("lang" in d)) {
      d["lang"] = "en";
    }

    if ("text" in d) {
      this.ndef.push(d);
      return true;
    }
    break;

  case "URI":
    if ("uri" in d) {
      this.ndef.push(d);
      return true;
    }
    break;

  case "MIME":
    if (("mime_type" in d) && ("payload" in d)) {
      this.ndef.push(d);
      return true;
    }

  case "AAR":
    if ("aar" in d) {
      this.ndef.push(d);
      return true;
    }
    break;

  default:
    console.log("Unsupported RTD type:" + d["type"]);
    break;
  }
  return false;
}


/*
 * Input:
 *   type -- a byte, see RTD Type Names
 *   rtd  -- Uint8Array.
 *
 * Output:
 *   JS structure
 */
NDEF.prototype.parse_RTD = function(type, rtd) {
  switch (type) {
  case 0x54:  /* 'T' */
    return this.parse_RTD_TEXT(rtd);
  case 0x55:  /* 'U' */
    return this.parse_RTD_URI(rtd);
  default:
    console.log("Unsupported RTD type: " + type);
  }
}


/*
 * Input:
 *   mime_type -- Uint8Array. See RFC 2046.
 *   payload  -- Uint8Array.
 *
 * Output:
 *   JS structure
 */
NDEF.prototype.parse_MIME = function(mime_type, payload) {
  return {"type": "MIME",
          "mime_type": UTIL_BytesToString(mime_type),
          "payload": UTIL_BytesToString(payload)};
}


/*
 * Input:
 *   mime_type and payload: string.
 *
 * Output:
 *   rtd_text  -- Uint8Array.
 */
NDEF.prototype.compose_MIME = function(payload) {
  return new Uint8Array(UTIL_StringToBytes(payload));
}


/*
 * Input:
 *   payload  -- Uint8Array.
 *
 * Output:
 *   JS structure
 */
NDEF.prototype.parse_AAR = function(payload) {
  return {"type": "AAR",
          "payload": UTIL_BytesToString(payload)};
}

/*
 * Input:
 *   type     -- Uint8Array.
 *   payload  -- Uint8Array.
 *
 * Output:
 *   JS structure
 */
NDEF.prototype.parse_ExternalType = function(type, payload) {
  if (UTIL_BytesToString(type) == "android.com:pkg")
    return this.parse_AAR(payload);
  else
    return {"type": type,
            "payload": UTIL_BytesToString(payload)};
}


/*
 * Input:
 *   payload: string.
 *
 * Output:
 *   Uint8Array.
 */
NDEF.prototype.compose_AAR = function(payload) {
  return new Uint8Array(UTIL_StringToBytes(payload));
}


/*
 * Input:
 *   rtd_text  -- Uint8Array.
 *
 * Output:
 *   JS structure
 */
NDEF.prototype.parse_RTD_TEXT = function(rtd_text) {
  var utf16 = (rtd_text[0] & 0x80) >> 7;
  var lang_len = (rtd_text[0] & 0x3f);
  var lang = rtd_text.subarray(1, 1 + lang_len);
  var text = rtd_text.subarray(1 + lang_len, rtd_text.length);

  return {"type": "Text",
          "encoding": utf16 ? "utf16" : "utf8",
          "lang": UTIL_BytesToString(lang),
          "text": UTIL_BytesToString(text)};
}


/*
 * Input:
 *   Language and text (assume UTF-8 encoded).
 *
 * Output:
 *   rtd_text  -- Uint8Array.
 */
NDEF.prototype.compose_RTD_TEXT = function(lang, text) {
  var l = lang.length;
  l = (l > 0x3f) ? 0x3f : l;
  return new Uint8Array([l].concat(
                        UTIL_StringToBytes(lang.substring(0, l))).concat(
                        UTIL_StringToBytes(text)));
}


/*
 * Input:
 *   rtd_uri  -- Uint8Array.
 *
 * Output:
 *   JS structure
 */
NDEF.prototype.parse_RTD_URI = function(rtd_uri) {
  return {"type": "URI",
          "uri": this.prepending[rtd_uri[0]] +
                 UTIL_BytesToString(rtd_uri.subarray(1, rtd_uri.length))};
}

/*
 * Input:
 *   Thr URI to compose (assume UTF-8).
 *
 * Output:
 *   Uint8Array.
 */
NDEF.prototype.compose_RTD_URI = function(uri) {
  var longest = -1;
  var longest_i;
  for (var i = 0; i < this.prepending.length; i++) {
    if (uri.substring(0, this.prepending[i].length) == this.prepending[i]) {
      if (this.prepending[i].length > longest) {
        longest_i = i;
        longest = this.prepending[i].length;
      }
    }
  }
  // assume at least longest_i matches prepending[0], which is "".

  return new Uint8Array([longest_i].concat(
                        UTIL_StringToBytes(uri.substring(longest))));
}


/**
 * UTILS
 */

 /*
 * Copyright 2014 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0
  
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function UTIL_StringToBytes(s, bytes) {
  bytes = bytes || new Array(s.length);
  for (var i = 0; i < s.length; ++i)
    bytes[i] = s.charCodeAt(i);
  return bytes;
}

function UTIL_BytesToString(b) {
  var tmp = new String();
  for (var i = 0; i < b.length; ++i)
    tmp += String.fromCharCode(b[i]);
  return tmp;
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

function UTIL_BytesToHexWithSeparator(b, sep) {
  var hexchars = '0123456789ABCDEF';
  var stride = 2 + (sep?1:0);
  var hexrep = new Array(b.length * stride);

  for (var i = 0; i < b.length; ++i) {
    if (sep) hexrep[i * stride + 0] = sep;
    hexrep[i * stride + stride - 2] = hexchars.charAt((b[i] >> 4) & 15);
    hexrep[i * stride + stride - 1] = hexchars.charAt(b[i] & 15);
  }
  return (sep?hexrep.slice(1):hexrep).join('');
}

function UTIL_HexToBytes(h) {
  var hexchars = '0123456789ABCDEFabcdef';
  var res = new Uint8Array(h.length / 2);
  for (var i = 0; i < h.length; i += 2) {
    if (hexchars.indexOf(h.substring(i, i + 1)) == -1) break;
    res[i / 2] = parseInt(h.substring(i, i + 2), 16);
  }
  return res;
}

function UTIL_equalArrays(a, b) {
  if (!a || !b) return false;
  if (a.length != b.length) return false;
  var accu = 0;
  for (var i = 0; i < a.length; ++i)
    accu |= a[i] ^ b[i];
  return accu === 0;
}

function UTIL_ltArrays(a, b) {
  if (a.length < b.length) return true;
  if (a.length > b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] < b[i]) return true;
    if (a[i] > b[i]) return false;
  }
  return false;
}

function UTIL_geArrays(a, b) {
  return !UTIL_ltArrays(a, b);
}

function UTIL_getRandom(a) {
  var tmp = new Array(a);
  var rnd = new Uint8Array(a);
  window.crypto.getRandomValues(rnd);  // Yay!
  for (var i = 0; i < a; ++i) tmp[i] = rnd[i] & 255;
  return tmp;
}

function UTIL_equalArrays(a, b) {
  if (!a || !b) return false;
  if (a.length != b.length) return false;
  var accu = 0;
  for (var i = 0; i < a.length; ++i)
    accu |= a[i] ^ b[i];
  return accu === 0;
}

function UTIL_setFavicon(icon) {
  // Construct a new favion link tag
  var faviconLink = document.createElement("link");
  faviconLink.rel = "Shortcut Icon";
  faviconLink.type = 'image/x-icon';
  faviconLink.href = icon;

  // Remove the old favion, if it exists
  var head = document.getElementsByTagName("head")[0];
  var links = head.getElementsByTagName("link");
  for (var i=0; i < links.length; i++) {
    var link = links[i];
    if (link.type == faviconLink.type && link.rel == faviconLink.rel) {
      head.removeChild(link);
    }
  }

  // Add in the new one
  head.appendChild(faviconLink);
}

// Erase all entries in array
function UTIL_clear(a) {
  if (a instanceof Array) {
    for (var i = 0; i < a.length; ++i)
      a[i] = 0;
  }
}

// hr:min:sec.milli string
function UTIL_time() {
  var d = new Date();
  var m = '000' + d.getMilliseconds();
  var s = d.toTimeString().substring(0, 8) + '.' + m.substring(m.length - 3);
  return s;
}

function UTIL_fmt(s) {
  return UTIL_time() + ' ' + s;
}

// a and b are Uint8Array. Returns Uint8Array.
function UTIL_concat(a, b) {
  var c = new Uint8Array(a.length + b.length);
  var i, n = 0;
  for (i = 0; i < a.length; i++, n++) c[n] = a[i];
  for (i = 0; i < b.length; i++, n++) c[n] = b[i];
  return c;
}

