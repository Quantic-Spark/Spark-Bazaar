/**
 * Spark-Bazaar Landing Page JavaScript
 * Handles interactive elements and responsive behavior
 */

document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  initProcessTabs();
  initCategoryTabs();
  initSmoothScroll();
  initFaqToggles();
  initNewsletterForm();
});

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navAuth = document.querySelector('.nav-auth');
  
  if (!menuToggle) return;
  
  menuToggle.addEventListener('click', function() {
    menuToggle.classList.toggle('active');
    
    // Create mobile nav if it doesn't exist
    let mobileNav = document.querySelector('.mobile-nav');
    
    if (!mobileNav) {
      mobileNav = document.createElement('div');
      mobileNav.className = 'mobile-nav';
      
      // Clone navigation links
      const navLinksClone = navLinks.cloneNode(true);
      mobileNav.appendChild(navLinksClone);
      
      // Clone auth buttons
      const navAuthClone = navAuth.cloneNode(true);
      mobileNav.appendChild(navAuthClone);
      
      // Insert after header
      const header = document.querySelector('.header');
      header.parentNode.insertBefore(mobileNav, header.nextSibling);
    }
    
    // Toggle mobile nav
    mobileNav.classList.toggle('active');
    
    // Handle body scroll
    document.body.classList.toggle('menu-active');
  });
}

/**
 * Process Tabs (How It Works section)
 */
function initProcessTabs() {
  const processTabs = document.querySelectorAll('.process-tab');
  const processContents = document.querySelectorAll('.process-content');

  if (processTabs.length === 0 || processContents.length === 0) return;

  processTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      processTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      processContents.forEach(content => content.style.display = 'none');

      const index = Array.from(processTabs).indexOf(tab);
      if (index >= 0 && index < processContents.length) {
        processContents[index].style.display = 'block';
      }
    });
  });
}

/**
 * Category Tabs (Featured Tools section)
 */
function initCategoryTabs() {
  const categoryTabs = document.querySelectorAll('.category-tab');
  
  if (categoryTabs.length === 0) return;
  
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      categoryTabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to current tab
      tab.classList.add('active');
      
      // In a real implementation, this would filter the tools
      // based on the selected category
    });
  });
}

/**
 * Smooth Scroll for Navigation Links
 */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      if (!/^#[a-zA-Z][\w-]*$/.test(href)) return;

      e.preventDefault();

      const targetElement = document.getElementById(href.slice(1));
      if (!targetElement) return;

      const header = document.querySelector('.header');
      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;

      window.scrollTo({
        top: targetPosition - headerHeight,
        behavior: 'smooth'
      });

      const mobileNav = document.querySelector('.mobile-nav');
      if (mobileNav && mobileNav.classList.contains('active')) {
        const toggle = document.querySelector('.mobile-menu-toggle');
        if (toggle) toggle.click();
      }
    });
  });
}

/**
 * Add CSS classes for animations when elements come into view
 * This enhances the landing page with subtle entrance animations
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  // Callback for IntersectionObserver
  const callback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        // Stop observing once animation is triggered
        observer.unobserve(entry.target);
      }
    });
  };
  
  // Set up IntersectionObserver
  const observer = new IntersectionObserver(callback, {
    root: null, // viewport
    threshold: 0.1, // trigger when 10% of the element is visible
    rootMargin: '0px 0px -50px 0px' // trigger slightly before element comes into view
  });
  
  // Observe all animated elements
  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

function initFaqToggles() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      item.classList.toggle('expanded');

      if (item.classList.contains('expanded')) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        answer.style.maxHeight = '0';
      }
    });
  });
}

function initNewsletterForm() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    if (!emailInput) return;

    const email = emailInput.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
    }

    emailInput.value = '';
  });
}

window.addEventListener('load', function() {
  initScrollAnimations();
});
