const Crypto = require('./crypto.js'),
	constants = require('../constants.js'),
	Slots = require('../time/slots.js');

function createHashRegistration(ipfshash, secret, secondSecret) {
	let crypto = this.crypto || crypto;
	let slots = this.slots || Slots;
	let transaction = {
		type: 5,
		amount:0,
		fee: constants.fees.send,
		timestamp: slots.getTime(),
		asset: {}
	};

	transaction.vendorField=ipfshash;

	let keys = crypto.getKeys(secret);
	transaction.senderPublicKey = keys.publicKey;

	crypto.sign(transaction, keys);

	if (secondSecret) {
		let secondKeys = crypto.getKeys(secondSecret);
		crypto.secondSign(transaction, secondKeys);
	}

	transaction.id = crypto.getId(transaction);
	return transaction;
}

class IpfsClass {
	constructor(config) {
		this.crypto = new Crypto.CryptoClass(config);
		this.slots = new Slots.SlotsClass(config);
		this.createHashRegistration = createHashRegistration;
	}
}

module.exports = {
	createHashRegistration,
	IpfsClass
};
