// Modified CloudflareUpload module with direct upload strategy
const CloudflareUpload = (function() {
  async function uploadVideo(file, onProgress) {
    console.log('Starting direct Cloudflare upload integration');
    try {
      // 1. Get authentication token from your session
      const token = localStorage.getItem('sportyfy_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // 2. Get a signed upload URL from your backend
      console.log('Requesting signed upload URL from backend...');
      const urlResponse = await fetch('https://api.sportyfy.live/api/v1/cloudflare/signed_upload_url', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!urlResponse.ok) {
        throw new Error(`Failed to get upload URL: ${await urlResponse.text()}`);
      }
      
      const { uploadUrl } = await urlResponse.json();
      console.log('Received signed upload URL', uploadUrl);
      
      // 3. Upload directly to Cloudflare using TUS protocol
      console.log('Preparing direct upload to Cloudflare...');
      
      return new Promise((resolve, reject) => {
        // Create a standard form for Cloudflare
        const formData = new FormData();
        formData.append('file', file);
        
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
        
        xhr.addEventListener('load', async function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              console.log('Upload to Cloudflare successful:', result);
              
              // 4. Notify your backend about the successful upload
              try {
                const notifyResponse = await fetch('https://api.sportyfy.live/api/v1/cloudflare/upload_complete', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    videoId: result.uid || result.id,
                    filename: file.name
                  })
                });
                
                if (!notifyResponse.ok) {
                  console.warn('Backend notification failed, but upload was successful');
                }
                
                const recordData = await notifyResponse.json();
                console.log('Backend record created:', recordData);
                
                resolve({
                  videoId: result.uid || result.id,
                  streamId: responseData.streamId
                });
              } catch (notifyError) {
                console.warn('Backend notification error:', notifyError);
                // Still resolve with the upload data since Cloudflare has the video
                resolve({ videoId: result.uid || result.id });
              }
            } catch (parseError) {
              console.error('Error parsing Cloudflare response:', xhr.responseText);
              reject(new Error('Invalid response from Cloudflare'));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              console.error('Cloudflare upload failed:', errorResponse);
              reject(new Error(`Upload failed: ${errorResponse.errors?.[0]?.message || xhr.statusText}`));
            } catch (e) {
              console.error('Cloudflare upload failed:', xhr.status, xhr.statusText);
              reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
            }
          }
        });
        
        xhr.addEventListener('error', () => {
          console.error('Network error during Cloudflare upload');
          reject(new Error('Network error during upload'));
        });
        
        xhr.addEventListener('abort', () => {
          console.error('Upload aborted');
          reject(new Error('Upload aborted'));
        });
        
        console.log('Sending file directly to Cloudflare...');
        xhr.open('POST', uploadUrl);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Upload infrastructure error:', error);
      throw error;
    }
  }
  
  return {
    uploadVideo
  };
})();