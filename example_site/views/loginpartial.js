module.exports = {
	ifLoggedIn: function(params) {
		try {
			if (this.user) { 
				params.then = params.then.replace('{~ username ~}', this.user.name); //how to replace the username?
				return params.then;
			}
			else { return params.else; }
		}
		catch (ex) { return (params.else) ? params.else : ''; }
	}
};