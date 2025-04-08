// Data usage monitoring
class DataUsageTracker {
    constructor() {
      this.startTime = null;
      this.lastCheck = null;
      this.totalBytes = 0;
      this.bytesPerMinute = 0;
      this.listeners = [];
      this.trackingInterval = null;
    }
    
    start(stream) {
      this.startTime = Date.now();
      this.lastCheck = this.startTime;
      this.totalBytes = 0;
      
      // Use the VideoTrackReader API if available
      // This is theoretical as this API doesn't exist in browsers yet
      // We're using a simulation approach instead
      
      // Estimate based on bitrate
      const videoBitrate = this.estimateVideoBitrate(stream);
      const audioBitrate = 128000; // Assume 128kbps audio
      
      // Convert to bytes per second
      const bytesPerSecond = (videoBitrate + audioBitrate) / 8;
      
      this.trackingInterval = setInterval(() => {
        const now = Date.now();
        const secondsElapsed = (now - this.lastCheck) / 1000;
        
        const newBytes = bytesPerSecond * secondsElapsed;
        this.totalBytes += newBytes;
        
        // Calculate MB per minute
        this.bytesPerMinute = (newBytes * 60) / secondsElapsed / (1024 * 1024);
        
        this.notifyListeners({
          totalMB: this.totalBytes / (1024 * 1024),
          mbPerMinute: this.bytesPerMinute,
          totalSeconds: (now - this.startTime) / 1000
        });
        
        this.lastCheck = now;
      }, 3000);
    }
    
    stop() {
      if (this.trackingInterval) {
        clearInterval(this.trackingInterval);
        this.trackingInterval = null;
      }
    }
    
    estimateVideoBitrate(stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length === 0) return 0;
      
      const videoTrack = videoTracks[0];
      const settings = videoTrack.getSettings();
      
      // Estimate based on resolution and frameRate
      const width = settings.width || 1280;
      const height = settings.height || 720;
      const frameRate = settings.frameRate || 30;
      
      // Very rough estimation
      if (width >= 1920) return 4500000; // 4.5 Mbps for 1080p
      if (width >= 1280) return 2500000; // 2.5 Mbps for 720p
      return 1000000; // 1 Mbps for lower resolutions
    }
    
    onUpdate(callback) {
      this.listeners.push(callback);
    }
    
    notifyListeners(data) {
      this.listeners.forEach(callback => callback(data));
    }
  }
  
  // Make it globally available
  window.DataUsageTracker = DataUsageTracker;