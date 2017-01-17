(function(util) {
var TYPE_EMPTY = 0;
var TYPE_ROAD = 1;
var TYPE_HOUSE = 2;
var TYPE_BEER = 3;
var TYPE_SODA = 4;
var TYPE_LEMONADE = 5;
var TYPE_RESTAURANT = 6;

var RESTAURANT_IMAGES = [
	"restaurant-0.png",
	"restaurant-1.png",
	"restaurant-2.png",
	"restaurant-3.png",
];

var ROAD_IMAGE = {
	NS: "road-ns.png",
	EW: "road-ew.png",
	NE: "road-ne.png",
	SE: "road-se.png",
	SW: "road-sw.png",
	NW: "road-nw.png",
	ESW: "road-esw.png",
	NSW: "road-nsw.png",
	ENW: "road-enw.png",
	ENS: "road-ens.png",
	ENSW: "road-ensw.png"
};

var ROTATED_IMAGE = {};
ROTATED_IMAGE[ROAD_IMAGE.NS] = ROAD_IMAGE.EW;
ROTATED_IMAGE[ROAD_IMAGE.EW] = ROAD_IMAGE.NS;

ROTATED_IMAGE[ROAD_IMAGE.NE] = ROAD_IMAGE.SE;
ROTATED_IMAGE[ROAD_IMAGE.SE] = ROAD_IMAGE.SW;
ROTATED_IMAGE[ROAD_IMAGE.SW] = ROAD_IMAGE.NW;
ROTATED_IMAGE[ROAD_IMAGE.NW] = ROAD_IMAGE.NE;

ROTATED_IMAGE[ROAD_IMAGE.ENSW] = ROAD_IMAGE.ENSW;

ROTATED_IMAGE[ROAD_IMAGE.ESW] = ROAD_IMAGE.NSW;
ROTATED_IMAGE[ROAD_IMAGE.NSW] = ROAD_IMAGE.ENW;
ROTATED_IMAGE[ROAD_IMAGE.ENW] = ROAD_IMAGE.ENS;
ROTATED_IMAGE[ROAD_IMAGE.ENS] = ROAD_IMAGE.ESW;

Array.prototype.clone = function() {
	var ret = [];
	for(var i = 0; i < this.length; i++) {
		var v = this[i];
		if (Object(Object(v).clone) instanceof Function) {
			v = v.clone();
		}
		ret[i] = v;
	}
	return ret;
}

function Square(type) {
	this.type = type;
}

Square.prototype = {
	draw: function(elt) {
		var colorMap = {};
		colorMap[TYPE_EMPTY] = "white";
		colorMap[TYPE_ROAD] = "gray";
		colorMap[TYPE_HOUSE] = "red";
		colorMap[TYPE_BEER] = "brown";
		colorMap[TYPE_SODA] = "green";
		colorMap[TYPE_LEMONADE] = "yellow";
		elt.style.background = colorMap[this.type];
		if (this.blockNumber) {
			elt.innerHTML = this.blockNumber+"";
		}
	},
	clone: function() {
		return new Square(this.type);
	}
};

function Empty() {
}

Empty.prototype = new Square(TYPE_EMPTY);

function Road(image) {
	this.image = image;
//	this.img = el("img");
//	this.img.src = image;
	this.type = TYPE_ROAD;
}

Road.prototype = new Square(TYPE_ROAD);

Road.prototype.clone = function() {
	var ret = new Road(this.image);
	ret.id = this.id;
	if(this.overpass) {
		ret.overpass = this.overpass;
	}
	return ret;
};

Road.prototype.draw = function(el) {
	Square.prototype.draw.call(this, el);
	var colors = [
		"red",
		"green",
		"blue",
		"yellow",
		"orange",
		"gray",
		"purple",
		"cyan",
		"maroon"
	];
	if(this.id) {
		el.style.background = colors[this.id % colors.length];
	}
	el.style.background = "url(" + this.image + ")";
	//el.appendChild(this.img);
};

Road.prototype.rotate = function() {
	this.image = ROTATED_IMAGE[this.image];
	this.img = el("img");
	this.img.src = this.image;
	return this;
};

function V() {
	return new Road(ROAD_IMAGE.NS);
}

function H() {
	return new Road(ROAD_IMAGE.EW);
}

function T() {
	return new Road(ROAD_IMAGE.ESW);
}

function NSW() {
	return new Road(ROAD_IMAGE.NSW);
}

function X() {
	return new Road(ROAD_IMAGE.ENSW);
}

function NE() {
	return new Road(ROAD_IMAGE.NE);
}

function SE() {
	return new Road(ROAD_IMAGE.SE);
}

function NW() {
	return new Road(ROAD_IMAGE.NW);
}

function SW() {
	return new Road(ROAD_IMAGE.SW);
}
function Overpass() {
	var ret = new Road(ROAD_IMAGE.NS);
	ret.overpass = true;
	return ret;
}


function HouseSquare(id, square) {
	this.id = id;
	this.square = square;
}

HouseSquare.prototype = new Square(TYPE_HOUSE);
HouseSquare.prototype.clone = function() {
	return new HouseSquare(this.id, this.square);
};

HouseSquare.prototype.draw = function(el) {
	console.error("HOUSEDRAW");
	Square.prototype.draw.call(this, el);
	el.innerHTML = "(" + this.id + ": " + this.square + ")";
}

function RestaurantSquare(restaurant, square) {
	this.id = restaurant.id;
	this.owner = restaurant.owner;
	this.square = square;
}

RestaurantSquare.prototype = new Square(TYPE_RESTAURANT);
RestaurantSquare.prototype.clone = function() {
	return new RestaurantSquare({ id: this.id, owner: this.owner}, this.square);
};

RestaurantSquare.prototype.draw = function(el) {
	console.error("RestaurantSquare");
	Square.prototype.draw.call(this, el);
	el.style.background = "url(" + RESTAURANT_IMAGES[this.square] + ")";
}

function House(id, square) { return new HouseSquare(id, square); }

function _() { return new Empty() }

function Drink(drinkType) {
	this.type = drinkType;
}

Drink.prototype = new Square();

function Beer() { return new Drink(TYPE_BEER); }
function Lemonade() { return new Drink(TYPE_LEMONADE); }
function Soda() { return new Drink(TYPE_SODA); }

var tile00 = [
	[_(), _(), V(), House(12, 0), House(12, 1)],
	[_(), _(), V(), House(12, 2), House(12, 3)],
	[H(), H(), Overpass(), H(), H()],
	[_(), _(), V(), _(), _()],
	[_(), _(), V(), _(), _()]
];

var tile01 = [
	[_(), _(), V(), _(), _()],
	[_(), _(), V(), _(), _()],
	[H(), H(), T().rotate(), _(), _()],
	[_(), _(), V(), Beer(), _()],
	[_(), _(), V(), _(), _()]
	
];

var tile02 = [
	[SE(), H(), NW(), _(), _()],
	[V(), House(13, 0), House(13, 1), _(), _()],
	[NSW(), House(13, 2), House(13, 3), _(), _()],
	[V(), _(), _(), _(), _()],
	[NE(), H(), SW(), _(), _()]
];

var tile10 = [
	[_(), _(), V(), _(), _()],
	[_(), _(), V(), _(), _()],
	[H(), H(), X(), H(), H()],
	[_(), _(), V(), _(), _()],
	[_(), _(), V(), Soda(), _()]
];

var tile11 = [
	[_(), _(), V(), _(), _()],
	[_(), Soda(), V(), _(), _()],
	[H(), H(), T().rotate().rotate(), H(), H()],
	[_(), _(), _(), _(), _()],
	[_(), _(), _(), _(), _()],
];

var tile12 = [
	[_(), _(), NE(), H(), SW()],
	[_(), _(), _(), Lemonade(), V()],
	[SW(), _(), _(), _(), NE()],
	[V(), Beer(), _(), _(), _()],
	[NE(), H(), SW(), _(), _()]
];

var tile20 = [
	[SE(), H(), NW(), _(), _()],
	[V(), Soda(), _(), _(), _()],
	[NW(), _(), House(3, 0), House(3, 1), SE()],
	[_(), _(), House(3, 2), House(3, 3), V()],
	[_(), _(), SE(), H(), NW()]
];

var tile21 = [
	[_(), _(), V(), House(4, 0), House(4, 1)],
	[_(), _(), V(), House(4, 2), House(4, 3)],
	[H(), H(), X(), H(), H()],
	[_(), _(), V(), _(), _()],
	[_(), _(), V(), _(), _()]
];

var tile22 = [
	[_(), _(), V(), _(), _()],
	[_(), _(), V(), _(), _()],
	[H(), H(), X(), H(), H()],
	[_(), _(), V(), Beer(), _()],
	[_(), _(), V(), _(), _()]
];

function makeMap(tiles) {
	var ret = [];
	for(var i = 0; i < tiles.length; i++) {
		var tileRow = tiles[i];
		for(var j = 0; j < tileRow.length; j++) {
			var tile = tiles[i][j];
			var tileRowOffset = i * 5;
			var tileColumnOffset = j * 5;
			for (var ii = 0; ii < tile.length; ii++) {
				if (!ret[ii + tileRowOffset]) {
					ret[ii + tileRowOffset] = [];
				}
				for(var jj = 0; jj < tile[ii].length; jj++) {
					var square = tile[ii][jj];
					ret[ii + tileRowOffset][jj + tileColumnOffset] = square.clone();
				}
			}
		}
	}
	return ret;
}

function el(tag) {
	return document.createElement(tag);
}

function getMapTable(map) {
	var tbl = el("table");
	el.className = "map";
	for (var i = 0; i < map.length; i++) {
		var row = el("tr");
		row.className = "mapRow";
		row.id = "row" + i;
		for(var j = 0; j < map[i].length; j++) {
			var _cell = el("td");
			var cell = el("div");
			cell.className = "mapCell mapRow" + i + " mapCol" + j;
			cell.id = "cell" + i + "_" + j;
			var square = map[i][j];
			cell.innerHTML = square.id +":" + square.stretch;
			square.draw(cell);
			_cell.appendChild(cell);
			row.appendChild(_cell);
		}
		tbl.appendChild(row);
	}
	return tbl;
}


function getBigMapTable(map, X, Y) {
	var tbl = el("table");
	el.className = "map";
	for (var I = 0; I < X; I++) {
		var i = I % map.length;
		var row = el("tr");
		row.className = "mapRow";
		row.id = "row" + i;
		for(var J = 0; J < Y; J++) {
			var j = J % map[i].length;
			var _cell = el("td");
			var cell = el("div");
			cell.className = "mapCell";
			cell.id = "cell" + i + "_" + j;
			var square = map[i][j];
			square.draw(cell);
			_cell.appendChild(cell);
			row.appendChild(_cell);
		}
		tbl.appendChild(row);
	}
	return tbl;
}

function getDX(dir) {
	var map = {
		N: 0,
		S: 0,
		E: 1,
		W: -1
	};
	return map[dir];
}

function getDY(dir) {
	var map = {
		N: -1,
		S: 1,
		E: 0,
		W: 0
	};
	return map[dir];
}

function tagNodes(start, id) {
	id = id || "(START)";
	start.__TAG__ = id;
	var ret = {};
	ret[id] = start;
	start.getNeighbors().map(function(node, i) {
		if(node.__TAG__) return;
		var ids = tagNodes(node, id + "." + i);
		for (var k in ids) {
			ret[k] = ids[k];
		}
	});
	return ret;
}

window.tagNodes = tagNodes;

function dijkstra(nodeMap, node) {
	var Q = [];
	
	var dist = {};
	var prev = {};
	for (var id in nodeMap) {
		Q.push(id);
		dist[id] = 100000;
	}
	dist[node.__TAG__] = 0;
	while(Q.length > 0) {
		var ui = 0;
		var uid = Q[0];
		for(var i = 1; i < Q.length; i++) {
			var qid = Q[i];
			if(dist[qid] < dist[uid]) {
				ui = i;
				uid = qid;
			}
		}
		Q.splice(ui, 1);
		var u = nodeMap[uid];
window.nodeMap = nodeMap;
console.debug("ui=", ui, "uid=", uid, "u=", u, "dist[u]=", dist[uid]);
		u.getNeighbors().forEach(function(nu) {
			var alt = dist[uid] + 1;
			if (alt < dist[nu.__TAG__]) {
				dist[nu.__TAG__] = alt;
				prev[nu.__TAG__] = uid;
			}
		});
	}
	return dist;
}

function preCalcDistances(map, roadNodes) {
	var output = getMatrix(map[0].length, map.length, function() {
		return getMatrix(map[0].length, map.length, function() { return { road: null, distance: 100000 }; });
	});
	roadNodes.forEach(function(node) {
		var nodeMap = tagNodes(node);
		for (var id in nodeMap) {
			console.info("Calculating distance from for road #" + node.id + " tile " + id);
			var distances = dijkstra(nodeMap, nodeMap[id]);
			var src = nodeMap[id];
			for (var id2 in nodeMap) {
				var dest = nodeMap[id2];
				var d = distances[id2];
				console.debug("distance from " + id + "->" + id2 + "on road " + id + "=" + d);
				for (var srcIndex in src.elements) {
					var srcXY = TileNode.getXY(srcIndex);
					for (var destIndex in dest.elements) {
						var destXY = TileNode.getXY(destIndex);
						var oldValue = output[srcXY.y][srcXY.x][destXY.y][destXY.x];
						if (d < oldValue.distance) {
							output[srcXY.y][srcXY.x][destXY.y][destXY.x] = {
								distance: d,
								road: node.id
							};
						}
					}
				}
			}
		}
	});
	return output;
}

window.dijkstra = dijkstra;

function tagRoads(map) {
    var numRoads = 0;
    var roads = [];
    for(var i = 0; i < map.length; i++) {
        for(var j= 0; j < map[i].length; j++) {
			var cell = map[i][j];
			if (cell.type != TYPE_ROAD) continue;
			if (cell.id) continue;
			if (cell.overpass) continue;
			var newID = ++numRoads;
			//console.debug("tagging new road:", i, j, newID, cell);
			roads.push({
				x: j,
				y: i
			});
			followRoadNew(cell, map, i, j, newID, 0, 0, new RoadGraph());
        }
    }
    // FIXME: pre-calculate distance from shortest distance from (x1,y1) to (x2,y2) using all roads adjacent to both
    var ROAD_NODES = roads.map(function(start) {
		return followRoadBFS(map, start);
    });
    window.ROAD_NODES = ROAD_NODES;
    var distances = preCalcDistances(map, ROAD_NODES);
    window.DISTANCES = distances;
}

function makeRoadGraph(map) {
    var numRoads = 0;
    for(var i = 0; i < map.length; i++) {
        for(var j= 0; j < map[i].length; j++) {
			var cell = map[i][j];
			if (cell.type != TYPE_ROAD) continue;
			if (cell.id) continue;
			if (cell.overpass) continue;
			console.debug("tagging new road:", i, j, numRoads+1, cell);
			followRoad(cell, map, i, j, ++numRoads);
        }
    }
}

function RoadGraph() {
	this.nodes = {};
	this.counter = 1;
}

RoadGraph.getIndex = function(tile) {
	return tile.x + "," + tile.y;
};

RoadGraph.prototype = {
	getNode: function(square) {
		var tile = Board.getTile(square);
		var index = RoadGraph.getIndex(tile);
		var ret = this.nodes[index];
	}
};


function RoadGraphNode(tile) {
	this.tile = options.tile;
	this.squares = {};
	this.neighbors = [];
}
RoadGraphNode.getIndex = function(square) {
	return square.x + "," + square.y;
};

RoadGraphNode.prototype = {
	addSquare: function(square) {
		this.squares[RoadGraphNode.getIndex(square)] = square;
		return this;
	},
	containsSquare: function(square) {
		return RoadGraphNode.getIndex(square) in this.squares;
	},
	addNeighbor: function(node) {
		this.neighbors.push(node);
	}
};

function updateGraph(graph, i, j, ii, jj) {
	var oldTile = Board.getTile({y: i, y: j});
	var newTile = Board.getTile({y:ii, x:jj});
	var dest = graph.getNode({x: jj, y: ii});
}

function followRoadNew(cell, map, i, j, id, pdi, pdj, graph) {
	var oldTile = Board.getTile({y: i - pdi, x: j - pdj});
	var newTile = Board.getTile({ x: j, y: i});
	
	if(!cell.stretch) cell.stretch = graph.counter;

	if ((pdi || pdj) && oldTile.x != newTile.x || oldTile.y != newTile.y) {
		console.debug("new tile for road " + id + "(" + oldTile.x + "," + oldTile.y + ")->(" + newTile.x + "," + newTile.y + "):", ++graph.counter);
	}
	if(cell.overpass) {
		console.error("OVERPASS tagging ", i, j, " -> ", id);
		cell.id = "";
	} else {
		cell.id = id;
		console.debug("tagging ", i, j, " -> ", id + "(" + newTile.x + "," + newTile.y + ")");
    }
    var toFollow = [];
    for(var di = -1; di <= 1; di++) {
        for(var dj = -1; dj <= 1; dj++) {
            if(di && dj || di == dj) continue;
            var ii=i+di;
            var jj=j+dj;
            if(ii<0||ii>=map.length) continue;
            var row = map[ii];
            if(jj<0||jj>=row.length) continue;
            var newTile = Board.getTile({x: jj, y: ii});
            if (cell.overpass) {
				// can only exit an overpass the way you came in
				if (di != pdi || dj != pdj) {
					console.error("Skipping ", di, dj, " for overpass because ", pdi, pdj);
					continue;
				}
            }
            var tile = Board.getTile({ x: jj, y: ii });
            var next = row[jj];
            toFollow.push({
				cell: next,
				di: di,
				dj: dj,
				tx: tile.x,
				ty: tile.y
            });
        }
    }
    // Only jump into a new tile after we've
    toFollow.sort(function(a, b) {
		var at = (a.ty - newTile.y) * 100 + (a.tx - newTile.x);
		var bt = (b.ty - newTile.y) * 100 + (b.tx - newTile.x);
		// ensure that it is always positive, and that different cells are grouped together
		if (at < 0) {
			at = -at + 1000;
		}
		if (bt < 0) {
			bt = -bt + 1000;
		}
		return at - bt;
    });
    toFollow.forEach(function(info) {
		var next = info.cell;
		var ii = i + info.di;
		var jj = j + info.dj;
		if (next.type != TYPE_ROAD) {
			//updateGraph(graph, i, j, ii, jj);
			return;
		}
		if (next.id) return;
		
		followRoadNew(next, map, ii, jj, id, info.di, info.dj, graph);
	});
}

function TileNode(id, nodeMap) {
	this.id = id;
	this.neighborMap = {};
	this.elements = {};
	this.nodeMap = nodeMap;
}

TileNode.getIndex = function(tile) {
	return tile.x + "," + tile.y;
};

TileNode.getXY = function(index) {
	var v = index.split(",");
	return {
		x: parseInt(v[0]),
		y: parseInt(v[1])
	};
};

TileNode.prototype.addNeighbor = function(tile) {
	this.neighborMap[TileNode.getIndex(tile)] = true;
};

TileNode.prototype.addElement = function(element) {
	this.elements[TileNode.getIndex(element)] = true;
};

TileNode.prototype.getNeighbors = function() {
	if (this.neighbors) {
		return this.neighbors;
	}
	var ret = [];
	for (var k in this.neighborMap) {
		var xy = TileNode.getXY(k);
		var node = this.nodeMap[xy.y][xy.x];
		ret.push(node);
	}
	return this.neighbors = ret;
}

function inSameTile(a, b) {
	var at = Board.getTile(a);
	var bt = Board.getTile(b);
	return at.x == bt.x && at.y == bt.y;
}

function getMatrix(w, h, f) {
	f = f || function() { return null };
	var ret = [];
	for (var i = 0; i < h; i++) {
		var row = [];
		ret[i] = row;
		for(var j = 0; j < w; j++) {
			row[j] = f(j, i);
		}
	}
	return ret;
}

function followRoadBFS(map, start) {
	var URDL = [ {x: 0, y: -1}, {x: 1, y: 0}, {x:0, y:1}, {x:-1, y:0} ];
	var otherTiles = [ start ];
	var roadID = map[start.y][start.x].id;
	var nodeMap = getMatrix(map.length, map[0].length);
	var startNode;
	console.debug("Following road for ", roadID);
	while(otherTiles.length > 0) {
		var tileStart = otherTiles.shift();
		var tileNode = new TileNode(roadID, nodeMap);
		if (!startNode) {
			startNode = tileNode;
		}
		var Q = [tileStart];
		console.warn("Starting new tile:", tileStart, Board.getTile(tileStart));
		while(Q.length > 0) {
			var S = Q.shift();
			console.info("Starting new node:", TileNode.getIndex(S));
			var sCell = map[S.y][S.x];
			URDL.forEach(function(dir) {
				var nx = S.x + dir.x;
				var ny = S.y + dir.y;
				if (nx < 0 || ny < 0) return;
				if (nx >= map[0].length || ny >= map.length) return;
				var newCell = map[ny][nx];
				// HACK FOR OVERPASSES: just skip over.
				// it only occurs in the center, so we don't have to worry about going off of the tile.
				if (newCell.overpass) {
					nx = nx + dir.x;
					ny = ny + dir.y;
					newCell = map[ny][nx];
					console.error("OVERPASS");
				}
				var nS = { x: nx, y: ny };
				if (nodeMap[ny][nx]) {
					console.debug(TileNode.getIndex(nS), "already visited for", roadID);
					return;
				}
				if (newCell.type == TYPE_ROAD) {
					if (inSameTile(nS, S)) {
						console.debug("Pushing intratile road ", TileNode.getIndex(nS));
						nodeMap[ny][nx] = tileNode;
						Q.push(nS);
					} else {
						console.debug("Pushing neighbor road ", TileNode.getIndex(nS));
						otherTiles.push(nS);
						tileNode.addNeighbor(nS);
					}
				} else {
					console.debug("Adding element ", TileNode.getIndex(nS));
					tileNode.addElement(nS);
					nodeMap[ny][nx] = tileNode;
				}
			});
		}
	}
	return startNode;
}

window.followNode = function(node) {
	for(var k in node.elements) {
		var xy = TileNode.getXY(k);
		var id = "cell" + xy.y + "_" + xy.x;
		$(id).innerHTML = "[" + node.id + "]";
	}
	node.followed = true;
	node.getNeighbors().forEach(function(n) {
		if(!n.followed) followNode(n);
	});
};

window.followRoadBFS = followRoadBFS;

function followRoad(cell, map, i, j, id, pdi, pdj) {
	if(cell.overpass) {
		console.error("OVERPASS tagging ", i, j, " -> ", id);
		cell.id = "";
	} else {
		cell.id = id;
		console.debug("tagging ", i, j, " -> ", id);
    }
    for(var di = -1; di <= 1; di++) {
        for(var dj = -1; dj <= 1; dj++) {
            if(di && dj || di == dj) continue;
            var ii=i+di;
            var jj=j+dj;
            if(ii<0||ii>=map.length) continue;
            var row = map[ii];
            if(jj<0||jj>=row.length) continue;
            if (cell.overpass) {
				// can only exit an overpass the way you came in
				if (di != pdi || dj != pdj) {
					console.error("Skipping ", di, dj, " for overpass because ", pdi, pdj);
					continue;
				}
            }
            var next = row[jj];
            if (next.type != TYPE_ROAD) continue;
            if (next.id) continue;
            
            followRoad(next, map, ii, jj, id, di, dj);
        }
    }
}

function tagBlocks(map) {
    var numBlocks = 0;
    for(var i = 0; i < map.length; i++) {
        for(var j= 0; j < map[i].length; j++) {
			var cell = map[i][j];
			if (cell.type == TYPE_ROAD) continue;
			if (cell.blockNumber) continue;
			//console.debug("tagging new block:", i, j, numBlocks+1, cell);
			followBlock(cell, map, i, j, ++numBlocks);
        }
    }
}

function followBlock(cell, map, i, j, blockNumber) {
	cell.blockNumber = blockNumber;
	//console.debug("tagging ", i, j, " -> ", blockNumber);
    for(var di = -1; di <= 1; di++) {
        for(var dj = -1; dj <= 1; dj++) {
            if(di && dj || di == dj) continue;
            var ii=i+di;
            var jj=j+dj;
            if(ii<0||ii>=map.length) continue;
            var row = map[ii];
            if(jj<0||jj>=row.length) continue;
            var next = row[jj];
            if (next.type == TYPE_ROAD) continue;
            if (next.blockNumber) continue;
            
            followBlock(next, map, ii, jj, blockNumber);
        }
    }
}

/*
function tagRoads(map) {
`	var numRoads = 0;
	for (var i = 0; i < map.length; i++) {
		for (var j = 0; j < map[i].length; j++) {
			console.debug("tagRoads", i, j);
			var cell = map[i][j];
			if (cell.type != TYPE_ROAD || cell.id) {
				continue;
			}
			var toSearch = {};
			cell.exits.forEach(function(exit) {
				var newID = ++numRoads;
				console.debug("new road:", i, j, inDir);
				"NSEW".split("").forEach(function(inDir) {
					if (!exit[inDir]) return;
					followRoad(map, cell, i, j, inDir, newID);
				});
			});
		}
	}
}

function followRoad(map, cell, i, j, inDir, id) {
	console.debug("followRoad(", i, j, inDir, id, ")");
	cell.id = id;
	var outDirs = cell.map[inDir].split("").forEach(function(outDir) {
		var dx = getDX(outDir);
		var dy = getDY(outDir);
		var ii = i + dx;
		var jj = j + dy;
		if (ii < 0 || ii >= map.length) return;
		if (jj < 0 || jj >= map[ii].length) return;
		var nextCell = map[ii][jj];
		if (nextCell.type != TYPE_ROAD) return;
		console.debug("following road " + outDir + " to ", i, j);
		followRoad(map, nextCell, ii, jj, outDir, id);
	});
}
*/

function rotateTile(tile) {
	var ret = [];
	for(var i = 0; i < tile.length; i++) {
		for(var j = 0; j < tile[i].length; j++) {
			ret[j] = (ret[j] || []);
			var clone = tile[i][j].clone();
			if (clone.rotate) clone.rotate();
			ret[j][tile.length - i - 1] = clone;
		}
	}
	return ret;
}

function Restaurant() {
}

Restaurant.count = 0;
Restaurant.prototype.init = function(info) {
	this.owner = info.owner;
	this.x = info.x;
	this.y = info.y;
	this.tile = Board.getTile(info);
	this.id = Restaurant.count++;
	this.orientation = info.orientation.clone();
	this.roads = util.cloneObject(info.roads);
	this.driveThrough = false;
	return this;
};

Restaurant.prototype.clone = function() {
	var ret = new Restaurant();
	ret.owner = this.owner;
	ret.x = this.x;
	ret.y = this.y;
	ret.id = this.id;
	ret.tile = {
		x: this.tile.x,
		y: this.tile.y
	};
	ret.orientation = this.orientation.clone();
	ret.roads = util.cloneObject(this.roads);
	ret.driveThrough = this.driveThrough;
	return ret;
};

Restaurant.prototype.tagRoads = function(state) {
	var board = state.board;
	var map = board.map;
	var x = this.tile.x;
	var y = this.tile.y;
	var orientations = [
		[ 1, 0], [ -1, 0], [0, 1], [0, -1]
	];
	var roads = {};
	var entrances = [ [0, 0] ];
	if (this.driveThrough) {
		this.orientations.forEach(function(o) {
			entrances.push([o[0], 0]);
			entrances.push([o[0], o[1]]);
			entrances.push([0, o[1]]);
		});
	}
	entrances.forEach(function(e) {
		orientations.forEach(function(o) {
			var xx = x + e[0] + o[0];
			var yy = y + e[1] + o[1];
			if (xx < 0 || yy < 0 || xx >= (board.width - 1) || yy >= (board.height - 1)) {
				return;
			}
			var m = map[yy][xx];
			if (m.type == TYPE_ROAD) {
				roads[m.id] = true;
			}
		});
	});
	this.roads = roads;
	return this;
}

function Board(map) {
}

Board.prototype.precalc = function() {
	var map = this.map;
	for(var y = 0; y < this.height; y++) {
		for(var x = 0; x < this.width; x++) {
			var m = map[y][x];
			var distances = [];
			var roads = [];
			var roadTiles = [];
			if (y > 0 && map[y - 1][x].type == TYPE_ROAD) {
				var tile = Board.getTile({ x: x, y: y - 1 });
				roadTiles.push({
					id: map[y - 1][x].id,
					x: x,
					y: y - 1,
					tile: tile
				});
				roads.push(map[y - 1][x].id);
			}
			if (x > 0 && map[y][x - 1].type == TYPE_ROAD) {
				var tile = Board.getTile({ x: x - 1, y: y });
				roadTiles.push({
					id: map[y][x - 1].id,
					x: x - 1,
					y: y,
					tile: tile
				});
				roads.push(map[y][x - 1].id);
			}
			if (y < (this.height - 1) && map[y + 1][x].type == TYPE_ROAD) {
				var tile = Board.getTile({ x: x, y: y + 1 });
				roadTiles.push({
					id: map[y + 1][x].id,
					x: x,
					y: y + 1,
					tile: tile
				});
				roads.push(map[y + 1][x].id);
			}
			if (x < (this.width + 1) && map[y][x + 1].type == TYPE_ROAD) {
				var tile = Board.getTile({ x: x + 1, y: y });
				roadTiles.push({
					id: map[y][x + 1].id,
					x: x + 1,
					y: y,
					tile: tile
				});
				roads.push(map[y][x + 1].id);
			}
			if (roads.length == 0) continue; // no adjacent roads -> no distance to calculate
			// don't count distance from same road on the same tile twice
			var uniqueRoads = {};
			roads.forEach(function(id, i) {
				var tile = roadTiles[i];
				uniqueRoads[id + ":" + tile.x + "," + tile.y] = tile;
			});
			for (var k in uniqueRoads) {
				var info = uniqueRoads[k];
				calculateDistances({
					board: board,
					x: info.x,
					y: info.y,
					distances: disances
				});
			}
		}
	}
};

function calculateDistances(options) {
	var board = options.board;
	var map = options.board.map;
	var x = options.x;
	var y = options.y;
	var tiles = 0;
	var lastTile = Board.getTile(options);
	var distances = options.distances;
	while(true) {
		var up, down, left, right;
		if (x > 0) {
			left = map[y][x - 1];
		}
		if (x < (board.width - 1)) {
			right = map[y][x + 1];
		}
		if (y > 0) {
			up = map[y - 1][x];
		}
		if (y < (board.height - 1)) {
			down = map[y + 1][x];
		}
		if (left && left.type == TYPE_ROAD) {
			
		}
	}
}

Board.getTile = function(pos) {
	return {
		x: Math.floor(pos.x / 5),
		y: Math.floor(pos.y / 5)
	};
}

Board.prototype = {};
Board.prototype.init = function(map) {
	this.map = map;
	this.restaurants = [];
	this.billboards = [];
	this.planes = [];
	this.height = map.length;
	this.width = map[0].length;
	return this;
};

Board.prototype.putRestaurant = function(r) {
console.debug("putRestaurant(" + r.x + "," + r.y + "):", r);
	this.restaurants.push(r);
	this.map[r.y][r.x] = new RestaurantSquare(r, 0);
	this.map[r.y + r.orientation[1]][r.x] = new RestaurantSquare(r, 1);
	this.map[r.y][r.x + r.orientation[0]] = new RestaurantSquare(r, 2)
	this.map[r.y + r.orientation[1]][r.x + r.orientation[0]] = new RestaurantSquare(r, 3);
	return this;
};

Board.prototype.clone = function() {
	var ret = new Board();
	ret.restaurants = this.restaurants.clone();
	ret.planes = this.planes.clone();
	ret.billboards = this.billboards.clone();
	ret.map = this.map.clone();
	ret.width = this.width;
	ret.height = this.height;
	return ret;
};

var tiles = [ tile00, tile01, tile02, tile10, tile11, tile12, tile20, tile21, tile22];

function rand(n) {
	return Math.floor(Math.random() * n);
}

var $ = util.$;

function drawMap(map) {
	$("map").innerHTML = "";
	$("map").appendChild(getMapTable(map));
}

function drawBoard(board) {
	tagRoads(board.map);
	tagBlocks(board.map);
	drawMap(board.map);
}

function randomBoard() {
	var tmap = [];
	for(var i = 0; i < 3; i++) {
		var row = [];
		tmap[i] = row;
		for (var j = 0; j < 3; j++) {
			var n = rand(tiles.length);
			var t = tiles.splice(n, 1)[0];
				var rotate = rand(4);
			while(rotate-- > 0) t = rotateTile(t);
			row[j] = t;
		}
	}
	var map = makeMap(tmap);
	return new Board().init(map);
}

function getAllTiles(state) {
	var ix = state.board.height;
	var iy = state.board.width;
	var t = Board.getTile({x: ix, y: iy});
	var ret = [];
	for (var i = 0; i < t.x; i++) {
		ret[i] = [];
		for (var j = 0; j < t.y; j++) {
			ret[i][j] = true;
		}
	}
	return ret;
}

window.GAT=getAllTiles; // TODO HACK FIXME REMOVE THIS
/**
 * 1. Restaurants must be placed fully on empty squares that do not contain any other resaurants, roads, drinks or houses
 * 2. Restaurants must be placed so that their entrance borders on a square with a road
 * 3. Restaurants may not be placed in such a way that their entrance is on the same tile as the entrance of an existing restaurant.
 */
function getPutRestaurantActions(state) {
	var actions = {};
	var allowedTiles = getAllTiles(state);
	var board = state.board;
	var player = state.getActivePlayer();
	board.restaurants.forEach(function(r) {
		var t = r.tile;
		allowedTiles[t.y][t.x] = false;
	});
	for (var row = 0; row < board.height; row++) {
		for (var col = 0; col < board.width; col++) {
			var square = board.map[row][col];
			if (square.type != TYPE_EMPTY) continue; // must be an empty square
			// TODO: check for billboards, other restaurants, added houses, ?
			var tile = Board.getTile({ x: col, y: row});
			if (!allowedTiles[tile.y][tile.x]) continue; // another restaurant has an entrance in this tile
			// Must have a road at one of [i - 1][j], [i + 1][j], [i][j - 1], [i][j + 1]
			var roads = {};
			if (row > 0 && board.map[row - 1][col].type == TYPE_ROAD) {
				roads[board.map[row - 1][col].id] = true;
			}
			if (row < (board.height - 1) && board.map[row + 1][col].type == TYPE_ROAD) {
				roads[board.map[row + 1][col].id] = true;
			}
			if (col > 0 && board.map[row][col - 1].type == TYPE_ROAD) {
				roads[board.map[row][col - 1].id] = true;
			}
			if (col < (board.width - 1) && board.map[row][col + 1].type == TYPE_ROAD) {
				roads[board.map[row][col + 1].id] = true;
			}
			if (util.setSize(roads) == 0) {
				continue;
			}
			var orientations = [
				[ 1, 1], [-1, 1], [1, -1], [-1,-1]
			];
			/* possible orientations:
			 * x0: dx=1,dy=1
			 * 00
			 *
			 * 0x: dx=-1, dy = 1
			 * 00
			 
			 * 00: dx=1, dy = -1
			 * x0 
			 *
			 * 00: dx=-1, dy=-1
			 * 0x
			 * 
			 * map[j][i], map[j + dy][i], map[j][i + dx], map[j + dy][i + dx]
			 */
			 var allowedOrientations = orientations.filter(function(o) {
				if (board.map[row][col].type != TYPE_EMPTY) return false;
				var rdr = row + o[1];
				var cdc = col + o[0];
				if (rdr < 0 || rdr >= (board.height - 1)) return false; // square off the map
				if (cdc < 0 || cdc >= (board.width - 1)) return false; // square off the map
				if (board.map[rdr][col].type != TYPE_EMPTY) return false;
				if (board.map[row][cdc].type != TYPE_EMPTY) return false;
				if (board.map[rdr][cdc].type != TYPE_EMPTY) return false;
				return true;
			 });
			 (function(row, col) {
			 allowedOrientations.forEach(function(o) {
				var name = "(" + col + "," + row + ") - (" + (col + o[0]) + ", " + (row + o[1]) + ")";
				actions[name] = function() {
					var s = state.clone();
					var r = new Restaurant().init({
						owner: player.id,
						x: col,
						y: row,
						orientation: o,
						roads: roads
					});
					s.board.putRestaurant(r);
					return s;
				};
			 });
			 })(row, col);
		}
	}
	return actions;
}

// TODO DEBUG HACK FIXME REMOVE THIS
window.getPutRestaurantActions = getPutRestaurantActions;

window.Board = Board;
window.randomBoard = randomBoard;
window.drawBoard = drawBoard;
})(window.util);