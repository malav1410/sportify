// app-controller.js
const AppController = (function() {
  // State
  let currentVideo = {
    file: null,
    videoId: null,
    highlights: [],
    player: null
  };
  
  // DOM Elements
  let elements = {};
  let isInitialized = false;
  
  // Initialize the app
  function initialize() {
    // Prevent multiple initialization
    if (isInitialized) {
      console.log("AppController already initialized. Skipping.");
      return;
    }
    
    console.log("Initializing AppController");
    isInitialized = true;

    // Get DOM elements
    elements = {
      uploadArea: document.getElementById('upload-area'),
      processingArea: document.getElementById('processing-area'),
      resultsArea: document.getElementById('results-area'),
      uploadContainer: document.getElementById('upload-container'),
      videoInput: document.getElementById('video-upload'),
      progressBar: document.getElementById('progress-bar'),
      progressPercentage: document.getElementById('progress-percentage'),
      uploadProgress: document.getElementById('upload-progress'),
      analyzingStatus: document.getElementById('analyzing-status'),
      detectingStatus: document.getElementById('detecting-status'),
      creatingStatus: document.getElementById('creating-status'),
      playerContainer: document.getElementById('cloudflare-player'),
      markerContainer: document.getElementById('marker-container'),
      downloadBtn: document.getElementById('download-highlights'),
      shareBtn: document.getElementById('share-highlights'),
      newUploadBtn: document.getElementById('new-upload')
    };

    // Debug logging
    console.log("Upload elements found:", {
      uploadArea: !!elements.uploadArea,
      uploadContainer: !!elements.uploadContainer,
      videoInput: !!elements.videoInput
    });
    
    // Remove any existing event listeners before adding new ones
    if (elements.uploadContainer) {
      const newContainer = elements.uploadContainer.cloneNode(true);
      if (elements.uploadContainer.parentNode) {
        elements.uploadContainer.parentNode.replaceChild(newContainer, elements.uploadContainer);
      }
      elements.uploadContainer = newContainer;
    }
    
    // Register event listeners
    if (elements.uploadContainer) {
      elements.uploadContainer.addEventListener('dragover', handleDragOver);
      elements.uploadContainer.addEventListener('dragleave', handleDragLeave);
      elements.uploadContainer.addEventListener('drop', handleDrop);
      
      // Use direct onclick instead of addEventListener for better compatibility
      elements.uploadContainer.onclick = handleUploadClick;
      console.log("Click handler attached to upload container");
    }
    
    if (elements.videoInput) {
      // Reset file input first to clear any previous selections
      elements.videoInput.value = '';
      elements.videoInput.addEventListener('change', handleFileSelect);
    }
    
    if (elements.newUploadBtn) {
      elements.newUploadBtn.addEventListener('click', resetApp);
    }
    
    if (elements.downloadBtn) {
      elements.downloadBtn.addEventListener('click', downloadHighlights);
    }
    
    if (elements.shareBtn) {
      elements.shareBtn.addEventListener('click', shareHighlights);
    }
    
    // Add direct upload button as fallback
    addDirectUploadButton();
  }
  
  // Add a direct upload button for better reliability
  function addDirectUploadButton() {
    if (!elements.uploadContainer) return;
    
    const directBtn = document.createElement('button');
    directBtn.id = 'direct-upload-btn';
    directBtn.innerHTML = 'FALLBACK UPLOAD';
    directBtn.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg font-bold mt-4 hover:bg-gray-600 transition';
    directBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (elements.videoInput) {
        elements.videoInput.click();
      }
    };
    
    // Insert after the "SELECT VIDEO" button
    const selectButton = elements.uploadContainer.querySelector('label');
    if (selectButton && selectButton.parentNode) {
      selectButton.parentNode.appendChild(directBtn);
    }
  }
  
  // Handle upload container click
  function handleUploadClick(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Upload container clicked");
    triggerFileInput();
  }
  
  // Handle drag over event
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadContainer.classList.add('border-sporty-red');
  }
  
  // Handle drag leave event
  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadContainer.classList.remove('border-sporty-red');
  }
  
  // Handle file drop event
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadContainer.classList.remove('border-sporty-red');
    
    if (e.dataTransfer.files.length) {
      processFile(e.dataTransfer.files[0]);
    }
  }
  
  // Trigger file input click
  function triggerFileInput() {
    console.log('Trigger file input called');
    
    // Make sure element exists
    if (!elements.videoInput) {
      console.error("Video input element not found!");
      return;
    }

    // Reset input first to ensure change event fires
    elements.videoInput.value = '';
    
    // Use setTimeout to prevent event handling issues
    setTimeout(() => {
      elements.videoInput.click();
    }, 50);
  }
  
  // Handle file select from input
  function handleFileSelect(e) {
    console.log("File selected event triggered");
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log("File selected:", file.name, file.size, file.type);
      processFile(file);
    } else {
      console.log("No files selected");
    }
  }
  
  // Process uploaded file
  function processFile(file) {
    // Validate file is video
    if (!file.type.startsWith('video/')) {
      showError('Please upload a video file');
      return;
    }
    
    // Validate file size (max 100MB for demo)
    if (file.size > 100 * 1024 * 1024) {
      showError('File too large. Maximum size is 100MB');
      return;
    }
    
    // Store file
    currentVideo.file = file;
    
    // Show progress UI
    elements.uploadProgress.classList.remove('hidden');
    
    // Start upload process
    uploadVideo(file);
  }
  
  // Upload video to backend
  async function uploadVideo(file) {
    try {
      console.log("Starting upload for file:", file.name);
      
      // Create FormData
      const formData = new FormData();
      formData.append('video', file);
      
      // Create XHR for progress tracking
      const xhr = new XMLHttpRequest();
      const token = localStorage.getItem('sportyfy_token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          console.log(`Upload progress: ${percentComplete}%`);
          elements.progressBar.style.width = `${percentComplete}%`;
          elements.progressPercentage.textContent = `${percentComplete}%`;
        }
      });
      
      // Setup promise to handle async upload
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log("Upload successful:", response);
              resolve(response);
            } catch (e) {
              console.error("Invalid JSON response:", xhr.responseText);
              reject(new Error('Invalid response from server'));
            }
          } else {
            console.error("Upload failed with status:", xhr.status);
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = function() {
          console.error("Network error during upload");
          reject(new Error('Network error during upload'));
        };
        
        xhr.ontimeout = function() {
          console.error("Upload timed out");
          reject(new Error('Upload timed out'));
        };
        
        xhr.onabort = function() {
          console.error("Upload aborted");
          reject(new Error('Upload aborted'));
        };
      });
      
      // Send request
      xhr.open('POST', 'https://api.sportyfy.live/api/v1/cloudflare/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
      
      // Wait for upload to complete
      const result = await uploadPromise;
      
      // Store video ID and start processing
      currentVideo.videoId = result.videoId;
      console.log("Starting processing for video:", currentVideo.videoId);
      startProcessing();
      
      return result;
    } catch (error) {
      console.error("Upload error:", error);
      showError(`Upload failed: ${error.message}`);
      resetUploadProgress();
      throw error;
    }
  }
  
  // Start video processing
  function startProcessing() {
    // Hide upload area, show processing area
    elements.uploadArea.classList.add('hidden');
    elements.processingArea.classList.remove('hidden');
    
    // First stage - Analyzing
    setTimeout(() => {
      // Update analyzing status
      elements.analyzingStatus.innerHTML = '<i class="fas fa-check text-white"></i>';
      elements.analyzingStatus.classList.remove('bg-gray-700');
      elements.analyzingStatus.classList.add('bg-sporty-red');
      
      // Start detecting stage
      elements.detectingStatus.innerHTML = '<div class="animate-pulse w-4 h-4 bg-sporty-red rounded-full"></div>';
      
      // For demo, we'll use our demo highlights
      // In production, call the real API
      setTimeout(() => {
        // In real app, we'd call: HighlightDetection.processVideo(currentVideo.videoId)
        // For demo, generate random highlights
        currentVideo.highlights = HighlightDetection.generateDemoHighlights(120); // Assume 2-min video
        
        // Update detecting status
        elements.detectingStatus.innerHTML = '<i class="fas fa-check text-white"></i>';
        elements.detectingStatus.classList.remove('bg-gray-700');
        elements.detectingStatus.classList.add('bg-sporty-red');
        
        // Start creating highlights stage
        elements.creatingStatus.innerHTML = '<div class="animate-pulse w-4 h-4 bg-sporty-red rounded-full"></div>';
        
        setTimeout(() => {
          // Update creating status
          elements.creatingStatus.innerHTML = '<i class="fas fa-check text-white"></i>';
          elements.creatingStatus.classList.remove('bg-gray-700');
          elements.creatingStatus.classList.add('bg-sporty-red');
          
          // Show results
          showResults();
        }, 2000);
      }, 3000);
    }, 2000);
  }
  
  // Show processing results
  function showResults() {
    // Hide processing area, show results
    elements.processingArea.classList.add('hidden');
    elements.resultsArea.classList.remove('hidden');
    
    // Initialize player
    initializePlayer();
    
    // Create highlight markers
    createHighlightMarkers();
  }
  
  // Initialize video player
  function initializePlayer() {
    // For demo, we'll use a placeholder video
    // In production, use the actual Cloudflare Stream URL
    
    // Initialize Cloudflare Stream player
    // Note: In demo mode, we'll use a sample video
    const demoVideoId = "31c9291a32750fad0a5b6621ff66bf00"; // Replace with a valid demo video ID
    
    // Check if Stream object exists
    if (typeof Stream === 'function' && elements.playerContainer) {
      currentVideo.player = Stream(elements.playerContainer, {
        src: currentVideo.videoId || demoVideoId,
        preload: "auto",
        poster: `https://videodelivery.net/${currentVideo.videoId || demoVideoId}/thumbnails/thumbnail.jpg`,
        controls: true
      });
    } else {
      // Fallback to HTML5 video player
      elements.playerContainer.innerHTML = `
        <video controls style="width:100%;height:100%">
          <source src="https://customer-w44jo3xf1ci6ri5v.cloudflarestream.com/${currentVideo.videoId || demoVideoId}/manifest/video.m3u8" type="application/x-mpegURL">
          Your browser does not support HTML5 video.
        </video>
      `;
    }
  }
  
  // Create highlight markers on timeline
  function createHighlightMarkers() {
    if (!elements.markerContainer) return;
    
    // Clear existing markers
    elements.markerContainer.innerHTML = '';
    
    // Create marker for each highlight
    currentVideo.highlights.forEach((highlight, index) => {
      const marker = document.createElement('div');
      marker.className = 'absolute top-0 h-full w-1 bg-sporty-red cursor-pointer hover:w-2 transition-all';
      
      // Calculate position (percentage of width)
      const position = (highlight.start_time / 120) * 100; // Assuming 120s video
      marker.style.left = `${position}%`;
      marker.dataset.index = index;
      marker.title = highlight.label;
      
      // Add click event to jump to highlight
      marker.addEventListener('click', () => {
        if (currentVideo.player && typeof currentVideo.player.currentTime === 'function') {
          currentVideo.player.currentTime(highlight.start_time);
          currentVideo.player.play();
        } else {
          // Fallback for HTML5 video
          const video = elements.playerContainer.querySelector('video');
          if (video) {
            video.currentTime = highlight.start_time;
            video.play();
          }
        }
      });
      
      elements.markerContainer.appendChild(marker);
    });
  }
  
  // Download highlights
  function downloadHighlights() {
    // In production, this would generate a highlight clip
    // For demo, show message
    showSuccessToast('Highlight reel downloading...');
    
    // Simulate download completion
    setTimeout(() => {
      showSuccessToast('Download complete!');
    }, 3000);
  }
  
  // Share highlights
  function shareHighlights() {
    // Generate shareable link
    const shareUrl = `https://sportyfy.live/share/${currentVideo.videoId || 'demo'}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showSuccessToast('Share link copied to clipboard!');
      })
      .catch(() => {
        showError('Failed to copy link');
      });
  }
  
  // Reset app state
  function resetApp() {
    // Reset video data
    currentVideo = {
      file: null,
      videoId: null,
      highlights: [],
      player: null
    };
    
    // Reset UI
    resetUploadProgress();
    
    // Show upload area, hide others
    elements.uploadArea.classList.remove('hidden');
    elements.processingArea.classList.add('hidden');
    elements.resultsArea.classList.add('hidden');
    
    // Reset processing indicators
    elements.analyzingStatus.innerHTML = '<div class="animate-pulse w-4 h-4 bg-sporty-red rounded-full"></div>';
    elements.analyzingStatus.classList.add('bg-gray-700');
    elements.analyzingStatus.classList.remove('bg-sporty-red');
    
    elements.detectingStatus.innerHTML = '<span class="text-xs text-gray-400">2</span>';
    elements.detectingStatus.classList.add('bg-gray-700');
    elements.detectingStatus.classList.remove('bg-sporty-red');
    
    elements.creatingStatus.innerHTML = '<span class="text-xs text-gray-400">3</span>';
    elements.creatingStatus.classList.add('bg-gray-700');
    elements.creatingStatus.classList.remove('bg-sporty-red');
  }
  
  // Reset upload progress UI
  function resetUploadProgress() {
    elements.progressBar.style.width = '0%';
    elements.progressPercentage.textContent = '0%';
    elements.uploadProgress.classList.add('hidden');
  }
  
  // Show error message
  function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white py-2 px-4 rounded-lg z-50';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }
  
  // Show success toast
  function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-sporty-red text-white py-2 px-4 rounded-lg z-50';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }
  
  // Public API
  return {
    initialize
  };
})();