(function(PuertoRico) {

function setDefault(key, value) {
	PuertoRico[key] = PuertoRico[key] || value;
}

setDefault("INITIAL_VP", 100);
setDefault("INITIAL_COLONISTS", 100);

function Goods(other) {
	if(!other) {
		this.init();
		return;
	}
	var me = this;
	Goods.types.forEach(function(type) {
		me[type] = other[type];
	});
}

Goods.types = [];
Goods.names = {};

Goods.addGood = function(id, name) {
	Goods[id] = id;
	Goods.types.push(id);
	Goods.names[id] = name;
}

Goods.addGood("CORN", "corn");
Goods.addGood("INDIGO", "indigo");
Goods.addGood("SUGAR", "sugar");
Goods.addGood("TOBACCO", "tobacco");
Goods.addGood("COFFEE", "coffee");

Goods.prototype = {
	clone: function() {
		return new Goods(this);
	},
	init: function() {
		var me = this;
		Goods.types.forEach(function(type) {
			me[type] = 0;
		});
		return me;
	}
};

function Buildings(other) {
	if (!other) {
		this.init(0);
		return;
	}
	var me = this;
	Buildings.types.forEach(function(type) {
		me[type] = other[type];
	});
}

Buildings.types = [];
Buildings.names = {};
Buildings.addBuilding = function(id, name) {
	Buildings[id] = id;
	Buildings.names[id] = name;
	types.push(id);
	return Buildings;
}

Buildings.addBuilding("SMALL_INDIGO_PLANT", "Sm Indigo Plant");
Buildings.addBuilding("LARGE_INDIGO_PLANT", "Lg Indigo Plant");
Buildings.addBuilding("SMALL_MARKET", "Sm Market");
Buildings.addBuilding("LARGE_MARKET", "Lg Market");

Buildings.prototype = {
	clone: function() {
		return new Buildings(this);
	},
	init: function(num) {
		num = num || 0;
		var me = this;
		Buildings.types.forEach(function(type) {
			me[type] = num;
		});
		return me;
	},
	removeBuilding: function(id) {
		var me = this;
		if (!me[id]) {
			throw new Error("Do not have " + id);
		}
		me[id]--;
		return me;
	},
	addBuilding: function(id) {
		var me = this;
		me[id]++;
		return me;
	}
};

function Building(id, numSlots, filledSlots) {
	this.id = id;
	this.numSlots = numSlots;
	this.filledSlots = filledSlots || 0;
}

Building.prototype = {
	clone: function(other) {
		return new Building(other.id, other.numSlots, other.filledSlots);
	}
}

function Players(other) {
	if(!other) {
		this.init();
		return;
	}
	this.players = other.players.map(function(p) {
		return p.clone();
	});
	this.governor = other.governor;
}

Players.prototype = {
	clone: function() {
		return new Players(this);
	},
	init: function(players) {
		this.governor = 0;
		this.players = players.map(function(p) { return p; });
		return this;
	},
};

function Player(other) {
	if(!other) {
		this.init();
		return;
	}
}

Player.prototype = {
	clone: function() {
		return new Player(this);
	},
	init: function() {
		this.vp = 0;
		this.colonists = 0;
		this.buildings = new Buildings();
		return this;
	},
};



function State(other) {
	if(!other) {
		this.init();
		return;
	}
	this.buildings = other.buildings.clone();
	this.vp = other.vp;
	this.colonists = other.colonists;
	this.goods = other.goods.clone();
	this.colonistShip = other.colonistShip;
	this.players = other.players.clone();
}

State.prototype = {
	clone: function() {
		return new State(this);
	},
	init: function() {
		this.buildings = new Buildings();
		this.vp = PuertoRico.INITIAL_VP;
		this.colonists = PuertoRico.INITIAL_COLONISTS;
		this.goods = new Goods();
		this.players = new Players();
	}
};

})(window.PuertoRico = window.PuertoRico || {});
