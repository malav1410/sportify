// Network monitoring class
class NetworkMonitor {
    constructor() {
      this.status = navigator.onLine ? 'online' : 'offline';
      this.listeners = [];
      this.initialized = false;
    }
    
    start() {
      if (this.initialized) return;
      
      window.addEventListener('online', this.handleStatusChange.bind(this));
      window.addEventListener('offline', this.handleStatusChange.bind(this));
      this.initialized = true;
    }
    
    stop() {
      window.removeEventListener('online', this.handleStatusChange.bind(this));
      window.removeEventListener('offline', this.handleStatusChange.bind(this));
      this.initialized = false;
    }
    
    handleStatusChange(event) {
      this.status = event.type;
      this.notifyListeners(this.status);
    }
    
    notifyListeners(status) {
      this.listeners.forEach(callback => callback(status));
    }
    
    onStatusChange(callback) {
      this.listeners.push(callback);
    }
    
    getStatus() {
      return this.status;
    }
  }
  
  // Make it globally available
  window.NetworkMonitor = NetworkMonitor;