// A service to fetch page content.
// It uses a public CORS proxy to circumvent browser security restrictions (CORS)
// that prevent fetching content directly from another domain on the client-side.
//
// NOTE: In a production application, you should host your own backend proxy
// for reliability, security, and to avoid rate-limiting from public services.
export const fetchPageContent = async (url: string): Promise<string> => {
  if (!url) {
    throw new Error("URL is required to fetch page content.");
  }

  // We use allorigins.win as a free, public CORS proxy.
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      // Try to get a more descriptive error message from the proxy if possible
      const errorBody = await response.text();
      console.error(`Proxy error for ${url}:`, errorBody);
      throw new Error(`Failed to fetch content. Status: ${response.status}. The URL may be inaccessible or blocked.`);
    }

    const content = await response.text();
    return content;
  } catch (error) {
    console.error("Network or fetch error:", error);
    if (error instanceof Error) {
        // Re-throw with a more user-friendly message
        throw new Error(`Could not connect to the provided URL. Please check the URL or your network connection. Details: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching the page content.');
  }
};