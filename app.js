/**
 * app.js - Master Interactivity & Audio-Visual Engine for Srika Sarathan's Portfolio
 * Includes custom cursor, 3D card tilt, typewriter, Web Audio API sound fx,
 * modals, interactive cake ordering simulator, copy-to-clipboard, and toast notifications.
 */

(function () {
  'use strict';

  // State Management
  const state = {
    soundEnabled: false,
    audioCtx: null,
    cartItemsCount: 1,
    selectedCake: 'Royal Chocolate Truffle',
    cakePrice: 650
  };

  // ==========================================================================
  // 1. WEB AUDIO API SYNTHESIZER (No external files required!)
  // ==========================================================================
  function initAudio() {
    if (!state.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        state.audioCtx = new AudioContext();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  }

  function playCyberSound(type) {
    if (!state.soundEnabled || !state.audioCtx) return;

    try {
      const now = state.audioCtx.currentTime;
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(state.audioCtx.destination);

      if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(780, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.08);
        osc.frequency.setValueAtTime(659.25, now + 0.16);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      }
    } catch (e) {
      console.warn('Audio synthesis issue:', e);
    }
  }

  // ==========================================================================
  // 2. TOAST NOTIFICATION SYSTEM
  // ==========================================================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    // Icon based on type
    const icon = type === 'success' 
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);

    playCyberSound('success');

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3400);
  }

  // ==========================================================================
  // 3. CUSTOM CYBER CURSOR ENGINE
  // ==========================================================================
  function initCustomCursor() {
    const cursor = document.getElementById('customCursor');
    const follower = document.getElementById('cursorFollower');
    if (!cursor || !follower) return;

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    function renderFollower() {
      posX += (mouseX - posX) * 0.16;
      posY += (mouseY - posY) * 0.16;
      follower.style.transform = `translate(${posX}px, ${posY}px)`;
      requestAnimationFrame(renderFollower);
    }
    renderFollower();

    // Hover effect on links and buttons
    const hoverables = document.querySelectorAll('a, button, input, textarea, select, .cake-card-item, .vault-row');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        follower.classList.add('hovered');
        playCyberSound('hover');
      });
      el.addEventListener('mouseleave', () => {
        follower.classList.remove('hovered');
      });
      el.addEventListener('click', () => {
        playCyberSound('click');
      });
    });
  }

  // ==========================================================================
  // 4. 3D CARD TILT WITH PERSPECTIVE GLOSS
  // ==========================================================================
  function initCardTilt() {
    const cards = document.querySelectorAll('.tilt-card');
    
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        const rotateX = -deltaY * 7.5;
        const rotateY = deltaX * 7.5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  // ==========================================================================
  // 5. TYPEWRITER EFFECT
  // ==========================================================================
  function initTypewriter() {
    const textEl = document.getElementById('typewriterText');
    if (!textEl) return;

    const phrases = [
      'Software Development',
      'Java & OOP Architecture',
      'DBMS & Relational Data',
      'Modern Web Engineering',
      'Computer Science Innovation'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        textEl.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 45;
      } else {
        textEl.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 110;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        typingSpeed = 2000; // Pause at end of word
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 500; // Pause before new word
      }

      setTimeout(type, typingSpeed);
    }

    type();
  }

  // ==========================================================================
  // 6. NAVBAR SCROLL SPY & MOBILE TOGGLE
  // ==========================================================================
  function initNavigation() {
    const nav = document.getElementById('siteNav');
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Navbar background blur & style change on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      // Scroll spy for current active link
      let currentSectionId = '';
      sections.forEach((sec) => {
        const top = sec.offsetTop - 180;
        const height = sec.offsetHeight;
        if (window.scrollY >= top && window.scrollY < top + height) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }, { passive: true });

    // Mobile menu toggle
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        nav.classList.toggle('mobile-open');
        const isOpen = nav.classList.contains('mobile-open');
        mobileBtn.setAttribute('aria-expanded', isOpen);
      });
    }

    // Close mobile nav on click
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('mobile-open');
        if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Sound toggle button
    const soundToggle = document.getElementById('soundToggle');
    const soundIcon = document.getElementById('soundIcon');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        initAudio();
        state.soundEnabled = !state.soundEnabled;
        if (state.soundEnabled) {
          soundToggle.style.color = 'var(--cyan-primary)';
          soundToggle.style.borderColor = 'var(--cyan-primary)';
          soundIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          `;
          showToast('Cyber Audio Synthesizer Enabled 🔊', 'info');
          playCyberSound('success');
        } else {
          soundToggle.style.color = 'var(--text-secondary)';
          soundToggle.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          soundIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          `;
          showToast('Cyber Audio Muted 🔇', 'info');
        }
      });
    }
  }

  // ==========================================================================
  // 7. CAKE CASTLE INTERACTIVE SIMULATOR (Project Showcase)
  // ==========================================================================
  function initCakeCastleSimulator() {
    const cakeCards = document.querySelectorAll('.cake-card-item');
    const queryMonitor = document.getElementById('liveQueryText');
    const cartBadge = document.getElementById('cartCountBadge');

    cakeCards.forEach((card) => {
      card.addEventListener('click', () => {
        cakeCards.forEach((c) => {
          c.classList.remove('selected');
          const btn = c.querySelector('.cake-order-action');
          if (btn) btn.textContent = '+ Add to Order';
        });

        card.classList.add('selected');
        const btn = card.querySelector('.cake-order-action');
        if (btn) btn.textContent = 'Selected';

        const cakeName = card.getAttribute('data-cake');
        const cakePrice = card.getAttribute('data-price');
        state.selectedCake = cakeName;
        state.cartItemsCount++;

        if (cartBadge) {
          cartBadge.textContent = `${state.cartItemsCount} Items In Order`;
          cartBadge.style.transform = 'scale(1.1)';
          setTimeout(() => { cartBadge.style.transform = 'scale(1)'; }, 200);
        }

        if (queryMonitor) {
          queryMonitor.textContent = `SELECT * FROM Cake_Inventory WHERE name = '${cakeName}' AND price = '${cakePrice}';`;
          queryMonitor.style.color = '#00f5d4';
          setTimeout(() => { queryMonitor.style.color = '#38bdf8'; }, 600);
        }

        showToast(`Added ${cakeName} (${cakePrice}) to active order!`, 'success');
      });
    });

    // Modal Order Simulator Calculation
    const flavorSelect = document.getElementById('modalFlavorSelect');
    const weightSelect = document.getElementById('modalWeightSelect');
    const orderTotalEl = document.getElementById('modalOrderTotal');
    const sqlOutput = document.getElementById('modalSqlOutput');
    const simulateOrderBtn = document.getElementById('modalSimulateOrderBtn');

    function updateModalBill() {
      if (!flavorSelect || !weightSelect || !orderTotalEl) return;
      const selectedOption = flavorSelect.options[flavorSelect.selectedIndex];
      const rate = parseFloat(selectedOption.getAttribute('data-rate')) || 650;
      const weight = parseFloat(weightSelect.value) || 1.0;
      const total = rate * weight;

      orderTotalEl.textContent = `₹${total.toFixed(2)}`;

      if (sqlOutput) {
        const orderId = Math.floor(1000 + Math.random() * 9000);
        sqlOutput.textContent = `INSERT INTO Cake_Orders (order_id, cake_name, weight_kg, total_amount, order_status, created_at)\nVALUES (${orderId}, '${selectedOption.value}', ${weight.toFixed(1)}, ${total.toFixed(2)}, 'CONFIRMED', NOW());`;
      }
    }

    if (flavorSelect) flavorSelect.addEventListener('change', updateModalBill);
    if (weightSelect) weightSelect.addEventListener('change', updateModalBill);

    if (simulateOrderBtn) {
      simulateOrderBtn.addEventListener('click', () => {
        playCyberSound('success');
        showToast('DBMS Query successfully committed to database transaction log!', 'success');
      });
    }
  }

  // ==========================================================================
  // 8. MODAL CONTROLS & RESUME ACTIONS
  // ==========================================================================
  function initModals() {
    // Project Demo Modal
    const projectModal = document.getElementById('projectModal');
    const openDemoBtn = document.getElementById('openProjectDemoBtn');
    const closeDemoBtn = document.getElementById('closeProjectModalBtn');

    if (openDemoBtn && projectModal) {
      openDemoBtn.addEventListener('click', () => {
        projectModal.classList.add('open');
      });
    }

    if (closeDemoBtn && projectModal) {
      closeDemoBtn.addEventListener('click', () => {
        projectModal.classList.remove('open');
      });
    }

    // Architecture Modal
    const archModal = document.getElementById('archModal');
    const openArchBtn = document.getElementById('openArchModalBtn');
    const closeArchBtn = document.getElementById('closeArchModalBtn');

    if (openArchBtn && archModal) {
      openArchBtn.addEventListener('click', () => {
        archModal.classList.add('open');
      });
    }

    if (closeArchBtn && archModal) {
      closeArchBtn.addEventListener('click', () => {
        archModal.classList.remove('open');
      });
    }

    // Airline ML Details Modal
    const airlineModal = document.getElementById('airlineModal');
    const openAirlineBtn = document.getElementById('openAirlineModalBtn');
    const closeAirlineBtn = document.getElementById('closeAirlineModalBtn');

    if (openAirlineBtn && airlineModal) {
      openAirlineBtn.addEventListener('click', () => {
        playCyberSound('click');
        airlineModal.classList.add('open');
      });
    }

    if (closeAirlineBtn && airlineModal) {
      closeAirlineBtn.addEventListener('click', () => {
        airlineModal.classList.remove('open');
      });
    }

    // Hero "Inspect Official Resume" Button scrolls directly & highlights
    const openResumeBtn = document.getElementById('openResumeModalBtn');
    if (openResumeBtn) {
      openResumeBtn.addEventListener('click', () => {
        const resumeSec = document.getElementById('resume');
        if (resumeSec) {
          resumeSec.scrollIntoView({ behavior: 'smooth' });
          const preview = document.getElementById('printableResume');
          if (preview) {
            preview.style.borderColor = 'var(--cyan-primary)';
            setTimeout(() => {
              preview.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            }, 1800);
          }
        }
      });
    }

    // Close on overlay backdrop click
    [projectModal, archModal, airlineModal].forEach((modal) => {
      if (!modal) return;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (projectModal) projectModal.classList.remove('open');
        if (archModal) archModal.classList.remove('open');
        if (airlineModal) airlineModal.classList.remove('open');
      }
    });

    // Print Resume Trigger
    const printBtn = document.getElementById('printResumeBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Copy Resume Full Text
    const copyResumeBtn = document.getElementById('copyResumeTextBtn');
    if (copyResumeBtn) {
      copyResumeBtn.addEventListener('click', () => {
        const resumeText = `
SRIKA SARATHAN
B.Sc Computer Science Graduate
Location: Namakkal, Tamil Nadu
Phone: 7603909713 | Email: srikasarathan@gmail.com

CAREER OBJECTIVE
Motivated and enthusiastic B.Sc Computer Science graduate seeking an entry-level opportunity to apply my technical knowledge, develop my skills, and contribute effectively to an organization while building a successful career in the IT field.

EDUCATION
• B.Sc Computer Science — Muthayammal College of Arts and Science, Rasipuram
• 12th Grade (HSC) — State Board of Tamil Nadu (Score: 445 Marks)
• 10th Grade (SSLC) — State Board of Tamil Nadu (Score: 380 Marks)

TECHNICAL SKILLS
• HTML (Semantic Web & Interface Design)
• Java (Core OOP Principles & Logic)
• DBMS (Database Management Systems & SQL Queries)
• Python & Machine Learning (scikit-learn, Flask, pandas)
• Computer Science Fundamentals

PROJECTS
• Cake Castle Project: Full bakery order & inventory management software with relational DBMS schema. Tech: HTML5, Java, DBMS, SQL.
• Airline Customer Satisfaction Predictor (GitHub: github.com/srikasarathan-cyber/srika-1): End-to-end ML web app predicting airline passenger satisfaction using Random Forest (200 estimators, 95.43% accuracy) on 129,880 records. Deployed as a Flask web app. Tech: Python, scikit-learn, Flask, pandas, numpy, matplotlib, seaborn, joblib.

PERSONAL DETAILS
• Date of Birth: 06/07/2007
• Gender: Female
• Father's Name: Sarathan
• Marital Status: Single
• Address: 3/78 Akkiyampatti, Sendamangalam, Namakkal, Tamil Nadu
• Languages: Tamil, English
        `.trim();

        navigator.clipboard.writeText(resumeText).then(() => {
          showToast('Resume transcript copied to clipboard!', 'success');
        }).catch(() => {
          showToast('Failed to copy. Please manually copy.', 'info');
        });
      });
    }
  }

  // ==========================================================================
  // 9. COPY BUTTONS & CONTACT FORM
  // ==========================================================================
  function initCopyButtons() {
    // Quick copy button in Hero Hologram card
    const heroCopyBtn = document.getElementById('copyContactQuickBtn');
    if (heroCopyBtn) {
      heroCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('7603909713').then(() => {
          showToast('Copied Srika\'s Phone (+91 7603909713) to clipboard!', 'success');
        });
      });
    }

    // Copy buttons in contact section
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const textToCopy = btn.getAttribute('data-copy');
        if (textToCopy) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            showToast(`Copied "${textToCopy}" to clipboard!`, 'success');
            const originalText = btn.innerHTML;
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
            setTimeout(() => { btn.innerHTML = originalText; }, 2000);
          });
        }
      });
    });

    // Contact Form submission simulation
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('senderName').value;
        const email = document.getElementById('senderEmail').value;
        const subject = document.getElementById('subjectLine').value;
        const message = document.getElementById('messageContent').value;

        const submitBtn = document.getElementById('submitFormBtn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>Transmitting Message...</span>`;
        }

        setTimeout(() => {
          showToast(`Thank you, ${name}! Your inquiry has been dispatched to srikasarathan@gmail.com.`, 'success');
          contactForm.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              <span>Transmit Message</span>
            `;
          }
        }, 1200);
      });
    }
  }

  // ==========================================================================
  // 10. SCROLL REVEAL OBSERVER
  // ==========================================================================
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.glass-panel, .timeline-item, .section-header');
    
    revealElements.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el) => observer.observe(el));
  }

  // Initialize all modules when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initCardTilt();
    initTypewriter();
    initNavigation();
    initCakeCastleSimulator();
    initModals();
    initCopyButtons();
    initScrollReveal();
  });
})();
