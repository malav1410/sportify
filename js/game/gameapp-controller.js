// app-controller.js - Reimagined for optimal performance and reliability
// New file updates
const GameAppController = (function() {
    // State management with enhanced structure
    let currentVideo = {
      file: null,
      videoId: null,
      highlights: [],
      player: null
    };
    
    // DOM Elements with robust initialization
    let elements = {};
    let isInitialized = false;
    
    // Fully-optimized app initialization
    function initialize() {
      // Prevent redundant initialization
      if (isInitialized) {
        console.log("GameAppController already initialized. Skipping.");
        return;
      }
      
      console.log("Initializing GameAppController with enhanced reliability");
      isInitialized = true;
  
      // DOM elements acquisition with comprehensive mapping
      cacheElementReferences();
      
      // Debug diagnostics
      logElementStatus();
      
      // Robust event handling setup
      setupEventListeners();
      
      // Add supplementary components
      addSupportComponents();
    }
    
    // Comprehensive DOM element caching
    function cacheElementReferences() {
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
        newUploadBtn: document.getElementById('new-upload'),
        // Critical: Reference the specific button for file selection
        selectVideoBtn: document.querySelector('label[for="video-upload"]')
      };
    }
    
    // Enhanced debugging for initialization issues
    function logElementStatus() {
      console.log("Upload elements found:", {
        uploadArea: !!elements.uploadArea,
        uploadContainer: !!elements.uploadContainer,
        videoInput: !!elements.videoInput,
        selectVideoBtn: !!elements.selectVideoBtn
      });
    }
    
    // Comprehensive event listener setup with proper isolation
    function setupEventListeners() {
      // Remove existing event handlers to prevent duplicates
      cleanupExistingEventListeners();
      
      // Set up drag and drop handlers
      setupDragDropHandlers();
      
      // *** KEY FIX: Direct file selection handlers - isolated from container ***
      setupFileSelectionHandlers();
      
      // Action button handlers
      setupActionButtonHandlers();
    }
    
    // Clean up existing event handlers to prevent duplication
    function cleanupExistingEventListeners() {
      if (elements.uploadContainer) {
        const newContainer = elements.uploadContainer.cloneNode(true);
        if (elements.uploadContainer.parentNode) {
          elements.uploadContainer.parentNode.replaceChild(newContainer, elements.uploadContainer);
        }
        elements.uploadContainer = newContainer;
        
        // Re-acquire the select button reference after DOM replacement
        elements.selectVideoBtn = elements.uploadContainer.querySelector('label[for="video-upload"]');
      }
    }
    
    // Setup drag and drop functionality
    function setupDragDropHandlers() {
      if (elements.uploadContainer) {
        elements.uploadContainer.addEventListener('dragover', handleDragOver);
        elements.uploadContainer.addEventListener('dragleave', handleDragLeave);
        elements.uploadContainer.addEventListener('drop', handleDrop);
      }
    }
    
    // *** CRITICAL FIX: Properly isolated file selection handlers ***
    function setupFileSelectionHandlers() {
      // Important: Don't attach click handler to container
      // Instead, let the label's native behavior handle the file input click
      
      // Only handle clicks on the SELECT VIDEO button
      if (elements.selectVideoBtn) {
        console.log("Select button found, ready for file selection");
        // No need to add click handler - HTML label already handles this correctly
      } else {
        console.warn("Select button not found - file selection may not work");
      }
      
      // Set up the file input change handler
      if (elements.videoInput) {
        // Reset file input first to clear any previous selections
        elements.videoInput.value = '';
        elements.videoInput.addEventListener('change', handleFileSelect);
        console.log("File input change handler attached");
      }
    }
    
    // Setup action button event handlers
    function setupActionButtonHandlers() {
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
    
    // Add supportive components
    function addSupportComponents() {
      // Direct upload button as fallback - more reliable than container click
      addDirectUploadButton();
    }
    
    // Add a reliable direct upload button
    function addDirectUploadButton() {
      if (!elements.uploadContainer) return;
      
      // Check if the button already exists to avoid duplicates
      if (document.getElementById('direct-upload-btn')) return;
      
      const directBtn = document.createElement('button');
      directBtn.id = 'direct-upload-btn';
      directBtn.innerHTML = 'ALTERNATIVE UPLOAD';
      directBtn.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg font-bold mt-4 hover:bg-gray-600 transition';
      directBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Direct upload button clicked");
        if (elements.videoInput) {
          elements.videoInput.click();
        }
      };
      
      // Insert after the "SELECT VIDEO" button
      if (elements.selectVideoBtn && elements.selectVideoBtn.parentNode) {
        elements.selectVideoBtn.parentNode.appendChild(directBtn);
      } else {
        // Fallback - append to container
        elements.uploadContainer.appendChild(directBtn);
      }
    }
    
    // *** REMOVED: handleUploadClick - this was causing the duplicate events ***
    
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
    
    // *** REMOVED: triggerFileInput - no longer needed ***
    
    // Handle file select from input
    function handleFileSelect(e) {
      console.log("File selected event triggered", e);
      
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        console.log("File selected:", file.name, file.size, file.type);
        processFile(file);
      } else {
        console.log("No files selected");
      }
    }
    
    // Rest of your app functionality remains the same
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
    
    // // Upload video to backend
    // async function uploadVideo(file) {
    //   try {
    //     console.log("Starting upload for file:", file.name);
        
    //     // Create FormData
    //     const formData = new FormData();
    //     formData.append('video', file);
        
    //     // Create XHR for progress tracking
    //     const xhr = new XMLHttpRequest();
    //     const token = localStorage.getItem('sportyfy_token');
        
    //     if (!token) {
    //       throw new Error('Authentication required. Please log in again.');
    //     }
        
    //     // Progress tracking
    //     xhr.upload.addEventListener('progress', (event) => {
    //       if (event.lengthComputable) {
    //         const percentComplete = Math.round((event.loaded / event.total) * 100);
    //         console.log(`Upload progress: ${percentComplete}%`);
    //         elements.progressBar.style.width = `${percentComplete}%`;
    //         elements.progressPercentage.textContent = `${percentComplete}%`;
    //       }
    //     });
        
    //     // Setup promise to handle async upload
    //     const uploadPromise = new Promise((resolve, reject) => {
    //       xhr.onload = function() {
    //         if (xhr.status >= 200 && xhr.status < 300) {
    //           try {
    //             const response = JSON.parse(xhr.responseText);
    //             console.log("Upload successful:", response);
    //             resolve(response);
    //           } catch (e) {
    //             console.error("Invalid JSON response:", xhr.responseText);
    //             reject(new Error('Invalid response from server'));
    //           }
    //         } else {
    //           console.error("Upload failed with status:", xhr.status);
    //           reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
    //         }
    //       };
          
    //       xhr.onerror = function() {
    //         console.error("Network error during upload");
    //         reject(new Error('Network error during upload'));
    //       };
          
    //       xhr.ontimeout = function() {
    //         console.error("Upload timed out");
    //         reject(new Error('Upload timed out'));
    //       };
          
    //       xhr.onabort = function() {
    //         console.error("Upload aborted");
    //         reject(new Error('Upload aborted'));
    //       };
    //     });
        
    //     // Send request
    //     xhr.open('POST', 'https://api.sportyfy.live/api/v1/cloudflare/upload');
    //     xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    //     xhr.send(formData);
        
    //     // Wait for upload to complete
    //     const result = await uploadPromise;
        
    //     // Store video ID and start processing
    //     currentVideo.videoId = result.videoId;
    //     console.log("Starting processing for video:", currentVideo.videoId);
    //     startProcessing();
        
    //     return result;
    //   } catch (error) {
    //     console.error("Upload error:", error);
    //     showError(`Upload failed: ${error.message}`);
    //     resetUploadProgress();
    //     throw error;
    //   }
    // }

    // Modify the uploadVideo function in app-controller.js

    async function uploadVideo(file) {
      try {
        console.log("Starting upload for file:", file.name);
        
        // Show progress UI
        elements.uploadProgress.classList.remove('hidden');
        
        // Use CloudflareUpload module
        const result = await CloudflareUpload.uploadVideo(file, (percentComplete) => {
          // Update progress UI
          elements.progressBar.style.width = `${percentComplete}%`;
          elements.progressPercentage.textContent = `${percentComplete}%`;
        });
        
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