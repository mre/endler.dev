// Adapted from Light YouTube Embeds by @labnol
//  http://labnol.org/?p=27941

function lightEmbedInit() {
  var n,
    v = document.getElementsByClassName("light-video-embed");

  for (n = 0; n < v.length; n++) {
    v[n].onclick = function () {
      var id = this.dataset.id;
      var iframe = document.createElement("iframe");
      var embed = "https://www.youtube.com/embed/ID?autoplay=1";
      iframe.setAttribute("src", embed.replace("ID", id));
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allowfullscreen", "1");
      this.innerHTML = iframe.outerHTML;
    };
  }
}
