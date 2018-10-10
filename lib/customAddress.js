const bs58check = require('bs58check');


var bs58checkEncode = function(token, tokenShortName, payload){
	let address;
	if(token != 'BLOCKPOOL'){
		address = tokenShortName + '_' + bs58check.encode(payload);
	}
	else {
		address = bs58check.encode(payload);
	}
	return address;
};

var bs58checkDecode = function(address){
	address = address.substring(address.indexOf('_') + 1);
	return bs58check.decode(address);
};

module.exports = {
	bs58checkEncode,
	bs58checkDecode
};
