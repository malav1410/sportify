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

        const urlResponse = await fetch('/api/v1/cloudflare/signed_upload_url', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!urlResponse.ok) {
            throw new Error('Failed to get upload URL');
          }
          
          const { uploadUrl, token: uploadToken } = await urlResponse.json();
        
        // Step 2: Upload directly to Cloudflare using the signed URL
            const formData = new FormData();
            formData.append('file', file);
            
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
            
            xhr.addEventListener('load', async () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const result = JSON.parse(xhr.responseText);
                    
                    // Step 3: Notify your backend about the successful upload
                    const notifyResponse = await fetch('/api/v1/cloudflare/upload_complete', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        videoId: result.uid,
                        filename: file.name
                    })
                    });
                    
                    if (!notifyResponse.ok) {
                    console.warn('Failed to notify server about upload completion');
                    }
                    
                    resolve(result);
                } catch (e) {
                    reject(new Error('Invalid response from server'));
                }
                } else {
                reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                }
            });
            
            // Error and abort handlers
            xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
            xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
            
            // Send the upload request with the signed URL
            xhr.open('POST', uploadUrl);
            
            // Add necessary headers provided by your backend
            xhr.setRequestHeader('X-Auth-Token', uploadToken);
            
            xhr.send(formData);
            });
        } catch (error) {
            console.error('Upload initialization error:', error);
            throw error;
        }
    }
    
    // Public API
    return {
      uploadVideo
    };
  })();