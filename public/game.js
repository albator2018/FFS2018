var player;
var xShuriken = 0;
var players = [];
var atHome = [];
var idle, right, left, up, down;
var m, myGrid;
var moveTween;
var layer;

bootState = {
  preload: function() {
    game.load.image("progressBar", "assets/sprites/preloader.png"),
    game.load.image("progressBarBg", "assets/sprites/preloaderbg.png"),
    game.load.image("loader", "assets/sprites/loader.png")
  },
  create: function() {
    game.state.start("load")
  }
},
loadState = {
  preload: function() {
    var a = game.add.image(game.world.centerX, 150, "loader");
    a.anchor.setTo(.5, .5);
    var b = game.add.sprite(game.world.centerX, 200, "progressBarBg");
    b.anchor.setTo(.5, .5);
    var c = game.add.sprite(game.world.centerX, 200, "progressBar");
    c.anchor.setTo(.5, .5),
    game.load.setPreloadSprite(c),

    game.load.tilemap('map', 'assets/map/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png', 32, 32);

    game.load.spritesheet('sprite', 'assets/sprites/1.png', 16, 16);
    game.load.image('shuriken', 'assets/sprites/shuriken.png');

    game.load.image('home', 'assets/sprites/home.png');

    game.load.image('learn', 'assets/sprites/learn.png');
    game.load.image('phaser2', 'assets/sprites/phaser2.png');

    game.load.image('cod', 'assets/pics/cod.jpg');
    game.load.image('spacebar', 'assets/buttons/spacebar.png');
  },
  create: function() {
    game.state.start("splash")
  }
},
splashState = {
  create: function() {
    var pic = game.add.image(game.world.centerX, game.world.centerY, 'learn');
    pic.anchor.set(0.5);
    pic.alpha = 0.1;
    //  This tween will wait 0 seconds before starting
    var tween = game.add.tween(pic).to( { alpha: 1 }, 3000, "Linear", true, 0);
    tween.onComplete.add(this.startMenu, this)
  },
  startMenu: function() {
    game.state.start("menu")
  }
},
menuState = {
  create: function() {
    game.add.sprite(0, 0, 'cod');

    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    var sBar = game.add.sprite(320, 240, 'spacebar');
    sBar.anchor.setTo(0.5, 0.5);
    sBar.alpha = 0;
    var tween = game.add.tween(sBar).to( { alpha: 1 }, 500, "Linear", true, 0, -1);
    tween.yoyo(true, 500);
  },
  update: function() {
    if (spaceKey.isDown){
      console.log("spacebar");
      game.state.start('play');
    }
  }
},
playState = {
  create: function() {
    this.playerMap = {};
    var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

    game.world.setBounds(0, 0, 1024, 768);

    var map = game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file

    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    };

    layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer
    layer.events.onInputUp.add(this.getCoordinates, this);

    game.physics.startSystem(Phaser.Physics.ARCADE);

    m = game.cache.getTilemapData('map').data.layers[0].data;
    myGrid = new Array();
    for(i=0; i<31; i++){
      myGrid[i] = new Array();
      for(j=0; j<32; j++){
        myGrid[i].push(m[i*j]);
      }
    }

    easystar.setGrid(myGrid);
    easystar.setAcceptableTiles([11]);

    for (var i = 0; i < 10; i++)
    {
        //  This creates a new Phaser.Sprite instance within the group
        //  It will be randomly placed within the world and use the 'baddie' image to display
        this.addPlayer(i, Math.random() * 1024, Math.random() * 768);
    };

    home = game.add.sprite(1024 - 217, 768 - 244, 'home');
    game.physics.arcade.enable(home);
  },

  update: function() {
    game.physics.arcade.overlap(player, home, this.collisionWithHome, null, this);
  },

  collisionWithHome : function(){
    for (var i = 0; i < 10; i++){
      if (player === players[i]){
        atHome.push(player);
        players[i].kill();
        xShuriken = xShuriken + 10;
        shuriken = game.add.sprite(xShuriken, 10, 'shuriken');
        shuriken.scale.setTo(2);
        shuriken.smoothed = false;
        shuriken.fixedToCamera = true;
      }
    };
    if (atHome.length == 10){
        game.state.start("win");
    }
  },

  getCoordinates : function(layer, pointer){
    this.movePlayer(pointer.worldX, pointer.worldY);
    //this.movePlayer2(pointer.worldX, pointer.worldY);
  },

  addPlayer : function(i, x, y){
    player = game.add.sprite(x, y, 'sprite', 0);
    player.scale.setTo(2);
    player.smoothed = false;
    game.physics.arcade.enable(player);

    idle = player.animations.add('idle', [0], 10, true);
    right = player.animations.add('right', [3, 7, 11, 15], 10, true);
    left = player.animations.add('left', [2, 6, 10, 14], 10, true);
    up = player.animations.add('up', [0, 4, 8, 12, 16], 10, true);

    player.ismoving = false;

    game.camera.follow(player);

    players[i] = player;

    player.inputEnabled = true;
    player.input.useHandCursor = true;

    player.events.onInputDown.add(this.playerListener, this);
  },

  playerListener : function(s, pointer){
    for (var i = 0; i < 10; i++){
      if (s === players[i]){
        console.log(i + " was clicked");
        player = s;
        game.camera.follow(player);
      }
    }
  },

  movePlayer : function(x, y){
    var i = 0;
    function moveObject(object, p, s){
      var StepX = p[i].x || false, StepY = p[i].y || false;
      moveTween = game.add.tween( object ).to({ x: StepX*32, y: StepY*32}, 150);
      moveTween.start();
      dx = p[i].x;
      moveTween.onComplete.add(function(){
        i++;
        if(i < p.length){
          console.log(p[i]);
          console.log(p[i+1]);
          if (p[i].x > dx) {
            player.play('right');
          };
          if (p[i].x < dx) {
            player.play('left');
          };
          if (p[i].x == dx) {
            player.play('up');
          };
          moveObject(object, p);
        }else{
          player.play('idle');
        };
      })
    }

    easystar.findPath(Math.floor(player.x/32), Math.floor(player.y/32), Math.floor(x/32), Math.floor(y/32), function( path ) {
      if (path === null) {
        console.log("Path was not found.");
    	} else {
        console.log("Path was found.");
        if (player.ismoving == false){
          console.log("is not moving");
          player.ismoving = true;
          moveObject(player, path);
        } else {
          console.log("is moving");
          player.ismoving = false;
          moveTween.stop();
          player.play('idle');
        }
    	}
    });
    easystar.calculate();
  }

//https://gamedevacademy.org/how-to-use-pathfinding-in-phaser/
/*
  movePlayer2 : function(x, y){
    var i = 0;
    var walking_speed = 100;
    easystar.findPath(Math.floor(player.x/32), Math.floor(player.y/32), Math.floor(x/32), Math.floor(y/32), function(path) {
      if (path.length > 0) {
        console.log(path);
        if (!Math.floor(player.x/32) == path[i].x*32) {
            if (path[i+1].x > path[i].x) {
              player.play('right');
              player.body.velocity.x = walking_speed;
            };
            if (path[i+1].x < path[i].x) {
              player.play('left');
            };
            if (path[i+1].x == path[i].x) {
              player.play('up');
            };
        } else {
            player.position.x = path[i+1].x;
            player.position.y = path[i+1].y;
            if (i < path.length ) {
                i += 1;
            } else {
                i = 0;
            }
        }
      }
    });
    easystar.calculate();
  }
*/
},
winState = {
  create: function() {
    youWin = game.add.sprite(320, -200, 'phaser2');
    youWin.anchor.setTo(0.5, 0.5);
    //youWin.alpha = 0;
    //youWin.fixedToCamera = true;
    var tween = game.add.tween(youWin).to( { y: 240 }, 3000, Phaser.Easing.Bounce.Out, true);
    //var tween = game.add.tween(youWin).to( { alpha: 1 }, 2000, "Linear", true, 0, 5);
    tween.onComplete.add(this.startMenu, this)
  },
  startMenu: function() {
    game.state.start("menu")
  }
},

game = new Phaser.Game(20*32, 15*32);
var easystar = new EasyStar.js();
game.state.add("boot", bootState),
game.state.add("load", loadState),
game.state.add("splash", splashState),
game.state.add("menu", menuState),
game.state.add("play", playState),
game.state.add("win", winState),
game.state.start("boot");
