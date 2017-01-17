(function(util) {

function $(id) { return document.getElementById(id); }

function toArray(list) {
	var ret = [];
	for (var i = 0; i < list.length; i++) {
		ret[i] = list[i];
	}
	return ret;
}

function cloneObject(object, dest) {
	dest = dest || {};
	for (var k in object) {
		var v = object[k];
		if (Object(Object(v).clone) instanceof Function) {
			v = v.clone();
		}
		dest[k] = v;
	}
	return dest;
}

function setSize(set) {
	var ret = 0;
	for (var k in set) {
		if (set.hasOwnProperty(k)) ret++;
	}
	return ret;
}

function mapObject(object, func) {
	var ret = {};
	for (var k in object) {
		if (!object.hasOwnProperty(k)) continue;
		var v = object[k];
		ret[k] = func(v, k, object);
	}
	return ret;
}

Array.prototype.pushall = function(array) {
	for(var i = 0; i < array.length; i++) {
		this.push(array[i]);
	}
	return this;
}

Array.prototype.multimap = function(func) {
	var ret = [];
	for(var i = 0; i < this.length; i++) {
		var v = func(v, i, this);
		if (Object(v) instanceof Array) {
			ret.pushall(v);
		} else {
			ret.push(v);
		}
	}
	return ret;
};

Array.prototype.clone = function() {
    var ret = [];
    for(var i = 0; i < this.length; i++) {
        var v = this[i];
        if(Object(Object(v).clone) instanceof Function) {
            v = v.clone();
        }
        ret[i] = v;
    }
    return ret;
};

function prepend(choice, array) {
    var ret = [choice];
    for(var i=0;i<array.length;i++) {
        ret[i+1] = array[i];
    }
    return ret;
}

function Map(copy) {
    this.keys = {};
    this.values = {}
    if(copy) {
        for (var k in copy.keys) {
			this.keys[k] = copy.keys[k];
			this.values[k] = copy.values[k];
		}
    }
}

Map.prototype = {
    put: function(key, value) {
		var hash = key.hash();
        this.keys[hash] = key;
        this.values[hash] = value;
        return this;
    },
    remove: function(key) {
        var hash = key.hash();
        delete this.keys[hash];
        delete this.values[hash];
    },
    get: function(key) {
        return this.values[key.hash()];
    },
    pairs: function(callback) {
		var me = this;
		for(var hash in me.keys) {
			var key = me.keys[hash];
			var value = me.values[hash];
			callback.call(this, key, value);
		}
		return this;
    },
    contains: function(key) {
		var hash = key.hash();
		return hash in this.keys;
    },
    containsAll: function(array) {
		for (var i = 0; i < array.length; i++) {
			var v = array[i];
			var hash = v.hash();
			if (!(hash in this.keys)) {
				return false
			}
		}
		return true;
    },
    forMatches: function(array, func) {
		for (var i = 0; i < array.length; i++) {
			var v = array[i];
			var hash = v.hash();
			if ((hash in this.keys)) {
				var key = this.keys[hash];
				var value = this.values[hash];
				func.call(this, key, value);
			}
		}
		return this;
    },
    size: function() {
		var ret = 0;
		for (var hash in this.keys) {
			ret++;
		}
		return ret;
    },
    increment: function(key) {
		var hash = key.hash();
		this.keys[hash] = key;
		this.values[hash] = (this.values[hash] || 0) + 1;
		return this;
    }
};


function $(id) {
    return document.getElementById(id);
}

function log() {
    var args = [];
    for(var i=0; i< arguments.length; i++) {
        args[i] = arguments[i] + "";
    }
    $("msg").innerHTML += args.join(", ") + "<br/>";
}
function clearLog() { $("msg").innerHTML = ""; }

function setToList(set) {
	var list = [];
	for (var k in set) {
		if (!set.hasOwnProperty(k)) continue;
		list.push(k);
	}
	return list;
}

function listToSet(list) {
	var set = {};
	for (var i = 0; i < list.length; i++) {
		set[list[i]] = true;
	}
	return set;
}

util.log = log;
util.$ = $;
util.clearLog = clearLog;
util.Map = Map;
util.prepend = prepend;
util.cloneObject = cloneObject;
util.mapObject = mapObject;
util.setSize = setSize;
util.setToList = setToList;
util.listToSet = listToSet;
util.toArray = toArray;
})(window.util = window.util || {});
