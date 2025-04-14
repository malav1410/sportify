 // === auth-ui.js ===
  // UI interactions for authentication
  
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication service
    AuthService.initialize();
    
    // DOM Elements
    const authModal = document.getElementById('auth-modal');
    const phoneNumberInput = document.getElementById('phone-number');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpContainer = document.getElementById('verify-otp-container');
    const sendOtpContainer = document.getElementById('send-otp-container');
    const otpInput = document.getElementById('otp-input');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const timerText = document.getElementById('timer-text');
    const timerElement = document.getElementById('timer');
    const resendBtn = document.getElementById('resend-btn');
    const closeBtn = authModal.querySelector('.close-btn');
    
    // Register auth triggers
    registerAuthTriggers();
    
    // Update UI based on authentication state
    updateAuthState();
    
    // Register event listeners
    closeBtn.addEventListener('click', hideAuthModal);
    
    authModal.addEventListener('click', function(e) {
      if (e.target === authModal) {
        hideAuthModal();
      }
    });
    
    sendOtpBtn.addEventListener('click', handleSendOTP);
    verifyOtpBtn.addEventListener('click', handleVerifyOTP);
    resendBtn.addEventListener('click', handleResendOTP);
    
    // === CORE UI FUNCTIONS ===
    
    // Show authentication modal
    function showAuthModal() {
      authModal.classList.add('show');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Hide authentication modal
    function hideAuthModal() {
      authModal.classList.remove('show');
      document.body.style.overflow = ''; // Re-enable scrolling
      resetAuthForm();
    }
    
    // Reset authentication form
    function resetAuthForm() {
      if (phoneNumberInput) phoneNumberInput.value = '';
      if (otpInput) otpInput.value = '';
      
      if (sendOtpContainer) sendOtpContainer.classList.remove('hidden');
      if (verifyOtpContainer) verifyOtpContainer.classList.add('hidden');
    }
    
    // Register authentication triggers
    function registerAuthTriggers() {
      // Waitlist buttons
      const waitlistButtons = document.querySelectorAll('a[href="#waitlist"]');
      waitlistButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          showAuthModal();
        });
      });
      
      // Login buttons
      const loginButtons = document.querySelectorAll('#login-button, #show-auth-button');
      loginButtons.forEach(button => {
        if (button) {
          button.addEventListener('click', function(e) {
            e.preventDefault();
            showAuthModal();
          });
        }
      });
    }
    
    // === AUTH HANDLERS ===
    
    // Handle send OTP
    async function handleSendOTP() {
      const phoneNumber = phoneNumberInput.value;
      if (!phoneNumber || phoneNumber.length !== 10) {
        showError('Enter a valid 10-digit mobile number!');
        return;
      }
      
      // Show loading
      sendOtpBtn.disabled = true;
      sendOtpBtn.textContent = 'SENDING...';
      
      const result = await AuthService.sendOTP(phoneNumber);
      
      if (result.success) {
        // Show OTP verification
        sendOtpContainer.classList.add('hidden');
        verifyOtpContainer.classList.remove('hidden');
        
        // Start timer
        AuthService.startResendTimer(60, 
          // onTick
          (time) => {
            timerElement.textContent = time;
          },
          // onComplete
          () => {
            timerText.classList.add('hidden');
            resendBtn.classList.remove('hidden');
          }
        );
        
        // Focus OTP input
        otpInput.focus();
      } else {
        showError(result.error || 'Failed to send OTP. Try again.');
      }
      
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = 'GET OTP';
    }
    
    // Handle verify OTP
    async function handleVerifyOTP() {
      const otp = otpInput.value;
      if (!otp || otp.length !== 6) {
        showError('Enter a valid 6-digit OTP!');
        return;
      }
      
      // Show loading
      verifyOtpBtn.disabled = true;
      verifyOtpBtn.textContent = 'VERIFYING...';
      
      const result = await AuthService.verifyOTP(otp);
      
      if (result.success) {
        // Close modal
        hideAuthModal();
        
        // Update UI
        updateAuthState();
        
        // Show welcome message
        showSuccessToast(result.isNew ? 
          'Welcome to SPORTYFY.LIVE! Complete your profile to get started!' : 
          'Welcome back, champion!');
        
        // Handle new user onboarding
        if (result.isNew) {
          showProfileCompletion(result.user);
        }
      } else {
        showError(result.error || 'Verification failed. Please try again.');
      }
      
      verifyOtpBtn.disabled = false;
      verifyOtpBtn.textContent = 'VERIFY & CONTINUE';
    }
    
    // Handle resend OTP
    async function handleResendOTP() {
      resendBtn.disabled = true;
      
      const result = await AuthService.sendOTP(phoneNumberInput.value);
      
      if (result.success) {
        // Reset timer
        AuthService.startResendTimer(60,
          // onTick
          (time) => {
            timerElement.textContent = time;
          },
          // onComplete
          () => {
            timerText.classList.add('hidden');
            resendBtn.classList.remove('hidden');
          }
        );
        
        resendBtn.classList.add('hidden');
        timerText.classList.remove('hidden');
        
        showSuccessToast('OTP sent again. Check your messages!');
      } else {
        showError(result.error || 'Failed to resend OTP. Try again.');
      }
      
      resendBtn.disabled = false;
    }
    
    // === UI UTILITIES ===
    
    // Show error message
    function showError(message) {
      // Check if error element already exists
      let errorEl = document.querySelector('.error-message');
      
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        const formElement = document.getElementById('phone-auth-form');
        if (formElement) {
          formElement.prepend(errorEl);
        }
      }
      
      errorEl.textContent = message;
      
      // Remove after 3 seconds
      setTimeout(() => {
        if (errorEl.parentElement) {
          errorEl.parentElement.removeChild(errorEl);
        }
      }, 3000);
    }
    
    // Show success toast
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
    
    // Update authentication state UI
    function updateAuthState() {
      const user = AuthService.getCurrentUser();
      const navLinks = document.querySelector('.main-nav');
      
      // Skip if nav not found
      if (!navLinks) return;
      
      // Remove existing auth links
      const existingAuthLinks = navLinks.querySelectorAll('.auth-link');
      existingAuthLinks.forEach(link => link.remove());
      
      if (user) {
        // User is logged in - add profile link
        const profileLink = document.createElement('a');
        profileLink.className = 'nav-item auth-link';
        profileLink.textContent = user.name ? user.name.split(' ')[0] : 'Profile'; // Just first name
        profileLink.href = '#profile';
        navLinks.appendChild(profileLink);
        
        // Add logout link
        const logoutLink = document.createElement('a');
        logoutLink.className = 'nav-item auth-link';
        logoutLink.textContent = 'LOGOUT';
        logoutLink.href = '#';
        logoutLink.addEventListener('click', function(e) {
          e.preventDefault();
          AuthService.logout();
          updateAuthState();
          showSuccessToast('Successfully logged out!');
        });
        navLinks.appendChild(logoutLink);
        
        // Update app state if on game page
        const loginState = document.getElementById('login-state');
        const appState = document.getElementById('app-state');
        
        if (loginState && appState) {
          loginState.classList.add('hidden');
          appState.classList.remove('hidden');
        }
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
        
        // Update app state if on game page
        const loginState = document.getElementById('login-state');
        const appState = document.getElementById('app-state');
        
        if (loginState && appState) {
          loginState.classList.remove('hidden');
          appState.classList.add('hidden');
        }
      }
    }
    
    // Show profile completion UI
    function showProfileCompletion(user) {
      // Create profile completion form
      const profileCompletion = `
        <div class="profile-completion">
          <h2>COMPLETE YOUR PROFILE!</h2>
          <p>You're almost there! Just a few more details to get you started.</p>
          
          <form id="profile-form">
            <div class="form-group">
              <label for="profile-name">Your Name</label>
              <input type="text" id="profile-name" required placeholder="What should we call you?">
            </div>
            
            <div class="form-group">
              <label for="profile-sport">Primary Sport</label>
              <select id="profile-sport" required>
                <option value="">Select your sport</option>
                <option value="cricket">Cricket</option>
                <option value="basketball">Basketball</option>
                <option value="football">Football</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="profile-location">Your City</label>
              <input type="text" id="profile-location" required placeholder="Where do you play?">
            </div>
            
            <button type="submit" class="auth-btn">START MY JOURNEY</button>
          </form>
        </div>
      `;
      
      // Show in main content area
      const mainContent = document.querySelector('.hero-content');
      if (mainContent) {
        mainContent.innerHTML = profileCompletion;
        
        // Handle profile form submission
        const profileForm = document.getElementById('profile-form');
        profileForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const userData = {
            name: document.getElementById('profile-name').value,
            sport: document.getElementById('profile-sport').value,
            location: document.getElementById('profile-location').value
          };
          
          const result = await AuthService.completeProfile(userData);
          
          if (result.success) {
            // Update auth UI
            updateAuthState();
            
            // Redirect to dashboard or reload
            window.location.href = '/dashboard.html';
          } else {
            showError(result.error || 'Failed to update profile. Try again.');
          }
        });
      }
    }
    
    // Make auth UI functions globally available
    window.SportyAuth = {
      showModal: showAuthModal,
      hideModal: hideAuthModal,
      showToast: showSuccessToast,
      showError: showError
    };
  });