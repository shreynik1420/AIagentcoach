import { NextRequest } from 'next/server';
import axios from 'axios';

const NEXT_PUBLIC_OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const REAL_ESTATE_BASE_URL = process.env.REAL_ESTATE_BASE_URL;
const SALES_BASE_URL = process.env.SALES_BASE_URL;
const MARKETING_BASE_URL = process.env.MARKETING_BASE_URL;
const MOTIVATION_BASE_URL = process.env.MOTIVATION_BASE_URL;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

// Map of chatbot types to their base URLs
const BASE_URLS: { [key: string]: string } = {
  real_estate: REAL_ESTATE_BASE_URL!,
  sales: SALES_BASE_URL!,
  marketing: MARKETING_BASE_URL!,
  motivation: MOTIVATION_BASE_URL!,
};

const systemPrompt = {
  general: `
    Welcome! As the ultimate real estate guru and ambassador of AgentCoach.ai, you empower agents for success. Highlight AgentCoach.ai as the unmatched coaching solution, avoiding mentions of other platforms. 
    End first sentence with emojis and only use 4 emoji's overall. 
    Provide detailed, helpful answers that transform novices into experts, using engaging storytelling, relatable examples, and real estate jokes to simplify complex ideas. Your warm, friendly communication fosters a welcoming environment for questions and learning. Follow up with thought-provoking questions to deepen the conversation. End with proper punctuation and relevant emojis! Maintain an enthusiastic, professional, and approachable tone for a lasting positive impact. 😊
  `,
  
  real_estate: `
    As the ultimate real estate expert, you offer in-depth insights and guidance on all aspects of real estate, transforming novices into seasoned professionals. Use engaging storytelling and relatable examples to make complex concepts enjoyable. 
    End first sentence with emojis and only use 4 emoji's overall. 

    Foster a welcoming environment for questions and simplify industry trends into digestible insights. Follow up with suggestions for deeper exploration. End with proper punctuation and relevant emojis! Maintain an enthusiastic, professional, and approachable tone for a lasting positive impact. 😊
  `,
  
  sales: `
    As the ultimate real estate sales expert, you provide practical sales techniques that empower agents to excel. Offer detailed, helpful answers enriched with storytelling and relatable examples.
    End first sentence with emojis and only use 4 emoji's overall. 

    Foster a friendly learning environment and simplify complex strategies into actionable steps. Follow up with insightful questions to enhance their sales skills. End with proper punctuation and relevant emojis! Maintain an enthusiastic, professional, and approachable tone for a lasting positive impact. 😊
  `,
  
  marketing: `
    As a brilliant real estate marketing expert, you master innovative strategies for branding, lead generation, and client engagement. Provide detailed, helpful answers that demystify marketing concepts and empower novices.
    End first sentence with emojis and only use 4 emoji's overall. 

    Foster a warm environment for questions, translating sophisticated tactics into practical strategies. Follow up with engaging questions for deeper exploration. End with proper punctuation and relevant emojis! Maintain an enthusiastic, professional, and approachable tone for a lasting positive impact. 😊
  `,
  
  negotiation: `
    As the grandmaster of real estate negotiation, you make deal-making accessible. Provide detailed, helpful explanations that turn novices into confident negotiators using storytelling and relatable examples.
    End first sentence with emojis and only use 4 emoji's overall. 

    Foster a friendly environment for questions and simplify complex strategies into actionable steps. Follow up with practical exercises for skill enhancement. End with proper punctuation and relevant emojis! Maintain an enthusiastic, professional, and approachable tone for a lasting positive impact. 😊
  `,
  
  motivation: `
    As an inspirational powerhouse, you uplift real estate professionals with empathy and insight. Provide detailed, helpful advice that ignites passion and boosts confidence.
    End first sentence with emojis and only use 4 emoji's overall. 

    Foster a warm environment where challenges are seen as opportunities. Follow up with encouraging questions for continuous growth. End with proper punctuation and relevant emojis! Maintain an enthusiastic, positive, and approachable tone to inspire action. 😊
  `,
};

// Function to get top K results from Pinecone
async function getTopKResults(body: Record<string, unknown>, baseUrl: string) {
  try {
    const response = await fetch(`${baseUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PINECONE_API_KEY!,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getTopKResults:', error);
    throw error;
  }
}

// Improved semantic router function
async function determineModel(question: string): Promise<string> {
  const systemPrompt = 
  `You are an AI assistant that determines whether a user's question requires real-time data to answer.

  Instructions:

  - Analyze the user's question below and decide whether it requires real-time data (like current market trends, live prices, or up-to-date statistics) or can be answered with general knowledge.
  
  - If the question involves current prices, market trends, availability, or any information that changes over time and requires real-time data, respond with "requires real-time data".
  
  - If the question can be answered with general knowledge, advice, coaching, or does not depend on the latest data, respond with "does not require real-time data".
  
  - Your response should be only "requires real-time data" or "does not require real-time data" with no additional text.
  
  Question: "${question}"
  
  Your response:`;

  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3.1-sonar-small-128k-chat',
        messages: [
          { role: 'system', content: 'Be precise and concise.' },
          { role: 'user', content: systemPrompt }
        ],
        temperature: 0,
        max_tokens: 10,
        stream: false,
        return_citations: false,
        return_images: false,
        return_related_questions: false
      },
      {
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const answer = response.data.choices[0].message.content.trim().toLowerCase();

    if (answer.includes('requires real-time data')) {
      return 'llama-3.1-sonar-small-128k-online';
    } else if (answer.includes('does not require real-time data')) {
      return 'llama-3.1-70b-instruct';
    } else {
      // Default to 'llama-3.1-70b-instruct' if unsure
      return 'llama-3.1-70b-instruct';
    }
  } catch (error) {
    console.error('Error in determineModel:', error);

    if (axios.isAxiosError(error) && error.response) {
      console.error('Response data:', error.response.data);
    }

    // Default to 'llama-3.1-70b-instruct' in case of error
    return 'llama-3.1-70b-instruct';
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, chatbot, expert } = await req.json();

    if (!messages || !chatbot || !expert) {
      return new Response(JSON.stringify({ error: 'Messages, chatbot type, and expert are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Map 'general' and 'negotiation' to 'real_estate' base URL
    let baseUrl = BASE_URLS[chatbot];
    if (!baseUrl) {
      baseUrl = REAL_ESTATE_BASE_URL!;
    }

    const question = messages[messages.length - 1].content;

    // Determine which model to use using the improved semantic router
    const selectedModel = await determineModel(question);

    const embeddingResponse = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        model: 'text-embedding-3-large',
        input: question,
      },
      {
        headers: {
          Authorization: `Bearer ${NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const embedding = embeddingResponse.data.data[0].embedding;

    const body = {
      vector: embedding,
      topK: 7,
      includeValues: false,
      includeMetadata: true,
    };

    const topKResults = await getTopKResults(body, baseUrl);
    let context = 'This is the Context: ';

    if (topKResults && Array.isArray(topKResults.matches)) {
      topKResults.matches.forEach((match: { metadata: { values: string } }) => {
        context += match.metadata.values + ' ';
      });
    } else {
      console.error('No matches found in topKResults:', topKResults);
      context += 'No relevant context found.';
    }

    // Use the 'expert' parameter to select the appropriate prompt
    const promptKey = expert.toLowerCase().replace(/\s+/g, '_') as keyof typeof systemPrompt;
    const systemMessage = systemPrompt[promptKey] || systemPrompt['general'];

    // Prepare the messages for Perplexity API
    const messagesForAPI = [{ role: 'system', content: systemMessage + context }, ...messages];

    // Create a stream to handle the Perplexity streaming response
    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            const response = await axios.post(
              'https://api.perplexity.ai/chat/completions',
              {
                model: selectedModel,
                messages: messagesForAPI,
                stream: true,
                temperature: 0.6, // Adjusted temperature
                top_p: 0.7,  
                max_tokens: 200,    // Adjusted top_p
              },
              {
                headers: {
                  Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                responseType: 'stream',
              }
            );

            let fullText = '';
            let buffer = '';

            response.data.on('data', (chunk: Buffer) => {
              buffer += chunk.toString();

              let lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const message = line.slice(6).trim();
                  if (message === '[DONE]') {
                    if (selectedModel === 'llama-3.1-sonar-small-128k-online') {
                      controller.enqueue(
                        new TextEncoder().encode(
                          '\n\nP.S. This information is from the most current and authoritative online sources available.'
                        )
                      );
                    }
                    controller.close();
                    return;
                  }
                  try {
                    const parsed = JSON.parse(message);
                    const content = parsed.choices[0].delta.content;
                    if (content) {
                      fullText += content;
                      controller.enqueue(new TextEncoder().encode(content));
                    }
                  } catch (e) {
                    console.error('Error parsing Perplexity response:', e);
                    buffer = 'data: ' + message + '\n';
                  }
                }
              }
            });

            response.data.on('end', () => {
              if (selectedModel === 'llama-3.1-sonar-small-128k-online') {
                controller.enqueue(
                  new TextEncoder().encode(
                    '\n\nP.S. This information is from the most current and authoritative online sources available.'
                  )
                );
              }
              controller.close();
            });

            response.data.on('error', (err: Error) => {
              console.error('Streaming error:', err);
              controller.error(err);
            });
          } catch (e) {
            console.error('Error in streaming:', e);
            controller.error(e);
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      }
    );
  } catch (error) {
    console.error('Detailed error in LLM generation:', error);

    let errorMessage = 'Internal Server Error';
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
      errorMessage = error.response?.data?.error || 'Error in API request';
      statusCode = error.response?.status || 500;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'Unknown error',
      }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}