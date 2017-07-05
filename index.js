bpl = {
	crypto : require("./lib/transactions/crypto.js"),
	delegate : require("./lib/transactions/delegate.js"),
	signature : require("./lib/transactions/signature.js"),
	transaction : require("./lib/transactions/transaction.js"),
	vote : require("./lib/transactions/vote.js"),
	ipfs : require("./lib/transactions/ipfs.js"),
	networks : require("./lib/networks.js"),
	slots : require("./lib/time/slots.js"),

	ECPair : require("./lib/ecpair.js"),
	HDNode : require("./lib/hdnode.js"),
	ECSignature : require("./lib/ecsignature.js"),
}

// extra aliases for bitcoinlib-js compatibility
var libCrypto = require('./lib/crypto.js')
for (var method in libCrypto) {
	bpl.crypto[method] = libCrypto[method]
}

module.exports = bpl;
