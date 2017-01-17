function elt(tag) {
	return document.createElement(tag)
}

function getRow(label, value) {
	var ret = elt("tr");
	var lblCell = elt("td");
	var valCell = elt("td");
	lblCell.innerHTML = label;
	if (Object(value) instanceof String) {
		valCell.innerHTML = value;
	} else {
		valCell.appendChild(value);
	}
	ret.appendChild(lblCell);
	ret.appendChild(valCell);
	return ret;
}

function drawPlayer(player, base) {
	var tbl = elt("table");
	var cashRow = getRow("Cash", player.cash+"");
	var beachList = elt("ul");
	beachList.innerHTML = player.beach.map(function(card) {
		return "<li>" + card.toString() + "</li>";
	}).join("");
	var beachRow = getRow("Beach", beachList);
	var structureList = elt("ul");
	structureList.innerHTML = player.structure.map(function(card) {
		return "<li>" + card.toString() + "</li>";
	}).join("");
	
	var structureRow = getRow("Structure", structureList);
	tbl.appendChild(cashRow);
	tbl.appendChild(beachRow);
	tbl.appendChild(structureRow);
	tbl.appendChild(getRow("Burgers", player.burgers+""));
	tbl.appendChild(getRow("Pizza", player.pizza+""));
	tbl.appendChild(getRow("Soda", player.soda+""));
	tbl.appendChild(getRow("Beer", player.beer+""));
	tbl.appendChild(getRow("Lemonade", player.lemonade+""));
	base.innerHTML = "";
	base.appendChild(tbl);
}

function drawTray(tray, base) {
	var tbl = elt("table");
	
	for(var k in tray.map) {
		var v = tray.map[k];
		tbl.appendChild(getRow(k, v+""));
	}
	base.innerHTML = "";
	base.appendChild(tbl);
}

function drawBank(bank, base) {
	var tbl = elt("table");
	tbl.appendChild(getRow("Cash left:", bank.cash+""));
	base.innerHTML = "";
	base.appendChild(tbl);
}
