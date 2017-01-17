var util = window.util;

function EmployeeCard(constructor) {
	this.id = constructor.ID;
	this.uidCounter = 0;
	this.constructor = constructor;
	constructor.prototype.id = constructor.ID;
	EmployeeCard.constructors[this.id] = constructor;
}

EmployeeCard.constructors = {};
EmployeeCard.get = function(id) {
	return (new EmployeeCard.constructors[id]).init();
};

EmployeeCard.prototype.init = function() {
	console.debug("EmployeeCard.init: this=", this, "this.constructor=", this.constructor);
	this.uid = this.id + "_" + this.constructor.prototype.uidCounter++;
	return this;
};

EmployeeCard.prototype.clone = function() {
	var ret = new this.constructor();
	ret.uid = this.uid;
	return this;
};

function CEO() {
}
CEO.ID = "ceo";

function Waitress() {
}
Waitress.ID = "waitress";


CEO.prototype = new EmployeeCard(CEO);
CEO.prototype.slots = 3;
//CEO.prototype.constructor = CEO;

Waitress.prototype = new EmployeeCard(Waitress);
//Waitress.prototype.constructor = Waitress;

Waitress.prototype.getActions = function(state) {
	return {
		"takeThreeDollars": function() {
			var s = state.clone();
			s.getActivePlayer().cash += 3;
			return s;
		}
	}
};

