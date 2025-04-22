// Submit Challenge Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loadingIndicator = document.getElementById('loading-indicator');
    const challengeContent = document.getElementById('challenge-content');
    const challengeTitle = document.getElementById('challenge-title');
    const challengeDescription = document.getElementById('challenge-description');
    const gameLink = document.getElementById('game-link');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Video recording elements
    const videoPreview = document.getElementById('video-preview');
    const startRecordingBtn = document.getElementById('start-recording');
    const stopRecordingBtn = document.getElementById('stop-recording');
    const recordingTime = document.getElementById('recording-time');
    
    // Upload elements
    const uploadArea = document.getElementById('upload-area');
    const uploadInput = document.getElementById('upload-input');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const videoPreviewContainer = document.getElementById('video-preview-container');
    const uploadedPreview = document.getElementById('uploaded-preview');
    
    // Submission elements
    const submitButton = document.getElementById('submit-button');
    const checkboxes = document.querySelectorAll('.checkbox-input');
    const statusMessage = document.getElementById('status-message');
    
    // State variables
    let stream = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let recordingStartTime = 0;
    let recordingTimer = null;
    let uploadFile = null;
    let challengeId = null;
    
    // Add API URL constant
    const API_BASE_URL = '/api/v1';
    
    // Initialize the page
    initPage();
    
    function initPage() {
        // Show loading indicator
        loadingIndicator.style.display = 'flex';
        challengeContent.style.display = 'none';
    
        // Get challenge ID from URL
        challengeId = new URLSearchParams(window.location.search).get('id');
        
        if (!challengeId) {
            showError('Challenge ID not found. Please go back to the challenges page.');
            return;
        }
    
        // Fetch challenge details
        fetchChallengeDetails(challengeId)
            .then(() => {
                // Hide loading indicator and show content
                loadingIndicator.style.display = 'none';
                challengeContent.style.display = 'block';
            })
            .catch(error => {
                showError('Failed to load challenge details. Please try again later.');
                console.error('Error fetching challenge details:', error);
            });
    
        // Initialize tabs
        initTabs();
    
        // Initialize form validation
        initValidation();
        
        // Initialize recording functionality
        initRecording();
        
        // Initialize upload functionality
        initUpload();
    }
    
    // Mock function to fetch challenge details
    function fetchChallengeDetails(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock data - in a real app, this would come from an API
                challengeTitle.textContent = 'Basketball Trick Shot Challenge';
                challengeDescription.textContent = 'Record yourself making the most creative basketball trick shot you can come up with. Be creative!';
                gameLink.href = `/game.html?id=${id}`;
                resolve();
            }, 1000);
        });
    }
    
    function showError(message) {
        loadingIndicator.style.display = 'none';
        const errorElement = document.createElement('div');
        errorElement.classList.add('error-message');
        errorElement.textContent = message;
        document.body.appendChild(errorElement);
    }
    
    // Tab functionality
    function initTabs() {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
        
        // Set first tab as active by default
        if (tabButtons.length > 0) {
            const firstTabId = tabButtons[0].getAttribute('data-tab');
            switchTab(firstTabId);
        }
    }
    
    function switchTab(tabId) {
        // Update active button
        tabButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update active content
        tabContents.forEach(content => {
            if (content.getAttribute('id') === tabId) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }
    
    // Recording functionality
    function initRecording() {
        if (startRecordingBtn && stopRecordingBtn) {
            startRecordingBtn.addEventListener('click', startRecording);
            stopRecordingBtn.addEventListener('click', stopRecording);
            stopRecordingBtn.disabled = true;
        }
    }
    
    function startRecording() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Request access to camera and microphone
            navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }, 
                audio: true 
            })
            .then(function(mediaStream) {
                // Store the stream for later use
                stream = mediaStream;
                
                // Display the video preview
                videoPreview.srcObject = mediaStream;
                videoPreview.play();
                
                // Create a media recorder
                const options = { mimeType: 'video/webm;codecs=vp9,opus' };
                try {
                    mediaRecorder = new MediaRecorder(stream, options);
                } catch (e) {
                    console.error('Error creating MediaRecorder:', e);
                    try {
                        // Fallback to a more widely supported format
                        mediaRecorder = new MediaRecorder(stream);
                    } catch (e) {
                        showError('Recording is not supported in this browser.');
                        return;
                    }
                }
                
                // Set up recorder event handlers
                mediaRecorder.ondataavailable = function(event) {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                };
                
                mediaRecorder.onstop = function() {
                    // Create a Blob from the recorded chunks
                    const blob = new Blob(recordedChunks, { type: 'video/webm' });
                    uploadFile = new File([blob], `challenge-${Date.now()}.webm`, { type: 'video/webm' });
                    
                    // Display the recorded video
                    const videoURL = URL.createObjectURL(blob);
                    uploadedPreview.src = videoURL;
                    uploadedPreview.controls = true;
                    videoPreviewContainer.style.display = 'block';
                    
                    // Update file info
                    fileName.textContent = uploadFile.name;
                    fileSize.textContent = formatFileSize(uploadFile.size);
                    
                    // Clean up
                    stopRecordingTimer();
                    stopMediaTracks();
                    
                    // Enable submit button if other conditions are met
                    validateForm();
                    
                    // Switch to the upload tab
                    switchTab('upload-tab');
                };
                
                // Start recording
                recordedChunks = [];
                mediaRecorder.start(1000); // Collect data in 1-second chunks
                
                // Update UI
                startRecordingBtn.disabled = true;
                stopRecordingBtn.disabled = false;
                
                // Start timer
                recordingStartTime = Date.now();
                startRecordingTimer();
            })
            .catch(function(err) {
                console.error('Error accessing media devices:', err);
                showError('Could not access your camera or microphone. Please check permissions.');
            });
        } else {
            showError('Media devices not supported in this browser.');
        }
    }
    
    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            startRecordingBtn.disabled = false;
            stopRecordingBtn.disabled = true;
        }
    }
    
    function startRecordingTimer() {
        recordingTimer = setInterval(updateRecordingTime, 1000);
        updateRecordingTime();
    }
    
    function stopRecordingTimer() {
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }
    }
    
    function updateRecordingTime() {
        const elapsedSeconds = Math.floor((Date.now() - recordingStartTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        
        recordingTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Auto-stop after 5 minutes
        if (elapsedSeconds >= 300) {
            stopRecording();
        }
    }
    
    function stopMediaTracks() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        
        if (videoPreview.srcObject) {
            videoPreview.srcObject = null;
        }
    }
    
    // Upload functionality
    function initUpload() {
        if (uploadArea && uploadInput) {
            uploadArea.addEventListener('click', () => uploadInput.click());
            uploadInput.addEventListener('change', handleFileSelect);
            
            // Drag and drop
            uploadArea.addEventListener('dragover', handleDragOver);
            uploadArea.addEventListener('dragleave', handleDragLeave);
            uploadArea.addEventListener('drop', handleDrop);
        }
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    }
    
    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    }
    
    function handleFileSelect(e) {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    }
    
    function handleFileUpload(file) {
        // Check if file is a video
        if (!file.type.startsWith('video/')) {
            showError('Please upload a video file.');
            return;
        }
        
        // Check file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            showError('File size exceeds the 50MB limit.');
            return;
        }
        
        // Store the file for submission
        uploadFile = file;
        
        // Update file info
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        // Create a preview
        const videoURL = URL.createObjectURL(file);
        uploadedPreview.src = videoURL;
        uploadedPreview.controls = true;
        videoPreviewContainer.style.display = 'block';
        
        // Show upload success
        simulateUpload();
        
        // Enable submit button if other conditions are met
        validateForm();
    }
    
    function simulateUpload() {
        uploadProgress.style.display = 'block';
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Hide progress after a moment
                setTimeout(() => {
                    uploadProgress.style.display = 'none';
                }, 1000);
            }
            
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }, 200);
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' bytes';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
    }
    
    // Form validation
    function initValidation() {
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', validateForm);
        });
        
        if (submitButton) {
            submitButton.addEventListener('click', submitChallenge);
            submitButton.disabled = true; // Initially disable
        }
    }
    
    function validateForm() {
        if (!submitButton) return;
        
        // Check if video is present
        const hasVideo = uploadFile !== null;
        
        // Check if all verification checkboxes are checked
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        
        // Enable/disable submit button
        submitButton.disabled = !(hasVideo && allChecked);
    }
    
    function submitChallenge() {
        if (!uploadFile) return;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Submitting...';
        
        // In a real implementation, we would create a FormData object and upload to the server
        const formData = new FormData();
        formData.append('video', uploadFile);
        
        // For demo purposes, simulate the API call
        // In production, use actual API call:
        // 
        // fetch(`${API_BASE_URL}/challenges/${challengeId}/submit`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('sportyfy_token')}`
        //   },
        //   body: formData
        // })
        // .then(response => response.json())
        // .then(data => {
        //   // Handle success
        //   statusMessage.textContent = 'Challenge submitted successfully!';
        //   statusMessage.classList.add('success');
        //   setTimeout(() => {
        //     window.location.href = '/game/challenges';
        //   }, 2000);
        // })
        // .catch(error => {
        //   // Handle error
        //   statusMessage.textContent = 'Error submitting challenge. Please try again.';
        //   statusMessage.classList.add('error');
        //   submitButton.disabled = false;
        //   submitButton.textContent = 'Submit Challenge';
        // });
        
        // Simulate server upload
        setTimeout(() => {
            // Show success message
            statusMessage.textContent = 'Challenge submitted successfully!';
            statusMessage.classList.add('success');
            
            // Reset form
            setTimeout(() => {
                window.location.href = '/game/challenges';
            }, 2000);
        }, 3000);
    }
}); 