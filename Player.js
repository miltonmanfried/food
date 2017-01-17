function Player() {
	this.cash = 0;
	this.beach = [];
	this.structure = [];
}

Player.prototype = {
	takeCard: function(id) {
		this.beach.push(EmployeeCard.get(id));
	},
	phase: function(i) {
		switch(i) {
		case 0:
			this.waitressCount = 0;
			this.cards.map(function(v) {
				v.used = false;
			});
			this.structure.map(function(v) {
				v.used = false;
			});
		}
	}
};