// Create new file: js/game/cloudflare-upload.js

const CloudflareUpload = (function() {
    // Cloudflare Stream API endpoint
    const CF_UPLOAD_URL = 'https://api.sportyfy.live/api/v1/cloudflare/upload';
    
    // Handle file upload to Cloudflare
    async function uploadVideo(file, onProgress) {
      try {
        // Get authentication token
        const token = localStorage.getItem('sportyfy_token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        // Create FormData with the file
        const formData = new FormData();
        formData.append('video', file);
        
        // Create XMLHttpRequest for progress tracking
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          // Track upload progress
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              if (typeof onProgress === 'function') {
                onProgress(percentComplete);
              }
            }
          });
          
          // Handle success
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (e) {
                reject(new Error('Invalid response from server'));
              }
            } else {
              reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
            }
          });
          
          // Handle error
          xhr.addEventListener('error', () => {
            reject(new Error('Network error occurred during upload'));
          });
          
          // Handle abort
          xhr.addEventListener('abort', () => {
            reject(new Error('Upload aborted'));
          });
          
          // Open and send request
          xhr.open('POST', CF_UPLOAD_URL);
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.send(formData);
        });
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    }
    
    // Public API
    return {
      uploadVideo
    };
  })();