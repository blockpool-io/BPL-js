const defaultConfig = require('../../config.json');

function getEpochTime(time) {
	if (time === undefined) {
		time = (new Date()).getTime();
	}
	let d = (this.hasOwnProperty('beginEpochTime') ? this.beginEpochTime() : beginEpochTime());
	let t = d.getTime();
	return Math.floor((time - t) / 1000);
}

function beginEpochTime() {
	let d = new Date(this.epochTime || defaultConfig.epochTime);

	return d;
}

function getTime(time) {
	if(this.hasOwnProperty('getEpochTime'))
		return this.getEpochTime(time);
	else
		return getEpochTime(time);
}

function getRealTime(epochTime) {
	if (epochTime === undefined) {
		epochTime = (this.hasOwnProperty(getTime) ? this.getTime() : getTime());
	}
	let d = (this.hasOwnProperty('beginEpochTime') ? this.beginEpochTime() : beginEpochTime());
	let t = Math.floor(d.getTime() / 1000) * 1000;
	return t + epochTime * 1000;
}

function getSlotNumber(epochTime) {
	if (epochTime === undefined) {
		epochTime = (this.hasOwnProperty('getTime') ? this.getTime() : getTime());
	}

	let interval = this.interval || defaultConfig.interval;
	return Math.floor(epochTime / interval);
}

function getSlotTime(slot) {
	let interval = this.interval || defaultConfig.interval;
	return slot * interval;
}

function getNextSlot() {
	let slot = (this.hasOwnProperty('getSlotNumber') ? this.getSlotNumber() : getSlotNumber());

	return slot + 1;
}

function getLastSlot(nextSlot) {
	let delegates = this.delegates || defaultConfig.delegates;
	return nextSlot + delegates;
}

class SlotsClass {
	constructor(config) {
		this.delegates = config.delegates;
		this.epochTime = config.epochTime;
		this.interval = config.interval;
		this.getEpochTime = getEpochTime;
		this.beginEpochTime = beginEpochTime;
		this.getTime = getTime;
		this.getRealTime = getRealTime;
		this.getSlotNumber = getSlotNumber;
		this.getSlotTime = getSlotTime;
		this.getNextSlot = getNextSlot;
		this.getLastSlot = getLastSlot;
	}
}

module.exports = {
	getEpochTime,
	beginEpochTime,
	getTime,
	getRealTime,
	getSlotNumber,
	getSlotTime,
	getNextSlot,
	getLastSlot,
	SlotsClass
};
