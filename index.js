window.onload = function(){

  var gameWindow = document.getElementById("gameWindow");
  var windowSize = [gameWindow.clientWidth, gameWindow.clientHeight];
  console.log(windowSize);

  var player = new Player();

  var playerBox = document.createElement("div");
  playerBox.className += " gameObj";
  playerBox.style.backgroundImage = "url('"+player.image+"')";
  playerBox.style.left = player.x+"px";
  playerBox.style.top = player.y+"px";
  playerBox.style.width = "176px";
  playerBox.style.height = "203px";
  player.container = playerBox;
  gameWindow.appendChild(playerBox);

  var runImg = new PlayerImage("images/RunningTransp.gif",176,203,0);
  var slideDownImg = new PlayerImage("images/SlideDown.gif",210,208,0);
  var slideImg = new PlayerImage("images/Slide.gif",210,128,0);
  var slideUpImg = new PlayerImage("images/SlideUp.gif",210,208,0);

  window.onkeydown = keyDepress;
  window.onkeyup = keyRelease;

  //========================================================
  var mainGameLoop = setInterval(gameLoop,20);
  //========================================================

  function gameLoop(){
    doGrav(player);

    draw(player);
  }

  function doGrav(thisPlayer){
    if(thisPlayer.y+thisPlayer.height-windowSize[1] > -8 && thisPlayer.vsp >= 0){
      thisPlayer.useGrav = false;
      thisPlayer.vsp = 0;
      thisPlayer.y = windowSize[1]-thisPlayer.height;
    }
    else{
      thisPlayer.vsp += thisPlayer.grav;
      thisPlayer.y += thisPlayer.vsp;
    }
  }

  function draw(thisPlayer){
    thisPlayer.container.style.top = thisPlayer.y+"px";
    thisPlayer.container.style.left = thisPlayer.x+"px";
    thisPlayer.container.style.backgroundImage = "url('"+thisPlayer.image+"')";
    playerBox.style.width = thisPlayer.width+"px";
    playerBox.style.height = thisPlayer.height+"px";
  }

  var timer = 0;

  function keyDepress(e){
    if(!e.repeat){

      var char = event.which || event.keyCode;
      if(char == 87){ //w=87
        if(player.y+player.height-windowSize[1] > -16){
          console.log("Jumped");
          player.vsp = player.jumpSpd;
        }
      }
      else if(char == 83){ //s=83
        console.log("Ducked");
        changeImage(player,slideDownImg);
        timer = setTimeout(changeImage,200,player,slideImg);
      }

    }
  }

  function keyRelease(e){
    var char = event.which || event.keyCode;
    if(char == 83){ //s=83
      console.log("Not ducked");
      changeImage(player,slideUpImg);
      timer = setTimeout(changeImage,200,player,runImg);

    }
  }

  function changeImage(thisPlayer, imageObj){
    thisPlayer.y -= imageObj.height - thisPlayer.height;
    thisPlayer.image = imageObj.image+"?a="+Math.random();
    thisPlayer.width = imageObj.width;
    thisPlayer.height = imageObj.height;
  }

  function Player(){
    this.container;
    this.image = "images/RunningTransp.gif";
    this.x = 0;
    this.y = windowSize[1] - 203;
    this.vsp = 0;
    this.jumpSpd = -12;
    this.duckSpd = 5;
    this.grav = 0.4;
    this.width = 176;
    this.height = 203;
    this.useGrav = false;
  }

  function PlayerImage(img,w,h,t){
    this.image = img;
    this.width = w;
    this.height = h;
    this.duration = t;
  }

  console.log(runImg);


};
