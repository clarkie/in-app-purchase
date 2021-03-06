var async = require('async');

var apple = require('./lib/apple');
var google = require('./lib/google');
var windows = require('./lib/windows');
var amazon = require('./lib/amazon');
var constants = require('./constants');

module.exports.APPLE = constants.SERVICES.APPLE;
module.exports.GOOGLE = constants.SERVICES.GOOGLE;
module.exports.WINDOWS = constants.SERVICES.WINDOWS;
module.exports.AMAZON = constants.SERVICES.AMAZON;

module.exports.config = function (configIn) {
	apple.readConfig(configIn);
	google.readConfig(configIn);
	windows.readConfig(configIn);
	amazon.readConfig(configIn);
};

module.exports.setup = function (cb) {
	async.parallel([
		function (next) {
			apple.setup(next);
		},
		function (next) {
			google.setup(next);
		},
		function (next) {
			amazon.setup(next);
		}
	], cb);
};

module.exports.validate = function (service, receipt, cb) {
	var validator;
	switch (service) {
		case module.exports.APPLE:
			validator = apple.validatePurchase;
			break;
		case module.exports.GOOGLE:
			validator = google.validatePurchase;
			break;
		case module.exports.WINDOWS:
			validator = windows.validatePurchase;
			break;
		case module.exports.AMAZON:
			validator = amazon.validatePurchase;
			break;
		default:
			return cb(new Error('invalid service given: ' + service));
	}
	validator(receipt, function (error, response) {
		if (error) {
			return cb(error);
		}
		cb(null, response);
	});
};

module.exports.isValidated = function (response) {
	if (response && response.status === constants.VALIDATION.SUCCESS) {
		return true;
	}
	return false;
};

module.exports.isExpired = function (purchasedItem) {
	if (!purchasedItem || !purchasedItem.transactionId) {
		throw new Error('invalid purchased item given:\n' + JSON.stringify(purchasedItem));
	}
	if (!purchasedItem.expirationDate) {
		// there is no exipiration date with this item
		return false;
	}
	if (Date.now() - purchasedItem >= 0) {
		return true;
	}
	// has not exipired yet
	return false;
};

module.exports.getPurchaseData = function (purchaseData, options) {
	if (!purchaseData || !purchaseData.service) {
		return null;
	}
	var data = {};
	switch (purchaseData.service) {
		case module.exports.APPLE:
			return apple.getPurchaseData(purchaseData, options);
		case module.exports.GOOGLE:
			return google.getPurchaseData(purchaseData, options);
		case module.exports.WINDOWS:
			return windows.getPurchaseData(purchaseData, options);
		case module.exports.AMAZON:
			return amazon.getPurchaseData(purchaseData, options);
		default:
			return null;
	}
};

// test use only
module.exports.reset = function () {
	// resets google setup
	google.reset();
};
