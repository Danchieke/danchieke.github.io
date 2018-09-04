window.onload = function(){
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

  var leaderList = document.getElementById("leaderList");

  for(let i in leaderBoard){
    let entry = document.createElement("li");
    entry.innerHTML = leaderBoard[i];
    if(i==0) entry.style.fontSize = "2em";
    leaderList.appendChild(entry);
  }

};
