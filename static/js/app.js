function init() {
	// Connect to the server's WebSocket
    var serverSock = new WebSocket("ws://" + window.location.host + "/sock/");

    serverSock.onmessage = function(message) {
		
		var jsonMessage = JSON.parse(message.data);


		if(jsonMessage.Event == "chatMessage") {
			// Add the chat message to the output box
			var chatOutput = document.getElementById("chat_output");
			chatOutput.innerHTML += jsonMessage.Data.User + ": " + (jsonMessage.Data.Message).replace(/[<>]/g, '') + "<br>";

			// Scroll to bottom of textbox
			chatOutput.scrollTop = chatOutput.scrollHeight;
		} else if(jsonMessage.Event == "screenUpdate") {
			viewCenter.x = jsonMessage.Data.ViewX;
			viewCenter.y = jsonMessage.Data.ViewY;

			updateData = jsonMessage.Data;

			update(updateData);
		} else if(jsonMessage.Event == "ping") {
			serverSock.send(JSON.stringify({
				Event   : "pong"
			}));
		}
	};


	// Init the stage
	var stage = new createjs.Stage("mainCanvas");

	// Init the mini map
	var miniMap = new createjs.Stage("miniMap");


	// Init the location, in map space, of the center (and therefor our player) of our view
	var viewCenter = {
		x : null,
		y : null
	}


	// Keypress listener
	var listener = new window.keypress.Listener();

	listener.register_many([
		{
		    "keys"       : "w",
		    "on_keydown" : function() {
	            serverSock.send(JSON.stringify({
					Event: "w down"
				}));
	        },
	        "on_keyup"   : function(e) {
	            serverSock.send(JSON.stringify({
					Event: "w up"
				}));
	        }
		},
		{
			"keys"       : "a",
		    "on_keydown" : function() {
	            serverSock.send(JSON.stringify({
					Event: "a down"
				}));
	        },
	        "on_keyup"   : function(e) {
	            serverSock.send(JSON.stringify({
					Event: "a up"
				}));
	        }
		},
		{
			"keys"       : "s",
		    "on_keydown" : function() {
	            serverSock.send(JSON.stringify({
					Event: "s down"
				}));
	        },
	        "on_keyup"   : function(e) {
	            serverSock.send(JSON.stringify({
					Event: "s up"
				}));
	        }
		},
		{
			"keys"       : "d",
		    "on_keydown" : function() {
	            serverSock.send(JSON.stringify({
					Event: "d down"
				}));
	        },
	        "on_keyup"   : function(e) {
	            serverSock.send(JSON.stringify({
					Event: "d up"
				}));
	    	}
	    },
	    {
			"keys"       : "f",
		    "on_keydown" : function() {
	            serverSock.send(JSON.stringify({
					Event: "f down"
				}));
	        },
	        "on_keyup"   : function(e) {
	            serverSock.send(JSON.stringify({
					Event: "f up"
				}));
	    	}
		}
	]);


	// Get the chat input box
	var chatInput = document.getElementById('chat_input');
	// Stop listening for keyboard events for the canvas when the chat box is focussed
	chatInput.addEventListener("focus", chatInputFocussed);
	function chatInputFocussed() {
		listener.stop_listening();
	} // end chatInputFocussed()
	// Start listening again when it loses focus
	chatInput.addEventListener("blur", chatInputFocusLost);
	function chatInputFocusLost() {
		listener.listen();
	} // end chatInputFocusLost()


    // Text chat input onkeydown event
	document.getElementById("chat_input").onkeydown = function(e) {
		// If the enter key is pressed
		if((e.keyCode || e.charCode) === 13) {
			// Get the input text
			var chatInputBox = document.getElementById("chat_input");

			if(chatInputBox.value == "") {
				return;
			} // end if

			// Send the chat message
			serverSock.send(JSON.stringify({
				Event: "chatMessage",
				Message : chatInputBox.value
			}));

			// Add the chat message to the output box
			var chatOutput = document.getElementById("chat_output");
			chatOutput.innerHTML += "You: " + (chatInputBox.value).replace(/[<>]/g, "") + "<br>";

			// Scroll to bottom of textbox
			chatOutput.scrollTop = chatOutput.scrollHeight;

			// Reset the chat input box
			chatInputBox.value = "";
		} // end if
	};

	// Sweet jesus the normal prompts are ugly
	var playerName = prompt("Please enter your player name");
	serverSock.send(JSON.stringify({
		Event   : "username",
		User    : playerName
	}));

	var currentNames = new Set();
	var nameCache = {};

	var sortFunction = function(obj1, obj2, options) {
	    if (obj1.name > obj2.name) { return 1; }
	    if (obj1.name < obj2.name) { return -1; }
	    return 0;
	}

    function update(updateData) {
    	// To cache an object: DisplayObject.cache()

    	// Get the mainCanvas
    	var mainCanvas = document.getElementById("mainCanvas");

		var newNames = new Set();
    	for (var i = 0; i < updateData.Objs.length; i++){
    		newNames.add(updateData.Objs[i].I)
    	}
    	newObjects = updateData.Objs;

    	removeOldChildren(newNames);

		// Place the far starfield
    	for (var i = mod(viewCenter.x * -0.1) - 512; i < mainCanvas.width; i += 512) {
    		for (var j = mod(viewCenter.y * -0.1) - 512; j < mainCanvas.height; j += 512) {
    			var starFieldFar = new createjs.Bitmap("img/starfield_far.png");
				starFieldFar.x = i;
				starFieldFar.y = j;
				starFieldFar.name = -3;

				stage.addChild(starFieldFar);
    		};
    	};

    	// Place the mid starfield
    	for (var i = mod(viewCenter.x * -0.4) - 512; i < mainCanvas.width; i += 512) {
    		for (var j = mod(viewCenter.y * -0.4) - 512; j < mainCanvas.height; j += 512) {
    			var starFieldNear = new createjs.Bitmap("img/starfield_near.png");
				starFieldNear.x = i;
				starFieldNear.y = j;
				starFieldNear.name = -2;

				stage.addChild(starFieldNear);
    		};
    	};

    	// Place the near starfield
    	for (var i = mod(viewCenter.x * -0.9) - 512; i < mainCanvas.width; i += 512) {
    		for (var j = mod(viewCenter.y * -0.9) - 512; j < mainCanvas.height; j += 512) {
    			var starFieldMid = new createjs.Bitmap("img/starfield_middle.png");
				starFieldMid.x = i;
				starFieldMid.y = j;
				starFieldMid.name = -1;

				stage.addChild(starFieldMid);
    		};
    	};




    	// Create and place each new object we're sent
    	for(var i = 0; i < updateData.Objs.length; i++) {
    		// Get the object we want to render
    		var currentObject = updateData.Objs[i];

    		var objectBitmap;
    		var addChildBool;

    		if(!currentNames.has(currentObject.I)) {
    			// Create the bitmap object
    			objectBitmap = new createjs.Bitmap("img/" + currentObject.N + ".png");

    			// Set the bitmap name to its unique id
    			objectBitmap.name = currentObject.I;

	    		addChildBool = true;
	    		nameCache[currentObject.I] = objectBitmap;
    		} else {
    			objectBitmap = nameCache[currentObject.I];
    			addChildBool = false;
    		} // end if/else

    		// Set the middle of the image
    		objectBitmap.regX = objectBitmap.image.width / 2;
    		objectBitmap.regY = objectBitmap.image.height / 2;

    		objectBitmap.x = Math.round(currentObject.X - viewCenter.x + mainCanvas.width/2);
    		objectBitmap.y = Math.round(currentObject.Y - viewCenter.y + mainCanvas.height/2);

    		createjs.Tween.get(objectBitmap).to({rotation:currentObject.R}, 100, createjs.Ease.circInOut)

    		// If the object is already on the stage, don't add it
    		if(addChildBool) {
    			stage.addChild(objectBitmap);
    		} // end if
    	} // end for

    	currentNames = newNames;
    	
		stage.sortChildren(sortFunction);

		stage.update();


		// Start updating mini map stuff

		var miniMapSize = {
			width  : document.getElementById("miniMap").width,
			height : document.getElementById("miniMap").height
		};

		miniMap.removeAllChildren();

		var circleGraphic = new createjs.Graphics().beginFill("Black").drawCircle(100, 100, 100);
		var circle = new createjs.Shape(circleGraphic);
		miniMap.addChild(circle);

		for(var i = 0; i < updateData.Planets.length; i++) {
			var currentPlanet = updateData.Planets[i];

			var planetBitmap = new createjs.Bitmap("img/" + "planet_python" + ".png");

			planetBitmap.regX = planetBitmap.image.width / 2;
			planetBitmap.regY = planetBitmap.image.height / 2;

			planetBitmap.x = Math.round(currentPlanet.X/100 + 100);
			planetBitmap.y = Math.round(currentPlanet.Y/100 + 100);

			planetBitmap.scaleX = 0.01;
			planetBitmap.scaleY = 0.01;

			miniMap.addChild(planetBitmap);
		}

		var miniShipBitmap = new createjs.Bitmap("img/" + "ship" + ".png");
		miniShipBitmap.regX = miniShipBitmap.image.width / 2;
		miniShipBitmap.regY = miniShipBitmap.image.height / 2;

		miniShipBitmap.x = Math.round(viewCenter.x/800 + 100);
		miniShipBitmap.y = Math.round(viewCenter.y/800 + 100);

		miniShipBitmap.scaleX = 0.1;
		miniShipBitmap.scaleY = 0.1;

		miniMap.addChild(miniShipBitmap);

		miniMap.update()
	} // end update()

	function removeOldChildren(newNames) {
		var toRemove = []
		for(var i = 0; i < stage.getNumChildren(); i++) {
			var child = stage.children[i];
			if (!newNames.has(child.name)){
				toRemove.push(child)
				delete nameCache[child.name]
			}
		}
		for(var i = 0; i < toRemove.length; i++){
			stage.removeChild(toRemove[i]);
		}
	} // end removeOldChildren()

	function mod(z) {
		z = z % 512;

		if(z < 0) {
			z += 512;
		} // end if

		return z;
	} // end mod()

} // end init()

