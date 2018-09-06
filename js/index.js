window.onload = function(){
  var audio = document.getElementsByTagName("audio")[0];
  audio.volume = "0.2";

  var page = document.getElementsByTagName("html")[0];
  var bannerImgDiv = document.getElementById("bannerDiv")
  var bannerPos = -120;
  bannerImgDiv.style.left =bannerPos+"px";
  bannerImgDiv.style.backgroundImage = "url('"+"images/runv2.gif"+"')";
  var imageURLs = ["runv2.gif", "Slide.gif", "jumpRep.gif"];
  var lenImg = imageURLs.length;

  setInterval(function(){
    bannerPos += 7;
    bannerImgDiv.style.left =bannerPos+"px";
    if(bannerPos > page.clientWidth){
      bannerPos = -120;
      bannerImgDiv.style.backgroundImage = "url('images/"
                              +imageURLs[Math.floor(Math.random()*lenImg)]
                              +"')";
    }
  },20);



};
