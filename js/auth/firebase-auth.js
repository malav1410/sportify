// firebase-auth.js
const FirebaseAuthService = {
    // Initialize with invisible reCAPTCHA
    init: function() {
      this.auth = firebase.auth();
      this.auth.languageCode = 'en';
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow sending OTP
          console.log('reCAPTCHA verified');
        }
      });
    },
    
    // Send OTP
    sendOTP: async function(phoneNumber) {
      try {
        // Format with country code if not already formatted
        if (!phoneNumber.startsWith('+')) {
          phoneNumber = '+91' + phoneNumber;
        }
        
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await this.auth.signInWithPhoneNumber(phoneNumber, appVerifier);
        
        // Save confirmation result to window for verification step
        window.confirmationResult = confirmationResult;
        return { success: true };
      } catch (error) {
        console.error('Error sending OTP:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to send OTP' 
        };
      }
    },
    
    // Verify OTP
    verifyOTP: async function(otp) {
      try {
        if (!window.confirmationResult) {
          throw new Error('No OTP was sent');
        }
        
        const result = await window.confirmationResult.confirm(otp);
        const user = result.user;
        
        // Get Firebase ID token for backend authentication
        const idToken = await user.getIdToken();
        
        return {
          success: true,
          firebaseUser: user,
          idToken: idToken,
          phone: user.phoneNumber
        };
      } catch (error) {
        console.error('Error verifying OTP:', error);
        return { 
          success: false, 
          error: error.message || 'Invalid OTP' 
        };
      }
    },
    
    // Sign out
    signOut: async function() {
      try {
        await this.auth.signOut();
        return { success: true };
      } catch (error) {
        console.error('Error signing out:', error);
        return { success: false, error: error.message };
      }
    },
    
    // Get current user
    getCurrentUser: function() {
      return this.auth.currentUser;
    }
  };