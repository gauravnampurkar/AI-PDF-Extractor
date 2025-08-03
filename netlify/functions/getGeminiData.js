export async function handler(event, context) {
  const apiKey = process.env.GEMINI_API_KEY;

  const response = await fetch("https://your-gemini-api.com", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}
