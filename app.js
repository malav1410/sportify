// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingStatus = document.getElementById('loadingStatus');
    const viewerCount = document.getElementById('viewerCount');
    
    // Loading sequence steps
    const loadingSteps = [
        { progress: 15, message: 'INITIALIZING PROTOCOL' },
        { progress: 30, message: 'ESTABLISHING NEURAL CONNECTION' },
        { progress: 45, message: 'SCANNING ENVIRONMENT' },
        { progress: 65, message: 'CALIBRATING STREAM PARAMETERS' },
        { progress: 80, message: 'OPTIMIZING PERFORMANCE METRICS' },
        { progress: 95, message: 'FINALIZING SYSTEM INTEGRATION' },
        { progress: 100, message: 'SYSTEM READY' }
    ];
    
    // Execute loading sequence
    let currentStep = 0;
    
    const loadingInterval = setInterval(function() {
        if (currentStep >= loadingSteps.length) {
            clearInterval(loadingInterval);
            setTimeout(function() {
                loadingScreen.style.opacity = '0';
                setTimeout(function() {
                    loadingScreen.style.display = 'none';
                    startPageAnimations();
                }, 500);
            }, 800);
            return;
        }
        
        const step = loadingSteps[currentStep];
        loadingProgress.style.width = step.progress + '%';
        loadingStatus.textContent = step.message;
        currentStep++;
    }, 700);
    
    // Start main page animations after loading
    function startPageAnimations() {
        // Handle header scroll behavior
        const header = document.querySelector('.main-header');
        
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
        
        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (navToggle) {
            navToggle.addEventListener('click', function() {
                mainNav.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
        
        // Animate stats counters when in viewport
        const stats = document.querySelectorAll('.stat-value');
        
        function animateStats() {
            stats.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-count'));
                const span = stat.querySelector('span');
                let current = 0;
                const increment = target / 60; // Adjust for animation speed
                const timer = setInterval(function() {
                    current += increment;
                    span.textContent = Math.floor(current);
                    if (current >= target) {
                        span.textContent = target;
                        clearInterval(timer);
                    }
                }, 30);
            });
        }
        
        // Check if element is in viewport
        function isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
        
        // Trigger animations when scrolling
        let statsAnimated = false;
        
        window.addEventListener('scroll', function() {
            if (!statsAnimated && stats.length > 0 && isInViewport(stats[0])) {
                animateStats();
                statsAnimated = true;
            }
        });
        
        // Initial check for elements in viewport
        setTimeout(function() {
            if (!statsAnimated && stats.length > 0 && isInViewport(stats[0])) {
                animateStats();
                statsAnimated = true;
            }
        }, 500);
        
        // Simulate live viewer count updates
        if (viewerCount) {
            setInterval(function() {
                const currentCount = parseInt(viewerCount.textContent.replace(',', ''));
                const change = Math.floor(Math.random() * 11) - 5; // Random change between -5 and +5
                const newCount = Math.max(1000, currentCount + change);
                viewerCount.textContent = newCount.toLocaleString();
            }, 3000);
        }
        
        // Add reveal animations for sections
        const revealElements = document.querySelectorAll('.section-header, .feature-card, .intro-card, .sport-card, .showcase-visual, .access-form');
        
        function revealElement(element) {
            element.classList.add('revealed');
        }
        
        window.addEventListener('scroll', function() {
            revealElements.forEach(element => {
                if (isInViewport(element) && !element.classList.contains('revealed')) {
                    setTimeout(function() {
                        revealElement(element);
                    }, 150);
                }
            });
        });
        
        // Initial check for elements in viewport
        revealElements.forEach(element => {
            if (isInViewport(element)) {
                setTimeout(function() {
                    revealElement(element);
                }, 150);
            }
        });
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Close mobile menu if open
                    if (mainNav.classList.contains('active')) {
                        mainNav.classList.remove('active');
                        navToggle.classList.remove('active');
                    }
                    
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Adjust for header height
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Form submission handling
        const waitlistForm = document.getElementById('waitlistForm');
        if (waitlistForm) {
            waitlistForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form values
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const role = document.getElementById('role').value;
                
                // In a real application, you would send this data to your server
                // For demo purposes, we'll just show a success message
                
                waitlistForm.innerHTML = `
                    <div class="form-success">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="success-icon">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <h3 class="success-title">ACCESS REQUEST SUBMITTED</h3>
                        <p class="success-message">Thank you, ${name}. We've added you to our waitlist as a ${role.toLowerCase()}. You'll receive updates at ${email}.</p>
                    </div>
                `;
            });
        }
        
        // Add particle background effect
        createParticleBackground();
    }
    
    // Create particle background effect
    function createParticleBackground() {
        const sections = document.querySelectorAll('.features-section, .access-section');
        
        sections.forEach(section => {
            // Create canvas element
            const canvas = document.createElement('canvas');
            canvas.classList.add('particle-canvas');
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '0';
            
            // Insert canvas as first child of section
            section.style.position = 'relative';
            section.insertBefore(canvas, section.firstChild);
            
            // Set canvas size
            const setCanvasSize = () => {
                canvas.width = section.offsetWidth;
                canvas.height = section.offsetHeight;
            };
            
            setCanvasSize();
            window.addEventListener('resize', setCanvasSize);
            
            // Create particles
            const ctx = canvas.getContext('2d');
            const particles = [];
            const particleCount = Math.floor(canvas.width * canvas.height / 15000); // Adjust density
            
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 3 + 1,
                    speedX: Math.random() * 0.2 - 0.1,
                    speedY: Math.random() * 0.2 - 0.1,
                    opacity: Math.random() * 0.5 + 0.1
                });
            }
            
            // Animate particles
            function animateParticles() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    
                    p.x += p.speedX;
                    p.y += p.speedY;
                    
                    // Wrap around edges
                    if (p.x > canvas.width) p.x = 0;
                    if (p.x < 0) p.x = canvas.width;
                    if (p.y > canvas.height) p.y = 0;
                    if (p.y < 0) p.y = canvas.height;
                    
                    // Draw particle
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(12, 255, 127, ${p.opacity})`;
                    ctx.fill();
                }
                
                requestAnimationFrame(animateParticles);
            }
            
            animateParticles();
        });
    }
    
    // Add animated cursor effect
    function createCustomCursor() {
        const cursorDot = document.createElement('div');
        cursorDot.classList.add('cursor-dot');
        
        const cursorRing = document.createElement('div');
        cursorRing.classList.add('cursor-ring');
        
        document.body.appendChild(cursorDot);
        document.body.appendChild(cursorRing);
        
        // Apply styles
        const cursorStyles = `
            .cursor-dot {
                position: fixed;
                top: 0;
                left: 0;
                width: 8px;
                height: 8px;
                background-color: var(--primary);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
            }
            
            .cursor-ring {
                position: fixed;
                top: 0;
                left: 0;
                width: 40px;
                height: 40px;
                border: 1px solid rgba(12, 255, 127, 0.5);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                transform: translate(-50%, -50%);
                transition: width 0.2s, height 0.2s;
            }
            
            a:hover ~ .cursor-ring,
            button:hover ~ .cursor-ring {
                width: 60px;
                height: 60px;
                border-color: rgba(12, 255, 127, 0.7);
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.innerHTML = cursorStyles;
        document.head.appendChild(styleElement);
        
        // Update cursor position
        document.addEventListener('mousemove', function(e) {
            cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            
            // Add slight delay to ring
            setTimeout(function() {
                cursorRing.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            }, 50);
        });
        
        // Handle hovering over interactive elements
        document.querySelectorAll('a, button, input, select').forEach(element => {
            element.addEventListener('mouseenter', function() {
                cursorRing.style.width = '60px';
                cursorRing.style.height = '60px';
                cursorRing.style.borderColor = 'rgba(12, 255, 127, 0.7)';
            });
            
            element.addEventListener('mouseleave', function() {
                cursorRing.style.width = '40px';
                cursorRing.style.height = '40px';
                cursorRing.style.borderColor = 'rgba(12, 255, 127, 0.5)';
            });
        });
    }
    
    // Initialize custom cursor on desktop devices
    if (window.matchMedia("(min-width: 992px)").matches) {
        createCustomCursor();
    }
    
    // Add CSS for reveal animations
    const revealStyles = `
        .section-header,
        .feature-card,
        .intro-card,
        .sport-card,
        .showcase-visual,
        .access-form {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .section-header.revealed,
        .feature-card.revealed,
        .intro-card.revealed,
        .sport-card.revealed,
        .showcase-visual.revealed,
        .access-form.revealed {
            opacity: 1;
            transform: translateY(0);
        }
        
        .form-success {
            text-align: center;
            padding: 2rem 0;
        }
        
        .success-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 1.5rem;
            color: var(--primary);
        }
        
        .success-title {
            font-family: var(--font-secondary);
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        
        .success-message {
            color: var(--gray);
            line-height: 1.6;
        }
    `;
    
    // Add reveal styles to page
    const styleElement = document.createElement('style');
    styleElement.innerHTML = revealStyles;
    document.head.appendChild(styleElement);
});