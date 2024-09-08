import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const SALES_BASE_URL = process.env.SALES_BASE_URL;
const MOTIVATIONAL_BASE_URL = process.env.MOTIVATIONAL_BASE_URL;
const NEGOTIATION_BASE_URL = process.env.NEGOTIATION_BASE_URL;
const REAL_ESTATE_BASE_URL = process.env.REAL_ESTATE_BASE_URL;

const systemPrompt = {
  "general": "You are a knowledgeable real estate expert with a deep understanding of the real estate market...",
  "sales": "You are a sales expert with in-depth knowledge of effective sales techniques...",
  "motivation": "You are an empathetic motivational speaker who inspires and encourages users...",
  "negotiations": "You are a skilled negotiator who understands the dynamics of successful negotiations..."
};

async function getTopKResults(body: Record<string, unknown>, chatbot: string) {
  try {
    let baseUrl;
    switch (chatbot) {
      case "sales":
        baseUrl = SALES_BASE_URL;
        break;
      case "motivation":
        baseUrl = MOTIVATIONAL_BASE_URL;
        break;
      case "negotiations":
        baseUrl = NEGOTIATION_BASE_URL;
        break;
      case "general":
        baseUrl = REAL_ESTATE_BASE_URL;
        break;
      default:
        throw new Error("Invalid chatbot type");
    }

    const response = await fetch(`${baseUrl}/query`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Api-Key": PINECONE_API_KEY!
      },
      body: JSON.stringify(body)
    });

    return await response.json();
  } catch (error) {
    console.error('Error in getTopKResults:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, chatbot } = await req.json();

    if (!messages || !chatbot) {
      return NextResponse.json({ error: 'Messages and chatbot type are required.' }, { status: 400 });
    }

    const question = messages[messages.length - 1].content;

    const embeddingResponse = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        model: 'text-embedding-3-large',
        input: question,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const embedding = embeddingResponse.data.data[0].embedding;

    const body = {
      vector: embedding,
      topK: 7,
      includeValues: false,
      includeMetadata: true
    };

    const topKResults = await getTopKResults(body, chatbot);
    let context = "This is the Context : ";
    topKResults.matches.forEach((match: { metadata: { values: string } }) => {
      context += match.metadata.values + " ";
    });

    const completionResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: (systemPrompt[chatbot as keyof typeof systemPrompt] + context) },
          ...messages
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponse = completionResponse.data.choices[0].message.content;

    return NextResponse.json({ response: aiResponse });
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

    return NextResponse.json({ 
      error: errorMessage, 
      details: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: statusCode });
  }
}