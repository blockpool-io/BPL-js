const crypto = require('./lib/transactions/crypto.js');
const delegate = require('./lib/transactions/delegate.js');
const signature = require('./lib/transactions/signature.js');
const transaction = require('./lib/transactions/transaction.js');
const vote = require('./lib/transactions/vote.js');
const ipfs = require('./lib/transactions/ipfs.js');
const slots = require('./lib/time/slots.js');
const ECPair = require('./lib/ecpair.js');
const HDNode = require('./lib/hdnode.js');
const ECSignature = require('./lib/ecsignature.js');
const customAddress = require('./lib/customAddress.js');

//default config for BPL
const defaultConfig = require('./config.json');

class BplClass {
	constructor(config) {
		config = config || {};
		let finalConfig = {
			delegates: config.delegates || defaultConfig.delegates,
			epochTime: config.epochTime || defaultConfig.epochTime,
			interval: config.interval || defaultConfig.interval,
			network: config.network || defaultConfig.network
		};

		this.crypto = new crypto.CryptoClass(finalConfig);
		this.delegate = new delegate.DelegateClass(finalConfig);
		this.signature = new signature.SignatureClass(finalConfig);
		this.transaction = new transaction.TransactionClass(finalConfig);
		this.vote = new vote.VoteClass(finalConfig);
		this.ipfs = new ipfs.IpfsClass(finalConfig);
		this.slots = new slots.SlotsClass(finalConfig);
		this.ECPair = ECPair;
		this.HDNode = HDNode;
		this.ECSignature = ECSignature;
		this.customAddress = customAddress;
	}
}

let bpljs = {
	crypto,
	delegate,
	signature,
	transaction,
	vote,
	ipfs,
	slots,
	ECPair,
	HDNode,
	ECSignature,
	customAddress,
	BplClass
};
module.exports = bpljs;
