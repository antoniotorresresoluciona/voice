export function getApiHeaders() {
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
  };

  // sessionStorage is only available in the browser
  if (typeof window !== 'undefined') {
    const apiKey = sessionStorage.getItem('elevenlabs_api_key');
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
  }

  return headers;
}