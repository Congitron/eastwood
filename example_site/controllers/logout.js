module.exports = {
	POST: function () { 
		this.sessionManager.logoffUser.apply(this, [this.user]); //probably don't need to pass context here, but doesn't hurt

		var headerData = { 
			'Content-Type': 'text/html',
			'Set-Cookie': 'sessId=expired;path=/;max-age=0'
		};

		var body = '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/" /></head><body></body></html>';

		this.response.writeHead(200, headerData);
		this.response.end(body);
	}
};