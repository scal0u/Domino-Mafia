// SOUNDS
var music1 = new Audio('audio/music.mp3');
music1.volume = 0.2;
music1.loop = true;


var myGunshot = new Audio('audio/laser_sound.m4a');
var enemyFalling = new Audio('audio/thud.m4a');
var bulletPang = new Audio('audio/bulletPang.m4a');

var enemyGunshot = new Audio('audio/laser_sound.m4a');
enemyGunshot.volume = 0.4;

var chopperNoise = new Audio('audio/chopper.mp3');
chopperNoise.volume = .7;
chopperNoise.loop = true;

var flatTire = new Audio('audio/flatTire.mp3');
flatTire.volume = .3;

var crash = new Audio('audio/explosion.mp3');
crash.volume = .7;


// DEFINE INTERVALS TO AVOID TROUBLE
var roadMovingInterval;
var carSwervingInterval;
var carScaleInterval;
var carShakeInterval;
var heliceFlapInterval;
var chopperSwervingInterval;
var chopperScaleInterval;
var enemyShotsTimeout;

// SOME ESSENTIAL VARIABLES
const gameFrame = document.querySelector("#gameFrame");

var myLifePoints = 100;
var enemyShotDamage = 20;
var enemyShotsTimeout;

function livingEnemies(mode) {
	var selector = ".level.current .enemy:not(.dead)";
	if(mode == 'level5') selector += ":not(.enemyVehicle:not(.openWindow) .enemy)";
	return document.querySelectorAll(selector);
}


// ENEMY SHOOTS ME
function enemyShootsMe(enemy) {
	if(enemy) {
		enemy.classList.add("showing");
		setTimeout(function() {
			if(!enemy.classList.contains("dead")) {
				enemyGunshot.play();
				enemy.classList.add("shooting");
				gameFrame.classList.add("enemyShooting");
				updateLifePoints(myLifePoints - enemyShotDamage);
				setTimeout(function() {
					enemy.classList.remove("shooting");
					gameFrame.classList.remove("enemyShooting");
					setTimeout(function() {
						enemy.classList.remove("showing");
					}, 150);
				}, 500);
			}
		}, 1100);
	}
}

// ELEMENT OF SURPRISE
function randomEnemyShots() {

	if(myLifePoints > 0) {

		var emz = livingEnemies(document.querySelector(".level.current").id);

		if(emz) {
			var randomEnemy = Math.floor(Math.random() * emz.length);
			var randomDelay = Math.floor(Math.random() * 2000) + 500;

			enemyShotsTimeout = setTimeout(function() {
				if(myLifePoints > 0) {
					enemyShootsMe(emz[randomEnemy]);
					randomEnemyShots();	
				}
			}, randomDelay);
		}

	}

}


// DAMAGE AND DEATH
function updateLifePoints(amount) {
	myLifePoints = amount;
	if(myLifePoints < 1) {
		myLifePoints = 0;
		setTimeout(function() {
			if(livingEnemies().length) {
				music1.volume = 1;
				gameFrame.classList.add("playerDead");
			}
		}, 500);
	}
	if(myLifePoints > 100) myLifePoints = 100;
	document.getElementById("healthBar").style.width = myLifePoints+"%";
}

function getNextLevel() {
	return document.querySelector(".level:not(.current):not(.past)");	
}


// I SHOOT THE ENEMIES
function iShoot(enemy) {

	/* Consequences on the enemies */
	enemy.classList.remove("shooting");
	enemy.classList.remove("showing");
	enemy.classList.add("dead");
	if(["level1", "level2"].indexOf(document.querySelector(".level.current").id) > -1) {
		setTimeout(function() {
			enemyFalling.play();
		}, 300);
	}

	assessVictory();
}

// VISUAL AND SOUND EFFECTS WHEN I SHOOT
function myShootingEffects() {
	myGunshot.play();
	gameFrame.classList.add("playerShooting");
	setTimeout(function() {
		gameFrame.classList.remove("playerShooting");
	}, 150);
}


// DID I WIN?
function assessVictory() {
	/* Victory! */
	if(!livingEnemies().length) {
		setTimeout(function() {

			// Is there a further level
			if(getNextLevel()) {
				var currentLevel = document.querySelector(".level.current");
				currentLevel.classList.add("past");
				currentLevel.classList.remove("current");
				getNextLevel().classList.add("current");
				updateLifePoints(myLifePoints+40);

				// Level 3 intervals
				if(document.querySelector(".level.current").id == 'level3') {
					setTimeout(function() {
						document.querySelector("#garageDoor").classList.add("open");
					}, 1000);
					setTimeout(function() {
						level3intervals();
					}, 2000);
				}

				// Level 4 functions
				if(document.querySelector(".level.current").id == 'level4') {
					level4intervals();
					clearLevel3intervals();
				}

				// Level 5 functions
				clearLevel4intervals();
				level5intervals();

				// Reseting random attacks
				clearTimeout(enemyShotsTimeout);
				setTimeout(function() {
					randomEnemyShots()
				}, 4500);
			}
			else {
				music1.volume = 1;
				setTimeout(function() {
					gameFrame.classList.add("playerWon");
				}, 1000);
			}

		}, 300);
	}	
}


// GETTING THE GAME READY
function newGame() {

	clearTimeout(enemyShotsTimeout);

	document.querySelectorAll(".enemy").forEach(enemy => {
		enemy.classList = ["enemy"];			
	});
	document.querySelectorAll("#truck").forEach(truck => {
		truck.classList = ["truck"];			
	});
	document.querySelectorAll(".bulletImpact").forEach(bulletImpact => {
		bulletImpact.remove();			
	});

	if(document.querySelector(".level.current").id == 'level3') {
		clearLevel3intervals();
		level3intervals();
	}
	if(document.querySelector(".level.current").id == 'level4') {
		clearLevel4intervals();
		level4intervals();
	}
	if(document.querySelector(".level.current").id == 'level5') {
		// clearLevel5intervals();
		level5intervals();
	}


	// Reset levels
	// document.querySelectorAll(".level").forEach(level => {
	// 	level.classList = ["level"];
	// });
	// document.querySelectorAll(".level")[0].classList.add("current");

	updateLifePoints(100);
	gameFrame.classList = [];

	// music1.currentTime = 0;
	music1.volume = 0.2;
	music1.play();

	setTimeout(function() {
		randomEnemyShots();
	}, 4000);


}


document.querySelectorAll('.enemy').forEach(enemy => {

	enemy.addEventListener("click", function() {
		iShoot(enemy);
	});

});

document.querySelectorAll(".wall, .panel").forEach(wall => {

	wall.addEventListener("click", function(e) {
		if(!wall.classList.contains('helice')) {
			wall.innerHTML += "<div class='bulletImpact' style='top: "+e.offsetY+"px; left: "+e.offsetX+"px;'></div>";
		}
		setTimeout(function() {
			bulletPang.play();
		}, 50);
	});

});


// LEVEL 3

innerRoad = document.querySelector(".current .road .inner");
truck = document.querySelector("#truck");
function level3intervals() {
	// roadMovingInterval = setInterval(function() {
	// 	innerRoad.style.backgroundPositionY = (parseInt(innerRoad.style.backgroundPositionY) - 20) + "%";
	// }, 1000);
	carSwervingInterval = setInterval(function() {
		document.querySelector("#truck:not(.wheelShot)").style.left = (Math.random() * 60) + "%"; 
	}, 1500);
	carScaleInterval = setInterval(function() {
		document.querySelector("#truck:not(.wheelShot)").style.transform = "scale("+(Math.random() * .4 + .5)+") perspective(0)"; 
	}, 3000);	
}
// level3intervals();

function level4intervals() {

	document.querySelector("#chopper").classList = [];
	chopperHealth = 100;
	enemyShotDamage = 10;

	setTimeout(function() {
		chopperNoise.play();		
	}, 1000);
	heliceFlapInterval = setInterval(function() {
	    document.querySelectorAll(".helice").forEach(helice => {
	    	helice.classList.toggle("alter");
	    });
	}, 200);
	chopperSwervingInterval = setInterval(function() {
		document.querySelector("#chopper").style.left = (Math.random() * 60) + "%"; 
		document.querySelector("#chopper").style.top = (Math.random() * 80 - 15) + "%"; 
	}, 2500);
	chopperScaleInterval = setInterval(function() {
		var heliScale = (Math.random() * .4 + .1);
		chopperNoise.volume = heliScale;
		document.querySelector("#chopper").style.transform = "scale("+heliScale+") rotate("+(Math.random() * 40 - Math.random() * 40)+"deg)"; 
	}, 3000);	
}
// level4intervals();



function clearLevel3intervals() {
	clearInterval(roadMovingInterval);
	clearInterval(carSwervingInterval);
	clearInterval(carScaleInterval);
	clearInterval(carShakeInterval);
	flatTire.pause();
}


function clearLevel4intervals() {
	clearInterval(heliceFlapInterval);
	clearInterval(chopperSwervingInterval);
	clearInterval(chopperScaleInterval);
}


function shootWheel(wheel) {

	clearInterval(carScaleInterval);

	carShakeInterval = setInterval(function() {
		if(document.querySelector("#truck.wheelShot")) {
			flatTire.play();
			document.querySelector("#truck.wheelShot").classList.toggle("up"); 
		}
	}, 200);	
	
	if(truck.classList.contains("wheelShot")) {
		crash.play();
		flatTire.pause();
		setTimeout(function() {
			truck.classList.remove("wheelShot");
			truck.classList.add("broken");
			document.querySelectorAll("#truck .enemy").forEach(enemy => {
				enemy.classList.add("dead");
				assessVictory();
			});
		}, 1000);
	} else {
		truck.classList.add("wheelShot", wheel);
	}

}

// LEVEL 4
var chopperHealth = 100;
function shootChopper(score) {
	chopperHealth -= score;

	if(chopperHealth < 1) {
		clearLevel4intervals();
		setTimeout(function() {
			document.querySelector("#chopper").style = [];
			document.querySelector("#chopper").classList.add("crashing");

			document.querySelectorAll("#chopper .enemy").forEach(enemy => {
				enemy.classList.add("dead");
			});

			setTimeout(function() {
				crash.play();
				document.querySelector("#level4").classList.add("explosion");
				setTimeout(function() {
					document.querySelector("#level4").classList.remove("explosion");
					setTimeout(function() {
						assessVictory();
					}, 100);
				}, 800);		
			}, 1000);
		}, 1000);
	}

}


function resetEnemyShots() {
	clearTimeout(enemyShotsTimeout);
	randomEnemyShots();	
}


// LEVEL 5
function driveBy5(v) {

	enemyShotDamage = 5;

	v.style.left = "35%";

	setTimeout(function() {
		v.classList.add("openWindow");

		resetEnemyShots();

		// var enemies51 = document.querySelectorAll("#level5 #"+v.id+" .enemy:not(.dead)");

		// var randE = Math.floor(Math.random() * enemies51.length);
		// enemyShootsMe(enemies51[randE]);
		// setTimeout(function() {
		// 	var randE = Math.floor(Math.random() * enemies51.length);
		// 	enemyShootsMe(enemies51[randE]);			
		// }, 1000);
		// setTimeout(function() {
		// 	var randE = Math.floor(Math.random() * enemies51.length);
		// 	enemyShootsMe(enemies51[randE]);			
		// }, 2000);
		
		setTimeout(function() {
			v.classList.remove("openWindow");
			v.style.left = "120%";
			clearTimeout(enemyShotsTimeout);
		}, 8000);

		resetEnemyShots();
		// setTimeout(function() {
		// }, 4000);
	}, 2000);

}


var laneTimeOuts = [];
function carLaneTraffic(lane) {
	document.querySelector("#"+lane).classList.toggle("alter");
	var randomDelay = Math.random() * 15000 + 7000; 
	laneTimeOuts[lane] = setTimeout(function() {
		carLaneTraffic(lane);
	}, randomDelay);
}


function level5intervals() {

	carLaneTraffic("backLane");

	setTimeout(function() {
		carLaneTraffic("middleLane");

		setTimeout(function() {
			carLaneTraffic("frontLane");
		}, 1000);

	}, 1000);


	document.querySelectorAll("#level5 .enemyVehicle").forEach(env => {
		env.style.left = "-120%";
	});

	// v.style.left = "20%";

	if(!document.querySelector(".carLane .car")) {
		var lanes = [{name: "backLane", distance: 0}, {name: "frontLane", distance: 0}, {name: "middleLane", distance: 0}];
		var carTypes = ["capsule", "van", "jazz", "capsule", "van", "jazz", "cube"];
		var colors = ["maroon", "blue", "purple", "black", "tan"];
		for (var i = 0; i < 60; i++) {
			newCarHeight = Math.random() * 7.5;
			if(newCarHeight < 5) newCarHeight = 5;
			newCarWidth = Math.random() * 15;
			if(newCarWidth < 10) newCarWidth = 10;
			var chosenCarType = Math.floor(Math.random() * carTypes.length); 
			var chosenColor = Math.floor(Math.random() * colors.length); 
			var chosenLane = Math.floor(Math.random() * 3); 
			lanes[chosenLane].distance += Math.random() * 15 + 4;
			var newCar = "<div class='obstacle wall car "+colors[chosenColor]+" "+carTypes[chosenCarType]+"' onclick='car5explode(this)' style='left: "+lanes[chosenLane].distance+"em; height: "+newCarHeight+"em; width: "+newCarWidth+"em'></div>";
			document.querySelector("#"+lanes[chosenLane].name).innerHTML += newCar;
		}
	}


	chopperNoise.pause();


	setTimeout(function() {
		driveBy5(document.querySelector("#enemyVehicle1"));
		setTimeout(function() {
			driveBy5(document.querySelector("#enemyVehicle1"));
		}, 11000);
	}, 1000);
	setTimeout(function() {
		driveBy5(document.querySelector("#enemyVehicle2"));
		setTimeout(function() {
			driveBy5(document.querySelector("#enemyVehicle2"));
		}, 15000);
	}, 6000);

}


function car5explode(car) {
	car.classList.add("car5shot");
	bulletPang.play();
	setTimeout(function() {
		enemyFalling.play();
	}, 800);
}