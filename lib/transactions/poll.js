const Crypto = require('./crypto.js'),
	constants = require('../constants.js'),
	Slots = require('../time/slots.js');

function createPoll(secret, poll, secondSecret, payload) {
	let crypto = this.crypto || Crypto;
	let slots = this.slots || Slots;

	if(!crypto.validateAddress(poll.address)){
		throw new Error('Wrong recipientId');
	}

	let keys = crypto.getKeys(secret);
	let transaction = {
		type: 9,
		amount: 0,
		fee: constants.fees.poll,
		recipientId: null,
		senderPublicKey: keys.publicKey,
		timestamp: slots.getTime(),
		asset: {
			poll: {
				name: poll.name || null,
				address: poll.address || null,
				startTimestamp: poll.startTimestamp || null,
				endTimestamp: poll.endTimestamp || null,
				intentions: poll.intentions || null
			}
		},
		payload: payload || null
	};

	crypto.sign(transaction, keys);

	if (secondSecret) {
		let secondKeys = crypto.getKeys(secondSecret);
		crypto.secondSign(transaction, secondKeys);
	}

	transaction.id = crypto.getId(transaction);
	return transaction;
}

class PollClass {
	constructor(config) {
		this.crypto = new Crypto.CryptoClass(config);
		this.slots = new Slots.SlotsClass(config);
		this.createPoll = createPoll;
	}
}

module.exports = {
	createPoll,
	PollClass
};
