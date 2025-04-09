// Add this to a new file called auth-modal.js

document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const authModal = document.getElementById('auth-modal');
    const closeBtn = authModal.querySelector('.close-btn');
    const tabBtns = authModal.querySelectorAll('.tab-btn');
    const tabContents = authModal.querySelectorAll('.tab-content');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Convert waitlist buttons to auth triggers
    const waitlistButtons = document.querySelectorAll('a[href="#waitlist"]');
    waitlistButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        showAuthModal();
      });
    });
    
    // Show auth modal
    function showAuthModal() {
      authModal.classList.add('show');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Hide auth modal
    function hideAuthModal() {
      authModal.classList.remove('show');
      document.body.style.overflow = ''; // Re-enable scrolling
    }
    
    // Close button
    closeBtn.addEventListener('click', hideAuthModal);
    
    // Close when clicking outside
    authModal.addEventListener('click', function(e) {
      if (e.target === authModal) {
        hideAuthModal();
      }
    });
    
    // Tab switching
    tabBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Remove active class from all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        const tabId = this.getAttribute('data-tab') + '-tab';
        document.getElementById(tabId).classList.add('active');
      });
    });
    
    // Handle login form
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      try {
        // Show loading
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'LOGGING IN...';
        submitBtn.disabled = true;
        
        // Call login function
        const user = await sportyAuth.login(email, password);
        
        // Success! Hide modal and update UI
        hideAuthModal();
        updateAuthUI(user);
        showSuccessToast('Welcome back, champion!');
        
      } catch (error) {
        // Show error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Invalid email or password. TRY HARDER!';
        
        // Remove any existing error
        const existingError = loginForm.querySelector('.error-message');
        if (existingError) {
          existingError.remove();
        }
        
        loginForm.appendChild(errorDiv);
        
      } finally {
        // Reset button
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.textContent = 'SECURE YOUR SPOTLIGHT';
        submitBtn.disabled = false;
      }
    });
    
    // Handle register form
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const phone = document.getElementById('register-phone').value;
      const sport = document.getElementById('register-sport').value;
      const password = document.getElementById('register-password').value;
      const passwordConfirm = document.getElementById('register-password-confirm').value;
      
      // Validate passwords match
      if (password !== passwordConfirm) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Passwords do not match! FOCUS!';
        
        // Remove any existing error
        const existingError = registerForm.querySelector('.error-message');
        if (existingError) {
          existingError.remove();
        }
        
        registerForm.appendChild(errorDiv);
        return;
      }
      
      try {
        // Show loading
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'CREATING ACCOUNT...';
        submitBtn.disabled = true;
        
        // Call register function
        const userData = { name, email, phone, sport, password, password_confirmation: passwordConfirm };
        const user = await sportyAuth.register(userData);
        
        // Success! Hide modal and update UI
        hideAuthModal();
        updateAuthUI(user);
        showSuccessToast('Welcome to SPORTYFY, ' + user.name + '!');
        
      } catch (error) {
        // Show error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Registration failed. Check your details and TRY AGAIN!';
        
        // Remove any existing error
        const existingError = registerForm.querySelector('.error-message');
        if (existingError) {
          existingError.remove();
        }
        
        registerForm.appendChild(errorDiv);
        
      } finally {
        // Reset button
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.textContent = 'SECURE YOUR SPOTLIGHT';
        submitBtn.disabled = false;
      }
    });
    
    // Update UI based on authentication
    function updateAuthUI(user) {
      const navLinks = document.querySelector('.main-nav');
      
      // Remove existing auth links
      const existingAuthLinks = navLinks.querySelectorAll('.auth-link');
      existingAuthLinks.forEach(link => link.remove());
      
      if (user) {
        // User is logged in - add profile link
        const profileLink = document.createElement('a');
        profileLink.className = 'nav-item auth-link';
        profileLink.textContent = user.name.split(' ')[0]; // Just first name
        profileLink.href = '#profile';
        navLinks.appendChild(profileLink);
        
        // Add logout link
        const logoutLink = document.createElement('a');
        logoutLink.className = 'nav-item auth-link';
        logoutLink.textContent = 'LOGOUT';
        logoutLink.href = '#';
        logoutLink.addEventListener('click', function(e) {
          e.preventDefault();
          sportyAuth.logout();
          updateAuthUI(null);
          showSuccessToast('Successfully logged out!');
        });
        navLinks.appendChild(logoutLink);
      } else {
        // User is logged out - add login link
        const loginLink = document.createElement('a');
        loginLink.className = 'nav-item auth-link';
        loginLink.textContent = 'LOGIN';
        loginLink.href = '#';
        loginLink.addEventListener('click', function(e) {
          e.preventDefault();
          showAuthModal();
        });
        navLinks.appendChild(loginLink);
      }
    }
    
    // Show toast message
    function showSuccessToast(message) {
      const toast = document.createElement('div');
      toast.className = 'success-toast';
      toast.textContent = message;
      
      document.body.appendChild(toast);
      
      // Animate in
      setTimeout(() => {
        toast.classList.add('show');
      }, 100);
      
      // Animate out after 3 seconds
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
    
    // Check if user is already logged in
    const storedUser = localStorage.getItem('sportyfy_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        updateAuthUI(user);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('sportyfy_user');
      }
    }
  });