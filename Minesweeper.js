setupGame = function(l, w, b) {
	//generate number of bombs based on board size.
	$('#bombCount').empty();
	$('#title').empty();
	$('#reset').empty();
	$('#grid').empty();
	$('#grid').off();

	var numBombs = b;

	var bombCount = $("#bombCount");
	bombCount.data('bombs', numBombs)
	bombCount.text('Bombs remaining: ' + bombCount.data('bombs'));

	$('#title').append('This... is... MINESWEEPER');

	var resetArea = $('#reset');
	var lInput = $("<input type='text' name='length' id='lInput' class='input' maxlength=3>");
	var wInput = $("<input type='text' name='width' id='wInput' class='input' maxlength=3>");
	var bInput = $("<input type='text' name='bombs' id='bInput' class='input' maxlength=3>");

	resetArea.append("Length: ");
	resetArea.append(lInput);
	resetArea.append("<br>Width:  ");
	resetArea.append(wInput);
	resetArea.append("<br>Bombs: ");
	resetArea.append(bInput);

	$('#lInput').val(l);
	$('#wInput').val(w);
	$('#bInput').val(b);

	var resetButton = $("<button type='button' id='rButton'>RESET GAME</button>");
	resetButton.on('click', function(e) {
		var newL = $('#lInput').val();
		var newW = $('#wInput').val();
		var newB = $('#bInput').val();

		if(newL < 8 || newW < 8 ||
			newL > 30 || newW > 40 ||
			newB < 1 || newB > (newW * newL - 1)){
			alert("Board dimensions must be between 8x8 and 30x40, and there must be between 1 and (l * w) - 1 bombs!");
		} else {
			setupGame(newL, newW, newB);
		}
		
	});

	resetArea.append(resetButton);

	//~~~~~~~~~~~~~~~ top bar setup complete ~~~~~~~~~~~~~~~~~~~
	var grid = $('#grid');
	for(var row = 0; row < l; row++){
		var rowDiv = $("<div class='row'></div>")

		for(var col = 0; col < w; col++){
			var btnDiv = $("<div class='gridBtn' id=" + row + "_" + col + "></button>");
			btnDiv.data('coord', [row, col]);
			btnDiv.data('hidden', true);
			btnDiv.data('marked', false);
			btnDiv.data('bomb', false);

			rowDiv.append(btnDiv);
			grid.append(rowDiv);
		}
		grid.append(rowDiv);
	}

	placeBombs(numBombs, l, w);
	setDanger(l, w);

	$('#grid').on('click', '.gridBtn', function(clk) {
		clk.preventDefault();
		var clicked = $(this);
		if(clicked.data('hidden') && !clicked.data('marked')){
			if(clk.shiftKey){
				clicked.data('marked', true);
				clicked.text('!');
				decBombCount($('#bombCount'));

				if($('#bombCount').data('bombs') == 0 && checkRevealed(l, w)){
					setTimeout(function() {
						alert('BOI YA WIN!');
						setupGame(l, w, b);
					}, 100);
				}
			} else {
				if(clicked.data('bomb')){
					showAllBombs(l, w);
					setTimeout(function() {
						alert('GAME OVER DUMMY!');
						setupGame(l, w, b);
					}, 60);

				} 
				else {
					if(clicked.data('danger') > 0){
						clicked.data('hidden', false);
						clicked.text(clicked.data('danger'));
					} else{
						clicked.data('hidden', false);
						clicked.css('background-color', 'white');
						var dim = clicked.data('coord');
						propogate(dim[0], dim[1], l, w);
					}
					if($('#bombCount').data('bombs') == 0 && checkRevealed(l, w)){
					setTimeout(function() {
						alert('BOI YA WIN!');
						setupGame(l, w, b);
					}, 60);
				}
					
				}
			}
		} else if (clicked.data('marked')){
			if(clk.shiftKey){
				clicked.data('marked', false);
				clicked.text('');
				incBombCount($('#bombCount'));
			}
		}
	});
}

var propogate = function(x, y, l, w){
	var adjList = getAdjacent(x, y, l, w);

	adjList.forEach(function(btn) {
		var clicked = $(btn);
		if(clicked.data('hidden')){
			if(clicked.data('danger') > 0){
			clicked.data('hidden', false);
			clicked.text(clicked.data('danger'));
		} else{
			clicked.data('hidden', false);
			clicked.css('background-color', 'white');
			var dim = clicked.data('coord');
			propogate(dim[0], dim[1], l, w);
		}
		}
		
	});
}

var checkRevealed = function(l, w){
	
	for (var row = 0; row < l; row++) {
		for(var col = 0; col < w; col++) {
			var btn = getButtonByCoord(row, col);
			if (!btn.data('marked')){
				if(btn.data('hidden')){
					return false;
				}
			}
		}
	}
	return true;
}

var getButtonByCoord = function(row, col) {
	idString = row + "_" + col;
	return $('#' + idString);
}

var placeBombs = function(numBombs, l, w) {
	var total = l * w, placed = 0;

	while(placed < numBombs){
		var rand = Math.floor(Math.random() * total);
		var row = Math.floor(rand / w);
		var col = rand % w;

		var btn = getButtonByCoord(row, col);
		if($(btn).data('bomb') == false) {
			$(btn).data('bomb', true);
			placed++;
		}
	}
}

var setDanger = function(l, w) {
	for (var row = 0; row < l; row++) {
		for(var col = 0; col < w; col++) {
			var btnCurrent = getButtonByCoord(row, col);
			var adj = getAdjacent(row, col, l, w);

			var numAdj = 0;
			adj.forEach(function(e) {
				if(e.data('bomb')==true){
					numAdj++;
				}
			});
			btnCurrent.data('danger', numAdj);
		}
	}
}

var decBombCount = function(bCountDiv) {
	bCountDiv.data('bombs', bCountDiv.data('bombs') - 1);
	bCountDiv.text('Bombs remaining: ' + bCountDiv.data('bombs'));
}

var incBombCount = function(bCountDiv) {
	bCountDiv.data('bombs', bCountDiv.data('bombs') + 1);
	bCountDiv.text('Bombs remaining: ' + bCountDiv.data('bombs'));
}

var getAdjacent = function(x, y, l, w) {
	var adj = [];

	for(var x_i = x-1; x_i <= x+1; x_i++){
		for(var y_i = y-1; y_i <= y+1; y_i++){
			if(x_i >= 0 && x_i < l && y_i >= 0 && y_i < w){
				adj.push(getButtonByCoord(x_i, y_i));
			}
		}
	}

	return adj;
}

var showAllBombs = function(l, w) {
	for (var row = 0; row < l; row++) {
		for(var col = 0; col < w; col++) {
			var btnCurrent = getButtonByCoord(row, col);
			if(btnCurrent.data('bomb')){
				btnCurrent.text('*');
			}
		}
	}
}

$(document).ready(function() {
	setupGame(16, 16, 40);
});