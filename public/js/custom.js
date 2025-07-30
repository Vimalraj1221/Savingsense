(function() {
    "use strict";

    /**
     * Apply .scrolled class to the body as the page is scrolled down
     */
    function toggleScrolled() {
        const selectBody = document.querySelector('body');
        const selectHeader = document.querySelector('#header');
        if (!selectHeader || (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top'))) return;
        window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
    }

    document.addEventListener('scroll', toggleScrolled);
    window.addEventListener('load', toggleScrolled);

    /**
     * Mobile nav toggle
     */
    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

    function mobileNavToggle() {
        const body = document.querySelector('body');
        if (body && mobileNavToggleBtn) {
            body.classList.toggle('mobile-nav-active');
            mobileNavToggleBtn.classList.toggle('bi-list');
            mobileNavToggleBtn.classList.toggle('bi-x');
        }
    }

    if (mobileNavToggleBtn) {
        mobileNavToggleBtn.addEventListener('click', mobileNavToggle);
    }

    /**
     * Hide mobile nav on same-page/hash links
     */
    const navMenuLinks = document.querySelectorAll('#navmenu a');
    if (navMenuLinks) {
        navMenuLinks.forEach(navmenu => {
            navmenu.addEventListener('click', () => {
                if (document.querySelector('.mobile-nav-active')) {
                    mobileNavToggle();
                }
            });
        });
    }

    /**
     * Toggle mobile nav dropdowns
     */
    const dropdownToggles = document.querySelectorAll('.navmenu .toggle-dropdown');
    if (dropdownToggles) {
        dropdownToggles.forEach(navmenu => {
            navmenu.addEventListener('click', function(e) {
                e.preventDefault();
                if (this.parentNode) {
                    this.parentNode.classList.toggle('active');
                    if (this.parentNode.nextElementSibling) {
                        this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
                    }
                }
                e.stopImmediatePropagation();
            });
        });
    }

    /**
     * Scroll top button
     */
    const scrollTop = document.querySelector('.scroll-top');

    function toggleScrollTop() {
        if (scrollTop) {
            window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
        }
    }

    if (scrollTop) {
        scrollTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    window.addEventListener('load', toggleScrollTop);
    document.addEventListener('scroll', toggleScrollTop);

    /**
     * Animation on scroll function and init
     */
    function aosInit() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 600,
                easing: 'ease-in-out',
                once: true,
                mirror: false
            });
        }
    }
    window.addEventListener('load', aosInit);

    /**
     * Frequently Asked Questions Toggle
     */
    const faqItems = document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle');
    if (faqItems) {
        faqItems.forEach((faqItem) => {
            faqItem.addEventListener('click', () => {
                faqItem.parentNode.classList.toggle('faq-active');
            });
        });
    }

    /**
     * Correct scrolling position upon page load for URLs containing hash links.
     */
    window.addEventListener('load', function() {
        if (window.location.hash) {
            const section = document.querySelector(window.location.hash);
            if (section) {
                setTimeout(() => {
                    const scrollMarginTop = getComputedStyle(section).scrollMarginTop;
                    window.scrollTo({
                        top: section.offsetTop - parseInt(scrollMarginTop),
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }
    });

    /**
     * Navmenu Scrollspy
     */
    const navMenuLinksScrollspy = document.querySelectorAll('.navmenu a');

    function navmenuScrollspy() {
        navMenuLinksScrollspy.forEach(navmenuLink => {
            if (!navmenuLink.hash) return;
            const section = document.querySelector(navmenuLink.hash);
            if (!section) return;
            const position = window.scrollY + 200;
            if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
                document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
                navmenuLink.classList.add('active');
            } else {
                navmenuLink.classList.remove('active');
            }
        });
    }

    if (navMenuLinksScrollspy.length > 0) {
        window.addEventListener('load', navmenuScrollspy);
        document.addEventListener('scroll', navmenuScrollspy);
    }
})();
