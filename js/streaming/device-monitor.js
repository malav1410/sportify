// Device capability checking
class DeviceMonitor {
    constructor() {
      this.deviceTier = 'unknown';
    }
    
    async checkCapabilities() {
      // Check memory
      const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
      
      // Check processor (rough estimate based on benchmark)
      const processorPower = await this.estimateProcessorPower();
      
      // Check battery status if available
      let batteryLevel = 1.0; // Default to full
      if (navigator.getBattery) {
        const battery = await navigator.getBattery();
        batteryLevel = battery.level;
      }
      
      // Determine device tier
      if (memory <= 2 || processorPower < 0.5) {
        this.deviceTier = 'low';
      } else if (memory <= 4 || processorPower < 0.8 || batteryLevel < 0.3) {
        this.deviceTier = 'medium';
      } else {
        this.deviceTier = 'high';
      }
      
      return this.deviceTier;
    }
    
    async estimateProcessorPower() {
      const startTime = performance.now();
      
      // Simple benchmark - calculate prime numbers
      const primes = [];
      const max = 10000;
      
      for (let i = 2; i <= max; i++) {
        let isPrime = true;
        for (let j = 2; j <= Math.sqrt(i); j++) {
          if (i % j === 0) {
            isPrime = false;
            break;
          }
        }
        if (isPrime) {
          primes.push(i);
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Normalize score between 0 and 1 (lower is better)
      // A modern flagship phone should complete in ~100ms
      // A low-end device might take ~500ms
      return Math.min(1, 500 / duration);
    }
  }
  
  // Make it globally available
  window.DeviceMonitor = DeviceMonitor;