//Array extensions
+function(Array) {
	//Creates a new list out of the two supplied by applying the function to each equally-positioned pair in the lists
	if (!Array.prototype.zipWith) {
		Array.prototype.zipWith = function(fn, oldArray) {
			const newArray = [];
			const length = Math.min(this.length, oldArray.length);
			let i = -1;
			while(++i < length) {
				newArray[i] = fn(this[i], oldArray[i]);
			}
			return newArray;
		}
	}
	//Takes the array and applys it to a returning function
	if (!Array.prototype.transform) {
		Array.prototype.transform = function(fn) {
			return fn(this);
		}
	}
	//Takes an argument and puts it in the array in the last position
	if (!Array.prototype.append) {
		Array.prototype.append = function(element) {
			return this.concat([element]);
		}
	}
	//Gets the first element in the array or returns undefined
	if (!Array.prototype.head) {
		Array.prototype.head = function() {
			return this.length > 0 ? this[0] : undefined;
		}
	}
	//Takes a predicate function and tests to see if every element in the array comes out true
	//If it does return the array, if not return and empty array
	if (!Array.prototype.everyOrNothing) {
		Array.prototype.everyOrNothing = function(predicate) {
			return this.every(predicate) ? this : [];
		}
	}
	//Takes a predicate function and tests to see if at least one element in the array comes out true
	//If it does return the array, if not return and empty array
	if (!Array.prototype.someOrNothing) {
		Array.prototype.someOrNothing = function(predicate) {
			return this.some(predicate) ? this : [];
		}
	}
	//Takes a number argument and uses it to find the element within that numbered index
	//Returns it in a new array
	if (!Array.prototype.take) {
		Array.prototype.take = function(number) {
			return this.slice(0, number);
		}
	}
	//Like Array.prototype.take but randomly takes the numbered argument amount into a new array and returns it back
	if (!Array.prototype.randomTake) {
		Array.prototype.randomTake = function(number) {
			const newArray = [];
			const tempArray = this.concat();
			let i = -1;
			number = Math.min(number, tempArray.length);
			while (++i < number) {
				let randomIndex = Math.floor(Math.random() * tempArray.length);
				newArray.push(tempArray[randomIndex]);
				tempArray.splice(randomIndex, 1);
			}
			return newArray;
		}
	}
	//Like Array.prototype.forEach but now returns the original array
	if (!Array.prototype.each) {
		Array.prototype.each = function(fn) {
			const length = this.length;
			let i = -1;
			while (++i < length) {
				fn(this[i]);
			}
			return this;
		}
	}
	//Creates an order of sequenced numbers with starting and ending numbers being inclusive
	//Array.range(0, 5) ---> [0, 1, 2, 3, 4, 5]
	if (!Array.range) {
		Array.range = function(from, to) {
			const array = [];
			while (from <= to) {
				array.push(from);
				from++;
			}
			return array;
		}
	}
}(Array);

const GAME = (function() { //Invoked function
	const players = [
		{playerID: '#player1', fillClass: 'box-filled-1', image: 'url(img/o.svg)', winClass: 'screen-win-one', type: 'O', active: false},
		{playerID: '#player2', fillClass: 'box-filled-2', image: 'url(img/x.svg)', winClass: 'screen-win-two', type: 'X', active: false}
	];
	
	
	
	//TicTac object used to keep the state of the board and game
	const TicTac = {
		player1: null,
		player2: null,
		activePlayer: null,
		mode: null,
		board: [[' ', ' ', ' '],   //The board represented in 2d array
				[' ', ' ', ' '],
				[' ', ' ', ' ']],
		winningCoordinates: 
		[
			[[0, 0], [0, 1], [0, 2]],
			[[1, 0], [1, 1], [1, 2]],
			[[2, 0], [2, 1], [2, 2]],
			[[0, 0], [1, 0], [2, 0]],
			[[0, 1], [1, 1], [2, 1]],
			[[0, 2], [1, 2], [2, 2]],
			[[0, 0], [1, 1], [2, 2]],
			[[0, 2], [1, 1], [2, 0]]
		],
		boardWipe() {
			this.board.map(row => row.fill(' '));
		},
		lookForWinner({x, y}) {
			return this.winningCoordinates.filter(coords => {
				return coords.some(([a,b]) => a === y && b === x);
			})
			.filter(coords => {
				return coords.every(([a,b]) => this.board[a][b] === this.activePlayer.type);
			})
			.reduce(() => true, false);
		},
		lookForTieGame() {
			return this.board.every(row => row.every(type => type !== ' '))
		},
		stampBoard({x, y}) {
			this.board[y][x] = this.activePlayer.type;
		},
		addPlayers(player1, player2) {
			this.player1 = player1;
			this.player2 = player2;
		},
		randomOpener() {
			return Math.random() >= 0.5 ? this.player1 : this.player2;
		},
		randomTurns(turns) {
			const min = Math.ceil(1);
			return Math.floor(Math.random() * (Math.floor(turns) - min) + min);
		},
		checkForComputer() {
			return this.mode === 1 && this.activePlayer.name === 'Computer';
		},
		setActivePlayer(player) {
			player.active = true;
			this.activePlayer = player;
		},
		setMode(mode) {
			this.mode = mode;
		},
		getPlayer(className) {
			return this.player1.fillClass === className ? this.player1 : this.player2;
		},
		changeActivePlayer() {
			[this.activePlayer].each(player => player.active = false)
							   .filter(player => player.type === 'O')
							   .reduce(() => [this.player2], [this.player1])
							   .each(player => player.active = true)
							   .each(player => this.activePlayer = player);
		}
	}

	
	
	//Computer object to calculate AI moves for player 1 mode
	//Computer's prototype is TicTac object for board state purposes
	const Computer = {
		firstTurnCoords: [[0, 0], [0, 2], [2, 0], [2, 2]],
		getSpaces(board) {
			return board.reduce((listA, y, indexY) => {
				return listA.concat(y.reduce((listB, x, indexX) => {
					return listB.concat(x === ' ' ? [[indexY, indexX]] : []);
				}, []));
			}, []);
		},
		copyBoard(board) {
			return board.map(row => row.concat()).concat();
		},
		lookForTie(board) {
			return board.every(row => row.every(type => type != ' '));
		},
		lookForWinner(board) {
			return this.winningCoordinates
					   .map(coords => coords.map(([x, y]) => board[y][x]))
					   .some(types => types.every(type => type === 'O') || types.every(type => type === 'X'))
		},
		determineGameState(board) {
			if (this.lookForWinner(board)) return 2;
			if (this.lookForTie(board)) return 1;
			return 0;
		},
		setSpace(board, type) {
			return ([y, x]) => {
				const newBoard = this.copyBoard(board);
				newBoard[y][x] = type;
				return newBoard;
			}
		},
		score(depth, maxPlayer, gameState) {
			if (!maxPlayer && gameState === 2) return 10 - depth;
			if (gameState === 2) return depth - 10;
			return 0;
		},
		moves(board, type) {
			return this.getSpaces(board).map(this.setSpace(board, type), this);
		},
		alphaBeta(board) {
			return this.min(board, 0, -Infinity, Infinity, false);
		},
		max(board, depth, alpha, beta, maxPlayer) {
			const gameState = this.determineGameState(board);
			if (gameState !== 0)
				return this.score(depth, maxPlayer, gameState);
			let value = Number.NEGATIVE_INFINITY;
			for (let child of this.moves(board, 'X')) {
				value = Math.max(value, this.min(child, depth + 1, alpha, beta, false));
				alpha = Math.max(alpha, value);
				if (beta <= alpha) {
					return value;
				}
			}
			return value;
		},
		min(board, depth, alpha, beta, maxPlayer) {
			const gameState = this.determineGameState(board);
			if (gameState !== 0)
				return this.score(depth, maxPlayer, gameState);
			let value = Number.POSITIVE_INFINITY;
			for (let child of this.moves(board, 'O')) {
				value = Math.min(value, this.max(child, depth + 1, alpha, beta, true));
				beta = Math.min(beta, value);
				if (beta <= alpha) {
					return value;
				}
			}
			return value;
		},
		firstTurn() {
			return this.firstTurnCoords.randomTake(1);
		},
		nextMove() {
			return this.moves(this.board, 'X')
					   .map(this.alphaBeta, this)
					   .zipWith((score, coords) => ({score, coords}), this.getSpaces(this.board))
					   .reduce((list, obj) => obj.score > list[0].score ? [obj] : 
											  obj.score === list[0].score ? list.concat(obj) : 
											  list, [{score: -Infinity}])
					   .randomTake(1)
					   .reduce((list, obj) => obj.coords, []);
		}
	}

	
	
	//TicTacUI object controls the HTML elements and event handlers
	//TicTacUI's prototype is TicTac object to influence the state of TicTac
	const TicTacUI = {
		TT: TicTac,
		Computer: Computer,
		createStartScreen() {
			$('<div class="screen screen-start" id="start"></div>')
				.append('<header id="main-header"></header>')
				.children(':first-child')
				.append('<h1 class="title">Tic Tac Toe</h1>')
				.append(this.createScreenButton('1p vs Comp'))
				.append(this.createScreenButton('1p vs 2P'))
				.parents('#start')
				.appendTo('body');
		},
		createWinScreen() {
			$(`<div class="screen screen-win ${this.activePlayer.winClass}" id="finish"></div>`)
				.append('<header></header>')
				.children(':first-child')
				.append('<h1>Tic Tac Toe</h1>')
				.append(`<p class="message">${this.activePlayer.name} Wins!</p>`)
				.append(this.createScreenButton('New Game'))
				.parents('#finish')
				.appendTo('body');
		},
		createTieScreen() {
			$('<div class="screen screen-win screen-win-tie" id="finish"></div>')
				.append('<header class="cat"></header>')
				.children(':first-child')
				.append('<h1>Tic Tac Toe</h1>')
				.append('<p class="message-tie">Cat\'s Game!</p>')
				.append(this.createScreenButton('New Game'))
				.parents('#finish')
				.appendTo('body');
		},
		createSVGButton() {
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			svg.setAttributeNS(null, 'width', '100%');
			svg.setAttribute(null, 'height', '100%');
			svg.setAttributeNS(null, 'viewBox', '0 0 300 125');
			svg.setAttributeNS(null, 'preserveAspectRatio', 'none');
			path.setAttributeNS(null, 'd', 'M286.5,113C286.5,113,182.5,113,150,113C114.25,113,13.5,113,13.5,113C13.5,113,13.5,73.583,13.5,60.5C13.5,48.333,13.5,12,13.5,12C13.5,12,115.333,12,150,12C183.583,12,286.5,12,286.5,12C286.5,12,286.5,47.917,286.5,60.5C286.5,73.167,286.5,113,286.5,113C286.5,113,286.5,113,286.5,113');
			svg.appendChild(path);
			return svg;
		},
		createScreenButton(text) {
			return (i, elm) => {
				const elements = ['button', 'span', 'span'];
				const properties = [{className: 'elastic-button'}, {className: 'elastic-wrap'}, {className: 'elastic-text', textContent: text}];
				return elements.map(name => document.createElement(name))
						 .zipWith((element, value) => $(element).prop(value).get(0), properties)
						 .append(this.createSVGButton())
						 .transform(([button, spanWrap, spanText, svg]) => [[button, [spanWrap, spanText]], [spanWrap, [svg]]])
						 .map(([parent, children]) => $(parent).append(children).get(0))
						 .head();
			}
		},
		createNameInputs(number) {
			Array.range(1, number)
				 .forEach(number => {
					 $(`<input class="input-name" id="namep${number}" type="text" placeholder="P${number} Name">`)
						.on('keyup', this.checkNamesInput.bind(this))
						.appendTo('#main-header')
				 });
		},
		createCircleButton() {
			$('#main-header').filter((i, elm) => !$(elm).children('.start-button').get(0))
							 .append('<a href="#" class="start-button start-button-in">Start</a>')
							 .each(this.startGame.bind(this));
		},
		removeCircleButton() {
			$('.start-button').replaceWith('<a href="#" class="start-button start-button-out">Start</a>') //need to replace it to allow the animation to start adding the class alone will not work
			setTimeout(() => {    				//setTimeout used to allow animations to finish
				$('.start-button').remove();
			}, 300)
		},
		whoStartsAnimation(box$) {
			$(`<div class="turn-message">${this.activePlayer.name} Goes First!</div>`)
				.appendTo('body');
			setTimeout(() => { //setTimeout used to allow animations to finish
				[box$].each(box => {
					$('.turn-message').remove();
					box$.replaceWith('<li class="box"></li>');
					$(this.activePlayer.playerID).addClass('active');
					this.boxHandler.bind(this)();
				})
				.filter(this.checkForComputer, this) //If 1 player is enabled
				.each(this.computerFirstTurn.bind(this)) //Will play out computers first move to randomly choose either of the four corners and place it
			}, 3500)
		},
		choosingWhoStarts() {
			const mainBox$ = $('.boxes .box').filter((i, elm) => i === 4);
			const delay = 200;
			const timed = count => {
				[count].filter(count => count !== 0)
					   .each(count => {
						   mainBox$.toggleClass(`${this.player1.fillClass} ${this.player2.fillClass}`)
						   setTimeout(timed, delay, --count); //Recursive setTimeout allows the swapping animation to work
					   })
					   .reduce(() => [], [mainBox$.attr('class')])
					   .map(classNames => classNames.split(' ')[1])
					   .map(className => this.getPlayer(className))
					   .each(player => {
						   this.setActivePlayer.call(this.TT, player);
						   this.whoStartsAnimation(mainBox$);
						   $('.screen-start').remove();
					   });
			}
			setTimeout(timed, delay, this.randomTurns(20)); //Delays are used to see the constant swapping of X and O or else you would not be able to see the animation
		},
		checkElementFillclassOrNothing(element) {
			return [$(element).attr('class')]
					 .map(string => string.split(' '))
					 .head()
					 .filter(string => string === this.player1.fillClass || string === this.player2.fillClass)
					 .reduce(() => [], [element]);
		},
		boardWipeUI() {//Clears the board in TicTac and TicTacUI when games restarts
			$('.box').replaceWith('<li class="box"></li>');
			$('.players').removeClass('active');
			this.boardWipe();
		},
		translateCoords([y, x]) {//Used to translate 2d array position to 1d array position on the UI
			return y * 3 + x;
		},
		computerFirstTurn() {
			this.Computer.firstTurn().map(this.translateCoords, this)
									 .each(index => $('.box').eq(index).trigger('click'));
		},
		computerTurn() {
			[this.Computer.nextMove()].map(this.translateCoords, this)
									  .each(index => $('.box').eq(index).trigger('click'));
		},
		
		
		//Event handlers
		buttonsExit() {
			$('.elastic-button').on('click', event => {
				const text = $(event.target).parents('.elastic-button').children('.elastic-text').text();
				const elasticButtons = $('.elastic-button');
				elasticButtons.addClass('goodbye-buttons').off();
				setTimeout(() => {
					[text].filter(text => text.includes('Comp'))
						  .reduce(() => [1], [2])
						  .forEach(number => {
							 elasticButtons.remove();
							 this.createNameInputs(number);
							 this.setMode.call(this.TT, number);
						  });
				}, 800);
			})
		},
		buttonNewGame() {
			$('.elastic-button').on('click', event => {
				$('#finish').remove();
				this.createStartScreen();
				this.buttonsExit();
				this.boardWipeUI.call(this);
			});
		},
		checkNamesInput() {
			$('.input-name').get()
							.map(element => element.value)
							.everyOrNothing(value => value !== '')
							.take(1)
							.each(this.createCircleButton.bind(this))
							.reduce(() => [], [true])
							.each(this.removeCircleButton.bind(this));
		},
		startGame() {
			$('.start-button').on('click', event => {
				const names = $('.input-name').map((i, element) => element.value).toArray();
				const playerName = document.querySelectorAll('.player-name');
				const mainBox = $('.boxes .box').get(4);
				$('.screen-start').addClass('screen-out');
				names.reduce((list, name) => [list[0].concat(name)], [[]])
					 .filter(array => array.length !== 2)
					 .reduce((names, array) => array.concat('Computer'), names)
					 .zipWith((playerName, player) => Object.assign({name: playerName}, player), players)
					 .reduce((list, player) => [list[0].concat(player)], [[]])
					 .each(([player1, player2]) => this.TT.addPlayers(player1, player2))
					 .map(() => [this.TT.player1.name, this.TT.player2.name])
					 .head()
					 .forEach((name, index) => $(playerName[index]).text(name));
						
				setTimeout(() => {
					[this.randomOpener()].each(player => {
						$(mainBox).addClass(player.fillClass)
						this.choosingWhoStarts();
					});
				}, 500)
			});
		},
		boxHandler() {
			$('.box').hover(
			event => {
				[event.target].map(this.checkElementFillclassOrNothing.bind(this))
							  .each(box => $(box).css('background-image', this.activePlayer.image))
			},
			event => {
				[event.target].map(this.checkElementFillclassOrNothing.bind(this))
							  .each(box => $(box).css('background-image', 'none'));
			})
			.on('click', event => {
				[event.target].map(this.checkElementFillclassOrNothing.bind(this))
							  .head()
							  .each(element => $(element).addClass(this.activePlayer.fillClass))
							  .each(element => $(element).css('background-image', this.activePlayer.image))
							  .each(element => $(element).off())
							  .each(() => $(this.activePlayer.playerID).removeClass('active'))
							  .map(element => $('.box').index(element))
							  .map(index => ({x: index % 3, y: Math.floor(index / 3)}))
							  .each(this.stampBoard.bind(this))
							  .filter(this.lookForWinner.bind(this))  //if there is a winner
							  .each(this.createWinScreen.bind(this))
							  .each(this.buttonNewGame.bind(this))
							  .reduce(() => [], [event.target])
							  .filter(this.lookForTieGame.bind(this)) //if there is a tie
							  .each(this.createTieScreen.bind(this))
							  .each(this.buttonNewGame.bind(this))
							  .reduce(() => [], [event.target])       //if there is no winner or tie game
							  .each(this.changeActivePlayer.bind(this.TT))
							  .each(() => $(this.activePlayer.playerID).addClass('active'))
							  .filter(this.checkForComputer, this)    //if one player is enabled
							  .each(this.computerTurn.bind(this))
			});
		}
	}

	Object.setPrototypeOf(TicTacUI, TicTac);
	Object.setPrototypeOf(Computer, TicTac);
	
	return {UI: TicTacUI};
})();

GAME.UI.createStartScreen();
GAME.UI.buttonsExit();