const Crypto = require('./crypto.js'),
	constants = require('../constants.js'),
	Slots = require('../time/slots.js');

function newSignature(secondSecret) {
	let crypto = this.crypto || Crypto;
	let keys = crypto.getKeys(secondSecret);

	let signature = {
		publicKey: keys.publicKey
	};

	return signature;
}

function createSignature(secret, secondSecret) {
	let crypto = this.crypto || Crypto;
	let slots = this.slots || Slots;
	let keys = crypto.getKeys(secret);

	let signature = this.newSignature(secondSecret) || newSignature(secondSecret);
	let transaction = {
		type: 1,
		amount: 0,
		fee: constants.fees.secondsignature,
		recipientId: null,
		senderPublicKey: keys.publicKey,
		timestamp: slots.getTime(),
		asset: {
			signature: signature
		}
	};

	crypto.sign(transaction, keys);
	transaction.id = crypto.getId(transaction);

	return transaction;
}

class SignatureClass {
	constructor(config) {
		this.crypto = new Crypto.CryptoClass(config);
		this.slots = new Slots.SlotsClass(config);
		this.newSignature = newSignature;
		this.createSignature = createSignature;
	}
}

module.exports = {
	newSignature,
	createSignature,
	SignatureClass
};
