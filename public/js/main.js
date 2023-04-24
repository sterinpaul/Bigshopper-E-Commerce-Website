let first,last,mailId,pass,rePass,passRePass,mobileNo,loginPass;

function validateFirstName(){
    let firstName = document.getElementById('form3Example1').value;
    
    const regex = /[A-z ]{2,30}$/;
    first = regex.test(firstName);
    if(first){
        document.getElementById('errorFName').innerText="";
        
    }else{
        document.getElementById('errorFName').innerText = "* Invalid Name"
    }
}

function validateLastName(){
    let lastName = document.getElementById('form3Example2').value;
    
    const regex = /[A-z ]{2,30}$/;
    last = regex.test(lastName);
    if(last){
        document.getElementById('errorLName').innerText="";
        
    }else{
        document.getElementById('errorLName').innerText = "* Invalid Name"
    }
}

function validateEmail(){
    let eMail = document.getElementById('form3Example3').value;
    
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    mailId = regex.test(eMail);
    if(mailId){
        document.getElementById('errorMail').innerText="";
        
    }else{
        document.getElementById('errorMail').innerText = "* Invalid E-mail Id"
    }
}


function validatePassword(){
    let password = document.getElementById('form3Example4').value;
    
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,30}$/
    pass = regex.test(password);
    if(pass){
        document.getElementById('errorPassword').innerText="";
        
    }else{
        document.getElementById('errorPassword').innerText = "* Password should contain atleast 1 Upper case 1 Special character and 1 number"
    }
}

function validateRetypePassword(){
    rePassword = document.getElementById('form3Example5').value;
    password = document.getElementById('form3Example4').value;
    if(rePassword === ""){
        passRePass = false;
        document.getElementById('errorConfirmPassword').innerText= "* Enter valid Password"
    }else if(rePassword!==password){
        passRePass = false;
        document.getElementById('errorConfirmPassword').innerText= "* Password does not match"
    }else{
        passRePass = true;
        document.getElementById('errorConfirmPassword').innerText = "";
    }
}

function validateMobile(){
    let mobile = document.getElementById('mobile').value;
    
    const regex = /^\d{10}$/;
    mobileNo = regex.test(mobile);
    if(mobileNo){
        document.getElementById('errorMobile').innerText="";
        document.getElementById('signupSendOtp').style.display = 'block';
    }else{
        document.getElementById('errorMobile').innerText = "* Invalid Mobile Number";
        document.getElementById('signupSendOtp').style.display = 'none';
    }
}

function signUpValidation(){
    if(first && last && mailId && pass && passRePass && mobileNo){
        return true
    }else{
        document.getElementById('signUpValidation').innerText = "* Please input valid details";
        setTimeout(()=>{
            document.getElementById('signUpValidation').innerText = "";
        },10000)
        return false
    }
}

function signinValidation(){
    let loginPassword = document.getElementById('typePasswordX').value;
    let eMail = document.getElementById('typeEmailX').value;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,30}$/
    loginPass = regex.test(loginPassword);
    if(loginPass && eMail){
        document.getElementById('errorLoginPassword').innerText="";
    }else{
        document.getElementById('errorLoginPassword').innerText = "* Invalid Password"
    }
}


// Close Add to Cart Pop-up Window
function closeAddCartPopup(){
    document.getElementById('cartPopupContainer').style.display = 'none'
}


// Category and Sub Category Validation
function categoryValidation(item){
    let category = document.getElementById('category').value
    let subCategory = document.getElementById('subCategory').value
    let subCategoryName = document.getElementById('subCategoryName').value
    
    if(item === 'subCategory'){
      category = subCategory
    }else if(item === 'subCategoryName'){
        category = subCategoryName
    }
    const regex = /[A-z]{2,10}$/;
    let categoryCheck = regex.test(category)
    if(categoryCheck){
      return true
    }else{
      return false
    }
  }


(function ($) {
    "use strict";

    /*[ Load page ]
    ===========================================================*/
    $(".animsition").animsition({
        inClass: 'fade-in',
        outClass: 'fade-out',
        inDuration: 1500,
        outDuration: 800,
        linkElement: '.animsition-link',
        loading: true,
        loadingParentElement: 'html',
        loadingClass: 'animsition-loading-1',
        loadingInner: '<div class="loader05"></div>',
        timeout: false,
        timeoutCountdown: 5000,
        onLoadEvent: true,
        browser: [ 'animation-duration', '-webkit-animation-duration'],
        overlay : false,
        overlayClass : 'animsition-overlay-slide',
        overlayParentElement : 'html',
        transition: function(url){ window.location.href = url; }
    });
    
    /*[ Back to top ]
    ===========================================================*/
    var windowH = $(window).height()/2;

    $(window).on('scroll',function(){
        if ($(this).scrollTop() > windowH) {
            $("#myBtn").css('display','flex');
        } else {
            $("#myBtn").css('display','none');
        }
    });

    $('#myBtn').on("click", function(){
        $('html, body').animate({scrollTop: 0}, 300);
    });


    /*==================================================================
    [ Fixed Header ]*/
    var headerDesktop = $('.container-menu-desktop');
    var wrapMenu = $('.wrap-menu-desktop');

    if($('.top-bar').length > 0) {
        var posWrapHeader = $('.top-bar').height();
    }
    else {
        var posWrapHeader = 0;
    }
    

    if($(window).scrollTop() > posWrapHeader) {
        $(headerDesktop).addClass('fix-menu-desktop');
        $(wrapMenu).css('top',0); 
    }  
    else {
        $(headerDesktop).removeClass('fix-menu-desktop');
        $(wrapMenu).css('top',posWrapHeader - $(this).scrollTop()); 
    }

    $(window).on('scroll',function(){
        if($(this).scrollTop() > posWrapHeader) {
            $(headerDesktop).addClass('fix-menu-desktop');
            $(wrapMenu).css('top',0); 
        }  
        else {
            $(headerDesktop).removeClass('fix-menu-desktop');
            $(wrapMenu).css('top',posWrapHeader - $(this).scrollTop()); 
        } 
    });


    /*==================================================================
    [ Menu mobile ]*/
    $('.btn-show-menu-mobile').on('click', function(){
        $(this).toggleClass('is-active');
        $('.menu-mobile').slideToggle();
    });

    var arrowMainMenu = $('.arrow-main-menu-m');

    for(var i=0; i<arrowMainMenu.length; i++){
        $(arrowMainMenu[i]).on('click', function(){
            $(this).parent().find('.sub-menu-m').slideToggle();
            $(this).toggleClass('turn-arrow-main-menu-m');
        })
    }

    $(window).resize(function(){
        if($(window).width() >= 992){
            if($('.menu-mobile').css('display') == 'block') {
                $('.menu-mobile').css('display','none');
                $('.btn-show-menu-mobile').toggleClass('is-active');
            }

            $('.sub-menu-m').each(function(){
                if($(this).css('display') == 'block') { console.log('hello');
                    $(this).css('display','none');
                    $(arrowMainMenu).removeClass('turn-arrow-main-menu-m');
                }
            });
                
        }
    });


    /*==================================================================
    [ Show / hide modal search ]*/
    $('.js-show-modal-search').on('click', function(){
        $('.modal-search-header').addClass('show-modal-search');
        $(this).css('opacity','0');
    });

    $('.js-hide-modal-search').on('click', function(){
        $('.modal-search-header').removeClass('show-modal-search');
        $('.js-show-modal-search').css('opacity','1');
    });

    $('.container-search-header').on('click', function(e){
        e.stopPropagation();
    });


    /*==================================================================
    [ Isotope ]*/
    var $topeContainer = $('.isotope-grid');
    var $filter = $('.filter-tope-group');

    // filter items on button click
    $filter.each(function () {
        $filter.on('click', 'button', function () {
            var filterValue = $(this).attr('data-filter');
            $topeContainer.isotope({filter: filterValue});
        });
        
    });

    // init Isotope
    $(window).on('load', function () {
        var $grid = $topeContainer.each(function () {
            $(this).isotope({
                itemSelector: '.isotope-item',
                layoutMode: 'fitRows',
                percentPosition: true,
                animationEngine : 'best-available',
                masonry: {
                    columnWidth: '.isotope-item'
                }
            });
        });
    });

    var isotopeButton = $('.filter-tope-group button');

    $(isotopeButton).each(function(){
        $(this).on('click', function(){
            for(var i=0; i<isotopeButton.length; i++) {
                $(isotopeButton[i]).removeClass('how-active1');
            }

            $(this).addClass('how-active1');
        });
    });

    /*==================================================================
    [ Filter / Search product ]*/
    $('.js-show-filter').on('click',function(){
        $(this).toggleClass('show-filter');
        $('.panel-filter').slideToggle(400);

        if($('.js-show-search').hasClass('show-search')) {
            $('.js-show-search').removeClass('show-search');
            $('.panel-search').slideUp(400);
        }    
    });

    $('.js-show-search').on('click',function(){
        $(this).toggleClass('show-search');
        $('.panel-search').slideToggle(400);

        if($('.js-show-filter').hasClass('show-filter')) {
            $('.js-show-filter').removeClass('show-filter');
            $('.panel-filter').slideUp(400);
        }    
    });




    /*==================================================================
    [ Cart ]*/
    $('.js-show-cart').on('click',function(){
        $('.js-panel-cart').addClass('show-header-cart');
    });

    $('.js-hide-cart').on('click',function(){
        $('.js-panel-cart').removeClass('show-header-cart');
    });

    /*==================================================================
    [ Cart ]*/
    $('.js-show-sidebar').on('click',function(){
        $('.js-sidebar').addClass('show-sidebar');
    });

    $('.js-hide-sidebar').on('click',function(){
        $('.js-sidebar').removeClass('show-sidebar');
    });

    /*==================================================================
    [ +/- num product ]*/
    $('.btn-num-product-down').on('click', function(){
        var numProduct = Number($(this).next().val());
        if(numProduct > 1) $(this).next().val(numProduct - 1);
    });

    $('.btn-num-product-up').on('click', function(){
        var numProduct = Number($(this).prev().val());
        $(this).prev().val(numProduct + 1);
    });

    /*==================================================================
    [ Rating ]*/
    $('.wrap-rating').each(function(){
        var item = $(this).find('.item-rating');
        var rated = -1;
        var input = $(this).find('input');
        $(input).val(0);

        $(item).on('mouseenter', function(){
            var index = item.index(this);
            var i = 0;
            for(i=0; i<=index; i++) {
                $(item[i]).removeClass('zmdi-star-outline');
                $(item[i]).addClass('zmdi-star');
            }

            for(var j=i; j<item.length; j++) {
                $(item[j]).addClass('zmdi-star-outline');
                $(item[j]).removeClass('zmdi-star');
            }
        });

        $(item).on('click', function(){
            var index = item.index(this);
            rated = index;
            $(input).val(index+1);
        });

        $(this).on('mouseleave', function(){
            var i = 0;
            for(i=0; i<=rated; i++) {
                $(item[i]).removeClass('zmdi-star-outline');
                $(item[i]).addClass('zmdi-star');
            }

            for(var j=i; j<item.length; j++) {
                $(item[j]).addClass('zmdi-star-outline');
                $(item[j]).removeClass('zmdi-star');
            }
        });
    });
    
    /*==================================================================
    [ Show modal1 ]*/
    $('.js-show-modal1').on('click',function(e){
        e.preventDefault();
        $('.js-modal1').addClass('show-modal1');
    });

    $('.js-hide-modal1').on('click',function(){
        $('.js-modal1').removeClass('show-modal1');
    });



})(jQuery);