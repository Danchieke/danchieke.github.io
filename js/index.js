window.onload = function(){

  var page = document.getElementsByTagName("html")[0];
  var bannerImgDiv = document.getElementById("bannerDiv")
  var bannerPos = -120;
  bannerImgDiv.style.left =bannerPos+"px";
  bannerImgDiv.style.backgroundImage = "url('"+"images/RunningTransp.gif"+"')";
  var imageURLs = ["RunningTransp.gif", "Slide.gif"];
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
