module.exports = {
	ifLoggedIn: function(params) {
		try {
			if (this.user) { 
				return params.then;
			}
			else { return params.else; }
		}
		catch (ex) { return (params.else) ? params.else : ''; }
	}
};