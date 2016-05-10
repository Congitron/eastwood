module.exports = {
	POST: function () {
		var parts = Utilities.parsePostData(this.data);

		if (!parts.email || !parts.password) {
			//if (!parts.email) { Logger.log('no email!'); }
			//if (!parts.passwrod) { Logger.log('no password!'); }
			this.return404();
			return;
		}

		//Logger.log('email: ' + parts.email);
		//Logger.log('password: ' + parts.password);

		if (parts.email.search('@') < 0 && parts.email.search('%40') > -1) {
			parts.email = parts.email.replace('%40', '@');
		}

		var hashedPass = require('crypto').createHash('sha256').update(parts.password).digest('hex');

		var me = this;
		this.sessionManager.authenticateUser(parts.email, hashedPass, function(sessId, user) {
			var headerData = { 'Content-Type': 'application/json' };
			if (sessId) { headerData['Set-Cookie'] = 'sessId=' + sessId + ';path=/'; }

			var jsonResponse = {
				success: !!sessId,
				sessId: sessId,
				name: (user && user.name) ? user.name : '',
				email: (user && user.email) ? user.email : '',
				logging: (user && user.logging) ? user.logging : 0
			};

			me.response.writeHead(200, headerData);
			me.response.end(JSON.stringify(jsonResponse));
		});
	}
};
