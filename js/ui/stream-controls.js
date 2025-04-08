// Stream UI controls
document.addEventListener('DOMContentLoaded', function() {
    // Don't initialize stream UI if no stream container exists
    const streamContainer = document.getElementById('stream-container');
    if (!streamContainer) return;
    
    // Initialize stream controls
    const goLiveBtn = document.getElementById('go-live-btn');
    const stopStreamBtn = document.getElementById('stop-stream-btn');
    const dataUsageDisplay = document.getElementById('data-usage');
    const networkStatusDisplay = document.getElementById('network-status');
    
    let activeStream = null;
    
    if (goLiveBtn) {
      goLiveBtn.addEventListener('click', async function() {
        try {
          // Show loading state
          goLiveBtn.disabled = true;
          goLiveBtn.innerHTML = 'Preparing Stream...';
          
          // Initialize streaming
          const stream = new SportyfyStream({
            title: 'Live from SPORTYFY!',
            sport: 'Basketball', // Change based on user profile
            location: 'Gujarat' // Change based on user location
          });
          
          // Handle status updates
          stream.onStatusChange = function(status) {
            updateStreamStatus(status);
          };
          
          // Handle network changes
          stream.onNetworkChange = function(status) {
            networkStatusDisplay.textContent = status === 'online' ? 
              'Connected' : 'Recording Offline';
            
            if (status === 'offline') {
              networkStatusDisplay.classList.add('offline');
            } else {
              networkStatusDisplay.classList.remove('offline');
            }
          };
          
          // Handle data usage updates
          stream.onDataUsageUpdate = function(data) {
            dataUsageDisplay.textContent = `${data.mbPerMinute.toFixed(1)} MB/min`;
          };
          
          // Initialize the stream
          const streamData = await stream.initialize();
          activeStream = stream;
          
          // Update UI
          goLiveBtn.style.display = 'none';
          stopStreamBtn.style.display = 'block';
          
          // Start a video preview
          const videoPreview = document.getElementById('video-preview');
          if (videoPreview) {
            videoPreview.srcObject = streamData.stream;
            videoPreview.play();
          }
        } catch (error) {
          console.error('Failed to start stream:', error);
          alert('Could not start stream. Please check camera permissions.');
          
          // Reset UI
          goLiveBtn.disabled = false;
          goLiveBtn.innerHTML = 'Go Live';
        }
      });
    }
    
    if (stopStreamBtn) {
      stopStreamBtn.addEventListener('click', function() {
        if (activeStream) {
          activeStream.stop();
          activeStream = null;
          
          // Update UI
          stopStreamBtn.style.display = 'none';
          goLiveBtn.style.display = 'block';
          goLiveBtn.disabled = false;
          goLiveBtn.innerHTML = 'Go Live';
          
          // Clear video preview
          const videoPreview = document.getElementById('video-preview');
          if (videoPreview) {
            videoPreview.srcObject = null;
          }
        }
      });
    }
    
    function updateStreamStatus(status) {
      const statusDisplay = document.getElementById('stream-status');
      if (!statusDisplay) return;
      
      switch (status.status) {
        case 'recording-offline':
          statusDisplay.textContent = `Recording offline (${status.offlineChunks} chunks)`;
          statusDisplay.className = 'status-offline';
          break;
        case 'uploading-chunks':
          statusDisplay.textContent = `Uploading ${status.remainingChunks}/${status.totalChunks} chunks`;
          statusDisplay.className = 'status-uploading';
          break;
        case 'upload-failed':
          statusDisplay.textContent = `Upload failed (${status.failedChunks} chunks)`;
          statusDisplay.className = 'status-error';
          break;
        case 'upload-complete':
          statusDisplay.textContent = 'Stream restored';
          statusDisplay.className = 'status-success';
          break;
        case 'stopped':
          statusDisplay.textContent = 'Stream ended';
          statusDisplay.className = '';
          break;
        default:
          statusDisplay.textContent = status.status || 'Live';
          statusDisplay.className = 'status-live';
      }
    }
  });