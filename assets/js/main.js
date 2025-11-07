(function ($) {
  'use strict';

  const $documentOn = $(document);
  const $windowOn = $(window);
  //  preloader
  $('#preloader').fadeOut(1500);

  $(document).ready(function () {
    // ===================== Offcanvas Toggle =====================
    $('.offcanvas-toggle').on('click', function () {
      $('.ht-offcanvas').addClass('ht-offcanvas-open');
      $('.ht-offcanvas-overlay').addClass('ht-offcanvas-overlay-open');
    });

    $('.ht-offcanvas-toggle-close, .ht-offcanvas-overlay').on('click', function () {
      $('.ht-offcanvas').removeClass('ht-offcanvas-open');
      $('.ht-offcanvas-overlay').removeClass('ht-offcanvas-overlay-open');
    });

    // ===================== Search Bar Toggle =====================
    var $searchBar = $('.ht-header-search-bar');

    // Open search bar
    $('.search-toggle').on('click', function () {
      $searchBar.addClass('open');
      $('.ht-offcanvas-overlay').addClass('active');
    });

    // Close via close button or overlay
    $('.ht-search-close, .ht-offcanvas-overlay').on('click', function () {
      $searchBar.removeClass('open');
      $('.ht-offcanvas-overlay').removeClass('active');
    });

    // Close when clicking outside the search bar
    $(document).on('click', function (e) {
      if ($searchBar.hasClass('open')) {
        if (!$(e.target).closest('.ht-header-search-bar, .search-toggle').length) {
          $searchBar.removeClass('open');
          $('.ht-offcanvas-overlay').removeClass('active');
        }
      }
    });

    // ===================== Clone Main Menu to Offcanvas =====================
    var htMenuWrap = $('.ht-mobile-menu-active > ul').clone();
    var htSideMenu = $('.ht-offcanvas-menu nav');
    htSideMenu.append(htMenuWrap);

    // ===================== Add Close Buttons to Submenus =====================
    htSideMenu
      .find('.sub-menu')
      .parent()
      .append('<button class="ht-menu-close"><i class="fas fa-chevron-right"></i></button>');

    // ===================== Handle Submenu Toggle =====================
    var sideMenuList = $(
      '.ht-offcanvas-menu nav > ul li.has-dropdown > a, .ht-offcanvas-menu nav > ul li button.ht-menu-close'
    );

    sideMenuList.on('click', function (e) {
      e.preventDefault();

      var submenu = $(this).siblings('.sub-menu');

      if (!$(this).parent().hasClass('active')) {
        // Open submenu
        $(this).parent().addClass('active');
        submenu.slideDown(300);
      } else {
        // Close submenu
        submenu.slideUp(300);
        $(this).parent().removeClass('active');
      }
    });

    //>> Body Overlay Js Start <<//
    $('.body-overlay').on('click', function () {
      $('.offcanvas__area').removeClass('offcanvas-opened');
      $('.df-search-area').removeClass('opened');
      $('.body-overlay').removeClass('opened');
    });

    //>> Sticky Header Js Start <<//

    $(window).scroll(function () {
      if ($(this).scrollTop() > 250) {
        $('#header-sticky').addClass('sticky');
      } else {
        $('#header-sticky').removeClass('sticky');
      }
    });

    //>> Video Popup Start <<//
    $('.img-popup').magnificPopup({
      type: 'image',
      gallery: {
        enabled: true,
      },
    });

    $('.video-popup').magnificPopup({
      type: 'iframe',
      callbacks: {},
    });

    //>> Counterup Start <<//
    $('.count').counterUp({
      delay: 15,
      time: 4000,
    });

    //>> Wow Animation Start <<//
    new WOW().init();

    //>> Nice Select Start <<//
    if ($.fn.niceSelect) {
      $('select').niceSelect();
    }

    // Brand Slider
    if ($('.ht-brand-slider').length > 0) {
      var swiper = new Swiper('.ht-brand-slider', {
        slidesPerView: 3,
        spaceBetween: 0,
        loop: true,
        allowTouchMove: true,
        speed: 3000,
        centeredSlides: true,
        autoplay: {
          delay: 0,
          disableOnInteraction: false,
        },
      });
    }

    // Testimonials Slider
    if ($('.ht-testi-slider').length > 0) {
      const testimonialSliders = new Swiper('.ht-testi-slider', {
        spaceBetween: 30,
        speed: 2000,
        loop: true,
        autoplay: {
          delay: 3500,
          disableOnInteraction: false,
        },
        navigation: {
          nextEl: '.ht-testi-next',
          prevEl: '.ht-testi-prev',
        },
        breakpoints: {
          575: {
            slidesPerView: 1,
          },
          0: {
            slidesPerView: 1,
          },
        },
      });
    }

    // Testimonials Slider-2
    if ($('.ht-testi-slider-2').length > 0) {
      const testimonialSliders = new Swiper('.ht-testi-slider-2', {
        spaceBetween: 30,
        slidesPerView: 3,
        speed: 2000,
        loop: true,
        autoplay: {
          delay: 3500,
          disableOnInteraction: false,
        },
        navigation: {
          nextEl: '.ht-testi-next-2',
          prevEl: '.ht-testi-prev-2',
        },
        breakpoints: {
          1200: { slidesPerView: 3 },
          992: { slidesPerView: 2 },
          768: { slidesPerView: 2 },
          576: { slidesPerView: 1 },
          0: { slidesPerView: 1 },
        },
      });
    }

    // Testimonials Slider-2
    if ($('.ht-testi-slider-3').length > 0) {
      const testimonialSliders = new Swiper('.ht-testi-slider-3', {
        spaceBetween: 30,
        slidesPerView: 1,
        speed: 2000,
        loop: true,
        autoplay: {
          delay: 3500,
          disableOnInteraction: false,
        },
        navigation: {
          nextEl: '.testi-slides-next',
          prevEl: '.testi-slides-prev',
        },
      });
    }

    // Project Slider
    if ($('.ht-project-slider').length > 0) {
      const projectSliders = new Swiper('.ht-project-slider', {
        slidesPerView: 4,
        spaceBetween: 30,
        speed: 1000,
        loop: true,
        autoplay: {
          delay: 1500,
          disableOnInteraction: false,
        },
        navigation: {
          nextEl: '.ht-project-next',
          prevEl: '.ht-project-prev',
        },
        breakpoints: {
          992: { slidesPerView: 4 },
          768: { slidesPerView: 3 },
          576: { slidesPerView: 1 },
          0: { slidesPerView: 1 },
        },
      });
    }

    // hero Slider
    if ($('.hero-img-slide').length > 0) {
      const heroImgSlides = new Swiper('.hero-img-slide', {
        slidesPerView: 1,
        spaceBetween: 30,
        speed: 1000,
        loop: true,
        navigation: {
          nextEl: '.ht-hero-next',
        },
      });
    }

    //>> Data Background Image Start <<//
    $('[data-bg-src]').each(function () {
      var $this = $(this),
        bg = $this.data('bg-src');

      if (bg) {
        $this.css({
          'background-image': 'url(' + bg + ')',
          'background-size': 'cover',
          'background-position': 'center',
          'background-repeat': 'no-repeat',
        });
      }
    });

    //>> Back To Top Slider Start <<//
    $windowOn.on('scroll', function () {
      if ($(this).scrollTop() > 20) {
        $('#back-top').addClass('show');
      } else {
        $('#back-top').removeClass('show');
      }
    });

    //>> Mouse Cursor Start <<//
    function mousecursor() {
      if ($('body')) {
        const e = document.querySelector('.cursor-inner'),
          t = document.querySelector('.cursor-outer');
        let n,
          i = 0,
          o = !1;
        (window.onmousemove = function (s) {
          o || (t.style.transform = 'translate(' + s.clientX + 'px, ' + s.clientY + 'px)'),
            (e.style.transform = 'translate(' + s.clientX + 'px, ' + s.clientY + 'px)'),
            (n = s.clientY),
            (i = s.clientX);
        }),
          $('body').on('mouseenter', 'a, .cursor-pointer', function () {
            e.classList.add('cursor-hover'), t.classList.add('cursor-hover');
          }),
          $('body').on('mouseleave', 'a, .cursor-pointer', function () {
            ($(this).is('a') && $(this).closest('.cursor-pointer').length) ||
              (e.classList.remove('cursor-hover'), t.classList.remove('cursor-hover'));
          }),
          (e.style.visibility = 'visible'),
          (t.style.visibility = 'visible');
      }
    }
    $(function () {
      mousecursor();
    });

    $documentOn.on('click', '#back-top', function () {
      $('html, body').animate({ scrollTop: 0 }, 1);
      return false;
    });
  }); // End Document Ready Function
})(jQuery); // End jQuery
