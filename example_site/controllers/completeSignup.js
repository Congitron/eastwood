module.exports = {
	POST: function () {
		var me = this;

		var parts = Utilities.parsePostData(me.data);
		//name, email, password1, password2

		if (parts.password1 != parts.password2) {
			var body = '<h1>Password fields must match!</h1>';
			me.response.setHeader('Content-Type', 'text/html');
  			me.response.end(body);
  			return;
		}

		if (parts.email) {
			if (parts.email.search('@') < 0 && parts.email.search('%40') > -1) {
				parts.email = parts.email.replace('%40', '@');
			}
		}

		var signupContext = this;

		//check for this email address in the database
		this.dao.execute('select * from "user" where "email" = \'' + parts.email + '\';', function (rows) {
			if (rows && rows.length > 0) {
				var body = '<h1>Email address is already in use!</h1>';
				me.response.setHeader('Content-Type', 'text/html');
  				me.response.end(body);
  				return;
			}

			//generate activation key
			var activation_key = require('crypto').createHash('sha256').update(parts.email).digest('hex');
			//var key_expires = today + 2 days?

			//Save to database with confirmed = false
			var hashedPass = require('crypto').createHash('sha256').update(parts.password1).digest('hex');
			var query = 'insert into "user" (name, email, password, confirmed, activation_key) values (' +
				'\'' + parts.name + '\', ' +
				'\'' + parts.email + '\', ' +
				'\'' + hashedPass + '\', ' +
				'false, ' +
				'\'' + activation_key + '\'' +
				');';

			signupContext.dao.execute(query, function (rows) {
				//send confirmation email
				var sendgrid_api_key = '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';
				var sendgrid = require('sendgrid')(sendgrid_api_key);

				var payload = {
					to      : parts.email,
					from    : 'support@marketblox.com',
					subject : 'MarketBlox confirmation email',
					text    : 'Hi ' + parts.name +
						' , welcome to MarketBlox!\n\n' +
						'To activate your account, please click the following link\n\n https://www.marketblox.com/confirm?ak=' + activation_key
				};

				sendgrid.send(payload, function(err, json) {
					var body = '';
					if (err) {
						console.error('sendgrid error: ' + err);
						body = '<h1>Error sending email to ' + parts.email + '</h1>';
					}

					else { body = '<h1>A confirmation email has been sent to ' + parts.email + '</h1>'; }
					console.log('sendgrid json: ' + json);

					me.response.setHeader('Content-Type', 'text/html');
	  				me.response.end(body);
	  				return;
				});
			});
		});
	}
};
