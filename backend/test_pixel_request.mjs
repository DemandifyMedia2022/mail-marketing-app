import axios from 'axios';

const trackingCode = 'n6etpitrv6aq4g9l97t91';
const trackingUrl = `http://192.168.0.219:5000/api/emails/track/open/${trackingCode}`;

console.log('Testing tracking pixel URL:', trackingUrl);

axios.get(trackingUrl)
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data type:', typeof response.data);
    console.log('Response is image:', response.headers['content-type']?.includes('image'));
  })
  .catch(error => {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  });
