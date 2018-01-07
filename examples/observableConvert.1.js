"use strict";

// #############
// example not finished, it in progress !!!
// Read NDEF formatted data
// #############

import { NFC, TAG_ISO_14443_3, TAG_ISO_14443_4, KEY_TYPE_A, KEY_TYPE_B, CONNECT_MODE_DIRECT } from '../src/index';
import pretty from './pretty';
import Rx from 'rxjs';

import ndef from '@taptrack/ndef'; // ndef formater
import { endianness }  from 'endianness'; // MSB first converter*
let isLittleEndian = ((new Uint32Array((new Uint8Array([1,2,3,4])).buffer))[0] === 0x04030201);

import streamToObservable from 'stream-to-observable';

console.log(streamToObservable)
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

const nfc = new NFC(); // const nfc = new NFC(minilogger); // optionally you can pass logger to see internal debug logs
// const nfc = new NFC(minilogger); // const nfc = new NFC(minilogger); // optionally you can pass logger to see internal debug logs



// const onReader = Rx.Observable.fromEvent(nfc, 'reader');

// let onReader$ = onReader.subscribe(reader => {
//   pretty.info(`device attached`, { reader: reader.name });
// 	// console.log(reader.led)
// 	// reader.connect(CONNECT_MODE_DIRECT);
// 	// reader.setBuzzerOutput(false);
// 	// reader.disconnect();
//   console.log(this)

//   const onCard = Rx.Observable.fromEvent(reader, 'card');

//   let onCard$ = onCard.subscribe(
//     async card => {
// 	  pretty.info('Card found', { reader: reader.name });
// 	  console.log('card:', card);

// 	  // ntag216 = 872 byte
// 	  var data = await reader.read(230, 4); // await reader.read(4, 16, 16); for Mifare Classic cards
// 	  pretty.info(`data read`, { reader: reader.name, data });


// 	// // let messageLength = data[1];
// 	// pretty.info(`data read`, data);

// 	// pretty.info(`message length`, messageLength);
//     //   try {
//     //     pretty.info(`(TRYCATCH) Got card`, { reader: reader.name, card });
//     //   } catch (err) {
//     //     pretty.error(`(TRYCATCH) error when reading data`, { reader: reader.name, err });
//     //   }
//     },
//     error => {
//         pretty.error(`(OBSERR) card error`, { reader: reader.name, card });
//     },
//     complete => {
// 	  console.log('Card complete', card)
// 	  pretty.info({ reader: reader.name });
//     },
//   );

//   const onError = Rx.Observable.fromEvent(reader, 'error');

//   let onError$ = onError.subscribe(error => {
//     console.log('ERROR', error);
//     pretty.error(`an error occurred`, { error });
//   });

//   const onEnd = Rx.Observable.fromEvent(reader, 'end');
//   let onEnd$ = onEnd.subscribe(end => {
//   	console.log('END', end);
//   	pretty.info(`device removed`, { reader: reader.name });
// });

// });

const onReader = Rx.Observable.fromEvent(nfc, 'reader')
.concatMap(a => {
  console.log('a0', a);
  const card$ = Rx.Observable.fromEvent(a, 'card');

  return card$.map(card => {
    console.log('card', card)
    return card;
  });
})

let onReader$ = onReader.subscribe(a => {
  console.log('aaaaaaaaaaaaaaaaaaaaaaaa');
  console.log('a', a)
  // get data here.
});

// const onEnd = Rx.Observable.fromEvent(onReader, 'end');
// let onEnd$ = onEnd.subscribe(end => {
//   console.log('END', end);
//   pretty.info(`device removed`, { reader: reader.name });
// });


// let onReader$ = onReader.subscribe(reader => {
//   pretty.info(`device attached`, { reader: reader.name });
// });






function mockRequest() {
  return Rx.Observable.of('{"id": 1, "lol": 2, "test": 3}');
  return Rx.Observable.of('{"id": 1, "lol": 2, "test": 3}');
  // return Rx.Observable.fromEvent(nfc, 'reader');
}
function otherMockRequest(id) {
  return Rx.Observable.of(`{"id":${id}, "desc": "description ${id}"}`);
  // return Rx.Observable.fromEvent(reader, 'card');
}

// class ItemsService {
//   fetchItems() {
//       return mockRequest()
//           .map(res => JSON.parse(res))
//           .concatAll()
//           .mergeMap(item => this.fetchItem(item));
//   }

//   fetchItem(item) {
//       return otherMockRequest(item.id)
//           .map(res => JSON.parse(res));
//   }
// }

// class ItemsService {
//   fetchItems() {
//       return mockRequest()
//         .map(function(res){
//           // var data = res.json();
//           console.log(res)
//         })
//           // .map(res => console.log('reader obs:', res))
//           // .map(res => res)
//           .concatAll()
//           .mergeMap(item =>
//             console.log('MERGING:', item)
//             // this.fetchItem(item),
//           );
//   }

//   fetchItem(item) {
//       return otherMockRequest(item)
//           .map(res => console.log(res));
//   }
// }

// let service = new ItemsService();
// service.fetchItems().subscribe(val => console.log(val));



const onReader = Rx.Observable.fromEvent(nfc, 'reader');
let onReader$ = onReader.subscribe(reader => {
  console.log(reader)
 return Rx.Observable.fromEvent(reader, 'card');
});
  const onCard = Rx.Observable.fromEvent(onReader$, 'card');
  let onCard$ = onCard.subscribe(
    async card => {
	  pretty.info('Card found', { reader: reader.name });
	  console.log('card:', card);
  });
let onReader$ = onReader.subscribe(reader => {
  pretty.info(`device attached`, { reader: reader.name });
	// console.log(reader.led)
	// reader.connect(CONNECT_MODE_DIRECT);
	// reader.setBuzzerOutput(false);
	// reader.disconnect();
  console.log(this)

  const onCard = Rx.Observable.fromEvent(reader, 'card');

  let onCard$ = onCard.subscribe(
    async card => {
	  pretty.info('Card found', { reader: reader.name });
	  console.log('card:', card);

	  // ntag216 = 872 byte
	  var data = await reader.read(230, 4); // await reader.read(4, 16, 16); for Mifare Classic cards
	  pretty.info(`data read`, { reader: reader.name, data });


	// // let messageLength = data[1];
	// pretty.info(`data read`, data);

	// pretty.info(`message length`, messageLength);
    //   try {
    //     pretty.info(`(TRYCATCH) Got card`, { reader: reader.name, card });
    //   } catch (err) {
    //     pretty.error(`(TRYCATCH) error when reading data`, { reader: reader.name, err });
    //   }
    },
    error => {
        pretty.error(`(OBSERR) card error`, { reader: reader.name, card });
    },
    complete => {
	  console.log('Card complete', card)
	  pretty.info({ reader: reader.name });
    },
  );

  const onError = Rx.Observable.fromEvent(reader, 'error');

  let onError$ = onError.subscribe(error => {
    console.log('ERROR', error);
    pretty.error(`an error occurred`, { error });
  });

  const onEnd = Rx.Observable.fromEvent(reader, 'end');
  let onEnd$ = onEnd.subscribe(end => {
  	console.log('END', end);
  	pretty.info(`device removed`, { reader: reader.name });
});

});






// nfc.on('reader', async reader => {

// 	pretty.info(`device attached`, { reader: reader.name });

// 	readers.push(reader);

// 	// needed for reading tags emulated with Android HCE AID
// 	// see https://developer.android.com/guide/topics/connectivity/nfc/hce.html
// 	reader.aid = 'F222222222';

	// reader.on('card', async card => {
  //   try {
  //     pretty.error(`Got card`, { card });
	// 	} catch (err) {
	// 		pretty.error(`error when reading data`, { err });
	// 	}

	// });

// 	reader.on('error', err => {

// 		pretty.error(`an error occurred`, { reader: reader.name, err });

// 	});

// 	reader.on('end', () => {

// 		pretty.info(`device removed`, { reader: reader.name });

// 		delete readers[readers.indexOf(reader)];

// 		console.log(readers);

// 	});


// });

// nfc.on('error', err => {

// 	pretty.error(`an error occurred`, err);

// });
