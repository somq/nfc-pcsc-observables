"use strict";

// #############
// example not finished, it in progress !!!
// Read NDEF formatted data
// #############

import { NFC, TAG_ISO_14443_3, TAG_ISO_14443_4, KEY_TYPE_A, KEY_TYPE_B, CONNECT_MODE_DIRECT } from '../src/index';
import pretty from './pretty';
import Rx from 'rxjs';
// import chromeNdef from '../src/chromenfcNDEF'
// console.log(chromeNdef)

import ndef from '@taptrack/ndef'; // ndef formater
import { endianness }  from 'endianness'; // MSB first converter*
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




  let onCard$ = onCard.subscribe(
    card => {
      console.log('CARD', card);
      var res = new NDEF(card.attr)
      console.log(res)
      //   pretty.info(`Got card`, { reader: reader.name, card });

      // try {
      //   pretty.info(`Got card`, { reader: reader.name, card });
      // } catch (err) {
      //   pretty.error(`(TRYCATCHE) error when reading data`, { reader: reader.name, err });
      // }
    },
    error => { 
        pretty.error(`(OBSERR) card error`, { reader: reader.name, card });
    },
    complete => {
      pretty.info(`card complete`, { reader: reader.name, card });
    },
  );


// //emit 'Hello' and 'Goodbye'
// const source = Rx.Observable.of('Hello', 'Goodbye');
// // map value from source into inner observable, when complete emit result and move to next
// const example = source.concatMap(val => Rx.Observable.of(`${val} World!`));
// //output: 'Example One: 'Hello World', Example One: 'Goodbye World'
// const subscribe = example.subscribe(val => console.log('Example One:', val));

const DEBUG = true;

const currentAction = 'READ_CARD_MESSAGE';
class NfcReaderService {
  reader = 'test';

  init() {
    // Source
    const onReader$ = Rx.Observable.fromEvent(nfc, 'reader')

    // Events as Observables
    const onCard$ = onReader$.switchMap(readerEvent => Rx.Observable.fromEvent(readerEvent, 'card'));
    const onCardOff$ = onReader$.switchMap(readerEvent => Rx.Observable.fromEvent(readerEvent, 'card.off'));
    const onReaderEnd$ = onReader$.switchMap(readerEvent => Rx.Observable.fromEvent(readerEvent, 'end'));
    const onReaderStatus$ = onReader$.switchMap(readerEvent => Rx.Observable.fromEvent(readerEvent, 'status'));
    const onError$ = onReader$.switchMap(readerEvent => Rx.Observable.fromEvent(readerEvent, 'error'));

    // Subscribes
    const onReader = onReader$.subscribe(reader => {
      // Declare the reader object for our class
      this.reader = reader;
      if (DEBUG) { pretty.info(`device attached`, { reader: this.reader.name }); }
    });
    const onReaderStatus = onReaderStatus$.subscribe(readerStatus => {
      if (DEBUG) { pretty.info(`Reader status`, { readerStatus: readerStatus }); }
    });
    const onReaderEnd = onReaderEnd$.subscribe(readerEnd => {
      if (DEBUG) { pretty.info(`device removed`, { reader: this.reader.name }); }
    });

    const onCard = onCard$.subscribe(async card => {
      if (DEBUG) { console.info(`Found a card`, { card }); }
      const action = this.actionManager.onCard();
      action();

    });
    const onCardOff = onCardOff$.subscribe(cardOff => {
      if (DEBUG) { console.info(`The card has been removed`, { card }); }
    });

    const onError = onError$.subscribe(error => {
      if (DEBUG) { pretty.error(`an error occurred`, { error }); }
    });
  }

  // https://github.com/pokusew/nfc-pcsc/blob/master/src/Reader.js#L486
  async readCard(blockNumber, length, blockSize = 4, packetSize = 16) {
    var data = await this.reader.read(blockNumber, length); // await reader.read(4, 16, 16); for Mifare Classic cards
    if (DEBUG) { pretty.info(`data read - (`, currentAction, ')', { reader: this.reader.name, data }); }
  }
  // https://github.com/pokusew/nfc-pcsc/blob/master/src/Reader.js#L557
  async writeCard(blockNumber, data, blockSize = 4) {
    var data = await this.reader.write(blockNumber, length); // await reader.write(4, data, 16); for Mifare Classic cards
    if (DEBUG) { pretty.info(`data written`, { reader: this.reader.name, data }); }
  }

  actionManager = {
    onCard: () => {
      switch (currentAction) {
        case 'READ_CARD_MESSAGE':
          return this.readCard(4, 16);
          break;
        case 'READ_CARD_CONFIG':
          return this.readCard(4, 16);
          break;

        default:
          break;
      }
    }
  }
}
let service = new NfcReaderService();
service.init();



// const onReader = Rx.Observable.fromEvent(nfc, 'reader')
// .mergeMap(readerEvent => {
//   pretty.info(`device attached`, { reader: readerEvent.name });
//   console.log('Caught a new readerEvent!', readerEvent);

//   const card$ = Rx.Observable.fromEvent(readerEvent, 'card');

//     return card$.map(card => {
//       console.log('card', card)
//       return card;
//     });

//   const onReaderEnd$ = Rx.Observable.fromEvent(readerEvent, 'end');

//   return onReaderEnd$.map(readerEnd => {
//     console.log('readerEnd', readerEnd)
//     return readerEnd;
//   });


// })
// let onReader$ = onReader.subscribe(success, error, complete);

// function success(res) {
//   console.log('succ', res);
// }
// function error(res) {
//   console.log('err', res);
// }
// function complete(res) {
//   console.log('comp', res);
// }





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

/**
 * OK
 */

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





/**
 * LEGACY
 */
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
