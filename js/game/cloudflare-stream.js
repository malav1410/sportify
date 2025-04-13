// js/game/cloudflare-stream.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadContainer = document.getElementById('upload-container');
    const videoUploadInput = document.getElementById('video-upload');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const uploadArea = document.getElementById('upload-area');
    const processingArea = document.getElementById('processing-area');
    const resultsArea = document.getElementById('results-area');
    
    // Processing Status Elements
    const analyzingStatus = document.getElementById('analyzing-status');
    const detectingStatus = document.getElementById('detecting-status');
    const creatingStatus = document.getElementById('creating-status');
    
    // Cloudflare Stream API endpoints
    const CLOUDFLARE_ACCOUNT_ID = '97758ca6330ac0fc587c28ea59d500c7'; // Replace with your actual account ID
    const CF_UPLOAD_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;
    
    // Current upload data
    let currentUpload = {
      file: null,
      filename: null,
      videoId: null,
      downloadURL: null,
      highlights: [],
      player: null
    };
    
    // Event Listeners
    
    // Drag and drop handling
    uploadContainer.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.add('border-sporty-red');
    });
    
    uploadContainer.addEventListener('dragleave', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.remove('border-sporty-red');
    });
    
    uploadContainer.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.remove('border-sporty-red');
      
      if (e.dataTransfer.files.length) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });
    
    // Click to upload
    uploadContainer.addEventListener('click', function() {
      videoUploadInput.click();
    });
    
    videoUploadInput.addEventListener('change', function() {
      if (this.files.length) {
        handleFileSelection(this.files[0]);
      }
    });
    
    // Handle new upload button
    document.getElementById('new-upload').addEventListener('click', function() {
      resetUploadState();
    });
    
    // Handle file selection
    function handleFileSelection(file) {
      // Check if file is a video
      if (!file.type.startsWith('video/')) {
        showError('Please select a video file');
        return;
      }
      
      // Check file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        showError('File size exceeds 500MB limit');
        return;
      }
      
      // Store file data
      currentUpload.file = file;
      currentUpload.filename = file.name;
      
      // Start upload
      startCloudflareUpload();
    }
    
    // Start uploading to Cloudflare Stream
    async function startCloudflareUpload() {
      try {
        // Show progress UI
        uploadProgress.classList.remove('hidden');
        
        // Get authenticated user token to secure the upload
        const user = JSON.parse(localStorage.getItem('sportyfy_user'));
        const token = localStorage.getItem('sportyfy_token');
        
        if (!user || !token) {
          throw new Error('Authentication required');
        }
        
        // Create a form for the upload
        const formData = new FormData();
        formData.append('file', currentUpload.file);
        
        // Add metadata
        const metadata = {
          name: currentUpload.filename,
          creator: user.name || user.id,
          allowedOrigins: [window.location.origin],
          requireSignedURLs: false // For demo purposes
        };
        
        formData.append('metadata', JSON.stringify(metadata));
        
        // Upload to Cloudflare Stream
        const response = await fetch(CF_UPLOAD_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}` // Your server would proxy this request with proper CF credentials
          },
          body: formData,
          // Track upload progress
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            progressBar.style.width = percentCompleted + '%';
            progressPercentage.textContent = percentCompleted + '%';
          }
        });
        
        if (!response.ok) {
          throw new Error('Upload failed: ' + (await response.text()));
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error('Upload failed: ' + JSON.stringify(result.errors));
        }
        
        // Store video details
        currentUpload.videoId = result.result.uid;
        currentUpload.downloadURL = result.result.playback.hls;
        
        // Start processing video for highlights
        startProcessing();
        
      } catch (error) {
        console.error('Upload error:', error);
        showError('Upload failed: ' + error.message);
        resetUploadState();
      }
    }
    
    // Start processing the uploaded video for highlights
    function startProcessing() {
      // Hide upload area, show processing area
      uploadArea.classList.add('hidden');
      processingArea.classList.remove('hidden');
      
      // First stage - Analyzing content
      setTimeout(() => {
        // Update analyzing status
        analyzingStatus.innerHTML = '<i class="fas fa-check text-white"></i>';
        analyzingStatus.classList.remove('bg-gray-700');
        analyzingStatus.classList.add('bg-sporty-red');
        
        // Start detecting stage
        detectingStatus.innerHTML = '<div class="animate-pulse w-4 h-4 bg-sporty-red rounded-full"></div>';
        
        // Run highlight detection algorithm
        // This would be a server-side process in production
        window.highlightDetection.processVideo(currentUpload.videoId)
          .then(highlights => {
            // Store highlights
            currentUpload.highlights = highlights;
            
            // Update detecting status
            detectingStatus.innerHTML = '<i class="fas fa-check text-white"></i>';
            detectingStatus.classList.remove('bg-gray-700');
            detectingStatus.classList.add('bg-sporty-red');
            
            // Start creating stage
            creatingStatus.innerHTML = '<div class="animate-pulse w-4 h-4 bg-sporty-red rounded-full"></div>';
                        

          // Simulate creating highlights compilation with Cloudflare Stream API
          setTimeout(() => {
            // Update creating status
            creatingStatus.innerHTML = '<i class="fas fa-check text-white"></i>';
            creatingStatus.classList.remove('bg-gray-700');
            creatingStatus.classList.add('bg-sporty-red');
            
            // Show results
            showResults();
          }, 3000);
        })
        .catch(error => {
          console.error('Highlight detection error:', error);
          showError('Failed to process video: ' + error.message);
          resetUploadState();
        });
    }, 3000);
  }
  
  // Show results after processing
  function showResults() {
    // Hide processing area, show results area
    processingArea.classList.add('hidden');
    resultsArea.classList.remove('hidden');
    
    // Initialize Cloudflare Stream player
    initializePlayer();
    
    // Create highlight markers
    createHighlightMarkers();
  }
  
  // Initialize Cloudflare Stream player
  function initializePlayer() {
    const playerElement = document.getElementById('cloudflare-player');
    
    // Check if we already have a player instance
    if (currentUpload.player) {
      currentUpload.player.destroy();
    }
    
    // Create new player
    const player = Stream(playerElement, {
      src: currentUpload.videoId,
      height: '100%',
      width: '100%',
      autoplay: false,
      preload: 'auto',
      poster: `https://videodelivery.net/${currentUpload.videoId}/thumbnails/thumbnail.jpg`,
      controls: true,
      primaryColor: '#FF0000' // Match SPORTYFY red
    });
    
    // Store player reference
    currentUpload.player = player;
    
    // Add player event listeners for highlight navigation
    player.addEventListener('timeupdate', function() {
      updateHighlightMarkers(player.currentTime);
    });
  }
  
  // Create highlight markers on the timeline
  function createHighlightMarkers() {
    const markerContainer = document.getElementById('marker-container');
    
    // Clear existing markers
    markerContainer.innerHTML = '';
    
    // Create marker for each highlight
    currentUpload.highlights.forEach((highlight, index) => {
      const marker = document.createElement('div');
      marker.className = 'absolute top-0 bottom-0 w-1 bg-sporty-red cursor-pointer hover:w-2 transition-all';
      marker.style.left = (highlight.position * 100) + '%';
      marker.dataset.index = index;
      marker.title = highlight.label;
      
      // Click event to seek to this highlight
      marker.addEventListener('click', function() {
        const position = currentUpload.highlights[this.dataset.index].position;
        const duration = currentUpload.player.duration();
        currentUpload.player.currentTime(duration * position);
        currentUpload.player.play();
      });
      
      markerContainer.appendChild(marker);
    });
  }
  
  // Update highlight markers based on current playback time
  function updateHighlightMarkers(currentTime) {
    const duration = currentUpload.player.duration();
    const currentPosition = currentTime / duration;
    
    // Find active highlight
    let activeHighlight = null;
    
    currentUpload.highlights.forEach((highlight, index) => {
      // Consider a highlight active if we're within ±2% of its position
      const highlightStart = highlight.position - 0.02;
      const highlightEnd = highlight.position + 0.02;
      
      if (currentPosition >= highlightStart && currentPosition <= highlightEnd) {
        activeHighlight = index;
      }
    });
    
    // Update marker styling
    const markers = document.querySelectorAll('#marker-container div');
    markers.forEach((marker, index) => {
      if (index === activeHighlight) {
        marker.classList.add('w-2', 'bg-yellow-400');
      } else {
        marker.classList.remove('w-2', 'bg-yellow-400');
      }
    });
  }
  
  // Reset upload state
  function resetUploadState() {
    // Clear current upload data
    currentUpload = {
      file: null,
      filename: null,
      videoId: null,
      downloadURL: null,
      highlights: []
    };
    
    // Reset UI
    progressBar.style.width = '0%';
    progressPercentage.textContent = '0%';
    uploadProgress.classList.add('hidden');
    
    // Reset processing indicators
    analyzingStatus.innerHTML = '<div class="animate-pulse w-4 h-4 bg-sporty-red rounded-full"></div>';
    analyzingStatus.classList.add('bg-gray-700');
    analyzingStatus.classList.remove('bg-sporty-red');
    
    detectingStatus.innerHTML = '<span class="text-xs text-gray-400">2</span>';
    detectingStatus.classList.add('bg-gray-700');
    detectingStatus.classList.remove('bg-sporty-red');
    
    creatingStatus.innerHTML = '<span class="text-xs text-gray-400">3</span>';
    creatingStatus.classList.add('bg-gray-700');
    creatingStatus.classList.remove('bg-sporty-red');
    
    // Show upload area, hide processing and results
    uploadArea.classList.remove('hidden');
    processingArea.classList.add('hidden');
    resultsArea.classList.add('hidden');
    
    // Destroy player if exists
    if (currentUpload.player) {
      currentUpload.player.destroy();
      currentUpload.player = null;
    }
  }
  
  // Handle download button
  document.getElementById('download-highlights').addEventListener('click', function() {
    // For production, this would generate a highlight clip via Cloudflare Stream API
    // For demo, we'll just redirect to the playback URL
    if (currentUpload.downloadURL) {
      window.open(currentUpload.downloadURL, '_blank');
    } else {
      showError('Highlight reel not available yet');
    }
  });
  
  // Handle share button
  document.getElementById('share-highlights').addEventListener('click', function() {
    // Generate a shareable link with the videoId
    const shareUrl = `${window.location.origin}/game/share/${currentUpload.videoId}`;
    
    // For demo purposes, copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      showSuccessToast('Share link copied to clipboard!');
    }).catch(err => {
      showError('Failed to copy share link');
    });
  });
  
  // Show error message
  function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#FF2E63';
    toast.style.color = 'white';
    toast.style.padding = '1rem 2rem';
    toast.style.borderRadius = '4px';
    toast.style.fontWeight = 'bold';
    toast.style.zIndex = '9999';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }
  
  // Show success toast
  function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#0CFF7F';
    toast.style.color = '#111111';
    toast.style.padding = '1rem 2rem';
    toast.style.borderRadius = '4px';
    toast.style.fontWeight = 'bold';
    toast.style.zIndex = '9999';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }
});