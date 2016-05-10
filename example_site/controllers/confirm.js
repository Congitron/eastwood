module.exports = {
	GET: function () {
		var me = this;
		var activationKey = this.query['ak'];

		this.dao.execute('update "user" set confirmed = true where activation_key = \'' + activationKey + '\';', function (rows) {
			//var headerData = { 'Content-Type': 'text/html'	};
			var template = '{: extend path="base.html" block="content" :}' + 
						   '<h1>Thank you for confirming your email address</h1></br>' +
			               'Click <a href="/login">here</a> to login'; //<meta http-equiv="refresh" content="0; url=/" />
			me.renderTemplateString(template);
			//this.response.writeHead(200, headerData);
			//this.response.end(body);
		});
	}
};