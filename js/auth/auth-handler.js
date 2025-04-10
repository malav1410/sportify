// auth-handler.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase Auth
    FirebaseAuthService.init();
    
    // Elements
    const phoneNumberInput = document.getElementById('phone-number');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpContainer = document.getElementById('verify-otp-container');
    const sendOtpContainer = document.getElementById('send-otp-container');
    const otpInput = document.getElementById('otp-input');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const timerText = document.getElementById('timer-text');
    const timerElement = document.getElementById('timer');
    const resendBtn = document.getElementById('resend-btn');
    
    let timer;
    
    // Send OTP
    sendOtpBtn.addEventListener('click', async function() {
      // Validate phone number
      const phoneNumber = phoneNumberInput.value;
      if (!phoneNumber || phoneNumber.length !== 10) {
        showError('Enter a valid 10-digit mobile number!');
        return;
      }
      
      // Show loading
      sendOtpBtn.disabled = true;
      sendOtpBtn.textContent = 'SENDING...';
      
      try {
        const result = await FirebaseAuthService.sendOTP(phoneNumber);
        
        if (result.success) {
          // Show OTP verification
          sendOtpContainer.classList.add('hidden');
          verifyOtpContainer.classList.remove('hidden');
          
          // Start timer
          startResendTimer(60);
          
          // Focus OTP input
          otpInput.focus();
        } else {
          showError(result.error || 'Failed to send OTP. Try again.');
          sendOtpBtn.disabled = false;
          sendOtpBtn.textContent = 'GET OTP';
        }
      } catch (error) {
        showError('Failed to send OTP. Try again.');
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = 'GET OTP';
      }
    });
    
    // Verify OTP
    verifyOtpBtn.addEventListener('click', async function() {
      const otp = otpInput.value;
      if (!otp || otp.length !== 6) {
        showError('Enter a valid 6-digit OTP!');
        return;
      }
      
      // Show loading
      verifyOtpBtn.disabled = true;
      verifyOtpBtn.textContent = 'VERIFYING...';
      
      try {
        const result = await FirebaseAuthService.verifyOTP(otp);
        
        if (result.success) {
          // Clear timer
          clearInterval(timer);
          
          // Get auth token from backend
          const response = await fetch('https://api.sportyfy.live/api/v1/firebase_auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${result.idToken}`
            }
          });
          
          const data = await response.json();
          
          if (response.ok) {
            // Save API token
            localStorage.setItem('sportyfy_token', data.token);
            localStorage.setItem('sportyfy_user', JSON.stringify(data.user));
            
            // Close modal
            closeAuthModal();
            
            // Show success message
            showSuccessToast(data.is_new ? 
              'Welcome to SPORTYFY.LIVE! Complete your profile to get started!' : 
              'Welcome back, champion!');
            
            // Redirect to profile completion for new users
            if (data.is_new) {
              showProfileCompletion(data.user);
            } else {
              updateAuthUI(data.user);
            }
          } else {
            showError(data.error || 'Authentication failed. Please try again.');
          }
        } else {
          showError(result.error || 'Invalid OTP. Try again.');
        }
      } catch (error) {
        showError('Verification failed. Please try again.');
      } finally {
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = 'VERIFY & CONTINUE';
      }
    });
    
    // Resend OTP
    resendBtn.addEventListener('click', async function() {
      resendBtn.disabled = true;
      
      try {
        const result = await FirebaseAuthService.sendOTP(phoneNumberInput.value);
        
        if (result.success) {
          // Reset timer
          startResendTimer(60);
          resendBtn.classList.add('hidden');
          timerText.classList.remove('hidden');
          
          showSuccessToast('OTP sent again. Check your messages!');
        } else {
          showError(result.error || 'Failed to resend OTP. Try again.');
        }
      } catch (error) {
        showError('Failed to resend OTP. Try again.');
      } finally {
        resendBtn.disabled = false;
      }
    });
    
    // Start resend timer
    function startResendTimer(seconds) {
      let timeLeft = seconds;
      
      // Clear any existing timer
      if (timer) clearInterval(timer);
      
      // Update timer display
      const updateTimer = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
          clearInterval(timer);
          timerText.classList.add('hidden');
          resendBtn.classList.remove('hidden');
        }
        
        timeLeft--;
      };
      
      // Initial display
      updateTimer();
      
      // Start interval
      timer = setInterval(updateTimer, 1000);
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
          
          try {
            const response = await fetch('/api/v1/firebase_auth/complete_profile', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('sportyfy_token')}`
              },
              body: JSON.stringify({ user: userData })
            });
            
            const data = await response.json();
            
            if (response.ok) {
              localStorage.setItem('sportyfy_user', JSON.stringify(data.user));
              
              // Show success and redirect
              window.location.href = '/dashboard.html';
            } else {
              showError(data.error || 'Failed to update profile. Try again.');
            }
          } catch (error) {
            showError('Connection error. Please try again.');
          }
        });
      }
    }
  });