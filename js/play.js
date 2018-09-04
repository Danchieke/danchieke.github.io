window.onload = function(){

  var gameWindow = document.getElementById("gameWindow");
  var windowSize = [gameWindow.clientWidth, gameWindow.clientHeight];

  // Player object, and div element containing the image
  var player = new Player();

  var leaderStore = localStorage.getItem("leaders");
  if(leaderStore){
    if(leaderStore.charAt(0)!="["){
      leaderStore = "["+leaderStore+"]";
    }
    var leaderBoard = JSON.parse(leaderStore);
  }
  else{
    var leaderBoard = [0,0,0,0,0];
  }
  console.log(leaderBoard);

  // Obstacles, to avoid
  var obstacleList = [];
  var gameTime = 0;
  var nextObjTime = 2000;
  var shiftSpeed = 10;
  var shiftAccel = 0.01;
  var shiftDecay = 0.2;
  var baseShiftSpeed = shiftSpeed;

  // Show total score
  var scorePane = document.getElementById("scorePane");
  var scoreBox = document.getElementById("score");
  var hiscoreBox = document.getElementById("hiscore");
  var score = 0, hiscore = leaderBoard[0];

  // Images used for player animations
  // var runImg = new imageObj("images/RunningTransp.gif",176,203,0);
  // var slideDownImg = new imageObj("images/SlideDown.gif",210,208,0);
  // var slideImg = new imageObj("images/Slide.gif",210,128,0);
  // var slideUpImg = new imageObj("images/SlideUp.gif",210,208,0);
  var runImg = new imageObj("images/runTemp.png",96,150,0);
  var slideDownImg = new imageObj("images/runTemp.png",96,75,0);
  var slideImg = new imageObj("images/slideTemp.png",96,75,0);
  var slideUpImg = new imageObj("images/slideTemp.png",96,150,0);

  // Images for Obstacles
  var wallImg = new imageObj("images/wall.png",63,100,0);

  // End game menu
  var menu = document.createElement("div");
  menu.innerHTML = "  <ul>\
    <a href='#'><li>Retry</li></a>\
    <a href='leaders.html'><li>Leaderboards</li></a>\
    <a href='index.html'><li>Home</li></a>\
  </ul>";

  window.onkeydown = keyDepress;
  window.onkeyup = keyRelease;

  var gameOver = false;

  //========================================================
  var mainGameLoop = setInterval(gameLoop,20,20);
  //========================================================

  function gameLoop(interval){
    doGrav(player);

    // Move and delete obstacles
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

    //Collision check
    for(let obstacle of obstacleList){
      if(collisionCheck(player,obstacle)) gameOver = true;
    }

    // Add obstacles
    if(gameTime >= nextObjTime){
      obstacleList.push(new Obstacle(wallImg));
      nextObjTime += 8000/shiftSpeed + 8000*Math.random()/shiftSpeed;
    }

    //Draw the player location & image
    draw(player);

    // Game continuing or not commands
    if(gameOver){
      // shiftSpeed -= shiftDecay;
      shiftSpeed = 0;
      if(shiftSpeed <= 0 && player.y+player.height-windowSize[1] > -8){
        clearInterval(mainGameLoop);
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
    scorePane.classList.add("endGamePane"); //makes score bigger
    addLeaders(score);
  }

  // Add score to leaderboard
  function addLeaders(score){
    for(let i in leaderBoard){
      if(score > leaderBoard[i]){
        for(let j=leaderBoard.length-2;j>i;j--){
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
    if(thisPlayer.x < thisObs.x + thisObs.width){
      if(thisPlayer.x + thisPlayer.width > thisObs.x){
        if(thisPlayer.y < thisObs.y + thisObs.height){
          if(thisPlayer.y + thisPlayer.height > thisObs.y){
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

  function imageObj(img,w,h,t){
    this.image = img;
    this.width = w;
    this.height = h;
    this.duration = t;
  }

  function Obstacle(imgObj){
    this.container = document.createElement("div");
    this.image = imgObj.image;
    this.width = imgObj.width;
    this.height = imgObj.height;
    this.x = windowSize[0];
    this.y = Math.floor(Math.random()*4)/3*(windowSize[1] - this.height);

    this.container.className += " gameObj";
    this.container.style.backgroundImage = "url('"+this.image+"')";
    this.container.style.left = this.x+"px";
    this.container.style.top = this.y+"px";
    this.container.style.width = this.width+"px";
    this.container.style.height = this.height+"px";
    gameWindow.appendChild(this.container);
  }

};
