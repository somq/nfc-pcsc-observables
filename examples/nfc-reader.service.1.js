"use strict";

// #############
// nfc-pcsc Observable
// #############

import { NFC, TAG_ISO_14443_3, TAG_ISO_14443_4, KEY_TYPE_A, KEY_TYPE_B, CONNECT_MODE_DIRECT } from '../src/index';
import pretty from './pretty';
import Rx from 'rxjs';

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

const DEBUG = true;

const currentAction = 'READ_CARD_MESSAGE';

/**
 * @class NfcReaderService
 * @description transforms the nfc-pcsc library into a swarm of observables
 *      - Manage the action to perform depending on the state of the app
 * @method init
 * @description initialize the reader, create child observables and subscribe to them
 *      - See below for more details
 * @namespace actionManager
 *    @method onCard
 *    @description What to do when we find a card ?
 *
 * @observables
 *    onReader$ - when a reader goes up
 *    onCard$ - when a card has been found
 *    onCardOff$ - when a card has been taken off
 *    onReaderEnd$ - when a reader goes down
 *    onReaderStatus$ - ?
 *    onError$ - when an error is raised
 *    aCardHasBeenRead$ - when a card has been read and processed
 *    aCardHasBeenWritten$ - when a card has been written and processed
 */

class NfcReaderService {

  // When a reader has been found
  // aReaderHasBeenFound$ = Rx.Observable.create(aReaderHasBeenFound => {
  //   this.aReaderHasBeenFound = aReaderHasBeenFound;
  // });
  // When a card has been read and processed
  aCardHasBeenRead$ = Rx.Observable.create(aCardHasBeenRead => {
    this.aCardHasBeenRead = aCardHasBeenRead;
  });
  // When a card has been written and processed
  aCardHasBeenWritten$ = Rx.Observable.create(aCardHasBeenWritten => {
    this.aCardHasBeenWritten = aCardHasBeenWritten;
  });

  /**
   * Source Observable
   * 'reader' event is our source
   * It's the base event we would nest childs events in if we were using .on eventEmitter syntax
   *
   * eg.
   *      nfc.on('reader', async reader => {
   *        reader.on('card', async card => {
   *          ...reader.write(blockNumber, length)...
   */
  onReader$ = Rx.Observable.fromEvent(nfc, 'reader')

  /**
   * Events as Observables
   * We grab all the childs event of reader here and switchMap them to observables
   */
  onCard$ = this.onReader$.switchMap(readerEvent => Rx.Observable.fromEvent(readerEvent, 'card'));
  onCardOff$ = this.onReader$.switchMap(readerEvent => Rx.Observable.fromEvent(readerEvent, 'card.off'));
  onReaderEnd$ = this.onReader$.switchMap(readerEvent => Rx.Observable.fromEvent(readerEvent, 'end'));
  onReaderStatus$ = this.onReader$.switchMap(readerEvent => Rx.Observable.fromEvent(readerEvent, 'status'));
  onError$ = this.onReader$.switchMap(readerEvent => Rx.Observable.fromEvent(readerEvent, 'error'));

  // Reader - when we find a new reader
  onReader = this.onReader$.subscribe(reader => {
    // Declare the reader object for our class
    this.reader = reader;
  });

  // card - when we find a card
  onCard = this.onCard$.subscribe(async card => {
    if (DEBUG) { console.info(`Processing card (uid:`, card.uid + ')' ); }
    const action = this.actionManager.onCard();
    action.then(cardData => {
      console.log('cardData', cardData)
      // ADD PROCESS HERE ?
      this.aCardHasBeenRead.next(cardData)
    });
  });

  init() {

    /**
     * Subscribes
     * We subscribe to all our observables here
     */

    // Reader - when we find a new reader
    // const onReader = this.onReader$.subscribe(reader => {
    //   // Declare the reader object for our class
    //   this.reader = reader;
    //   this.aReaderHasBeenFound.next('reader')
    //   // if (DEBUG) { pretty.info(`device attached`, { reader: this.reader.name }); }
    // });

    // // Reader Status @UNUSED?
    // const onReaderStatus = this.onReaderStatus$.subscribe(readerStatus => {
    //   if (DEBUG) { pretty.info(`Reader status`, { readerStatus: readerStatus }); }
    // });

    // // Reader end - when we lose a reader
    // const onReaderEnd = this.onReaderEnd$.subscribe(readerEnd => {
    //   if (DEBUG) { pretty.info(`device removed`, { reader: this.reader.name }); }
    // });

    // // card - when we find a card
    // const onCard = this.onCard$.subscribe(async card => {
    //   if (DEBUG) { console.info(`Processing card (uid:`, card.uid + ')' ); }
    //   const action = this.actionManager.onCard();
    //   action.then(cardData => {
    //     console.log('cardData', cardData)
    //     // ADD PROCESS HERE ?
    //     this.aCardHasBeenRead.next('cardData processed')
    //   });
    // });

    // // card.off - when we lose a card
    // const onCardOff = this.onCardOff$.subscribe(cardOff => {
    //   if (DEBUG) { console.info(`The card has been removed`, { card }); }
    // });

    // // error - any error is thrown here, either reader or card
    // const onError = this.onError$.subscribe(error => {
    //   if (DEBUG) { pretty.error(`an error occurred`, { error }); }
    // });

  }


  /**
   * @method readCard
   * @description read a card using legacy args
   *    - see: https://github.com/pokusew/nfc-pcsc/blob/master/src/Reader.js#L486
   *
   * @param {*} blockNumber
   * @param {*} length
   * @param {*} blockSize
   * @param {*} packetSize
   */
  async readCard(blockNumber, length, blockSize = 4, packetSize = 16) {
    // var data = await this.reader.read(blockNumber, length); // await reader.read(4, 16, 16); for Mifare Classic cards
    // if (DEBUG) { pretty.info(`data read - (`, currentAction, ')', { reader: this.reader.name, data }); }
    return await this.reader.read(blockNumber, length); // await reader.write(4, data, 16); for Mifare Classic cards
  }

  /**
   * @method writeCard
   * @description write a card using legacy args
   *    see: https://github.com/pokusew/nfc-pcsc/blob/master/src/Reader.js#L557
   *
   * @param {any} blockNumber
   * @param {any} data
   * @param {number} [blockSize=4]
   * @memberof NfcReaderService
   */
  async writeCard(blockNumber, data, blockSize = 4) {
    var data = await this.reader.write(blockNumber, length); // await reader.write(4, data, 16); for Mifare Classic cards
    if (DEBUG) { pretty.info(`data written`, { reader: this.reader.name, data }); }
  }


  /**
   * @namespace actionManager
   * @description a dispatcher used to know what we are supposed to do when we find a card
   *
   * @method onCard
   * @description What to do when we find a card ?
   *    - Check what's the current action and return the approriate method
   * @returns {function} according to the @param currentAction
   */
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
// Instanciate the reader service class
let nfcReader = new NfcReaderService();
// Init the reader
// nfcReader.init();


// // Reader - when we find a new reader
// nfcReader.aReaderHasBeenFound$.subscribe(reader => {
//   if (DEBUG) { pretty.info(`device attached`, { reader: reader.name }); }
// });
// Reader - when we find a new reader
nfcReader.onReader$.subscribe(reader => {
  if (DEBUG) { pretty.info(`device attached`, { reader: reader.name }); }
});

// Reader end - when we lose a reader
nfcReader.onReaderEnd$.subscribe(readerEnd => {
  if (DEBUG) { pretty.info(`device removed`, { reader: reader.name }); }
});

// card - when we find a card
nfcReader.onCard$.subscribe(async card => {
  if (DEBUG) { console.info(`Found a card`, { card }); }
});

// card.off - when we lose a card
nfcReader.onCardOff$.subscribe(cardOff => {
  if (DEBUG) { console.info(`The card has been removed`, { card }); }
});

// error - any error is thrown here, either reader or card
nfcReader.onError$.subscribe(error => {
  if (DEBUG) { pretty.error(`an error occurred`, { error }); }
});

nfcReader.aCardHasBeenRead$.subscribe(data => console.log('A card has been read and processed', data))
nfcReader.aCardHasBeenWritten$.subscribe(data => console.log('A card has been written and processed', data))
