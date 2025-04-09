// auth.js
const sportyAuth = {
    // Check if user is authenticated
    isAuthenticated: function() {
      return !!localStorage.getItem('sportyfy_token');
    },
    
    // Login user
    login: async function(email, password) {
      try {
        const response = await fetch('https://api.sportyfy.live/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: { email, password } })
        });
        
        if (!response.ok) throw new Error('Login failed');
        
        const data = await response.json();
        localStorage.setItem('sportyfy_token', data.token);
        localStorage.setItem('sportyfy_user', JSON.stringify(data.user));
        
        return data.user;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    
    // Register user
    register: async function(userData) {
      try {
        const response = await fetch('https://api.sportyfy.live/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: userData })
        });
        
        if (!response.ok) throw new Error('Registration failed');
        
        const data = await response.json();
        localStorage.setItem('sportyfy_token', data.token);
        localStorage.setItem('sportyfy_user', JSON.stringify(data.user));
        
        return data.user;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    
    // Logout user
    logout: function() {
      localStorage.removeItem('sportyfy_token');
      localStorage.removeItem('sportyfy_user');
    }
  };