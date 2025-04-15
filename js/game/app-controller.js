// Create new file: js/game/app-controller.js

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
    
    // Initialize the app
    function initialize() {

      if (window.appInitialized) return;
      window.appInitialized = true;
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
      
      // Register event listeners
      if (elements.uploadContainer) {
        elements.uploadContainer.addEventListener('dragover', handleDragOver);
        elements.uploadContainer.addEventListener('dragleave', handleDragLeave);
        elements.uploadContainer.addEventListener('drop', handleDrop);
        elements.uploadContainer.addEventListener('click', triggerFileInput);
      }
      
      if (elements.videoInput) {
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
    function triggerFileInput(e) {
      console.log('Trigger file input called');
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      elements.videoInput.click();
    }
    
    // Handle file select from input
    function handleFileSelect(e) {
      console.log('File selected via input element');
      if (e.target.files.length) {
        processFile(e.target.files[0]);
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
    
    // Upload video to Cloudflare
    async function uploadVideo(file) {
      try {
        // Upload to Cloudflare via our service
        const result = await CloudflareUpload.uploadVideo(file, (percent) => {
          // Update progress bar
          elements.progressBar.style.width = `${percent}%`;
          elements.progressPercentage.textContent = `${percent}%`;
        });
        
        // Store video ID
        currentVideo.videoId = result.videoId;
        
        // Start processing
        startProcessing();
      } catch (error) {
        showError(`Upload failed: ${error.message}`);
        resetUploadProgress();
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
        document.body.removeChild(toast);
      }, 3000);
    }
    
    // Show success toast
    function showSuccessToast(message) {
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-sporty-red text-white py-2 px-4 rounded-lg z-50';
      toast.textContent = message;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);
    }
    
    // Public API
    return {
      initialize
    };
  })();