module.exports = function () {
	var self = this;
	self.fs = require('fs');
	self.logFile = 'eastwood.log';

	self.log = function (message) {
		try {
			var now = new Date();
			message = now + ' ' + message;
			console.log(message + '\n');
			self.fs.appendFile(self.logFile, message + '\n', 'utf8', function () {});
		}
		catch (ex) { Logger.log('exception in logger.log: ' + ex); }
	};

	self.logObject = function (message, o) {
		try {
			if (message) { 
				console.log(message + '\n'); 
				self.fs.appendFile(self.logFile, message + '\n', 'utf8', function () {});
			}
			console.log(JSON.stringify(o));
			self.fs.appendFile(self.logFile, JSON.stringify(o), 'utf8', function () {});
		}
		catch (ex) {
			// it was probably circular
			try {
				for (var key in o) { 
					if (o.hasOwnProperty(key)) {
						var out = key + ': ' + o[key];
						console.log(out);
						self.fs.appendFile(self.logFile, out, 'utf8', function () {});
					}
				}
			}
			catch (ex) { console.log('Error printing object: ' + ex); }
		}
	};

	self.error = function(message, err) { console.log('ERROR\n' + message + '\n' + err + '\n'); }
};