var $nav = $('.toolar-ul');

$nav.on("click" , "a" , function (e){
    e.preventDefault();
    var href = $(this).attr("href");
    $("html,body").animate({scrollTop:  ($(href).offset().top -120) + "px"});
});


setTimeout(function (){
    $nav.addClass("show");
},500)