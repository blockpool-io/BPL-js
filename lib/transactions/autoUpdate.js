const Crypto = require('./crypto.js'),
	constants = require('../constants.js'),
	Slots = require('../time/slots.js');

function createAutoUpdate(data, secret, secondSecret) {
	let crypto = this.crypto || Crypto;
	let slots = this.slots || Slots;

	let keys = crypto.getKeys(secret);
	let transaction = {
		type: 8,
		amount: 0,
		fee: constants.fees.autoupdate,
		recipientId: null,
		senderPublicKey: keys.publicKey,
		timestamp: slots.getTime(),
		asset: {
			autoUpdate: {
				versionLabel: data.versionLabel,
				triggerHeight: data.triggerHeight,
				ipfsHash: data.ipfsHash,
				ipfsPath: data.ipfsPath,
				verifyingTransactionId: data.verifyingTransactionId,
				cancellationStatus: data.cancellationStatus
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

class AutoUpdateClass {
	constructor(config) {
		this.crypto = new Crypto.CryptoClass(config);
		this.slots = new Slots.SlotsClass(config);
		this.createAutoUpdate = createAutoUpdate;
	}
}

module.exports = {
	createAutoUpdate,
	AutoUpdateClass
};
