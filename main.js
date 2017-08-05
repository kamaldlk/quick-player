(function () {
	"use strict";

	// imports
	var CommandEnum = com.dgsprb.quick.CommandEnum;
	var Quick = com.dgsprb.quick.Quick;
	var GameObject = com.dgsprb.quick.GameObject;
	var Rect = com.dgsprb.quick.Rect;
	var Scene = com.dgsprb.quick.Scene;

	// serialized game in open-game-lang
	var game = {
		name: "Quick Player Paddle Demo",
		animation: {},

		object: {
			background: {
				color: "green",
				width: "SCREEN_WIDTH",
				height: "SCREEN_HEIGHT"
			},

			ball: {
				imageId: "ballSprite",
				boundary: "SCREEN_BOUNDARY",
				essential: true,
				speedX: "RANDOM 1..3",
				speedY: "RANDOM 1..3",

				collision: {
					paddle: {
						bounceFrom: null,
						play: "pingSound"
					},

					default: {
						bounceFrom: null,
						play: "pongSound"
					}
				}
			},

			paddle: {
				imageId: "paddleSprite",
				solid: true,
				centerX: "SCREEN_HALF_X",
				bottom: 384,
				controller: 0,

				controls: {
					left: {
						moveX: -4
					},

					right: {
						moveX: 4
					}
				}
			},

			pipe: {
				solid: true
			},

			horizontalPipe: {
				inherit: "pipe",
				imageId: "horizontalPipeSprite",
				width: "SCREEN_WIDTH"
			},

			verticalPipe: {
				inherit: "pipe",
				imageId: "verticalPipeSprite",
				height: "SCREEN_HEIGHT"
			}
		},

		scene: {
			first: {
				objects: [
					{
						name: "background"
					},

					{
						name: "horizontalPipe"
					},

					{
						name: "verticalPipe"
					},

					{
						name: "verticalPipe",
						right: "SCREEN_WIDTH"
					},

					{
						name: "ball",
						top: 16,
						left: 16
					},

					{
						name: "paddle"
					}
				],

				next: "first"
			}
		}
	};

	function main() {
		var hash = game;

		for (var key in hash) {
			var value = hash[key];

			switch (key) {
				case "animation":
				break;

				case "object":
				break;

				case "scene":
				break;

				default:
					Quick[method(key)](value);
				break;
			}
		}

		Quick.init(function () {
			return sceneFactory("first");
		});
	}

	function method(word) {
		return "set" + word[0].toUpperCase() + word.slice(1);
	}

  function objectFactory(name) {
		var object = new GameObject();
		var hash = game.object[name];
		carve(object, hash);
		return object;
	}

  function sceneFactory(name) {
		var hash = game.scene[name];
		var scene = new Scene();

		for (var i = 0; i < hash.objects.length; ++i) {
			var object = objectFactory(hash.objects[i].name);
			carve(object, hash.objects[i]);
			scene.add(object);
		}

		scene.setDelegate({
			getNext: function () {
				return sceneFactory(hash.next);
			}
		});

		return scene;
	}

	function carve(object, hash) {
		for (var key in hash) {
			var value = hash[key];

			switch (key) {
				case "inherit":
					carve(object, game.object[value]);
				break;

				case "collision":
					object.setSolid();

					if (!object.delegate) {
						object.setDelegate({});
					}

					object.delegate.onCollision = onCollision;

					function onCollision(collider) {
						var match = false;

						for (var name in value) {
							if (collider.hasTag(name)) {
								match = true;
								perform(value[name]);
							}
						}

						!match && value["default"] && perform(value["default"]);

						function perform(actions) {
							for (var action in actions) {
								console.log(action);
								switch (action) {
									case "bounceFrom":
										object.bounceFrom(object.getCollision(collider));
									break;

									case "play":
										Quick.play(actions[action]);
									break;
								}
							}
						}
					}
				break;

				case "controller":
				  object.controller = Quick.getController(value);
				break;

				case "controls":
					if (!object.controller) {
						object.controller = Quick.getController();
					}

					if (!object.delegate) {
						object.setDelegate({});
					}

					object.delegate.update = onUpdate;

					function onUpdate() {
						for (var command in value) {
							if (object.controller.keyDown(CommandEnum[command.toUpperCase()])) {

								for (var action in value[command]) {
									object[action](value[command][action]);
								}
							}
						}
					}
				break;

				case "name":
					object.addTag(value);
				break;

				default:
					object[method(key)](translate(value));
				break;
			}
		}
	}

	function translate(word) {
		if (typeof word == "function") {
			return word();
		}

		if (typeof word != "string") {
			return word;
		}

		switch (word) {
			case "SCREEN_BOUNDARY":
				return Quick.getBoundary();
			break;

			case "SCREEN_HALF_X":
				return Quick.getWidth() / 2;
			break;

			case "SCREEN_HEIGHT":
				return Quick.getHeight();
			break;

			case "SCREEN_WIDTH":
				return Quick.getWidth();
			break;
		}

		if (word.indexOf("RANDOM ") == 0) {
			var args = word.slice(7).split("..");
			var lower = parseInt(args[0]);
			var upper = parseInt(args[1]);
			return lower + Quick.random(upper);
		}

		return word;
	}

	main();
})();
