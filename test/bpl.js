var Buffer = require('buffer/').Buffer;
var should = require('should');
var bpl = require('../index.js');

describe('bpl JS', function () {

	it('should be ok', function () {
		(bpl).should.be.ok;
	});

	it('should be object', function () {
		(bpl).should.be.type('object');
	});

	it('should have properties', function () {
		var properties = ['transaction', 'signature', 'vote', 'delegate', 'crypto'];

		properties.forEach(function (property) {
			(bpl).should.have.property(property);
		});
	});

});
