/* ==========================================================================
   Kiran Portfolio — Main JavaScript Logic & GSAP Animations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme toggle first for fastest response
  initThemeToggle();

  // Set current copyright year
  document.getElementById('currentYear').textContent = new Date().getFullYear();

  // Initialize GSAP ScrollTrigger plugin if available
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initGSAPAnimations();
  }

  initNavScrollHighlight();
  initMobileMenu();
  initContactModal();
  init3DCards();
  initHero3DTilt();
  initStatsCounter();
  initDownloadCV();
  initPreloader();
  initMagneticButtons();
  initHeroWireframeScene();
  initHomeTypewriter();

});

/* --- THEME TOGGLE SYSTEM (DARK / LIGHT MODE) --- */
function initThemeToggle() {
  const toggleBtnDesktop = document.getElementById('themeToggleBtn');
  const toggleBtnMobile = document.getElementById('themeToggleBtnMobile');
  const icons = document.querySelectorAll('.theme-icon-indicator');

  const getSavedTheme = () => {
    return localStorage.getItem('theme') || 'dark';
  };

  const updateUI = (theme) => {
    icons.forEach((icon) => {
      if (theme === 'light') {
        icon.className = 'fa-solid fa-moon theme-icon-indicator';
      } else {
        icon.className = 'fa-solid fa-sun theme-icon-indicator';
      }
    });

    const tooltip = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    if (toggleBtnDesktop) toggleBtnDesktop.setAttribute('title', tooltip);
    if (toggleBtnMobile) toggleBtnMobile.setAttribute('title', tooltip);
  };

  const applyTheme = (theme, animate = true) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateUI(theme);

    if (typeof window.updateHeroSceneTheme === 'function') {
      window.updateHeroSceneTheme(theme);
    }

    if (animate) {
      document.body.classList.add('theme-transition');
      setTimeout(() => {
        document.body.classList.remove('theme-transition');
      }, 400);
    }
  };

  // Set initial state
  const initialTheme = getSavedTheme();
  applyTheme(initialTheme, false);

  const handleToggle = (e) => {
    if (e) e.preventDefault();
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  };

  if (toggleBtnDesktop) {
    toggleBtnDesktop.addEventListener('click', handleToggle);
  }
  if (toggleBtnMobile) {
    toggleBtnMobile.addEventListener('click', handleToggle);
  }
}

/* --- PRELOADER --- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const hide = () => preloader.classList.add('hide');

  // Hide once everything has loaded, with a small minimum-visible delay
  // so it doesn't just flash on fast connections. Also guard with a hard
  // timeout in case the 'load' event is ever delayed by a slow CDN script.
  window.addEventListener('load', () => setTimeout(hide, 700));
  setTimeout(hide, 3000);
}


/* --- HOME TYPEWRITER --- */
function initHomeTypewriter() {
  const target = document.getElementById('typewriterRole');
  if (!target) return;

  const roles = ['Frontend Developer', 'Graphic Designer'];
  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const current = roles[roleIndex];
    target.textContent = deleting
      ? current.slice(0, charIndex - 1)
      : current.slice(0, charIndex + 1);

    charIndex += deleting ? -1 : 1;

    let delay = deleting ? 55 : 85;

    if (!deleting && charIndex === current.length) {
      deleting = true;
      delay = 1500;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 450;
    }

    setTimeout(tick, delay);
  };

  tick();
}

/* --- MAGNETIC BUTTONS (Home hero CTAs) --- */
function initMagneticButtons() {
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (coarsePointer) return;

  document.querySelectorAll('.btn-3d').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0)';
    });
  });
}

/* --- HOME HERO: 3D WIREFRAME SCENE ---
   A rotating wireframe icosahedron with an orbiting particle field,
   scoped to the Home section's canvas only (not a full-page fixed
   canvas), so it scrolls away with the section like normal content. */
function initHeroWireframeScene() {
  const section = document.getElementById('home');
  const canvas = document.getElementById('heroCanvas');
  if (!section || !canvas || typeof THREE === 'undefined') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (err) {
    console.warn('Hero wireframe scene: WebGL unavailable.', err);
    return;
  }

  const setSize = () => {
    const rect = section.getBoundingClientRect();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(rect.width, rect.height);
    return rect;
  };

  let rect = setSize();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 100);
  camera.position.set(0, 0, 7);

  const group = new THREE.Group();
  scene.add(group);

  // Wireframe icosahedron, using the site's gold accent
  const icoGeo = new THREE.IcosahedronGeometry(1.9, 1);
  const icoEdges = new THREE.EdgesGeometry(icoGeo);
  const icoMat = new THREE.LineBasicMaterial({ color: 0xcda44e, transparent: true, opacity: 0.55 });
  group.add(new THREE.LineSegments(icoEdges, icoMat));

  // Soft inner solid core
  const coreGeo = new THREE.IcosahedronGeometry(1.15, 2);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x121216, transparent: true, opacity: 0.85 });
  group.add(new THREE.Mesh(coreGeo, coreMat));

  const coreEdges = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.15, 1));
  const coreLineMat = new THREE.LineBasicMaterial({ color: 0xf3d888, transparent: true, opacity: 0.35 });
  group.add(new THREE.LineSegments(coreEdges, coreLineMat));

  // Orbiting particle field
  const particleCount = 220;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 3.2 + Math.random() * 2.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0x9aa3c9, size: 0.02, transparent: true, opacity: 0.5 });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Dynamic Theme updater for Three.js scene
  window.updateHeroSceneTheme = (theme) => {
    const isLight = theme === 'light';
    if (icoMat) {
      icoMat.color.setHex(isLight ? 0xb38600 : 0xcda44e);
      icoMat.opacity = isLight ? 0.6 : 0.55;
    }
    if (coreMat) {
      coreMat.color.setHex(isLight ? 0xe2e6f2 : 0x121216);
      coreMat.opacity = isLight ? 0.9 : 0.85;
    }
    if (coreLineMat) {
      coreLineMat.color.setHex(isLight ? 0x966f00 : 0xf3d888);
      coreLineMat.opacity = isLight ? 0.45 : 0.35;
    }
    if (particleMat) {
      particleMat.color.setHex(isLight ? 0x7880a4 : 0x9aa3c9);
      particleMat.opacity = isLight ? 0.4 : 0.5;
    }
  };

  // Apply current theme on scene mount
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  window.updateHeroSceneTheme(currentTheme);

  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const clock = new THREE.Clock();
  let frameId;

  function renderStaticFrame() {
    renderer.render(scene, camera);
  }

  function animate() {
    frameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;

    group.rotation.y = t * 0.12 + targetX * 0.5;
    group.rotation.x = t * 0.05 + targetY * 0.3;
    particles.rotation.y = -t * 0.03;
    particles.rotation.x = t * 0.02;

    renderer.render(scene, camera);
  }

  if (reducedMotion) {
    renderStaticFrame();
  } else {
    animate();
  }

  window.addEventListener('resize', () => {
    rect = setSize();
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    if (reducedMotion) renderStaticFrame();
  });
}

/* --- LIVE 3D PORTRAIT — TRACKS THE CURSOR ACROSS THE WHOLE PAGE ---
   The photo card behaves like a real 3D object: it continuously turns
   toward wherever the mouse is on screen (not just on hover), smoothed
   frame-by-frame so the motion feels organic and "alive" rather than
   snapping to the cursor. A light sheen shifts opposite the tilt to
   reinforce the sense of a lit, physical surface. Falls back to a slow
   idle sway on touch devices / reduced-motion so it still feels alive. */
function initHero3DTilt() {
  const stage = document.getElementById('hero3DStage');
  const card = document.getElementById('live3DCard');
  if (!stage || !card) return;

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (coarsePointer || reducedMotion) {
    card.classList.add('idle-sway');
    return;
  }

  const MAX_TILT = 16; // degrees
  let targetX = 0, targetY = 0; // desired rotation
  let currentX = 0, currentY = 0; // smoothed rotation actually applied
  let sheenX = 50, sheenY = 30;
  let rafId = null;

  const updateTarget = (clientX, clientY) => {
    const rect = stage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalize distance from stage center against the viewport size so the
    // portrait keeps "looking" toward the cursor even far away on the page.
    const dx = (clientX - centerX) / (window.innerWidth / 2);
    const dy = (clientY - centerY) / (window.innerHeight / 2);

    targetY = Math.max(-1, Math.min(1, dx)) * MAX_TILT;
    targetX = Math.max(-1, Math.min(1, dy)) * -MAX_TILT;

    sheenX = 50 - (targetY / MAX_TILT) * 40;
    sheenY = 30 - (targetX / MAX_TILT) * 30;
  };

  const tick = () => {
    // Ease toward the target each frame — the "alive", slightly-lagging feel.
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    card.style.transform = `perspective(1400px) rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg) translateZ(14px)`;
    card.style.setProperty('--sheen-x', `${sheenX.toFixed(1)}%`);
    card.style.setProperty('--sheen-y', `${sheenY.toFixed(1)}%`);

    rafId = requestAnimationFrame(tick);
  };

  window.addEventListener('mousemove', (e) => updateTarget(e.clientX, e.clientY), { passive: true });

  stage.classList.add('is-tracking');
  rafId = requestAnimationFrame(tick);

  // Pause the loop when the tab isn't visible to save cycles.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && !rafId) {
      rafId = requestAnimationFrame(tick);
    }
  });
}

/* --- GSAP ANIMATIONS --- */
function initGSAPAnimations() {
  // Hero Entrance Animations
  gsap.from('.hero-greeting', {
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.2
  });

  gsap.from('.hero-title', {
    y: 30,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.4
  });

  gsap.from('.hero-subtitle', {
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.6
  });

  gsap.from('.hero-actions, .hero-socials', {
    y: 20,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    delay: 0.8
  });

  gsap.from('.hero-image-wrapper', {
    scale: 0.9,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.5
  });

  // Scroll Trigger Animations for Cards & Headers
  const scrollElements = document.querySelectorAll('.animate-scroll');
  scrollElements.forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  });
}

/* --- STATS COUNTER ANIMATION --- */
function initStatsCounter() {
  const counters = document.querySelectorAll('.counter');
  let animated = false;

  const runCounter = () => {
    counters.forEach((counter) => {
      const target = +counter.getAttribute('data-target');
      let count = 0;
      const speed = target / 30; // speed step

      const updateCount = () => {
        count += speed;
        if (count < target) {
          counter.innerText = Math.ceil(count).toString().padStart(2, '0');
          setTimeout(updateCount, 40);
        } else {
          counter.innerText = target.toString().padStart(2, '0');
        }
      };

      updateCount();
    });
  };

  // Trigger when stats section enters viewport
  const statsSection = document.querySelector('.stats-row');
  if (statsSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          runCounter();
        }
      });
    }, { threshold: 0.4 });

    observer.observe(statsSection);
  } else {
    runCounter();
  }
}

/* --- NAVIGATION HIGHLIGHT ON SCROLL --- */
function initNavScrollHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        current = sectionId;
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* --- 3D TILT EFFECT FOR CARDS --- */
function init3DCards() {
  const cards = document.querySelectorAll('.card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7; // Tilt max 7deg
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) translateZ(12px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) translateZ(0px)';
    });
  });
}

/* --- MOBILE MENU --- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggle');
  const toggleIcon = document.getElementById('mobileToggleIcon');
  const mobileNav = document.getElementById('mobileNav');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const talkBtnMobile = document.getElementById('openContactBtnMobile');

  if (!toggleBtn || !mobileNav) return;

  const openMenu = () => {
    mobileNav.classList.add('active');
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    if (toggleIcon) {
      toggleIcon.classList.remove('fa-bars');
      toggleIcon.classList.add('fa-xmark');
    }
  };

  const closeMenu = () => {
    mobileNav.classList.remove('active');
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (toggleIcon) {
      toggleIcon.classList.remove('fa-xmark');
      toggleIcon.classList.add('fa-bars');
    }
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (mobileNav.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  if (talkBtnMobile) {
    talkBtnMobile.addEventListener('click', () => {
      closeMenu();
    });
  }

  // Close when clicking anywhere outside
  document.addEventListener('click', (e) => {
    if (mobileNav.classList.contains('active') && !mobileNav.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
      closeMenu();
    }
  });
}

/* --- CONTACT MODAL --- */
function initContactModal() {
  const modal = document.getElementById('contactModal');
  const openBtn = document.getElementById('openContactBtn');
  const openBtnMobile = document.getElementById('openContactBtnMobile');
  const closeBtn = document.getElementById('closeModalBtn');
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');

  const openModal = () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  };

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (openBtnMobile) openBtnMobile.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Any other element on the page (e.g. the Home hero's "Get in touch"
  // button) can open the same modal just by carrying this class.
  document.querySelectorAll('.open-contact-trigger').forEach((el) => {
    el.addEventListener('click', openModal);
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      feedback.style.display = 'block';
      setTimeout(() => {
        feedback.style.display = 'none';
        form.reset();
        closeModal();
      }, 2000);
    });
  }
}

/* --- DOWNLOAD CV TRIGGER --- */
/* --- DOWNLOAD CV TRIGGER ---
   The anchor already has href + download attributes, so the browser
   handles the actual download natively — this just needed to stop
   blocking that with preventDefault(). */
function initDownloadCV() {
  const cvBtn = document.getElementById('downloadCvBtn');
  if (cvBtn) {
    cvBtn.addEventListener('click', () => {
      // Let the native download happen; nothing to intercept here.
    });
  }
}
// WhatsApp Contact Form Integration
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Default form submit hone se rokna

    // Form se inputs ki values lena
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // ⚠️ YAHAN APNA WHATSAPP NUMBER LIKHEIN (Country Code ke sath, bina '+' ya '-' ke)
    // Example Pakistan: "923001234567"
    const myPhoneNumber = "923103400622";

    // Message ka format tayyar karna
    const textMessage = `*New Website Inquiry*%0A%0A` +
      `*Name:* ${encodeURIComponent(name)}%0A` +
      `*Email:* ${encodeURIComponent(email)}%0A` +
      `*Message:* ${encodeURIComponent(message)}`;

    // WhatsApp Redirection Link
    const whatsappURL = `https://wa.me/${myPhoneNumber}?text=${textMessage}`;

    // Naye tab mein WhatsApp kholna
    window.open(whatsappURL, '_blank');

    // Form reset karna aur Modal close karna
    contactForm.reset();
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
      contactModal.classList.remove('active'); // Agar modal active class se khulta/band hota hai
      contactModal.style.display = 'none';      // Alternative hide method
    }
  });
}
/* ==========================================================================
   SMOOTH LIQUID MOUSE FLUID
   ========================================================================== */

(function initLiquidMouseFluid() {
  const canvas = document.getElementById('mouse-smoke');

  if (!canvas) {
    console.error('Liquid Fluid: #mouse-smoke canvas not found.');
    return;
  }

  /*
   * Keep the effect desktop-only. Touch devices do not receive
   * a simulated mouse trail, and reduced-motion users get no fluid layer.
   */
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (coarsePointer || reducedMotion) {
    canvas.style.display = 'none';
    return;
  }

  if (typeof WebGLFluid !== 'function') {
    console.error('Liquid Fluid: WebGLFluid library did not load.');
    canvas.style.display = 'none';
    return;
  }

  /*
   * webgl-fluid 0.4 supports hover interaction, empty initialization
   * with IMMEDIATE:false, automatic-splat control with AUTO:false,
   * and fixed RGB splat colors.
   */
  WebGLFluid(canvas, {
    /* Initial state: EMPTY */
    TRIGGER: 'hover',
    IMMEDIATE: false,
    AUTO: false,

    /* Balanced desktop performance */
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 768,
    CAPTURE_RESOLUTION: 512,

    /* Dissipate instead of filling the page */
    DENSITY_DISSIPATION: 2.2,
    VELOCITY_DISSIPATION: 0.45,

    /* Organic turbulence */
    PRESSURE: 0.8,
    PRESSURE_ITERATIONS: 20,
    CURL: 18,

    /* Controlled injection */
    SPLAT_RADIUS: 0.12,
    SPLAT_FORCE: 4200,

    /* Multiple RGB fluid colors */
    COLORFUL: true,
    COLOR_UPDATE_SPEED: 2.5,

    /* Subtle rendering */
    SHADING: true,
    BLOOM: false,
    SUNRAYS: false,

    /* Preserve the existing portfolio background */
    TRANSPARENT: true,

    PAUSED: false
  });

  /*
   * IMPORTANT: webgl-fluid@0.4 listens for mousemove directly on the canvas.
   * The canvas intentionally uses pointer-events:none so it cannot block the
   * portfolio's buttons, links, cards, and forms. Forward the real document
   * mouse position to the canvas instead. This preserves both requirements:
   * interactive fluid + completely normal pointer interaction.
   */
  const forwardMouseMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    const forwarded = new MouseEvent('mousemove', {
      bubbles: false,
      cancelable: false,
      clientX: event.clientX,
      clientY: event.clientY,
      screenX: event.screenX,
      screenY: event.screenY,
      movementX: event.movementX,
      movementY: event.movementY
    });

    Object.defineProperties(forwarded, {
      offsetX: { value: event.clientX - rect.left },
      offsetY: { value: event.clientY - rect.top }
    });

    canvas.dispatchEvent(forwarded);
  };

  window.addEventListener('mousemove', forwardMouseMove, { passive: true });

  console.log('Liquid Mouse Fluid initialized. Mouse events are forwarded safely.');
})();
