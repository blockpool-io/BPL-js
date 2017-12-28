var crypto = require("crypto");
var crypto_utils = require("../crypto.js");
var ECPair = require("../ecpair.js");
var ECSignature = require("../ecsignature.js");
var networks = require("../networks.js")

var bs58check = require('bs58check')

if (typeof Buffer === "undefined") {
	Buffer = require("buffer/").Buffer;
}

var ByteBuffer = require("bytebuffer");
var bignum = require("browserify-bignum");


var fixedPoint = Math.pow(10, 8);
// default is wbx 'W'
var networkVersion = 73;

function getSignatureBytes(signature) {
	var bb = new ByteBuffer(33, true);
	var publicKeyBuffer = new Buffer(signature.publicKey, "hex");

	for (var i = 0; i < publicKeyBuffer.length; i++) {
		bb.writeByte(publicKeyBuffer[i]);
	}

	bb.flip();
	return new Uint8Array(bb.toArrayBuffer());
}

function getBytes(transaction, skipSignature, skipSecondSignature) {
	var assetSize = 0,
		assetBytes = null;

	switch (transaction.type) {
		case 1: // Signature
			assetBytes = getSignatureBytes(transaction.asset.signature);
			assetSize = assetBytes.length;
			break;

		case 2: // Delegate
			assetBytes = new Buffer(transaction.asset.delegate.username, "utf8");
			assetSize = assetBytes.length;
			break;

		case 3: // Vote
			if (transaction.asset.votes !== null) {
				assetBytes = new Buffer(transaction.asset.votes.join(""), "utf8");
				assetSize = assetBytes.length;
			}
			break;

		case 4: // Multi-Signature
			var keysgroupBuffer = new Buffer(transaction.asset.multisignature.keysgroup.join(""), "utf8");
			var bb = new ByteBuffer(1 + 1 + keysgroupBuffer.length, true);

			bb.writeByte(transaction.asset.multisignature.min);
			bb.writeByte(transaction.asset.multisignature.lifetime);

			for (var i = 0; i < keysgroupBuffer.length; i++) {
				bb.writeByte(keysgroupBuffer[i]);
			}

			bb.flip();

			assetBytes = bb.toBuffer();
			assetSize  = assetBytes.length;
			break;

	}

	if (transaction.requesterPublicKey) {
		assetSize += 33;
	}

	var bb = new ByteBuffer(1 + 4 + 32 + 8 + 8 + 21 + 64 + 64 + 64 + assetSize, true);
	bb.writeByte(transaction.type);
	bb.writeInt(transaction.timestamp);

	var senderPublicKeyBuffer = new Buffer(transaction.senderPublicKey, "hex");
	for (var i = 0; i < senderPublicKeyBuffer.length; i++) {
		bb.writeByte(senderPublicKeyBuffer[i]);
	}

	if (transaction.requesterPublicKey) {
		var requesterPublicKey = new Buffer(transaction.requesterPublicKey, "hex");

		for (var i = 0; i < requesterPublicKey.length; i++) {
			bb.writeByte(requesterPublicKey[i]);
		}
	}

	if (transaction.recipientId) {
		var recipient = bs58check.decode(transaction.recipientId);
		for (var i = 0; i < recipient.length; i++) {
			bb.writeByte(recipient[i]);
		}
	} else {
		for (var i = 0; i < 21; i++) {
			bb.writeByte(0);
		}
	}

	if (transaction.vendorField) {
		var vf = new Buffer(transaction.vendorField);
		var fillstart=vf.length;
		for (i = 0; i < fillstart; i++) {
			bb.writeByte(vf[i]);
		}
		for (i = fillstart; i < 64; i++) {
			bb.writeByte(0);
		}
	} else {
		for (i = 0; i < 64; i++) {
			bb.writeByte(0);
		}
	}

	bb.writeLong(transaction.amount);

	bb.writeLong(transaction.fee);

	if (assetSize > 0) {
		for (var i = 0; i < assetSize; i++) {
			bb.writeByte(assetBytes[i]);
		}
	}

	if (!skipSignature && transaction.signature) {
		var signatureBuffer = new Buffer(transaction.signature, "hex");
		for (var i = 0; i < signatureBuffer.length; i++) {
			bb.writeByte(signatureBuffer[i]);
		}
	}

	if (!skipSecondSignature && transaction.signSignature) {
		var signSignatureBuffer = new Buffer(transaction.signSignature, "hex");
		for (var i = 0; i < signSignatureBuffer.length; i++) {
			bb.writeByte(signSignatureBuffer[i]);
		}
	}

	bb.flip();
	var arrayBuffer = new Uint8Array(bb.toArrayBuffer());
	var buffer = [];

	for (var i = 0; i < arrayBuffer.length; i++) {
		buffer[i] = arrayBuffer[i];
	}

	return new Buffer(buffer);
}

function getId(transaction) {
	return crypto.createHash("sha256").update(getBytes(transaction)).digest().toString("hex");
}

function getHash(transaction, skipSignature, skipSecondSignature) {
	return crypto.createHash("sha256").update(getBytes(transaction, skipSignature, skipSecondSignature)).digest();
}

function getFee(transaction) {
	switch (transaction.type) {
		case 0: // Normal
			return 0.1 * fixedPoint;
			break;

		case 1: // Signature
			return 100 * fixedPoint;
			break;

		case 2: // Delegate
			return 10000 * fixedPoint;
			break;

		case 3: // Vote
			return 1 * fixedPoint;
			break;
	}
}

function sign(transaction, keys) {
	var hash = getHash(transaction, true, true);

	var signature = keys.sign(hash).toDER().toString("hex");

	if (!transaction.signature) {
		transaction.signature = signature;
	}
	return signature;

}

function secondSign(transaction, keys) {
	var hash = getHash(transaction, false, true);

	var signature = keys.sign(hash).toDER().toString("hex");

	if (!transaction.signSignature) {
		transaction.signSignature = signature;
	}
	return signature;
}

function verify(transaction, network) {
	network = network || networks.bpl;

	var hash = getHash(transaction, true, true);

	var signatureBuffer = new Buffer(transaction.signature, "hex");
	var senderPublicKeyBuffer = new Buffer(transaction.senderPublicKey, "hex");
	var ecpair = ECPair.fromPublicKeyBuffer(senderPublicKeyBuffer, network);
	var ecsignature = ECSignature.fromDER(signatureBuffer);
	var res = ecpair.verify(hash, ecsignature);

	return res;
}

function verifySecondSignature(transaction, publicKey, network) {
	network = network || networks.bpl;

	var hash = getHash(transaction, false, true);

	var signSignatureBuffer = new Buffer(transaction.signSignature, "hex");
	var publicKeyBuffer = new Buffer(publicKey, "hex");
	var ecpair = ECPair.fromPublicKeyBuffer(publicKeyBuffer, network);
	var ecsignature = ECSignature.fromDER(signSignatureBuffer);
	var res = ecpair.verify(hash, ecsignature);

	return res;
}

function getKeys(secret, network) {
	var ecpair = ECPair.fromSeed(secret, network || networks.bpl);

	ecpair.publicKey = ecpair.getPublicKeyBuffer().toString("hex");
	ecpair.privateKey = '';

	return ecpair;
}

function getAddress(publicKey, version){
	if(!version){
		version = networkVersion;
	}
	var buffer = crypto_utils.ripemd160(new Buffer(publicKey,'hex'));

	var payload = new Buffer(21);
	payload.writeUInt8(version, 0);
	buffer.copy(payload, 1);

	return bs58check.encode(payload);
}

function setNetworkVersion(version){
	networkVersion = version;
}

function getNetworkVersion(){
	return networkVersion;
}

function validateAddress(address, version){
	if(!version){
		version = networkVersion;
	}
	try {
		var decode = bs58check.decode(address);
		return decode[0] == version;
	} catch(e){
		return false;
	}
}

module.exports = {
	getBytes: getBytes,
	getHash: getHash,
	getId: getId,
	getFee: getFee,
	sign: sign,
	secondSign: secondSign,
	getKeys: getKeys,
	getAddress: getAddress,
	validateAddress: validateAddress,
	verify: verify,
	verifySecondSignature: verifySecondSignature,
	fixedPoint: fixedPoint,
	setNetworkVersion: setNetworkVersion,
	getNetworkVersion: getNetworkVersion
}
