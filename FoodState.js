function Tray() {
	this.map = {};
}

Tray.prototype = {
	init: function() {
		this.map[Waitress.ID] = 4;
		this.map[ManagementTrainee.ID] = 4;
		this.map[JuniorVicePresident.ID] = 4;
		this.map[NewBusinessDeveloper.ID] = 4;
		this.map[LuxuriesManager.ID] = 4;
		this.map[PricingManager.ID] = 4;
		this.map[RecruitingGirl.ID] = 4;
		this.map[Trainer.ID] = 4;
		this.map[ErrandBoy.ID] = 4
		this.map[MarketingTrainee.ID] = 4
		this.map[KitchenTrainee.ID] = 4;
		return this;
	},
	clone: function() {
		var ret = new Tray();
		util.cloneObject(this.map, ret.map);
		return ret;
	},
	take: function(id) {
		var map = this.map;
		if (!map[id]) throw new Error("No " + id + " left");
		map[id]--;
		return EmployeeCard.get(id);
	},
	put: function(id) {
		var map = this.map;
		map[id] = (map[id] || 0) + 1;
		return this;
	},
	count: function(id) {
		return this.map[id] || 0;
	}
};

function Bank(amt) {
	this.cash = amt;
}

Bank.prototype = {
	take: function(amt) {
		this.cash = Math.max(this.cash - amt, 0);
		return this;
	},
	put: function(amt) {
		this.cash = this.cash + amt;
	},
	clone: function() {
		return new Bank(this.cash);
	}
};

function Player() {
}

Player.count = 0;
Player.prototype = {};
Player.prototype.init = function() {
	this.id = Player.count++;
	this.restaurants = [];
	this.structure = [EmployeeCard.get(CEO.ID)];
	this.structureActions = [];
	this.beach = [ ];
	this.cash = 0;
	this.burgers = 0;
	this.pizza = 0;
	this.soda = 0;
	this.lemonade = 0;
	this.beer = 0;
	this.salaryDiscount = 0;
	return this;
};

Player.prototype.countTypeInStructure = function(id) {
	var count = 0;
	this.structure.forEach(function(card) {
		if (card.id == id) count++;
	});
	return count;
};

Player.prototype.countTypeAtBeach = function(id) {
	var count = 0;
	this.beach.forEach(function(card) {
		if (card.id == id) count++;
	});
	return count;
};

Player.prototype.canHire = function(id) {
	var isUnique = EmployeeCard.constructors[id].prototype.unique;
	if (!isUnique) return true;
	if (countTypeInStructure(id)) return false;
	if (countTypeAtBeach(id)) return false;
	return true;
}

Player.prototype.hire = function(id, tray) {
	var newCard = tray.take(id);
	this.beach.push(newCard);
	return this;
};

Player.prototype.train = function(card, newID, tray) {
	var uid = card.uid;
	var newCard = tray.take(newID);
	this.beach = this.beach.filter(function(beachCard) {
		return beachCard.uid != uid;
	});
	tray.put(card.id);
	return this;
};

Player.prototype.findCardInStructure = function(target) {
	var uid = target.uid;
	return this.structure.filter(function(card) {
		return card.uid == uid;
	})[0];
};

Player.prototype.findCardOnBeach = function(target) {
	var uid = target.uid;
	return this.beach.filter(function(card) {
		return card.uid == uid;
	})[0];
};

Player.prototype.getDiscount = function() {
	var total = 0;
	this.structure.forEach(function(card) {
		if (card.discount) {
			total += discount;
		}
	});
	return total;
};

Player.prototype.numWaitresses = function() {
	var ret = 0;
	this.structure.forEach(function(card) {
		if(card.id == Waitress.ID) {
			ret++;
		}
	});
	return ret;
};

Player.prototype.numSlots = function() {
	var ret = 0;
	this.structure.forEach(function(card) {
		ret += (card.slots + 1);
	});
	return ret;
};

Player.prototype.clone = function() {
	var ret = new Player();
	ret.id = this.id;
	ret.restaurants = this.restaurants.clone();
	ret.structure = this.structure.clone();
	ret.beach = this.beach.clone();
	ret.cash = this.cash;
	ret.burgers = this.burgers;
	ret.pizza = this.pizza;
	ret.soda = this.soda;
	ret.beer = this.beer;
	ret.lemonade = this.lemonade;
	ret.salaryDiscount = this.salaryDiscount;
	return this;
};

function State() {
}

State.prototype.newGame = function(numPlayers) {
	this.players = [];
	for(var i = 0; i < numPlayers; i++) {
		this.players[i] = new Player().init();
	}
	this.turnOrder = [];
	for(var i = 0; i < numPlayers; i++) {
		this.turnOrder[i] = i;
	}
	this.turnIndex = 0;
	this.phase = 0;
	this.bank = new Bank(50);
	this.tray = new Tray().init();
	this.board = randomBoard();
	return this;
};

State.prototype.getActivePlayer = function() {
	return this.players[this.turnOrder[this.turnIndex]];
};

State.prototype.clone = function() {
	var ret = new State();
	ret.players = this.players.clone();
	ret.turnOrder = this.turnOrder.clone();
	ret.turnIndex = this.turnIndex;
	ret.bank = this.bank.clone();
	ret.tray = this.tray.clone();
	ret.phase = this.phase;
	ret.board = this.board.clone();
	return ret;
};

State.prototype.nextPhase = function() {
	this.turnIndex = 0;
	this.phase = (this.phase + 1) % 2; // % 6
	return this.startPhase(this.phase);
};

State.prototype.startPhase = function(phase) {
	var state = this;
	switch(phase) {
	case 0:
		this.turnIndex = 0;
		// back from structure to beach
		this.players.map(function(player) {
			player.salaryDiscount = 0;
			player.structure = player.structure.filter(function(card) {
				if (card.id != CEO.ID) {
console.debug("removing ", card.uid, " from structure");
					player.beach.push(card);
					return false;
				} else {
					return true;
				}
console.debug("keeping ", card.uid, " in structure");
			});
			console.debug("player structure = ", player.structure.join(","));
		});
		break;
	case 1:
		this.players.map(function(player) {
			player.structure.map(function(card) {
				card.reset();
				var automaticActions = card.getAutomaticActions();
				util.mapObject(automaticActions, function(action, name) {
					console.debug("Automatic action from " + card.uid + ":", name);
					state = action(state);
				});
			});
		});
		break;
	}
	return state;
};

State.prototype.nextPlayerOrPhase = function() {
	var i = ++this.turnIndex;
	if (i >= this.players.length) {
		return this.nextPhase();
	}
	return this;
}

State.prototype.phaseI = function() {
	var actions = {};
	var state = this;
	console.debug("state=", state);
	var activePlayer = state.getActivePlayer();
	if (activePlayer.structure.length < activePlayer.numSlots()) {
		activePlayer.beach.map(function(card, i) {
			actions["utilize_" + card.uid] = function() {
				var s = state.clone();
				var sap = s.getActivePlayer();
				sap.beach.splice(i, 1);
				sap.structure.push(card);
				return s;
			};
		});
	}
	actions.done = function() {
		return state.clone().nextPlayerOrPhase();
	};
	return actions;
};

State.prototype.phaseII = function() {
	var actions = {};
	var state = this;
	var activePlayer = state.getActivePlayer();
	var numActions = 0;
	activePlayer.structure.map(function(card, i) {
console.debug("Getting actions for ", card.uid);		
		util.mapObject(card.getActions(state), function(action, name) {
			numActions++;
			actions[name] = action;
		});
console.debug("numActions=", numActions);
	});
	if (numActions == 0) {
		actions.finishTurn = function() {
			return state.clone().nextPlayerOrPhase();
		};
	}
	return actions;
};


State.prototype.phases = {
	"1": State.prototype.phaseI,
	"2": State.prototype.phaseII
};

State.prototype.run = function() {
	var state = this;
	return new Promise(function(resolve, reject) {
		var actions = state.phases[state.phase + 1].apply(state);
		chooseAction(actions).then(function(action) {
console.debug("Executing action", action);
			resolve(action());
		})["catch"](function(err) {
console.error("RUN FAILED:", err);
			reject(err);
		});
	});
};

function chooseAction(actions) {
	console.info("CHOOSE AN ACTION");
	var i = 0;
	var array = [];
	for(var k in actions) {
		array[i++] = k;
		console.info(i, k, actions[k]);
	}
	return new Promise(function(resolve, reject) {
		if (window.CHOICES && window.CHOICES.length > 0) {
			var choice = window.CHOICES.shift();
			console.debug("Using window.CHOICES:", choice);
			if (!actions[choice]) {
				console.error("BAD CHOICE", choice);
				return;
			}
			return resolve(actions[choice]);
		}
		window.CHOOSE = function(ret) {
			if (Object(ret) instanceof Number) {
				ret = array[ret - 1];
			}
			
			var action = actions[ret];

			if (!action) {
				console.error("BAD ACTION", ret);
				return;
			}
			console.info("Chose:", ret, action);
			resolve(action);
			console.info("resolved");
		};
		window.FAIL = reject;
	});
}

function play() {
	state = state.run();
}
