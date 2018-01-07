
// /* Input:
//  *   None.
//  *
//  * Output:
//  *   ArrayBuffer.
//  *
//  */
// NDEF = function() {

// }
// compose = function() {
// 	var out = new Uint8Array();
// 	var arr = [];

// 	for (var i = 0; i < this.ndef.length; i++) {
// 	  var entry = this.ndef[i];

// 	  switch (entry["type"]) {
// 	  case "TEXT":
// 	  case "Text":
// 		arr.push({"TNF": 1,
// 				  "TYPE": new Uint8Array([0x54 /* T */]),
// 				  "PAYLOAD": compose_RTD_TEXT(entry["lang"],
// 												   entry["text"])});
// 		break;
// 	  case "URI":
// 		arr.push({"TNF": 1,
// 				  "TYPE": new Uint8Array([0x55 /* U */]),
// 				  "PAYLOAD": this.compose_RTD_URI(entry["uri"])});
// 		break;
// 	  case "MIME":
// 		arr.push({"TNF": 2,
// 				  "TYPE": new Uint8Array(UTIL_StringToBytes(entry["mime_type"])),
// 				  "PAYLOAD": this.compose_MIME(entry["payload"])});
// 		break;
// 	  case "AAR":
// 		arr.push({"TNF": 4,
// 				  "TYPE": new Uint8Array(UTIL_StringToBytes('android.com:pkg')),
// 				  "PAYLOAD": this.compose_AAR(entry["aar"])});
// 		break;
// 	  default:
// 		console.error("Unsupported RTD type:" + entry["type"]);
// 		break;
// 	  }
// 	}

// 	for (var i = 0; i < arr.length; i++) {
// 	  var flags = 0x10 | arr[i]["TNF"];  /* SR and TNF */
// 	  flags |= (i == 0) ? 0x80 : 0x00;  /* MB */
// 	  flags |= (i == (arr.length - 1)) ? 0x40 : 0x00;  /* ME */

// 	  var type = arr[i]["TYPE"];
// 	  var payload = arr[i]["PAYLOAD"];
// 	  out = UTIL_concat(out, [flags, type.length, payload.length]);
// 	  out = UTIL_concat(out, type);
// 	  out = UTIL_concat(out, payload);
// 	}

// 	return out.buffer;
//   }

// /*
//  * Input:
//  *   Language and text (assume UTF-8 encoded).
//  *
//  * Output:
//  *   rtd_text  -- Uint8Array.
//  */
// NDEF.prototype.compose_RTD_TEXT = function(lang, text) {
// 	var l = lang.length;
// 	l = (l > 0x3f) ? 0x3f : l;
// 	return new Uint8Array([l].concat(
// 						  UTIL_StringToBytes(lang.substring(0, l))).concat(
// 						  UTIL_StringToBytes(text)));
//   }

// let ndef = new NDEF();
// console.log(ndef)



/* Input:
 *   ndef - Uint8Array
 */
compose = function(ndef) {

	  var blen;  // CC2
	  var need_lock_control_tlv = 0;

	  if ((ndef.length + 16 /* tt2_header */
					   + 2  /* ndef_tlv */
					   + 1  /* terminator_tlv */) > 64) {
		/*
		 * CC bytes of MF0ICU2 (MIFARE Ultralight-C) is OTP (One Time Program).
		 * Set to maximum available size (144 bytes).
		 */
		blen = 144 / 8;
		need_lock_control_tlv = 1;

		/* TODO: check if the ndef.length + overhead are larger than card */
	  } else {
		/*
		 * CC bytes of MF0ICU1 (MIFARE Ultralight) is OTP (One Time Program).
		 * Set to maximum available size (48 bytes).
		 */
		blen = 48 / 8;
	  }

	  var tt2_header = new Uint8Array([
		0x00, 0x00, 0x00, 0x00,  /* UID0, UID1, UID2, Internal0 */
		0x00, 0x00, 0x00, 0x00,  /* UID3, UID4, UID5, UID6 */
		0x00, 0x00, 0x00, 0x00,  /* Internal1, Internal2, Lock0, Lock1 */
		0xe1, 0x10, blen, 0x00   /* CC0, CC1, CC2(len), CC3 */
	  ]);

	  var lock_control_tlv = (need_lock_control_tlv) ?
		new Uint8Array([
		  /*T*/ 0x01,
		  /*L*/ 0x03,
		  /*V*/ 0xA0, 0x10, 0x44  /* BytesLockedPerLockBit=4, Size=16
								   * ByteAddr=160
								   */
		]) :
		new Uint8Array([]);

	  var ndef_tlv = new Uint8Array([
		0x03, ndef.length        /* NDEF Message TLV */
	  ]);
	  var terminator_tlv = new Uint8Array([
		0xfe
	  ]);
	  var ret = UTIL_concat(tt2_header,
				UTIL_concat(lock_control_tlv,
				UTIL_concat(ndef_tlv,
				UTIL_concat(new Uint8Array(ndef),
							terminator_tlv))));
	  return ret;
	}

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


	let a = compose('1234')
	console.log(Buffer.from(a))
