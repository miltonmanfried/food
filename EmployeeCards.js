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

EmployeeCard.prototype.reset = function() {
	this.used = false;
};

EmployeeCard.prototype.clone = function() {
	var ret = new this.constructor();
	ret.uid = this.uid;
	ret.used = this.used;
	return this;
};

EmployeeCard.prototype.getActions = function() {
	console.debug("DEFAULT getActions FOR ", this.uid);
	return {};
}
EmployeeCard.prototype.getAutomaticActions = function() { return {}; }
EmployeeCard.prototype.toString = function() {
	return this.uid;
};

EmployeeCard.prototype.promotions = [];
EmployeeCard.prototype.slots = -1;
EmployeeCard.prototype.discount = 0;

function BrandDirector() { }
BrandDirector.ID = "brandDirector";

function BrandManager() { }
BrandManager.ID = "brandManager";

function BurgerChef() { }
BurgerChef.ID = "burgerChef";

function BurgerCook() { }
BurgerCook.ID = "burgerCook";

function CampaignManager() { }
CampaignManager.ID = "campaignManager";

function CartOperator() { }
CartOperator.ID = "cartOperator";

function CEO() { }
CEO.ID = "ceo";

function CFO() { }
CFO.ID = "cfo";

function Coach() { }
Coach.ID = "coach";

function DiscountManager() { }
DiscountManager.ID = "discountManager";

function ErrandBoy() { }
ErrandBoy.ID = "errandBoy";

function ExecutiveVicePresident() { }
ExecutiveVicePresident.ID = "executiveVicePresident";

function Guru() { }
Guru.ID = "guru";

function HRDirector() { }
HRDirector.ID = "hrDirectory";

function JuniorVicePresident() { }
JuniorVicePresident.ID = "juniorVicePresident";

function KitchenTrainee() { }
KitchenTrainee.ID = "kitchenTrainee";

function LocalManager() { }
LocalManager.ID = "localManager";

function LuxuriesManager() { }
LuxuriesManager.ID = "luxuriesManager";

function MarketingTrainee() { }
MarketingTrainee.ID = "marketingTrainee";

function ManagementTrainee() { }
ManagementTrainee.ID = "mgmtTrainee"

function NewBusinessDeveloper() { }
NewBusinessDeveloper.ID = "newBusinessDeveloper";

function PizzaChef() { }
PizzaChef.ID = "pizzaChef";

function PizzaCook() { }
PizzaCook.ID = "pizzaCook";

function PricingManager() { }
PricingManager.ID = "pricingManager";

function RecruitingGirl() { }
RecruitingGirl.ID = "recruitingGirl";

function RecruitingManager() { }
RecruitingManager.ID = "recruitingManager";

function RegionalManager() { }
RegionalManager.ID = "regionalManager";

function SeniorVicePresident() { }
SeniorVicePresident.ID = "seniorVicePresident";

function Trainer() { }
Trainer.ID = "trainer";

function TruckDriver() { }
TruckDriver.ID = "truckDriver";

function VicePresident() { }
VicePresident.ID = "vicePresident";

function Waitress() { }
Waitress.ID = "waitress";

function ZeppelinPilot() { }
ZeppelinPilot.ID = "zeppelinPilot";

/********************************************************
 * Utility functions ************************************
 ********************************************************/

function getTrainActions(state, card) {
	var player = state.getActivePlayer();
	var beach = player.beach;
	var actions = {};
	// any card on the beach may be trained
	beach.map(function(card) {
		var id = card.id;
		var uid = card.uid;
		// find only those promotion-IDs where the tray contains at least 1 instance
		card.promotions.filter(function(id) {
			return state.tray.count(id) > 0;
		}).forEach(function(newID) {
			// Note: training the same card has the same action name regardless of who is doing the training (lower branching factor?)
			if (player.canHire(newID)) {
				actions["beachTrain_" + uid + "_to_" + newID] = function() {
					var s = state.clone();
					var sap = s.getActivePlayer();
					sap.train(card, newID, s.tray);
					var newCard = sap.findCardInStructure(card);
					newCard.trainCount = (newCard.trainCount || 0) + 1;
					return s;
				};
			}
		});
	});
	// Recruit + train handled by recruiter
	return actions;
}

function getTwoFoldTrainActions(state, trainerCard) {
	var player = state.getActivePlayer();
	var beach = player.beach;
	var actions = {};
	// TODO: only add actions where an intermediate is actually missing
	beach.map(function(card) {
		var id = card.id;
		var uid = card.uid;
		card.promotions.forEach(function(intermediateID) {
			var intermediateType = EmployeeCard.constructors[intermediateID];
			intermediateType.prototype.promotions.forEach(function(id2) {
				if (state.tray.count(id2) < 1) return;
				if (!player.canHire(id2)) return;
				actions["beachTrain_" + uid + "_to_" + id2] = function() {
					var s = state.clone();
					var sap = s.getActivePlayer();
					sap.train(card, id2, s.tray);
					var newCard = sap.findCardInStructure(trainerCard);
					newCard.trainCount = (newCard.trainCount || 0) + 2;
					return s;
				};
			});
		});
	});
	return actions;
}

function getThreeFoldTrainActions(state, trainerCard) {
	var player = state.getActivePlayer();
	var beach = player.beach;
	var actions = {};
	// TODO: only add actions where an intermediate is actually missing
	beach.map(function(card) {
		var id = card.id;
		var uid = card.uid;
		card.promotions.forEach(function(intermediateID) {
			var intermediateType = EmployeeCard.constructors[intermediateID];
			intermediateType.prototype.promotions.forEach(function(id2) {
				EmployeeCard.constructors[id2].promotions.forEach(function(id3) {
					if (state.tray.count(id3) < 1) return;
					if (!player.canHire(id3)) return;
					actions["beachTrain_" + uid + "_to_" + id3] = function() {
						var s = state.clone();
						var sap = s.getActivePlayer();
						sap.train(card, id3, s.tray);
						var newCard = sap.findCardInStructure(trainerCard);
						newCard.trainCount = (newCard.trainCount || 0) + 3;
						return s;
					};
				});
			});
		});
	});
	return actions;
}

function getSalaryDiscountAction(state, discount, card) {
	return function() {
		var s = state.clone();
		var sap = s.getActivePlayer();
		sap.salaryDiscount += discount;
		var newCard = sap.findCardInStructure(card);
		newCard.hireCount = (newCard.hireCount || 0) + 1;
		return s;
	};
}

function getHireActions(state, card) {
	var player = state.getActivePlayer();
	var actions = {};
	var entryLevel = [Waitress.ID, ManagementTrainee.ID, PricingManager.ID, RecruitingGirl.ID, Trainer.ID, ErrandBoy.ID, MarketingTrainee.ID, KitchenTrainee.ID];
	// any card on the beach may be trained
	entryLevel.filter(function(id) {
		return state.tray.count(id) > 0;
	}).map(function(id) {
		actions["hire_" + id] = function() {
			var s = state.clone();
			var sap = s.getActivePlayer();
			sap.hire(id, s.tray);
			var newCard = sap.findCardInStructure(card);
			newCard.hireCount = (newCard.hireCount || 0) + 1;
			return s;
		};
	});
	var trainers = player.structure.filter(function(card) {
		return card.maxTrain && card.trainCount < card.maxTrain;
	});
	// TODO: only add actions where an intermediate is actually missing
	trainers.forEach(function(trainer) {
		var canHire = entryLevel.clone();
		var numTrains = trainer.maxTrain - trainer.trainCount;
		for (var i = 0; i < numTrains; i++) {
			var temp = [];
			canHire.forEach(function(id) {
				temp.pushall(EmployeeCard.constructors[id].prototype.promotions);
			});
			canHire = temp;
			canHire.forEach(function(id) {
				if (state.tray.count(id) < 1) return;
				if (!player.canHire(id)) return;
				actions["hire_and_train" + id] = function() {
					var s = state.clone();
					var sap = state.getActivePlayer();
					sap.hire(id, s.tray);
					sap.findCardInStructure(trainer).trainCount += i;
					var newCard = sap.findCardInStructure(card);
					newCard.hireCount = (newCard.hireCount || 0) + 1;
					return s;
				};
			});
		}
	});
	return actions;
}

function getFoodAction(type, count, card, state) {
	return function() {
		var s = state.clone();
		var sap = s.getActivePlayer();
		sap[type] = (sap[type] || 0) + 8;
		sap.findCardInStructure(card).used = true;
		return s;
	};
}

/********************************************************
 * Prototype implementation *****************************
 ********************************************************/

BrandDirector.prototype = new EmployeeCard(BrandDirector);
BrandDirector.prototype.unique = true;
BrandDirector.prototype.salary = 5;
BrandDirector.prototype.getActions = function(state) {
	// TODO HACK FIXME IMPLEMENT
	if (this.used) return {};
	var card = this;
	return {
		placeCampaign: function() { 
			// Place radio or lower with max duration 5
			var s = state.clone();
			var sap = s.getActivePlayer();
			sap.findCardInStructure(card).used = true;
			return s;
		} 
	};
};

BrandManager.prototype = new EmployeeCard(BrandManager);
BrandManager.prototype.promotions = [ BrandDirector.ID ];
BrandManager.prototype.salary = 5;
BrandManager.prototype.getActions = function(state) {
	// TODO HACK FIXME IMPLEMENT
	if (this.used) return {};
	var card = this;
	return {
		placeCampaign: function() { 
			// Place airplane or lower with max duration 4
			var s = state.clone();
			var sap = s.getActivePlayer();
			sap.findCardInStructure(card).used = true;
			return s;
		} 
	};
};

BurgerChef.prototype = new EmployeeCard(BurgerChef);
BurgerChef.prototype.unique = true;
BurgerChef.prototype.salary = 5;
BurgerChef.prototype.getActions = function(state) {
	if (this.used) return {};
	var card = this;
	return {
		get8Burgers: getFoodAction("burgers", 8, card, state)
	};
};

BurgerCook.prototype = new EmployeeCard(BurgerCook);
BurgerCook.prototype.promotions = [ BurgerChef.ID ];
BurgerCook.prototype.salary = 5;
BurgerCook.prototype.getActions = function(state) {
	if (this.used) return {};
	var card = this;
	return {
		get3Burgers: getFoodAction("burgers", 3, card, state)
	};
};

CampaignManager.prototype = new EmployeeCard(CampaignManager);
CampaignManager.prototype.promotions = [ BrandManager.ID ];
CampaignManager.prototype.range = 3;
CampaignManager.prototype.salary = 5;
CampaignManager.prototype.getActions = function(state) {
	// TODO HACK FIXME IMPLEMENT
	if (this.used) return {};
	var card = this;
	return {
		placeCampaign: function() { 
			// Place mailbox or lower with max duration 3
			var s = state.clone();
			var sap = s.getActivePlayer();
			sap.findCardInStructure(card).used = true;
			return s;
		} 
	};
};


CartOperator.prototype = new EmployeeCard(CartOperator);
CartOperator.prototype.salary = 5;
CartOperator.prototype.range = 2;
CartOperator.prototype.promotions = [ TruckDriver.ID ];
CartOperator.prototype.getAutomaticActions = function(state) {
	var card = this;
	return {
		getDrinksOnRoute: function() {
			var s = state.clone();
			var sap = s.getActivePlayer();
			var numDrinksOnRoute = {
				soda: 2,
				lemonade: 2,
				beer: 2
			}; // TODO HACK FIXME
			for (var type in numDrinksOnRoute) {
				var num = numDrinksOnRoute[type];
				sap[type] = (sap[type] || 0) + 2 * num;
			}
			return s;
		}
	};
};

CEO.prototype = new EmployeeCard(CEO);
CEO.prototype.slots = 3;
CEO.prototype.maxHires = 1;
CEO.prototype.reset = function() { 
	this.numHires = 0;
};
CEO.prototype.clone = function() {
	var ret = EmployeeCard.prototype.clone.apply(this);
	ret.numHires = this.numHires;
	return ret;
};

CEO.prototype.getActions = function(state) {
	var hiresLeft = this.maxHires - this.numHires;
	if (this.hiresLeft < 1) return {};
	var card = this;
	return getHireActions(state, card);
};

CFO.prototype = new EmployeeCard(CFO);
CFO.prototype.unique = true;
CFO.prototype.salary = 5;

Coach.prototype = new EmployeeCard(Coach);
Coach.prototype.maxTrain = 2;
Coach.prototype.salary = 5;

Coach.prototype.reset = function() {
	this.trainCount = 0;
};

Coach.prototype.clone = function() {
	var ret = EmployeeCard.prototype.clone.apply(this);
	ret.trainCount = this.trainCount;
	return ret;
};

Coach.prototype.getActions = function(state) {
	var trainLeft = (this.maxTrain - this.trainCount);
	if (trainLeft < 1) return {};
	var trainerCard = this;
	var ret = getTrainActions(state, trainerCard);
	if (trainLeft >= 2) {
		var doubleTrain = getTwoFoldTrainActions(state);
		util.mapObject(doubleTrain, function(v, k) {
			ret[k] = v;
		});
	}
	return ret;
};

DiscountManager.prototype = new EmployeeCard(DiscountManager);
DiscountManager.prototype.salary = 5;
DiscountManager.prototype.discount = -3;

ErrandBoy.prototype = new EmployeeCard(ErrandBoy);
ErrandBoy.prototype.promotions = [ CartOperator.ID ];
ErrandBoy.prototype.getActions = function(state) {
	if (this.used) return {};
	var card = this;
	return {
		getBeer: getFoodAction("beer", 1, card, state),
		getLemonade: getFoodAction("lemonade", 1, card, state),
		getSoda: getFoodAction("soda", 1, card, state)
	};
};

ExecutiveVicePresident.prototype = new EmployeeCard(ExecutiveVicePresident);
ExecutiveVicePresident.prototype.slots = 6;
ExecutiveVicePresident.prototype.salary = 5;
ExecutiveVicePresident.prototype.unique = true;

Guru.prototype = new EmployeeCard(Guru);
Guru.prototype.maxTrain = 3;
Guru.prototype.unique = true;
Guru.prototype.salary = 5;

Guru.prototype.clone = function() {
	var ret = EmployeeCard.prototype.clone.apply(this);
	ret.trainCount = this.trainCount;
	return ret;
};

Guru.prototype.getActions = function(state) {
	var trainLeft = (this.maxTrain - this.trainCount);
	if (trainLeft < 1) return {};
	var trainerCard = this;
	var ret = getTrainActions(state, trainerCard);
	if (trainLeft >= 2) {
		var doubleTrain = getTwoFoldTrainActions(state);
		util.mapObject(doubleTrain, function(v, k) {
			ret[k] = v;
		});
	}
	if (trainLeft >= 3) {
		var tripleTrain = getThreeFoldTrainActions(state);
		util.mapObject(tripleTrain, function(v, k) {
			ret[k] = v;
		});
	}
	return ret;
};

HRDirector.prototype = new EmployeeCard(HRDirector);
HRDirector.prototype.maxHires = 4;
HRDirector.prototype.unique = true;
HRDirector.prototype.salary = 5;
HRDirector.prototype.reset = function() { 
	this.numHires = 0;
};
HRDirector.prototype.clone = function() {
	var ret = EmployeeCard.prototype.clone.apply(this);
	ret.numHires = this.numHires;
	return ret;
};

HRDirector.prototype.getActions = function(state) {
	var hiresLeft = this.maxHires - this.numHires;
	if (this.hiresLeft < 1) return {};
	var card = this;
	var hireActions = getHireActions(state, card);
	hireActions.getSalaryDiscount = getSalaryDiscountAction(state, card, 5);
	return hireActions;
};

JuniorVicePresident.prototype = new EmployeeCard(JuniorVicePresident);
JuniorVicePresident.prototype.slots = 3;
JuniorVicePresident.prototype.salary = 5;
JuniorVicePresident.prototype.promotions = [ LocalManager.ID, VicePresident.ID, DiscountManager.ID, RecruitingManager.ID, Coach.ID ];

KitchenTrainee.prototype = new EmployeeCard(KitchenTrainee);
KitchenTrainee.prototype.promotions = [ BurgerCook.ID, PizzaCook.ID ];
KitchenTrainee.prototype.getActions = function(state) {
	if (this.used) return {};
	var card = this;
	return {
		getBurger: getFoodAction("burgers", 1, card, state),
		getPizza: getFoodAction("pizza", 1, card, state)
	};
};

LocalManager.prototype = new EmployeeCard(LocalManager);
LocalManager.prototype.salary = 5;
LocalManager.prototype.range = 3;
LocalManager.prototype.getActions = function(state) {
	if (this.used) return {};
	var card = this;
	// TODO DEBUG HACK FIXME IMPLEMENT
	return {
		placeOpenSoonRestaurant: function() {
			var s = state.clone();
			var sap = s.getActivePlayer();
			var newCard = sap.findCardInStructure(card);
			newCard.used = true;
			return s;
		}
	};
};

LuxuriesManager.prototype = new EmployeeCard(LuxuriesManager);
LuxuriesManager.prototype.salary = 5;
LuxuriesManager.prototype.discount = 10;

ManagementTrainee.prototype = new EmployeeCard(ManagementTrainee);
ManagementTrainee.prototype.slots = 2;
ManagementTrainee.prototype.salary = 5;
ManagementTrainee.prototype.promotions = [JuniorVicePresident.ID, NewBusinessDeveloper.ID, LuxuriesManager.ID];

MarketingTrainee.prototype = new EmployeeCard(MarketingTrainee);
MarketingTrainee.prototype.promotions = [ CampaignManager.ID ];
MarketingTrainee.prototype.range = 2;
MarketingTrainee.prototype.getActions = function(state) {
	// TODO HACK FIXME IMPLEMENT
	if (this.used) return {};
	var card = this;
	return {
		placeBillboard: function() { 
			var s = state.clone();
			var sap = s.getActivePlayer();
			sap.findCardInStructure(card).used = true;
			return s;
		} 
	};
};

NewBusinessDeveloper.prototype = new EmployeeCard(NewBusinessDeveloper);
NewBusinessDeveloper.salary = 5;
NewBusinessDeveloper.getActions = function(state) {
	// TODO HACK FIXME IMPLEMENT
	if (this.used) return {};
	var card = this;
	return {
		placeHouse: function() { 
			var s = state.clone();
			var sap = s.getActivePlayer();
			sap.findCardInStructure(card).used = true;
			return s;
		},
		placeGarden: function() { 
			var s = state.clone();
			var sap = s.getActivePlayer();
			sap.findCardInStructure(card).used = true;
			return s;
		} 
	};
};

PizzaChef.prototype = new EmployeeCard(PizzaChef);
PizzaChef.prototype.unique = true;
PizzaChef.prototype.salary = 5;
PizzaChef.prototype.getActions = function(state) {
	if (this.used) return {};
	var card = this;
	return {
		get8Pizzas: getFoodAction("pizza", 8, card, state)
	};
};

PizzaCook.prototype = new EmployeeCard(PizzaCook);
PizzaCook.prototype.promotions = [PizzaChef.ID];
PizzaCook.prototype.salary = 5;
PizzaCook.prototype.getActions = function(state) {
	if (this,used) return {};
	var card = this;
	return {
		get3Pizzas: getFoodAction("pizza", 3, card, state)
	};
};

PricingManager.prototype = new EmployeeCard(PricingManager);
PricingManager.prototype.discount = -1;

RecruitingGirl.prototype = new EmployeeCard(RecruitingGirl);
RecruitingGirl.prototype.maxHires = 1;
RecruitingGirl.prototype.reset = function() { 
	this.numHires = 0;
};
RecruitingGirl.prototype.clone = function() {
	var ret = EmployeeCard.prototype.clone.apply(this);
	ret.numHires = this.numHires;
	return ret;
};

RecruitingGirl.prototype.getActions = function(state) {
	var hiresLeft = this.maxHires - this.numHires;
	if (this.hiresLeft < 1) return {};
	var card = this;
	return getHireActions(state, card);
};

RecruitingManager.prototype = new EmployeeCard(RecruitingManager);
RecruitingManager.prototype.maxHires = 2;
RecruitingManager.prototype.salary = 5;
RecruitingManager.prototype.reset = function() { 
	this.numHires = 0;
};
RecruitingManager.prototype.clone = function() {
	var ret = EmployeeCard.prototype.clone.apply(this);
	ret.numHires = this.numHires;
	return ret;
};

RecruitingManager.prototype.getActions = function(state) {
	var hiresLeft = this.maxHires - this.numHires;
	if (this.hiresLeft < 1) return {};
	var card = this;
	var hireActions = getHireActions(state, card);
	hireActions.getSalaryDiscount = getSalaryDiscountAction(state, card, 5);
	return hireActions;
};

RegionalManager.prototype = new EmployeeCard(RegionalManager);
RegionalManager.prototype.salary = 5;
RegionalManager.prototype.unique = true;
RegionalManager.prototype.getActions = function(state) {
	if (this.used) return {};
	var card = this;
	// TODO DEBUG HACK FIXME IMPLEMENT
	return {
		placeNewRestaurant: function() {
			var s = state.clone();
			var sap = s.getActivePlayer();
			var newCard = sap.findCardInStructure(card);
			newCard.used = true;
			return s;
		}
	};
};

SeniorVicePresident.prototype = new EmployeeCard(SeniorVicePresident);
SeniorVicePresident.prototype.slots = 5;
SeniorVicePresident.prototype.salary = 5;
SeniorVicePresident.prototype.promotions = [ CFO.ID, ExecutiveVicePresident.ID, HRDirector.ID ];

Trainer.prototype = new EmployeeCard(Trainer);
Trainer.prototype.reset = function() {
	this.trainCount = 0;
};
Trainer.prototype.clone = function() {
	var ret = EmployeeCard.prototype.clone.apply(this);
	ret.trainCount = this.trainCount;
	return ret;
};
Trainer.prototype.maxTrain = 1;

Trainer.prototype.getActions = function(state) {
	var trainLeft = (this.maxTrain - this.trainCount);
	if (trainLeft < 1) return {};
	var trainerCard = this;
	return getTrainActions(state, trainerCard);
};

TruckDriver.prototype = new EmployeeCard(TruckDriver);
TruckDriver.prototype.salary = 5;
TruckDriver.prototype.range = 3;
TruckDriver.prototype.promotions = [ ZeppelinPilot.ID ];
TruckDriver.prototype.getAutomaticActions = function(state) {
	var card = this;
	return {
		getDrinksOnRoute: function() {
			var s = state.clone();
			var sap = s.getActivePlayer();
			var numDrinksOnRoute = {
				soda: 2,
				lemonade: 2,
				beer: 2
			}; // TODO HACK FIXME
			for (var type in numDrinksOnRoute) {
				var num = numDrinksOnRoute[type];
				sap[type] = (sap[type] || 0) + 3 * num;
			}
			return s;
		}
	};
};

VicePresident.prototype = new EmployeeCard(VicePresident);
VicePresident.prototype.slots = 4;
VicePresident.prototype.salary = 5;
VicePresident.prototype.promotions = [ SeniorVicePresident.ID, RegionalManager.ID, Guru.ID ];

Waitress.prototype = new EmployeeCard(Waitress);
Waitress.prototype.getAutomaticActions = function() {
	return {
		takeThreeDollars: function(state) {
			var s = state.clone();
			var sap = s.getActivePlayer();
			sap.cash += 3;
			return s;
		}
	}
};

ZeppelinPilot.prototype = new EmployeeCard(ZeppelinPilot);
ZeppelinPilot.prototype.salary = 5;
ZeppelinPilot.prototype.range = 4;
ZeppelinPilot.prototype.flies = true;
ZeppelinPilot.prototype.unique = true;
ZeppelinPilot.prototype.getActions = function(state) {
	if (this.used) return {};
	var card = this;
	return {
		getDrinksOnRoute: function() {
			var s = state.clone();
			var sap = s.getActivePlayer();
			var numDrinksOnRoute = {
				soda: 2,
				lemonade: 2,
				beer: 2
			}; // TODO HACK FIXME
			for (var type in numDrinksOnRoute) {
				var num = numDrinksOnRoute[type];
				sap[type] = (sap[type] || 0) + 2 * num;
			}
			sap.findCardInStructure(card).used = true;
			return s;
		}
	};
};
