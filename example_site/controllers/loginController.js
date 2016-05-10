var loginController = {
	GET: function (request, response, data) {
		Logger.logObject('this:', this);
		Logger.log('blah: ' + this.blahblahblah);
		var pagePath = 'example_site/views/login.html'; //should use path.join maybe

		require('fs').readFile(pagePath, 'utf-8', function (err, text) {
			var parsedText = this.project.requestHandler.processTemplate(text, request);

			response.setHeader('Content-Type', 'text/html');
			response.end(parsedText);
		});
	},

	POST: function (request, response, data) {
		Logger.log('loginController.POST()');
		var parts = this.utilities.parsePostData(data);

		if (parts.email) {
			if (parts.email.search('@') < 0 && parts.email.search('%40') > -1) {
				parts.email = parts.email.replace('%40', '@');
			}
		}

		// now verify login via sessionManager..need to..
		// hash the provided password
		// pass the email/hashed-password combo to the sessionManager's authentication method
		// sessMngr needs to verify your shit is right (you sent the right pw for your email/username) and then make a session Id for you
		// need to set the session id in a cookie and give it back to you so you can keep sending it back w / requests

		var hashedPass = require('crypto').createHash('sha256').update(parts.password).digest('hex');
		//console.log('hashed: ' + hashedPass); // hashed pass

		this.project.sessionManager.authenticateUser(parts.email, hashedPass, function(sessId, user) {
			// move the response code here in the callback
			// if sessId isn't null then make a cookie and return it
			var headerData = { 'Content-Type': 'text/plain' };
			var body = '';

			if (sessId) { //add the cookie if login was successfull
				headerData['Set-Cookie'] = 'sessId=' + sessId;
				body += '>Welcome ' + user.name + '\n';
			}

			else { body += 'Login failed.'; }

			response.writeHead(200, headerData);
  			response.end(body);
		});
	},

	PUT: function (request, response, data) {
		var message = 'verifyLogin PUT';
		console.log(message + '\n' + request);
		response.setHeader('Content-Type', 'text/html');
		response.end(message);
	}
};

module.exports = loginController;
