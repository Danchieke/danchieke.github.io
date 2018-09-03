window.onload = function(){

  var gameWindow = document.getElementById("gameWindow");
  var windowSize = [gameWindow.clientWidth, gameWindow.clientHeight];
  console.log(windowSize);
  var player = {
    image:"images/RunningTransp.gif",
    x:0,
    y:windowSize[1] - 203,
    lanes:[]
  };

  var playerBox = document.createElement("div");
  playerBox.className += " gameObj";
  playerBox.style.backgroundImage = "url('"+player.image+"')";
  playerBox.style.left = player.x+"px";
  playerBox.style.top = player.y+"px";
  playerBox.style.width = "176px";
  playerBox.style.height = "203px";
  gameWindow.appendChild(playerBox);

  setInterval(function(){
    playerBox.style.backgroundImage = "url('"+player.image+"')";
  },100);
}
