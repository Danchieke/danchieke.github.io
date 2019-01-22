"use strict";

{ /*-- Initial Global Setup --*/
// Gridsquare setup
var grid = document.getElementById("grid");
var square = document.createElement("div");
grid.addEventListener("click", function(){setTimeout(updateBoard, 100);});
square.classList.add("gridsquare");

// Checkmate text
var checkBlack = document.getElementById("checkblack");
var checkWhite = document.getElementById("checkwhite");
var mateBlack  = document.getElementById("mateblack");
var mateWhite  = document.getElementById("matewhite");
checkBlack.style.display = "none";
checkWhite.style.display = "none";
mateBlack.style.display = "none";
mateWhite.style.display = "none";

// Turn text
var turnBlack = document.getElementById("blackturn");
var turnWhite = document.getElementById("whiteturn");
turnBlack.style.display = "none";

// Turn timers
var timerBlack = document.getElementById("blacktime");
var timerWhite = document.getElementById("whitetime");
var blackTime = 0, whiteTime = 0;
var timerState = 0;
setInterval(incrementTimer, 100);

// Buttons
var pauseButton = document.getElementById("pause");
pauseButton.addEventListener("click", function(){
	switch(timerState){
		case 1:
			timerState = 2;
			break;
		case 2:
			timerState = 1;
			break;
	}
});
document.getElementById("restart").addEventListener("click", function(){
	if(timerState != 1) location = location;
});

// Booleans for state-dependent functions
var blackTurn = false;
var blackTurnOld = blackTurn;
var selectingMove = false;
var newNodeGlobal = null;
var castling = false;

// Data 2D arrays
var s;
var gridArrayHTML = [[]];
var gridArrayInfo = [[]];
var gridArrayInfoOld = [[]];
var gridArrayInfoCheck = [[]];
}

// Generate grid
for(var i=0; i<8; i++){
	gridArrayHTML[i] = [];
	gridArrayInfo[i] = [];
	gridArrayInfoCheck[i] = [];
	gridArrayInfoOld[i] = [];
	for(var j=0; j<8; j++){
		gridArrayInfo[i][j] = "";
		s = square.cloneNode();
		gridArrayHTML[i][j] = s;
		grid.appendChild(s);
		s.classList.add((i+j)%2==1 ? "blackgrid" : "whitegrid");
		s.addEventListener("click", movePiece);
		s.ii = i;
		s.jj = j;
	}
}
s = null;

layBoard();
// layTest();
updateBoard();

// 0x25CD,0x29BF,0x272A

function layTest(){
	gridArrayInfo[0][7] = "Kb";
	gridArrayInfo[3][3] = "Kw";
	gridArrayInfo[2][6] = "Qw";
}

function layBoard(){
	gridArrayInfo[0][0] = "Rb0";
	gridArrayInfo[0][1] = "Nb0";
	gridArrayInfo[0][2] = "Bb0";
	gridArrayInfo[0][3] = "Qb0";
	gridArrayInfo[0][4] = "Kb0";
	gridArrayInfo[0][5] = "Bb0";
	gridArrayInfo[0][6] = "Nb0";
	gridArrayInfo[0][7] = "Rb0";
	
	for(let i=0; i<8; i++){
		gridArrayInfo[1][i] = "pb0";
		gridArrayInfo[6][i] = "pw0";
	}
	
	gridArrayInfo[7][0] = "Rw0";
	gridArrayInfo[7][1] = "Nw0";
	gridArrayInfo[7][2] = "Bw0";
	gridArrayInfo[7][3] = "Qw0";
	gridArrayInfo[7][4] = "Kw0";
	gridArrayInfo[7][5] = "Bw0";
	gridArrayInfo[7][6] = "Nw0";
	gridArrayInfo[7][7] = "Rw0";	
}

function updateBoard(){
	if(selectingMove) return;

	let info, node;
	let newTurn = (blackTurn === blackTurnOld ? false : true);
	
	for(let i=0; i<8; i++){
		for(let j=0; j<8; j++){
			if(newTurn || gridArrayInfo[i][j] != gridArrayInfoOld[i][j]){
				info = gridArrayInfo[i][j];
				node = gridArrayHTML[i][j];
				
				gridArrayInfoOld[i][j] = info;
				
				if(info == ""){
					node.innerHTML = "";
					node.classList.remove("whitepiece");
					node.classList.remove("blackpiece");
					node.classList.remove("activegrid");
				}
				else{
					node.innerHTML = "<p>"+getPieceText(info.substr(0,1))+"</p>";
					switch(info.substr(1,1)){
						case "w":
							node.classList.add("whitepiece");
							node.classList.remove("blackpiece");
							if(!blackTurn){
								node.classList.add("activegrid");
								if(gridArrayInfo[node.ii][node.jj].substr(2,1) == "E") gridArrayInfo[node.ii][node.jj] = gridArrayInfo[node.ii][node.jj].substr(0,2);
							}
							else node.classList.remove("activegrid");
							break;
						case "b":
							node.classList.add("blackpiece");
							node.classList.remove("whitepiece");
							if(blackTurn){
								node.classList.add("activegrid");
								if(gridArrayInfo[node.ii][node.jj].substr(2,1) == "E") gridArrayInfo[node.ii][node.jj] = gridArrayInfo[node.ii][node.jj].substr(0,2);
							}
							else node.classList.remove("activegrid");
							break;
						default:
							alert("There was an error in the info array");
							break;
					}
				}
			}
		}
	}
	blackTurnOld = blackTurn;
	if(blackTurn){
		turnBlack.style.display = "";
		turnWhite.style.display = "none";
	}
	else{
		turnBlack.style.display = "none";
		turnWhite.style.display = "";
	}
	
	displayCheck();
}

function getPieceText(chr){
	switch(chr){
		case "K":
			return "&#9818;";
		case "Q":
			return "&#9819;";
		case "R":
			return "&#9820;";
		case "B":
			return "&#9821;";
		case "N":
			return "&#9822;";
		case "p":
			return "&#9823;";
		default:
			throw "Invalid Piece";
			return;
	}
}

function disableActiveGrid(){
	for(let i=0; i<8; i++){
		for(let j=0; j<8; j++){
			gridArrayHTML[i][j].classList.remove("activegrid");
		}
	}
}

function setMoveLocations(nI, nJ){
	var validMoves = getValidMoves(nI, nJ);
	var colour = gridArrayInfo[nI][nJ].substr(1,1);
	for(var square of validMoves){
		// set state as if piece had moved
		for(let i=0; i<8; i++){
			for(let j=0; j<8; j++){
				gridArrayInfoCheck[i][j] = gridArrayInfo[i][j];
			}
		}
		swapGrids();
		movePiece2({ii:nI, jj:nJ},{ii:square[0], jj:square[1]}, false);
		
		if((nI == square[0] && nJ == square[1]) || !checkCheck(colour, colour)){
			makeMoveOption(square[0], square[1]);
		}
		
		// revert gridArray to proper functionality
		swapGrids();
	}
}

function swapGrids(){
	let tempArr = gridArrayInfo;
	gridArrayInfo = gridArrayInfoCheck;
	gridArrayInfoCheck = tempArr;
}

function getValidMoves(nI, nJ){
	var tempI, tempJ;
	var valid;
	
	var validMoves = [[]];
	validMoves[0] = [nI, nJ];
	var validMovesCount = 1;
	
	var testingPromotion = gridArrayInfo[nI][nJ].substr(0,1) == "X" ? true : false;
	
	switch(gridArrayInfo[nI][nJ].substr(0,1)){
		case "K":
			// Check Checks
		
			for(let i=-1; i<=1; i++){
				for(let j=-1; j<=1; j++){
					if(i==0 && j==0) continue;
					
					tempI = nI + i;
					tempJ = nJ + j;
					
					if(squareIsValid(tempI, tempJ, nI, nJ)){
						validMoves[validMovesCount++] = [tempI, tempJ];
					}
				}
			}
			
			// Castling
			if(gridArrayInfo[nI][nJ].length == 3){
				var rowI = gridArrayInfo[nI]
				
				if(rowI[0].length == 3 && rowI[1] == "" && rowI[2] == "" && rowI[3] == ""){
					validMoves[validMovesCount++] = [nI, 2];
				}
				if(rowI[7].length == 3 && rowI[5] == "" && rowI[6] == ""){
					validMoves[validMovesCount++] = [nI, 6];
				}
			}
			
			// Add can't move through check
			break;
		case "X":
		case "Q":
			for(let i=-1; i<=1; i++){
				for(let j=-1; j<=1; j++){
					if(i==0 && j==0) continue;
				
					tempI = nI;
					tempJ = nJ;
					valid = true;
					while(valid){
						tempI += i;
						tempJ += j;
						
						if(squareIsValid(tempI, tempJ, nI, nJ)){
							validMoves[validMovesCount++] = [tempI, tempJ];
							if(!isEmpty(tempI, tempJ)) valid = false;
						}
						else valid = false;
					}
				}
			}
			if(!testingPromotion) break;
		case "B":			
			for(let i=-1; i<=1; i+=2){
				for(let j=-1; j<=1; j+=2){
					tempI = nI;
					tempJ = nJ;
					valid = true;
					while(valid){
						tempI += i;
						tempJ += j;
						
						if(squareIsValid(tempI, tempJ, nI, nJ)){
							validMoves[validMovesCount++] = [tempI, tempJ];
							if(!isEmpty(tempI, tempJ)) valid = false;
						}
						else valid = false;
					}
				}
			}
			break;
		case "N":
			var knightLocations = [[2,1],[2,-1],[1,2],[1,-2],[-1,2],[-1,-2],[-2,1],[-2,-1]];
			
			for(let k of knightLocations){
				if(squareIsValid(nI+k[0], nJ+k[1], nI, nJ)) validMoves[validMovesCount++] = [nI+k[0], nJ+k[1]];
			}
			
			if(!testingPromotion) break;
		case "R":
			for(let i=-1; i<=1; i++){
				for(let j=-1; j<=1; j++){
					if(i*j != 0) continue;
					if(i==0 && j==0) continue;
					
					tempI = nI;
					tempJ = nJ;
					valid = true;
					while(valid){
						tempI += i;
						tempJ += j;
						
						if(squareIsValid(tempI, tempJ, nI, nJ)){
							validMoves[validMovesCount++] = [tempI, tempJ];
							if(!isEmpty(tempI, tempJ)) valid = false;
						}
						else valid = false;
					}
				}
			}
			
			break;
		case "p":
			let forwardFree = false;
			let dir = (gridArrayInfo[nI][nJ].substr(1,1) == "w") ? -1 : 1; 
			tempI = nI+dir;
			
			if(onBoard(tempI, nJ) && isEmpty(tempI, nJ)){
				validMoves[validMovesCount++] = [tempI, nJ];
				forwardFree = true;
			}
			
			for(j of [-1, 1]){
				tempJ = nJ + j;
				
				if(squareIsValid(tempI, tempJ, nI, nJ) && !isEmpty(tempI, tempJ)) validMoves[validMovesCount++] = [tempI, tempJ];
				
				else if(isEmpty(tempI, tempJ) && gridArrayInfo[nI][tempJ].substr(2,1) == "E") validMoves[validMovesCount++] = [tempI, tempJ];
			}
			
			// Double move
			if(forwardFree && gridArrayInfo[nI][nJ].substr(2,1) == "0"){
				tempI = nI + 2*dir;
				if(onBoard(tempI, nJ) && isEmpty(tempI, nJ)) validMoves[validMovesCount++] = [tempI, nJ];
			}
			
			// Add en-passant
			
			
			break;
		default:
			alert("Error: invalid piece on board: " + gridArrayInfo[nI][nJ]);
			break;
	}
	
	return validMoves;
}

function makeMoveOption(ii, jj){
	gridArrayHTML[ii][jj].classList.add("activegrid");
	gridArrayHTML[ii][jj].classList.add("validmove");
}

function squareIsValid(tempI, tempJ, ii, jj){
	if(tempI == ii && tempJ == jj) return true;
	if(!onBoard(tempI, tempJ)) return false;
	if(isAlly(tempI, tempJ, ii, jj)) return false;
	return true;
}

function isEmpty(ii, jj){
	return (gridArrayInfo[ii][jj] == "") ? true : false;
}

function isAlly(ii, jj, selfI, selfJ){
	return (gridArrayInfo[ii][jj].substr(1,1) == gridArrayInfo[selfI][selfJ].substr(1,1)) ? true : false;
}

function onBoard(ii, jj){
	return (ii>=0 && ii<8 && jj>=0 && jj<8) ? true : false;
}

function cancelMoveLocations(){
	for(let i=0; i<8; i++){
		for(let j=0; j<8; j++){
			gridArrayHTML[i][j].classList.remove("activegrid");
			gridArrayHTML[i][j].classList.remove("validmove");
		}
	}
}

function movePiece(){
	var node = this;
	timerState = 1;
	if(node.classList.contains("activegrid")){ // to this square
		if(selectingMove){
			newNodeGlobal = node;
		}
		else{ // from this square
			selectingMove = true;
			var nI = node.ii;
			var nJ = node.jj;
			
			disableActiveGrid();
			
			setMoveLocations(nI, nJ);
		
			waitForMove(movePiece2);		
			
			function waitForMove(callback){
				if(newNodeGlobal === null) setTimeout(waitForMove, 100, callback);
				else callback(node, newNodeGlobal);
			}
		}
	}
}

async function movePiece2(node, newNode, isReal = true){
	var nextTurn = node.ii == newNode.ii && node.jj == newNode.jj ? false : true;

	var value = gridArrayInfo[node.ii][node.jj];
	gridArrayInfo[node.ii][node.jj] = "";
	gridArrayInfo[newNode.ii][newNode.jj] = nextTurn ? value.substr(0,2) : value;
	
	if(isReal){
		cancelMoveLocations();
	}
	
	// En-Passant setup
	if(Math.abs(node.ii - newNode.ii) == 2 && node.jj - newNode.jj == 0 && value.substr(0,1) == "p"){
		gridArrayInfo[newNode.ii][newNode.jj] += "E";
	}
	
	// En-Passant action
	let colourDir = blackTurn ? 1 : -1;
	if(newNode.ii - node.ii == colourDir && Math.abs(node.jj - newNode.jj) == 1 && gridArrayInfo[node.ii][newNode.jj].substr(2,1) == "E"){
		gridArrayInfo[node.ii][newNode.jj] = "";
	}
	
	// Castling
	if(value.includes("K")){
		if((node.jj-newNode.jj)*(node.jj-newNode.jj) == 4){
			if(node.jj > newNode.jj){
				node = {ii:node.ii, jj:0};
				newNode = {ii:node.ii, jj:3};
			}
			else{
				node = {ii:node.ii, jj:7};
				newNode = {ii:node.ii, jj:5};
			}
		
			value = gridArrayInfo[node.ii][node.jj];
			gridArrayInfo[node.ii][node.jj] = "";
			gridArrayInfo[newNode.ii][newNode.jj] = value.substr(0,2);
		}
	}
	
	var newVal = gridArrayInfo[newNode.ii][newNode.jj]
	
	// Promotion
	if(newVal.substr(0,1) == "p"){
		if(  (newVal.substr(1,1) == "w" && newNode.ii == 0) 
		  || (newVal.substr(1,1) == "b" && newNode.ii == 7)){
			if(isReal){// choose a piece to promote to
				let promoteOption = null;
				let waitForPromote;
				
				displayPromotions();
				function displayPromotions(){
					var op = square.cloneNode();
					op.classList.add("promotion");
					op.classList.add("activegrid");
					
					var x = newNode.ii == 0 ? -50 - 10 : 8*50 + 10;
					var y = newNode.jj * 50;
					
					op.style.position = "absolute";
					
					var prNod = [
						op.cloneNode(),
						op.cloneNode(),
						op.cloneNode(),
						op.cloneNode()
					];
					var pieces = ["R","Q","N","B"];
					
					for(let i=0; i<4; i++){
						grid.appendChild(prNod[i]);
						prNod[i].style.top = x+"px";
						prNod[i].style.left = (y - 75 + i*50)+"px";
						prNod[i].innerHTML = "<p>"+pieces[i]+"</p>";
						prNod[i].addEventListener("click", selectPromotion);
					}
				}
				function selectPromotion(){
					promoteOption = this.textContent;
					
					var p = grid.getElementsByClassName("promotion");
					for(let i=3; i>=0; i--){
						grid.removeChild(p[i]);
					}
				}
			
				let getPromotion = new Promise((resolve, reject) => {
					a();
					
					async function a(){
						while(promoteOption === null){
							waitForPromote = new Promise((resolve, reject) =>{
								setTimeout(resolve, 100);
							});
							
							await waitForPromote;
						}
						
						resolve();
					}
				});
				
				await getPromotion;
				gridArrayInfo[newNode.ii][newNode.jj] = promoteOption + newVal.substr(1);
			}
			else{// somehow make 4 possible moves, to rook/knight/bishop/queen
				gridArrayInfo[newNode.ii][newNode.jj] = "X" + newVal.substr(1);
			}
		}
	}
	
	if(isReal){
		newNodeGlobal = null;
		selectingMove = false;
		
		if(nextTurn) blackTurn = !blackTurn;
		else blackTurnOld = null;
		
		updateBoard();
	}
}

function displayCheck(){
	mateBlack.style.display = "none";
	mateWhite.style.display = "none";
	if(checkCheck("b", "b")){
		checkBlack.style.display = "";
		if(mateCheck("b")){
			mateBlack.style.display = "";
			timerState = 3;
		}
		else{
			mateBlack.style.display = "none";
		}
	}
	else{
		if(mateCheck("b")){
			checkBlack.style.display = "";
			checkBlack.innerHTML = "STALE";
			mateBlack.style.display = "";
			timerState = 3;
		}
		else{
			checkBlack.style.display = "none";
			mateBlack.style.display = "none";
		}
	}
	if(checkCheck("w", "w")){
		checkWhite.style.display = "";
		if(mateCheck("w")){
			mateWhite.style.display = "";
			timerState = 3;
		}
		else{
			mateWhite.style.display = "none";
		}
	}
	else{
		checkWhite.style.display = "none";
		mateWhite.style.display = "none";
	}
}

function checkCheck(moveColour, kingColour){
	var info = null;
	var inI, inJ;
	
	for(let i=0; i<8; i++){
		for(let j=0; j<8; j++){
			
			if(gridArrayInfo[i][j].substr(0,2) == "K"+kingColour){
				info = gridArrayInfo[i][j];
				inI = i;
				inJ = j;
				break;
			}
		}
		if(!(info===null)) break;
	}
	
	if(info===null) throw("No K"+kingColour+" found");
	
	for(let i=0; i<8; i++){
		for(let j=0; j<8; j++){
			if(isEmpty(i, j)) continue;
			if((moveColour == kingColour) == isAlly(i, j, inI, inJ)) continue;
			
			if(movesInclude(i, j, inI, inJ)){
				return true;
			}
		}
	}
	return false;
}

function movesInclude(nI, nJ, ti, tj){
	for(let move of getValidMoves(nI, nJ)){
		if(move[0] == ti && move[1] == tj){
			return true;
		}
	}
	return false;
}

function mateCheck(colour){
	var notColour = colour == "b" ? "w" : "b";
	var validMoves, info;
	
	for(let i=0; i<8; i++){
		for(let j=0; j<8; j++){
			info = gridArrayInfo[i][j];
			if(info.substr(1,1) == colour){
				validMoves = getValidMoves(i,j);
				
				for(var square of validMoves){
					if(square[0] == i && square[1] == j) continue;
					// set state as if piece had moved
					for(let i2=0; i2<8; i2++){
						for(let j2=0; j2<8; j2++){
							gridArrayInfoCheck[i2][j2] = gridArrayInfo[i2][j2];
						}
					}
					swapGrids();
					movePiece2({ii:i, jj:j},{ii:square[0], jj:square[1]}, false);
					
					if(!(i == square[0] && j == square[1]) && !checkCheck(colour, colour)){
						// console.log(`${gridArrayInfo[i][j]} moving from ${i},${j} to ${square[0]},${square[1]} prevents check`); 
						
						swapGrids();
						return false;
					}
					else{
						// revert gridArray to proper functionality
						swapGrids();
					}
				}
			}
		}
	}

	return true;
}

function incrementTimer(){
	if(timerState == 1){
		if(blackTurn){
			blackTime+=0.1;
			timerBlack.innerHTML = Math.floor(blackTime/60) + " : " + ("0"+(Math.floor(blackTime)%60)).slice(-2);
		}
		else{
			whiteTime+=0.1;
			timerWhite.innerHTML = Math.floor(whiteTime/60) + " : " + ("0"+(Math.floor(whiteTime)%60)).slice(-2);
		}
	}
}