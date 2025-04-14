// === auth-service.js ===
// Core authentication service with no UI dependencies

// Self-executing module pattern for encapsulation
const AuthService = (function() {
    // Private service state
    let authTimer;
    let currentUser = null;
    
    // Firebase initialization
    function initialize() {
      FirebaseAuthService.init();
      checkStoredAuth();
    }
    
    // Check existing authentication
    function checkStoredAuth() {
      try {
        const storedUser = localStorage.getItem('sportyfy_user');
        const token = localStorage.getItem('sportyfy_token');
        
        if (storedUser && token) {
          currentUser = JSON.parse(storedUser);
          return true;
        }
      } catch (e) {
        console.error('Auth restore error:', e);
        clearAuthData();
      }
      return false;
    }
    
    // Send OTP via Firebase
    async function sendOTP(phoneNumber) {
      try {
        return await FirebaseAuthService.sendOTP(phoneNumber);
      } catch (error) {
        console.error('OTP send error:', error);
        return { success: false, error: error.message || 'Failed to send OTP' };
      }
    }
    
    // Verify OTP and authenticate
    async function verifyOTP(otp) {
      try {
        // Firebase verification
        const result = await FirebaseAuthService.verifyOTP(otp);
        
        if (!result.success) {
          return result;
        }
        
        // Backend authentication
        const response = await fetch('https://api.sportyfy.live/api/v1/firebase_auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${result.idToken}`
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Store authentication state
          storeAuthData(data.token, data.user);
          currentUser = data.user;
          return { 
            success: true, 
            user: data.user, 
            isNew: data.is_new 
          };
        } else {
          return { 
            success: false, 
            error: data.error || 'Authentication failed' 
          };
        }
      } catch (error) {
        console.error('Verification error:', error);
        return { success: false, error: error.message || 'Verification failed' };
      }
    }
    
    // Start OTP resend timer
    function startResendTimer(seconds, onTick, onComplete) {
      let timeLeft = seconds;
      
      // Clear any existing timer
      if (authTimer) clearInterval(authTimer);
      
      // Update timer display
      const updateTimer = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (typeof onTick === 'function') {
          onTick(formattedTime, timeLeft);
        }
        
        if (timeLeft <= 0) {
          clearInterval(authTimer);
          if (typeof onComplete === 'function') {
            onComplete();
          }
        }
        
        timeLeft--;
      };
      
      // Initial update
      updateTimer();
      
      // Start interval
      authTimer = setInterval(updateTimer, 1000);
      
      return {
        clear: () => {
          if (authTimer) {
            clearInterval(authTimer);
            authTimer = null;
          }
        }
      };
    }
    
    // Handle profile completion
    async function completeProfile(userData) {
      try {
        const response = await fetch('https://api.sportyfy.live/api/v1/firebase_auth/complete_profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('sportyfy_token')}`
          },
          body: JSON.stringify({ user: userData })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          storeAuthData(localStorage.getItem('sportyfy_token'), data.user);
          currentUser = data.user;
          return { success: true, user: data.user };
        } else {
          return { success: false, error: data.error || 'Profile update failed' };
        }
      } catch (error) {
        return { success: false, error: error.message || 'Connection error' };
      }
    }
    
    // Logout user
    function logout() {
      firebase.auth().signOut().catch(e => console.error('Logout error:', e));
      clearAuthData();
      currentUser = null;
      return { success: true };
    }
    
    // Store authentication data
    function storeAuthData(token, user) {
      localStorage.setItem('sportyfy_token', token);
      localStorage.setItem('sportyfy_user', JSON.stringify(user));
    }
    
    // Clear authentication data
    function clearAuthData() {
      localStorage.removeItem('sportyfy_token');
      localStorage.removeItem('sportyfy_user');
    }
    
    // Get current user
    function getCurrentUser() {
      return currentUser;
    }
    
    // Public API
    return {
      initialize,
      sendOTP,
      verifyOTP,
      startResendTimer,
      completeProfile,
      logout,
      getCurrentUser,
      isAuthenticated: () => !!currentUser
    };
  })();