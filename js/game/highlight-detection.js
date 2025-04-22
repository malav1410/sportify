// Create or update: js/game/highlight-detection.js

const HighlightDetection = (function() {
    // API endpoint for processing
    const HIGHLIGHT_API_URL = '/api/v1/cloudflare/process';
    
    // Process video for highlights
    async function processVideo(videoId) {
      try {
        // Get authentication token
        const token = localStorage.getItem('sportyfy_token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        // Call API to process video
        const response = await fetch(`${HIGHLIGHT_API_URL}/${videoId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Processing failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Highlight detection error:', error);
        throw error;
      }
    }
    
    // For development/demo purposes, generate fake highlights
    function generateDemoHighlights(duration) {
      const count = Math.floor(Math.random() * 5) + 3; // 3-7 highlights
      const highlights = [];
      
      for (let i = 0; i < count; i++) {
        // Generate random timestamp (5-95% of video)
        const position = (Math.random() * 0.9 + 0.05) * duration;
        
        highlights.push({
          id: i + 1,
          start_time: position,
          duration: Math.random() * 10 + 5, // 5-15 second highlight
          label: getRandomHighlightLabel(),
          confidence: Math.random() * 0.3 + 0.7 // 0.7-1.0 confidence score
        });
      }
      
      // Sort by start time
      return highlights.sort((a, b) => a.start_time - b.start_time);
    }
    
    // Generate random label for demo
    function getRandomHighlightLabel() {
      const labels = [
        'Key Moment',
        'Great Shot',
        'Skill Move',
        'Team Play',
        'Defensive Action',
        'Crowd Excitement'
      ];
      
      return labels[Math.floor(Math.random() * labels.length)];
    }
    
    // Public API
    return {
      processVideo,
      generateDemoHighlights
    };
  })();