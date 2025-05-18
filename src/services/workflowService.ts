// Service to interact with the workflow backend API

export interface WorkflowApiResponse {
  Plan: string;
  Think: string;
  response: string;
}

// Function to call the backend workflow API
export const callWorkflowApi = async (
  query: string,
  sessionId: string // Add sessionId parameter
): Promise<WorkflowApiResponse> => {
  const apiUrl = 'https://modelselector-backend-1051022814597.us-central1.run.app/chat'; // Your backend API endpoint

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, sessionId }), // Include sessionId in the body
    });

    if (!response.ok) {
      // Handle HTTP errors (e.g., 4xx, 5xx)
      const errorBody = await response.text();
      console.error('API Error Response:', errorBody);
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    const data: WorkflowApiResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Error calling workflow API:', error);
    // Re-throw the error or return a default error structure
    // depending on how you want the UI to handle it.
    throw error; // Re-throwing for the component to catch
  }
};