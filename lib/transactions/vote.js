const Crypto = require('./crypto.js'),
	constants = require('../constants.js'),
	Slots = require('../time/slots.js');

function createVote(secret, delegates, secondSecret) {
	let crypto = this.crypto || Crypto;
	let slots = this.slots || Slots;
	let keys = crypto.getKeys(secret);

	let transaction = {
		type: 3,
		amount: 0,
		fee: constants.fees.vote,
		recipientId: crypto.getAddress(keys.publicKey),
		senderPublicKey: keys.publicKey,
		timestamp: slots.getTime(),
		asset: {
			votes: delegates
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

class VoteClass {
	constructor(config) {
		this.crypto = new Crypto.CryptoClass(config);
		this.slots = new Slots.SlotsClass(config);
		this.createVote = createVote;
	}
}

module.exports = {
	createVote,
	VoteClass
};
