// Add this to a new file called auth-modal.js

document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const authModal = document.getElementById('auth-modal');
    const closeBtn = authModal.querySelector('.close-btn');
    
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

      // Reset form state
        const phoneNumberInput = document.getElementById('phone-number');
        const otpInput = document.getElementById('otp-input');
        const verifyOtpContainer = document.getElementById('verify-otp-container');
        const sendOtpContainer = document.getElementById('send-otp-container');
        
        // Clear inputs
        if (phoneNumberInput) phoneNumberInput.value = '';
        if (otpInput) otpInput.value = '';
        
        // Reset containers
        if (sendOtpContainer) sendOtpContainer.classList.remove('hidden');
        if (verifyOtpContainer) verifyOtpContainer.classList.add('hidden');
    }
    
    // Close button
    closeBtn.addEventListener('click', hideAuthModal);
    
    // Close when clicking outside
    authModal.addEventListener('click', function(e) {
      if (e.target === authModal) {
        hideAuthModal();
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