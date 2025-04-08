// js/streaming/stream-core.js

class SportyfyStream {
    constructor(options = {}) {
      this.options = {
        videoBitrate: options.videoBitrate || 1500000,
        audioBitrate: options.audioBitrate || 128000,
        resolution: options.resolution || '720p',
        frameRate: options.frameRate || 30,
        ...options
      };
      
      this.stream = null;
      this.mediaRecorder = null;
      this.cloudflareData = null;
      this.recordedChunks = [];
      this.networkMonitor = new NetworkMonitor();
      this.deviceMonitor = new DeviceMonitor();
      this.dataUsageTracker = new DataUsageTracker();
      this.offlineChunks = [];
      this.sequenceNumber = 0;
      
      // Event listeners
      this.onStatusChange = () => {};
      this.onNetworkChange = () => {};
      this.onDataUsageUpdate = () => {};
    }
    
    // Initialize the stream
    async initialize() {
      try {
        // Check device capabilities first
        const deviceTier = await this.deviceMonitor.checkCapabilities();
        
        // Adjust options based on device
        if (deviceTier === 'low') {
          this.options.videoBitrate = 500000;
          this.options.resolution = '480p';
          this.options.frameRate = 24;
        }
        
        // Get user media
        const constraints = this.getMediaConstraints();
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Create a stream on the server
        const response = await fetch('https://api.sportyfy.live/api/v1/streams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            stream: {
              title: this.options.title || 'Live from SPORTYFY!',
              sport: this.options.sport || 'Other',
              location: this.options.location || 'Unknown'
            }
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create stream');
        }
        
        this.cloudflareData = await response.json();
        
        // Initialize tracking
        this.dataUsageTracker.start(this.stream);
        this.dataUsageTracker.onUpdate((data) => {
          this.onDataUsageUpdate(data);
        });
        
        // Monitor network
        this.networkMonitor.start();
        this.networkMonitor.onStatusChange((status) => {
          this.onNetworkChange(status);
          
          if (status === 'offline') {
            this.startOfflineRecording();
          } else if (status === 'online' && this.offlineChunks.length > 0) {
            this.uploadOfflineChunks();
          }
        });
        
        return {
          stream: this.stream,
          streamId: this.cloudflareData.stream.id,
          streamKey: this.cloudflareData.stream_key,
          rtmpsUrl: this.cloudflareData.rtmps_url
        };
      } catch (error) {
        console.error('Failed to initialize stream:', error);
        throw error;
      }
    }
    
    // Get media constraints based on options
    getMediaConstraints() {
      const videoConstraints = {
        width: this.options.resolution === '720p' ? 1280 : 854,
        height: this.options.resolution === '720p' ? 720 : 480,
        frameRate: this.options.frameRate
      };
      
      return {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: videoConstraints
      };
    }
    
    // Start recording in offline mode
    startOfflineRecording() {
      if (this.mediaRecorder) {
        return; // Already recording
      }
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: this.options.videoBitrate,
        audioBitsPerSecond: this.options.audioBitrate
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.offlineChunks.push({
            data: event.data,
            timestamp: Date.now(),
            sequenceNumber: this.sequenceNumber++
          });
          
          this.onStatusChange({
            status: 'recording-offline',
            offlineChunks: this.offlineChunks.length
          });
        }
      };
      
      this.mediaRecorder.start(10000); // 10-second chunks
    }
    
    // Upload chunks recorded while offline
    async uploadOfflineChunks() {
      if (this.offlineChunks.length === 0) {
        return;
      }
      
      this.onStatusChange({
        status: 'uploading-chunks',
        totalChunks: this.offlineChunks.length,
        remainingChunks: this.offlineChunks.length
      });
      
      const chunksToUpload = [...this.offlineChunks];
      this.offlineChunks = [];
      
      for (let i = 0; i < chunksToUpload.length; i++) {
        const chunk = chunksToUpload[i];
        
        try {
          const formData = new FormData();
          formData.append('chunk', chunk.data);
          formData.append('timestamp', chunk.timestamp);
          formData.append('sequence_number', chunk.sequenceNumber);
          
          await fetch(`https://api.sportyfy.live/api/v1/streams/${this.cloudflareData.stream.id}/chunk`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          });
          
          this.onStatusChange({
            status: 'uploading-chunks',
            totalChunks: chunksToUpload.length,
            remainingChunks: chunksToUpload.length - (i + 1)
          });
        } catch (error) {
          console.error('Failed to upload chunk:', error);
          
          // Put back in queue if upload failed
          this.offlineChunks.push(chunk);
          
          this.onStatusChange({
            status: 'upload-failed',
            failedChunks: this.offlineChunks.length
          });
          
          break;
        }
      }
      
      if (this.offlineChunks.length === 0) {
        this.onStatusChange({
          status: 'upload-complete'
        });
      }
    }
    
    // Stop streaming and clean up
    stop() {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
      
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
      
      this.networkMonitor.stop();
      this.dataUsageTracker.stop();
      
      this.onStatusChange({
        status: 'stopped'
      });
    }
  }
  
  // Export for use in other files
  window.SportyfyStream = SportyfyStream;