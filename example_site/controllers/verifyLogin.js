module.exports = {
	POST: function () {
		var parts = Utilities.parsePostData(this.data); // maybe let request context check for this and parse it?

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

		var me = this;
		this.sessionManager.authenticateUser(parts.email, hashedPass, function(sessId, user) {
			// move the response code here in the callback
			// if sessId isn't null then make a cookie and return it
			var headerData = { 'Content-Type': 'text/html' };
			var body = '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/" /></head><body></body></html>';

			// if (!user.confirmed) { } //user hasn't clicked email confirmation link yet

			if (sessId) { headerData['Set-Cookie'] = 'sessId=' + sessId + ';path=/'; }

			me.response.writeHead(200, headerData);
  		me.response.end(body);
		});
	}
};
