// MANAM Core JavaScript Application - Premium Motion & Sound Systems

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCanvasParticles();
  initThemeSwitcher();
  initAudioSynth();
  initEnquiryForm();
  initScrollAnimations();
});

/* ==========================================================================
   1. Preloader System
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const progressBar = document.querySelector('.preloader-bar');
  const countDisplay = document.querySelector('.preloader-count');
  
  if (!preloader) return;

  let count = 0;
  const interval = setInterval(() => {
    count += Math.floor(Math.random() * 8) + 2;
    if (count >= 100) {
      count = 100;
      clearInterval(interval);
      
      // End Loading sequence
      setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        
        // Trigger initial page entrance animations
        document.querySelectorAll('.fade-entrance').forEach((el, index) => {
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, index * 200 + 300);
        });
      }, 500);
    }
    
    progressBar.style.width = `${count}%`;
    countDisplay.textContent = count.toString().padStart(2, '0');
  }, 60);
}

/* ==========================================================================
   2. Canvas Particle Engine (Gold Dust / Stardust)
   ========================================================================== */
let activeParticleColor = '#d3bc97'; // Global variable to react to theme shifts

function initCanvasParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Track cursor position for subtle repulsion
  let mouse = { x: -1000, y: -1000, radius: 120 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * height; // initial spread
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 20;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedY = -(Math.random() * 0.6 + 0.2);
      this.speedX = Math.random() * 0.4 - 0.2;
      this.opacity = Math.random() * 0.6 + 0.1;
      this.amplitude = Math.random() * 1.5 + 0.5;
      this.waveLength = Math.random() * 0.01 + 0.005;
      this.angle = Math.random() * 100;
    }

    update() {
      this.y += this.speedY;
      this.angle += this.waveLength;
      this.x += this.speedX + Math.sin(this.angle) * 0.2;

      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * force * 2;
        this.y += Math.sin(angle) * force * 2;
      }

      // Fade out near top
      if (this.y < 50) {
        this.opacity -= 0.01;
      }

      // Reset when off-screen or faded out
      if (this.y < 0 || this.x < 0 || this.x > width || this.opacity <= 0) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = activeParticleColor;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
    }
  }

  // Populate particles
  const particleCount = Math.min(Math.floor(width / 15), 100);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  
  animate();
}

/* ==========================================================================
   3. Theme Switcher System
   ========================================================================== */
function initThemeSwitcher() {
  const body = document.body;
  const themeChips = document.querySelectorAll('.theme-chip');

  const themeColors = {
    'theme-default': '#d3bc97',
    'theme-royal': '#e2c07f',
    'theme-celestial': '#a9c6e2',
    'theme-minimalist': '#8b7355'
  };

  window.setGlobalTheme = function(themeName) {
    // 1. Remove existing theme classes
    Object.keys(themeColors).forEach(cls => body.classList.remove(cls));

    // 2. Add new theme class
    body.classList.add(themeName);

    // 3. Update particle colors
    activeParticleColor = themeColors[themeName] || '#d3bc97';

    // 4. Highlight active chips/inputs
    themeChips.forEach(chip => {
      if (chip.getAttribute('data-theme') === themeName) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    // 5. Update input selector in the form/previewer if they exist
    const themeSelects = document.querySelectorAll('.theme-selector-input');
    themeSelects.forEach(select => {
      select.value = themeName;
    });

    // 6. Sync invitation preview theme
    if (window.updateInvitationTheme) {
      window.updateInvitationTheme(themeName);
    }
  };

  // Add click listeners to chips
  themeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const theme = chip.getAttribute('data-theme');
      window.setGlobalTheme(theme);
    });
  });

  // Default theme active
  window.setGlobalTheme('theme-default');
}

/* ==========================================================================
   4. Ambient Audio Synthesiser (Web Audio API)
   ========================================================================== */
function initAudioSynth() {
  const audioWidget = document.getElementById('audio-widget');
  if (!audioWidget) return;

  const audioText = audioWidget.querySelector('.audio-txt');
  let isPlaying = false;
  let ytPlayer = null;
  let ytReady = false;

  // Create a hidden div container for the YouTube player
  let playerContainer = document.getElementById('youtube-player-container');
  if (!playerContainer) {
    playerContainer = document.createElement('div');
    playerContainer.id = 'youtube-player-container';
    playerContainer.style.position = 'fixed';
    playerContainer.style.width = '1px';
    playerContainer.style.height = '1px';
    playerContainer.style.left = '-10px';
    playerContainer.style.top = '-10px';
    playerContainer.style.opacity = '0.001';
    playerContainer.style.pointerEvents = 'none';
    document.body.appendChild(playerContainer);
  }

  // Inject YouTube Player API
  if (!document.getElementById('youtube-iframe-api')) {
    const tag = document.createElement('script');
    tag.id = 'youtube-iframe-api';
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  // Global callback required by YouTube Iframe API
  window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('youtube-player-container', {
      videoId: 'gtTjNSeNwDg', // YouTube video ID from your link
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        loop: 1,
        playlist: 'gtTjNSeNwDg' // Loop list requires videoId again
      },
      events: {
        onReady: (e) => {
          ytReady = true;
          e.target.setVolume(30); // Soft luxurious background level (30%)
        }
      }
    });
  };

  function toggleAudio() {
    if (!ytReady || !ytPlayer) {
      audioText.textContent = 'Loading...';
      setTimeout(() => {
        if (!isPlaying && ytReady) toggleAudio();
      }, 500);
      return;
    }

    if (isPlaying) {
      ytPlayer.pauseVideo();
      audioWidget.classList.remove('playing');
      audioText.textContent = 'Sound Off';
      isPlaying = false;
    } else {
      ytPlayer.playVideo();
      audioWidget.classList.add('playing');
      audioText.textContent = 'Ambient: On';
      isPlaying = true;
    }
  }

  audioWidget.addEventListener('click', toggleAudio);

  // Expose a function to play a little "ding" when form is stamped (Web Audio API)
  let audioCtx = null;
  window.playStampSound = function() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    audioCtx.resume();
    const now = audioCtx.currentTime;

    // Heavy stamp thud (synth kick)
    const thud = audioCtx.createOscillator();
    const thudGain = audioCtx.createGain();
    thud.frequency.setValueAtTime(100, now);
    thud.frequency.exponentialRampToValueAtTime(0.01, now + 0.4);
    thudGain.gain.setValueAtTime(0.3, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    thud.connect(thudGain);
    thudGain.connect(audioCtx.destination);
    thud.start(now);
    thud.stop(now + 0.4);

    // Sparkle bells chime
    setTimeout(() => {
      [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
        const chime = audioCtx.createOscillator();
        const chimeGain = audioCtx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(f, now + idx * 0.08);
        chimeGain.gain.setValueAtTime(0.08, now + idx * 0.08);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.2);
        chime.connect(chimeGain);
        chimeGain.connect(audioCtx.destination);
        chime.start(now + idx * 0.08);
        chime.stop(now + idx * 0.08 + 1.2);
      });
    }, 150);
  };
}

/* ==========================================================================
   5. Interactive Enquiry Form (Luxurious Wax Seal Process)
   ========================================================================== */
function initEnquiryForm() {
  const form = document.getElementById('wedding-enquiry-form');
  if (!form) return;

  const steps = form.querySelectorAll('.form-step');
  const progressBar = document.querySelector('.form-progress-bar');
  const nextBtns = form.querySelectorAll('.btn-next');
  const prevBtns = form.querySelectorAll('.btn-prev');
  const waxWrapper = document.getElementById('wax-seal-wrapper');
  const waxStamp = document.getElementById('wax-stamp');
  const stampLogo = document.querySelector('.wax-stamp-logo');
  
  let currentStep = 0;

  function updateFormProgress() {
    steps.forEach((step, idx) => {
      if (idx === currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    const percent = ((currentStep + 1) / steps.length) * 100;
    progressBar.style.width = `${percent}%`;
  }

  // Next steps navigation with validation checks
  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Simple validation for current step fields
      const inputs = steps[currentStep].querySelectorAll('input[required], textarea[required], select[required]');
      let valid = true;
      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = '#ff4d4d';
          valid = false;
        } else {
          input.style.borderColor = 'var(--border-color)';
        }
      });

      if (valid && currentStep < steps.length - 1) {
        currentStep++;
        updateFormProgress();
      }
    });
  });

  // Prev steps navigation
  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        updateFormProgress();
      }
    });
  });

  // Wax stamp submit trigger
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Gather all customer enquiry details
    const coupleNames = document.getElementById('form-couple-names').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const weddingDate = document.getElementById('form-wedding-date').value;
    const guestCount = document.getElementById('form-guest-count').value;
    const themeSelect = document.getElementById('form-theme-select');
    const themeText = themeSelect.options[themeSelect.selectedIndex].text;
    const notes = document.getElementById('form-notes').value.trim();

    const payload = {
      coupleNames: coupleNames,
      email: email,
      phone: phone,
      weddingDate: weddingDate,
      guestCount: guestCount,
      selectedTheme: themeText,
      notes: notes
    };

    // 2. Submit to local server endpoint silently
    fetch('/api/enquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Local server offline or not supported.');
    })
    .then(data => {
      console.log("Enquiry successfully recorded by local server:", data);
    })
    .catch(error => {
      console.log("Local backend not available or POST failed:", error);
    });

    // 3. Submit to Google Sheets (if URL is configured)
    // Create your Google Sheet, add the Apps Script code, and paste your Web App URL below:
    const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxQVp1lzIi62ipA67ETijQbUeLxjVk9gs4qJogfZpGXkXJOEOOATD7ovm8fJQorsubp/exec"; 

    if (GOOGLE_SHEETS_URL) {
      fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(() => {
        console.log("Enquiry successfully recorded by Google Sheets.");
      })
      .catch(error => {
        console.error("Google Sheets submission failed:", error);
      });
    }

    // Show wax overlay
    waxWrapper.classList.add('active');

    // Trigger stamp landing sequence
    setTimeout(() => {
      waxStamp.classList.add('stamped');
      
      // Play synthesized stamping thud and sparkling bells
      if (window.playStampSound) {
        window.playStampSound();
      }

      // Add a slight screenshake
      waxWrapper.style.transform = 'scale(1.02)';
      setTimeout(() => { waxWrapper.style.transform = 'scale(1)'; }, 100);

      // Trigger success text and button reveal
      setTimeout(() => {
        document.querySelector('.seal-success-txt').classList.add('show');
        document.querySelector('.seal-success-subtxt').classList.add('show');
        document.querySelector('.seal-close-btn').classList.add('show');
      }, 800);
      
    }, 600);
  });

  // Close Success Screen Action
  const closeBtn = document.getElementById('seal-close-btn');
  closeBtn.addEventListener('click', () => {
    waxWrapper.classList.remove('active');
    waxStamp.classList.remove('stamped');
    document.querySelector('.seal-success-txt').classList.remove('show');
    document.querySelector('.seal-success-subtxt').classList.remove('show');
    document.querySelector('.seal-close-btn').classList.remove('show');
    
    // Reset Form
    form.reset();
    currentStep = 0;
    updateFormProgress();
  });
}

/* ==========================================================================
   6. Scroll Reveal & GSAP Parallax Animations
   ========================================================================== */
function initScrollAnimations() {
  // Check if IntersectionObserver is available (Standard support)
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-animated');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Register elements to animate on scroll
    document.querySelectorAll('.reveal-fade, .reveal-slide-left, .reveal-slide-right, .reveal-zoom').forEach(el => {
      scrollObserver.observe(el);
    });
  } else {
    // Fallback: make everything visible
    document.querySelectorAll('.reveal-fade, .reveal-slide-left, .reveal-slide-right, .reveal-zoom').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
}
