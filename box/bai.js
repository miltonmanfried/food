function StateTree(root) {
	this.root = root;
	this.value = {};
	this.count = {};
	this.children = null;
}

StateTree.prototype.expand = function() {
	var options = this.root.getOptions();
	this.children = {};
	for (var i in options) {
		var k = options[i];
		var s = this.root.clone().applyOption(k);
		this.children[k] = new StateTree(s);
		this.value[k] = 0;
		this.count[k] = 0;
	}
}

StateTree.prototype.chooseChild = function() {
	var weights = {};
	var total = 0;
	var C = 1;
	for (var k in this.children) {
		if (this.count[k] == 0) {
			return k;
		}
		total += this.count[k];
		weights[k] = this.value[k]/this.count[k];
	}
	var logTotal = Math.log(total);
	for (var k in this.children) {
		weights[k] += C * Math.sqrt(logTotal / this.count[k]);
	}
	return softmax(weights);
};

function uniform(keys) {
	var idx = Math.floor(Math.random() * keys.length);
	return keys[idx];
}

function softmax(weights) {
	var exps = [];
	var sum = 0;
	var keys = [];
	for (var k in weights) {
		keys.push(k);
		var e = Math.exp(weights[k]);
		exps.push(e);
		sum += e;
	}
	var probs = exps.map(function(v) { return v / sum; });
	var val = Math.random();
	var c = 0;
	for (var i = 0; i < probs.length; i++) {
		c = c + probs[i];
		if (val <= c) {
			return keys[i];
		}
	}
	console.error(val, probs, weights);
	throw new Error("broken");
}

function MCTS(root) {
	this.expanded = [];
	this.root = new StateTree(root);
	this.maxDepth = 100;
	this.chunkSize = 100;
	this.maxTime = 500;
	this.target = 1;
}

MCTS.prototype.apply = function(action) {
	if (!this.root.children) {
		this.root.expand();
	}
	if (!(action in this.root.children)) {
		throw new Error("WTF:" + action);
	}
	this.root = this.root.children[action];
};

MCTS.prototype.doSimulationUntil = function(time) {
	var me = this;
	return new Promise(function(resolve, reject) {
		function tick() {
			if (new Date().getTime() >= time) return resolve(true);
			try {
				for (var i = 0; i < me.chunkSize; i++) {
					me.simulate(me.root, me.maxDepth);
				}
				setTimeout(tick, 10);
			} catch(e) {
				reject(e);
			}
		}
		tick();
	});
}

MCTS.prototype.selectOption = function() {
	var me = this;
	return me.doSimulationUntil(new Date().getTime() + me.maxTime).then(function() {
		var max, maxk;
		var values = {};
		var children = [];
		for (var k in me.root.children) {
			var child = me.root.children[k];
			children.push(k);
			if (me.root.count[k]) {
				var ratio = me.root.value[k] / me.root.count[k];
				values[k] = ratio;
				if (!max || ratio > max) {
					max = ratio;
					maxk = k;
				}
			} else {
				values[k] = -1;
			}
		}
		children.sort(function(a, b) {
			av = values[a];
			bv = values[b];
			if (av > bv) return 1;
			if (av < bv) return -1;
			return 0;
		});
		for (var i = 0; i < children.length; i++) {
			var k = children[i];
			console.log(k, me.root.value[k], me.root.count[k], values[k]);
		}

		return maxk;
	})
};

MCTS.prototype.simulate = function(state, maxDepth) {
	if (arguments.length == 1) maxDepth = 100;
	if (!maxDepth) return 0;
	if (!state.children) {
		state.expand();
		return this.rollout(state, maxDepth)
	}
	var nextOption = state.chooseChild();
	var nextState = state.children[nextOption];
	state.count[nextOption]++;
	var q = this.simulate(nextState, maxDepth - 1);
	state.value[nextOption] += q;
	return q;
};

MCTS.prototype.rollout = function(state, maxDepth) {
	if (arguments.length == 1) maxDepth = 100;
	var temp = state.root.clone();
	for (var i = 0; i < maxDepth; i++) {
		if (temp.isFinished()) {
			var score = temp.getScore();
			return Math.max(score[this.target] - score[1 - this.target], -1000);
			if (temp.getWinner() === this.target) {
				return 1;
			} else {
				return 0;
			}
		}
		var next = uniform(temp.getOptions());
		temp.applyOption(next);
	}
	console.error("OUT OF STEAM");
	return 0;
}

exports.MCTS = MCTS;
