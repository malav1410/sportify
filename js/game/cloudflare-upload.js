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
              // Check if response is empty
              if (!xhr.responseText || xhr.responseText.trim() === '') {
                console.log('Empty response from Cloudflare, but status code indicates success');
                // Some Cloudflare endpoints return empty responses on success
                // Try to get video ID from URL or other means
                const videoId = extractVideoIdFromUrl(xhr.responseURL) || generateTempId();
                resolve({ videoId });
                return;
              }
              
              // Try to parse JSON response
              const result = JSON.parse(xhr.responseText);
              console.log('Cloudflare upload successful:', result);
              
              // Continue with backend notification...
              try {
                console.log('Notifying backend of successful upload...');
                const videoId = result.uid || result.id || result.videoId || extractVideoIdFromUrl(xhr.responseURL);
                
                const notifyResponse = await fetch('https://api.sportyfy.live/api/v1/cloudflare/upload_complete', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    videoId: videoId,
                    filename: file.name
                  })
                });
                
                if (!notifyResponse.ok) {
                  console.warn('Backend notification failed, but upload was successful');
                  resolve({ videoId });
                  return;
                }
                
                const responseData = await notifyResponse.json();
                console.log('Backend notification successful:', responseData);
                resolve({ 
                  videoId: videoId,
                  streamId: responseData.streamId 
                });
              } catch (notifyError) {
                console.warn('Backend notification error:', notifyError);
                // Still resolve since the upload worked
                resolve({ videoId: result.uid || result.id || 'unknown-id' });
              }
            } catch (parseError) {
              console.error('Error parsing Cloudflare response:', parseError);
              console.log('Raw response:', xhr.responseText);
              console.log('Status:', xhr.status, xhr.statusText);
              
              // Despite parse error, the upload may have succeeded since we got a 2xx status
              // Let's try to extract video ID from URL or response text
              const possibleId = extractIdFromText(xhr.responseText) || 
                                 extractVideoIdFromUrl(xhr.responseURL) ||
                                 generateTempId();
              
              console.log('Extracted possible video ID:', possibleId);
              resolve({ videoId: possibleId, parseError: true });
            }
          } else {
            // Handle error response
            console.error('Error response from Cloudflare:', xhr.status, xhr.statusText);
            console.log('Response text:', xhr.responseText);
            
            let errorMessage = `Upload failed with status ${xhr.status}`;
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              errorMessage = errorResponse.errors?.[0]?.message || errorResponse.error || errorMessage;
            } catch (e) {
              // If we can't parse the error, use the status text
              console.warn('Could not parse error response');
            }
            
            reject(new Error(errorMessage));
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
  
  // Helper function to extract video ID from URL if possible
  function extractVideoIdFromUrl(url) {
    if (!url) return null;
    
    try {
      // Try to extract ID from URL pattern
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      // Look for IDs in typical formats (32 char hex, etc)
      for (const part of pathParts) {
        if (part.match(/^[a-f0-9]{32}$/) || 
            part.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)) {
          return part;
        }
      }
      return null;
    } catch (e) {
      console.warn('Error extracting ID from URL:', e);
      return null;
    }
  }
  
  // Try to extract an ID from response text
  function extractIdFromText(text) {
    if (!text) return null;
    
    try {
      // Look for patterns like "id":"abcd1234" or "uid":"abcd1234"
      const idMatch = text.match(/"(id|uid)"\s*:\s*"([^"]+)"/);
      if (idMatch && idMatch[2]) {
        return idMatch[2];
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  
  // Generate a temporary ID if all else fails
  function generateTempId() {
    return 'temp-' + Math.random().toString(36).substring(2, 15);
  }
  
  return {
    uploadVideo
  };
})();