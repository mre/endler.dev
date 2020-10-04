// Adapted from Light YouTube Embeds by @labnol
// http://labnol.org/?p=27941

function lightEmbedInit() {
  var n,
    v = document.getElementsByClassName("light-video-embed");

  for (n = 0; n < v.length; n++) {
    v[n].onclick = function () {
      var iframe = document.createElement("iframe");
      var embed = this.dataset.url + "?autoplay=1";
      if (typeof this.dataset.start !== "undefined") {
        embed = embed + "&start=" + this.dataset.start;
      }
      iframe.setAttribute("src", embed);
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allowfullscreen", "1");
      this.innerHTML = iframe.outerHTML;
    };
  }
}
