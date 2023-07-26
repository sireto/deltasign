/// used for all pages
var navbar = document.getElementById("landing-nav-bar-id");
window.onscroll = function(){
      if(navbar !== undefined){
        if (window.pageYOffset > 0) {
            navbar.classList.add('navbar-scrolled')
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
      }
}

function scrollToView(id){
    var element = document.getElementById(id);
    if(element !== null){
        element.scrollIntoView({behavior: "smooth", block: "center", inline: "start"});
    }
}