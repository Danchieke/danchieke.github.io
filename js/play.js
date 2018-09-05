window.onload = function(){

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
  // var runImg = new ImageObj("images/RunningTransp.gif",176,203,0);
  // var slideDownImg = new ImageObj("images/SlideDown.gif",210,208,0);
  // var slideImg = new ImageObj("images/Slide.gif",210,128,0);
  // var slideUpImg = new ImageObj("images/SlideUp.gif",210,208,0);
  var runImg = new ImageObj("images/black.png",100,150,0,null,null,null);
  var slideDownImg = new ImageObj("images/black.png",100,75,0,null,null,null);
  var slideImg = new ImageObj("images/black.png",100,75,0,null,null,null);
  var slideUpImg = new ImageObj("images/black.png",100,150,0,null,null,null);

  changeImage(player,runImg);
  player.container.style.zIndex = -2;

  // Images for Obstacles
  var wallImg = new ImageObj("images/wall.png",50,100,0,(windowSize[1])*0.5,windowSize[1],2);
  var birdImg = new ImageObj("images/bird.gif",100,75,0,0,windowSize[1]*0.5,3);
  var holeImg = new ImageObj("images/hole.png",300,104,0,windowSize[1]-50,0,1);
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

  window.onkeydown = keyDepress;
  window.onkeyup = keyRelease;

  var gameOver = false;

  //========================================================
  var mainGameLoop = setInterval(gameLoop,20,20);
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
      if(collisionCheck(player,obstacle)) gameOver = true;
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

    //Draw the player location & image
    draw(player);

    // Game continuing or not commands
    if(gameOver){
      shiftSpeed -= shiftDecay;
      // choose above line or below line
      // shiftSpeed = 0;
      if(shiftSpeed <= 0 && player.y+player.height-windowSize[1] > -8){
        clearInterval(mainGameLoop);
        player.y = windowSize[1] - player.height;
        shiftSpeed = 0;
        postGame();
      }
    }
    else{
      score = Math.floor(gameTime/100)*1;
      if(score>hiscore) hiscore = score;
      scoreBox.textContent = score;
      hiscoreBox.textContent = hiscore;

      shiftSpeed += shiftAccel;
    }
    gameTime += interval;
  }

  //Operations for after game ends
  function postGame(){
    draw(player);
    scorePane.classList.add("endGamePane"); //makes score bigger
    addLeaders(score);
    setTimeout(function(){
      gameWindow.appendChild(menu);
    },1100);
    console.log(decoList);
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
    thisPlayer.container.style.top = thisPlayer.y+"px";
    thisPlayer.container.style.left = thisPlayer.x+"px";
    thisPlayer.container.style.backgroundImage = "url('"+thisPlayer.image+"')";
    thisPlayer.container.style.width = thisPlayer.width+"px";
    thisPlayer.container.style.height = thisPlayer.height+"px";
  }

  // For keeping track of auto-change animations
  var timer = 0;

  function keyDepress(e){
    if(!e.repeat){
      if(!gameOver){

        var char = event.which || event.keyCode;
        if(char == 87){ //w=87
          if(player.y+player.height-windowSize[1] > -16){
            player.vsp = player.jumpSpd;
          }
        }
        else if(char == 83){ //s=83
          changeImage(player,slideDownImg);
          clearTimeout(timer);
          timer = setTimeout(changeImage,200,player,slideImg);
          if(player.y+player.height-windowSize[1] < -16){
            player.vsp = player.duckSpd ;
          }
        }

      }
    }
  }

  function keyRelease(e){
    if(!gameOver){

      var char = event.which || event.keyCode;
      if(char == 83){ //s=83
        changeImage(player,slideUpImg);
        clearTimeout(timer);
        timer = setTimeout(changeImage,200,player,runImg);
      }

    }
  }

  function changeImage(thisPlayer, imgObj){
    thisPlayer.y -= imgObj.height - thisPlayer.height;
    thisPlayer.image = imgObj.image+"?a="+Math.random();
    thisPlayer.width = imgObj.width;
    thisPlayer.height = imgObj.height;
  }

  function randInt(low,high){
    return Math.floor(low + Math.random()*(high-low));
  }

  // Constructors
  function Player(){
    this.container = document.createElement("div");
    this.image = "images/runTemp.png"//"images/RunningTransp.gif";
    this.x = 0;
    this.y = windowSize[1] - 203;
    this.vsp = 0;
    this.jumpSpd = -21;
    this.duckSpd = 15;
    this.grav = 0.8;
    this.width = 176;
    this.height = 203;

    this.container.className += " gameObj";
    this.container.style.backgroundImage = "url('"+this.image+"')";
    this.container.style.left = this.x+"px";
    this.container.style.top = this.y+"px";
    this.container.style.width = "176px";
    this.container.style.height = "203px";
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
