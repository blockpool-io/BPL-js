const Crypto = require('./crypto.js'),
	constants = require('../constants.js'),
	Slots = require('../time/slots.js');

function signTransaction(trs, secret) {
	let crypto = this.crypto || Crypto;
	let keys = crypto.getKeys(secret);
	let signature = crypto.sign(trs, keys);

	return signature;
}

function createMultisignature(secret, secondSecret, keysgroup, lifetime, min) {
	let crypto = this.crypto || Crypto;
	let slots = this.slots || Slots;
	let keys = crypto.getKeys(secret);

	let transaction = {
		type: 4,
		amount: 0,
		fee: constants.fees.multisignature,
		recipientId: null,
		senderPublicKey: keys.publicKey,
		timestamp: slots.getTime(),
		asset: {
			multisignature: {
				min: min,
				lifetime: lifetime,
				keysgroup: keysgroup
			}
		}
	};

	crypto.sign(transaction, keys);

	if (secondSecret) {
		let secondKeys = crypto.getKeys(secondSecret);
		crypto.secondSign(transaction, secondKeys);
	}

	transaction.id = crypto.getId(transaction);
	return transaction;
}

class MultiSignatureClass {
	constructor(config) {
		this.crypto = new Crypto.CryptoClass(config);
		this.slots = new Slots.SlotsClass(config);
		this.signTransaction = signTransaction;
		this.createMultisignature = createMultisignature;
	}
}

module.exports = {
	signTransaction,
	createMultisignature,
	MultiSignatureClass
};
