module.exports = function (p) {
	var self = this;
	self.project = p;

	self.sessions = { };

	//asynchronous
	self.authenticateUser = function (email, hashedPass, callback) {
		self.project.dao.execute('select id, name, email, confirmed, logging from "user" where "email" = \'' + email + '\' and "password" = \'' + hashedPass + '\' and "confirmed" = true;', function (rows) {
			if (rows && rows.length > 0 && rows[0].id) {
				var sessId = self.newSessionId();
				self.sessions[sessId] = rows[0];
				callback(sessId, rows[0]);
			}
			callback(null);
		}); 
	};

	self.logoffUser = function (user) {
		if (self.sessions[user.sessId]) { delete self.sessions[user.sessId]; }
	};

	//synchronous
	//returns the user data if the user is logged in, otherwise returns null
	self.isLoggedIn = function (request) {
  		if (request.headers.cookie) {
  			var user = null;

  			var cookies = request.headers.cookie;
  			var matches = cookies.match(/[^\=\&\;]*=[^\=\&\;]*/g);

  			for (var i = 0; i < matches.length; i++) {
  				var parts = matches[i].split('=');
  				var name = Utilities.trimString(parts[0], ' ');
  				var value = Utilities.trimString(parts[1], ' ');

  				if (name == 'sessId' && self.sessions[value]) {
  					user = self.sessions[value];
  					user.sessId = value;
  					return user;
  				}
  			}
  		}

  		return user;
	};

	self.newSessionId = function () {
		return require('crypto').createHash('sha256').update(Math.random().toString()).digest('hex');
	};
};
