const Crypto = require('./crypto.js'),
	constants = require('../constants.js'),
	Slots = require('../time/slots.js');

function createTransaction(recipientId, amount, vendorField, secret, secondSecret, payload) {
	let crypto = this.crypto || Crypto;
	let slots = this.slots || Slots;

	if(!crypto.validateAddress(recipientId)){
		throw new Error('Wrong recipientId');
	}

	let transaction = {
		type: 0,
		amount: amount,
		fee: constants.fees.send,
		recipientId: recipientId,
		timestamp: slots.getTime(),
		asset: {},
		payload: payload || null
	};

	if(vendorField){
		transaction.vendorField=vendorField;
		if(transaction.vendorField.length > 64){
			return null;
		}
	}

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

class TransactionClass {
	constructor(config) {
		this.crypto = new Crypto.CryptoClass(config);
		this.slots = new Slots.SlotsClass(config);
		this.createTransaction = createTransaction;
	}
}

module.exports = {
	createTransaction,
	TransactionClass
};
