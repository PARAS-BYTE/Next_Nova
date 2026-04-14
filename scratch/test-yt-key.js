import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const testYoutubeKey = async () => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const playlistId = 'PL4Gr5tOafJJkMv4hF9Jd_Q568_7uXk6S2';
  
  console.log(`Testing with API Key: ${apiKey?.substring(0, 10)}...`);
  
  // Test 1: General Google Connectivity
  try {
    console.log('--- Test 1: General Google Connectivity (DNS API) ---');
    await axios.get('https://dns.google/resolve?name=google.com');
    console.log('✅ Success: Google DNS is reachable.');
  } catch (err) {
    console.error('❌ Error hitting Google DNS:', err.message);
  }

  // Test 2: YouTube API with Key
  try {
    console.log('\n--- Test 2: YouTube API with Key ---');
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=${playlistId}&key=${apiKey}`;
    const response = await axios.get(url);
    console.log('✅ Success: YouTube API accepted the key!');
  } catch (error) {
    console.error('❌ Error testing YouTube Key:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.log('Error Reason:', error.response.data?.error?.errors?.[0]?.reason || 'Unknown');
      console.log('Full Message:', error.response.data?.error?.message);
    } else {
      console.error('Network/TLS Error:', error.message);
    }
  }
};

testYoutubeKey();
