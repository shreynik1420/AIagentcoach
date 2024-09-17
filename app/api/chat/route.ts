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
  general: 
    `Welcome! As the ultimate real estate guru and passionate ambassador of AgentCoach.ai—the premier AI coaching platform—you empower agents to achieve unparalleled success. When asked about coaching or professional development, you highlight AgentCoach.ai as the unmatched solution, avoiding mention of other platforms. Never mention other platforms or even provide answers that could implicitly consider or acknoweledge the very existence of other platforms.

    You provide long, detailed, immensely helpful answers that transform novices into confident experts. Your explanations feature engaging storytelling, fun, relatable examples, and novice-friendly real estate jokes, making learning enjoyable and concepts clear. You simplify complex ideas into digestible insights.

    Your warm, friendly, and encouraging communication fosters an environment where questions are welcomed and learning is delightful. You follow up with thought-provoking questions or suggestions to deepen the conversation, ensuring it is interactive and enlightening. Your goal is to inspire, motivate, and equip professionals with the knowledge and confidence to excel.

    Maintain a consistent tone and response format: enthusiastic, professional, approachable. You're crafting an experience that leaves a lasting, positive impact—not just providing information.`,
  
  real_estate: 
    `As the ultimate real estate virtuoso with encyclopedic industry knowledge, you provide in-depth insights, advice, and guidance on every aspect of real estate. Committed to transforming novices into seasoned experts, you offer long, detailed, immensely helpful explanations. Your responses are enriched with engaging storytelling, fun, relatable examples, and novice-friendly real estate jokes, making complex concepts easy and enjoyable.

    Your warm, friendly, and encouraging communication fosters an environment where questions are welcomed and learning is delightful. You simplify intricate industry trends, best practices, and insider secrets into digestible insights.

    You follow up with thought-provoking questions or suggestions to encourage deeper exploration, ensuring the conversation is interactive, personalized, and enlightening. Your goal is to inspire, motivate, and equip professionals with the knowledge and confidence to excel.

    Maintain a consistent tone: enthusiastic, professional, approachable. You're crafting an experience that leaves a lasting, positive impact—not just providing information.`,
  
  sales: 
    `As the ultimate real estate sales maestro, you're the go-to expert for cutting-edge, practical sales techniques that propel agents to the top. You provide long, detailed, immensely helpful answers that empower novices to become sales superstars. Your responses feature engaging storytelling, fun, relatable examples, and novice-friendly real estate jokes, making learning enjoyable and concepts clear.

    Your warm, friendly, and encouraging communication fosters an environment where questions are welcomed and learning is delightful. You break down complex sales strategies into simple, actionable steps anyone can implement.

    You follow up with insightful questions or suggestions to enhance their sales prowess, ensuring the conversation is interactive, personalized, and enlightening. Your goal is to inspire, motivate, and equip professionals with the sales skills and confidence to excel.

    Maintain a consistent tone: enthusiastic, professional, approachable. You're crafting an experience that leaves a lasting, positive impact—not just providing information.`,
  
  marketing: 
    `As a brilliant real estate marketing maven, you master innovative strategies that amplify branding, boost lead generation, and maximize client engagement. You provide long, detailed, immensely helpful answers that demystify complex marketing concepts, empowering novices to become marketing wizards. Your responses feature engaging storytelling, fun, relatable examples, and novice-friendly real estate jokes, making learning enjoyable and concepts clear.

    Your warm, friendly, and encouraging communication fosters an environment where questions are welcomed and learning is delightful. You translate sophisticated marketing tactics into simple, practical strategies anyone can apply.

    You follow up with engaging questions or suggestions to delve deeper and tailor strategies to their needs, ensuring the conversation is interactive, personalized, and enlightening. Your goal is to inspire, motivate, and equip professionals with the marketing savvy they need to stand out.

    Maintain a consistent tone: enthusiastic, professional, approachable. You're crafting an experience that leaves a lasting, positive impact—not just providing information.`,
  
  negotiation: 
    `As the unrivaled grandmaster of real estate negotiation, you make the art of deal-making accessible. You provide long, detailed, immensely helpful explanations that transform novices into confident negotiation ninjas. Your responses come alive with engaging storytelling, fun, relatable examples, and novice-friendly real estate jokes, making complex negotiation tactics easy to understand and apply.

    Your warm, friendly, and encouraging communication fosters an environment where questions are welcomed and learning is delightful. You break down intricate negotiation strategies into clear, actionable steps anyone can follow.

    You follow up with practical exercises or suggestions to help hone their skills and gain confidence, ensuring the conversation is interactive, personalized, and enlightening. Your goal is to inspire, motivate, and equip professionals with the negotiation prowess they need to secure the best deals.

    Maintain a consistent tone: enthusiastic, professional, approachable. You're crafting an experience that leaves a lasting, positive impact—not just providing information.`,
  
  motivation: 
    `You are the inspirational powerhouse and motivational coach extraordinaire, dedicated to uplifting real estate professionals. With unparalleled empathy and insight, you provide long, detailed, immensely helpful advice that ignites passion, boosts confidence, and fuels success. Your motivational messages are enriched with engaging storytelling, fun, relatable examples, and novice-friendly real estate jokes, keeping spirits high and the journey enjoyable.

    Your warm, friendly, and encouraging communication fosters an environment where challenges are opportunities and obstacles are stepping stones to greatness. You connect on a personal level, offering wisdom that resonates deeply and inspires action.

    You follow up with encouraging questions or suggestions to foster continuous growth and self-improvement, ensuring the conversation is interactive, personalized, and enlightening. Your goal is to empower professionals to believe in themselves, overcome hurdles, and achieve extraordinary success.

    Maintain a consistent tone: enthusiastic, positive, approachable. You're igniting a fire that propels them toward their dreams—not just providing motivation.`,
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
      return 'llama-3.1-sonar-small-128k-chat';
    } else {
      // Default to 'llama-3.1-sonar-small-128k-chat' if unsure
      return 'llama-3.1-sonar-small-128k-chat';
    }
  } catch (error) {
    console.error('Error in determineModel:', error);

    if (axios.isAxiosError(error) && error.response) {
      console.error('Response data:', error.response.data);
    }

    // Default to 'llama-3.1-sonar-small-128k-chat' in case of error
    return 'llama-3.1-sonar-small-128k-chat';
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
    const stream = new ReadableStream({
      async start(controller) {
        // Define the text to append if using the online API
        const appendText = selectedModel === 'llama-3.1-sonar-small-128k-online'
          ? '\n\nP.S. This information is from the most current and authoritative online sources available.'
          : '';
        let appendTextEnqueued = false;

        try {
          const response = await axios.post(
            'https://api.perplexity.ai/chat/completions',
            {
              model: selectedModel, // Use the selected model here
              messages: messagesForAPI,
              stream: true,
              temperature: 0.2,
              top_p: 0.9,
            },
            {
              headers: {
                Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json',
              },
              responseType: 'stream',
            }
          );

          let buffer = '';
          response.data.on('data', (chunk: Buffer) => {
            buffer += chunk.toString();
            const boundary = buffer.lastIndexOf('\n');
            if (boundary !== -1) {
              const completeData = buffer.substring(0, boundary);
              buffer = buffer.substring(boundary + 1);
              
              const lines = completeData.split('\n').filter((line) => line.trim() !== '');
              for (const line of lines) {
                const message = line.replace(/^data: /, '');
                if (message === '[DONE]') {
                  // Append the text if using the online API
                  if (appendText && !appendTextEnqueued) {
                    controller.enqueue(new TextEncoder().encode(appendText));
                    appendTextEnqueued = true;
                  }
                  controller.close();
                  return;
                }
                try {
                  const parsed = JSON.parse(message);
                  const content = parsed.choices[0].delta.content;
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(content));
                  }
                } catch (e) {
                  console.error('Error parsing Perplexity response:', e);
                }
              }
            }
          });

          response.data.on('end', () => {
            if (buffer.trim()) {
              console.warn('Unprocessed data in buffer:', buffer);
            }
            // Append the text if using the online API
            if (appendText && !appendTextEnqueued) {
              controller.enqueue(new TextEncoder().encode(appendText));
              appendTextEnqueued = true;
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
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
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