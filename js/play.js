window.onload = function(){
  // Audio setup
  var audio = document.getElementsByTagName("audio")[0];
  audio.volume = "0.2";

  var fallSnd = new Audio("fall.mp3");
  var hiSnd = new Audio("hiScore.mp3");

  var gameWindow = document.getElementById("gameWindow");
  var windowSize = [gameWindow.clientWidth, gameWindow.clientHeight];

  // Player object, and div element containing the image
  var player = new Player();

  // Fetch leaderboard
  var leaderStore = localStorage.getItem("leaders");
  if(leaderStore){
    if(leaderStore.charAt(0)!="["){
      leaderStore = "["+leaderStore+"]";
    }
    var leaderBoard = JSON.parse(leaderStore);
  }
  else{
    var leaderBoard = [5,4,3,2,1];
  }

  // Obstacles, to avoid
  var obstacleList = [];
  var decoList = [];
  var gameTime = 0;
  var nextObjTime = 2000;
  var nextDecoTime = 1000;
  var shiftSpeed = 10;
  var shiftAccel = 0.01;
  var shiftDecay = 0.4;
  var baseShiftSpeed = shiftSpeed;

  // Show total score
  var scorePane = document.getElementById("scorePane");
  var scoreBox = document.getElementById("score");
  var hiscoreBox = document.getElementById("hiscore");
  var score = 0, hiscore = leaderBoard[0];

  // Images used for player animations
  var runImg = new ImageObj("images/runv2.gif",100,150,null,null,null,null);
  var slideDownImg = new ImageObj("images/slideDown.gif",125,125,120,null,null,null);
  var slideImg = new ImageObj("images/slide.gif",140,80,null,null,null,null);
  var slideUpImg = new ImageObj("images/slideUp.gif",125,125,120,null,null,null);
  var fallImg = new ImageObj("images/fall.gif",200,150,null,null,null,null);
  var jumpImg = new ImageObj("images/jump.gif",100,150,null,null,null,null,null);
  var imageLoader = new Image();

  // Images for Obstacles
  var wallImg = new ImageObj("images/wall.png",50,100,null,(windowSize[1])*0.5,windowSize[1],2);
  var birdImg = new ImageObj("images/bird.gif",100,75,0,null,windowSize[1]*0.5,3);
  var holeImg = new ImageObj("images/hole.png",300,104,null,windowSize[1]-50,0,1);
  var objImages = [wallImg,wallImg,birdImg,holeImg];

  // Images for decoration
  var cloudImg = new ImageObj("images/cloud.png",150,100,0,0,windowSize[1]/3,3);
  var treeImg = new ImageObj("images/tree.png",100,150,0,windowSize[1]-200,windowSize[1]-20,3);
  var decoImages = [cloudImg,treeImg];

  // End game menu
  var menu = document.createElement("div");
  menu.innerHTML = "  <ul id='menu'>\
    <li><a href='play.html'>Retry</a></li>\
    <li><a href='leaders.html'>Leaderboards</a></li>\
    <li><a href='index.html'>Home</a></li>\
  </ul>";

  // Game Control Setup
  window.onkeydown = keyDown;
  window.onkeyup = keyUp;
  var gameKeys = {87:0, 83:0};
  // w=87, s=83
  // 0:released. 1:just pressed. 2: pressed. 3:just released

  var gameOver = false;
  var gameInterval = 20;

  //========================================================
  var mainGameLoop = setInterval(gameLoop,gameInterval,gameInterval);
  //========================================================

  function gameLoop(interval){
    doGrav(player);

    // Move, draw and delete obstacles
    for(let i=0; i<obstacleList.length; i++){
      if(obstacleList[i].x+obstacleList[i].width < 0){
        obstacleList[i].container.remove();
        obstacleList.splice(i, 1);
        i--;
      }
      else{
        obstacleList[i].x -= shiftSpeed;
        draw(obstacleList[i]);
      }
    }
    //Move, draw and delete decorations
    for(let i=0; i<decoList.length; i++){
      if(decoList[i].x+decoList[i].width < 0){
        decoList[i].container.remove();
        decoList.splice(i, 1);
        i--;
      }
      else{
        decoList[i].x -= shiftSpeed*0.5;
        draw(decoList[i]);
      }
    }

    //Collision check
    for(let obstacle of obstacleList){
      if(!gameOver){
        if(collisionCheck(player,obstacle)){
          gameOver = true;
          changeImageNoTimer(player,fallImg);
          fallSnd.play();
        }
      }
    }

    // Add obstacles
    if(gameTime >= nextObjTime){
      let newObs = new Obstacle(objImages[randInt(0,objImages.length)]);
      obstacleList.push(newObs);
      nextObjTime += 8000/shiftSpeed + 8000*Math.random()/shiftSpeed
        + newObs.width*interval/shiftSpeed;
    }
    // Add decorations
    if(gameTime >= nextDecoTime){
      let newDeco = new Obstacle(decoImages[randInt(0,decoImages.length)]);
      decoList.push(newDeco);
      newDeco.container.style.zIndex = -10;
      nextDecoTime += 8000/shiftSpeed + 16000*Math.random()/shiftSpeed
        + newDeco.width*interval/shiftSpeed;
    }

    // Game state dependent commands
    if(gameOver){
      shiftSpeed -= shiftDecay;
      // choose above line or below line
      // shiftSpeed = 0;
      if(shiftSpeed < 0) shiftSpeed = 0;

      if(shiftSpeed <= 0 && player.y+player.height-windowSize[1] > -8){
        clearInterval(mainGameLoop);
        player.y = windowSize[1] - player.height;
        shiftSpeed = 0;
        postGame();
      }
    }
    else{
      checkKeys();
      score = Math.floor(gameTime/100)*1;
      if(score>hiscore) hiscore = score;
      scoreBox.textContent = score;
      hiscoreBox.textContent = hiscore;

      shiftSpeed += shiftAccel;
    }

    //Draw the player location & image
    draw(player);
    gameTime += interval;
  }

  //Operations for after game ends
  function postGame(){
    draw(player);
    scorePane.classList.add("endGamePane"); //makes score bigger
    addLeaders(score);
    if(score==hiscore) hiSnd.play();
    setTimeout(function(){
      gameWindow.appendChild(menu);
    },1100);
  }

  // Game Control Functions
  function keyDown(e){
    if(!e.repeat){
      let char = e.which || e.keyCode;
      gameKeys[char] = 1;
    }
  }
  function keyUp(e){
    let char = e.which || e.keyCode;
    gameKeys[char] = 3;
  }
  function checkKeys(e){
    for(var i in gameKeys){
      if(gameKeys[i]==1){
        keyPressFuncs(i);
        gameKeys[i] = 2;
      }
      else if(gameKeys[i]==3){
        keyRelFuncs(i);
        gameKeys[i] = 0;
      }
    }
  }
  function keyPressFuncs(key){
    // clearTimeout(animTimer);
    switch(key){
      case "83":
        changeImageNoTimer(player,slideDownImg);
        changeImageOnTimer(slideDownImg.duration,player,slideImg);
        if(player.y+player.height-windowSize[1] < -16){
          player.vsp = player.duckSpd;
        }
        break;
      case "87":
        if(player.y+player.height-windowSize[1] > -16){
          player.vsp = player.jumpSpd;
          changeImageNoTimer(player,jumpImg);
        }
        break;
    }
  }
  function keyRelFuncs(key){
    // clearTimeout(animTimer);
    switch(key){
      case "83":
        if(player.y+player.height-windowSize[1] > -32){
          changeImageNoTimer(player,slideUpImg);
          changeImageOnTimer(slideUpImg.duration,player,runImg);
        }
        break;
      case "87":
        break;
    }
  }

  // Add score to leaderboard
  function addLeaders(score){
    for(let i in leaderBoard){
      if(score > leaderBoard[i]){
        for(let j=leaderBoard.length-2;j>=i;j--){
          leaderBoard[j+1] = leaderBoard[j];
        }
        leaderBoard[i] = score;
        break;
      }
    }
    hiscore = leaderBoard[0];
    localStorage.setItem("leaders",JSON.stringify(leaderBoard));
  }

  // Check for collision between player and object
  function collisionCheck(thisPlayer,thisObs){
    let px1 = thisPlayer.x + thisPlayer.width*0.15,
        px2 = thisPlayer.x + thisPlayer.width*0.85,
        py1 = thisPlayer.y + thisPlayer.height*0.05,
        py2 = thisPlayer.y + thisPlayer.height*0.95;
    let ox1 = thisObs.x + thisObs.width*0.05,
        ox2 = thisObs.x + thisObs.width*0.95,
        oy1 = thisObs.y + thisObs.height*0.05,
        oy2 = thisObs.y + thisObs.height*0.95;
    let curImg = thisPlayer.image.slice(0,-9);

    if(curImg == slideDownImg.image || curImg == slideUpImg.image){
      py1 += slideDownImg.h - slideImg.h;
    }

    if(px1 < ox2){
      if(px2 > ox1){
        if(py1 < oy2){
          if(py2 > oy1){
            return true;
          }
        }
      }
    }
    return false;
  }

  // Calculate gravity and ground impact
  function doGrav(thisPlayer){
    if(thisPlayer.y+thisPlayer.height-windowSize[1] > -8 && thisPlayer.vsp >= 0){
      if(thisPlayer.vsp>0 && !gameOver && gameKeys[83]==0) changeImageNoTimer(thisPlayer,runImg);
      thisPlayer.vsp = 0;
      thisPlayer.y = windowSize[1]-thisPlayer.height;
    }
    else{
      thisPlayer.vsp += thisPlayer.grav;
      thisPlayer.y += thisPlayer.vsp;
    }
  }

  // Draw any changes in animation, position, size
  function draw(thisPlayer){
    setTimeout(function(){
      thisPlayer.container.style.top = thisPlayer.y+"px";
      thisPlayer.container.style.left = thisPlayer.x+"px";
      thisPlayer.container.style.backgroundImage = "url('"+thisPlayer.image+"')";;
      thisPlayer.container.style.width = thisPlayer.width+"px";
      thisPlayer.container.style.height = thisPlayer.height+"px";
    },gameInterval);
  }

  // For keeping track of auto-change animations
  var animTimer = 0;

  function changeImageOnTimer(delay, thisPlayer, imgObj){
    clearTimeout(animTimer);
    animTimer = setTimeout(changeImage,delay,thisPlayer,imgObj);
  }

  function changeImageNoTimer(thisPlayer, imgObj){
    clearTimeout(animTimer);
    changeImage(thisPlayer,imgObj);
  }

  function changeImage(thisPlayer, imgObj){
    thisPlayer.y -= imgObj.height - thisPlayer.height;
    thisPlayer.image = imgObj.image + "?a=" + (1+Math.random()).toPrecision(5);
    imageLoader.src = thisPlayer.image;
    thisPlayer.width = imgObj.width;
    thisPlayer.height = imgObj.height;
  }

  function randInt(low,high){
    return Math.floor(low + Math.random()*(high-low));
  }

  // Constructors
  function Player(){
    this.container = document.createElement("div");
    this.image = "images/runv2.gif";
    this.width = 100;
    this.height = 150;
    this.x = 25;
    this.y = windowSize[1] - this.height;
    this.vsp = 0;
    this.jumpSpd = -21;
    this.duckSpd = 15;
    this.grav = 0.8;

    this.container.className += " gameObj";
    this.container.style.backgroundImage = "url('"+this.image+"')";
    this.container.style.left = this.x+"px";
    this.container.style.top = this.y+"px";
    this.container.style.width = "176px";
    this.container.style.height = "203px";
    this.container.style.zIndex = -2;
    gameWindow.appendChild(this.container);
  }

  function ImageObj(img,w,h,t,minH,maxH,numH){
    this.image = img;
    this.width = w;
    this.height = h;
    this.duration = t;
    this.minHeight = minH;
    this.maxHeight = maxH;
    this.numHeight = numH;
  }

  function Obstacle(imgObj){
    this.container = document.createElement("div");
    this.image = imgObj.image;
    this.width = imgObj.width;
    this.height = imgObj.height;
    this.x = windowSize[0];
    this.y = imgObj.numHeight <= 1 ? imgObj.minHeight :
      imgObj.minHeight + randInt(0,imgObj.numHeight)/(imgObj.numHeight-1) *      (imgObj.maxHeight - imgObj.minHeight - this.height);

    this.container.className += " gameObj";
    this.container.style.backgroundImage = "url('"+this.image+"')";
    this.container.style.left = this.x+"px";
    this.container.style.top = this.y+"px";
    this.container.style.width = this.width+"px";
    this.container.style.height = this.height+"px";
    gameWindow.appendChild(this.container);
  }

};
