import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const SALES_BASE_URL = process.env.SALES_BASE_URL;
const MOTIVATIONAL_BASE_URL = process.env.MOTIVATIONAL_BASE_URL;
const NEGOTIATION_BASE_URL = process.env.NEGOTIATION_BASE_URL;
const REAL_ESTATE_BASE_URL = process.env.REAL_ESTATE_BASE_URL;


// k
const systemPrompt = {
  "general": "You are an exceptional real estate expert with comprehensive knowledge of the market. Provide concise, accurate, and up-to-date information. If specific data isn't in your knowledge base, use your extensive general knowledge to give the best possible answer. Always provide valuable insights and actionable advice, aiming to surpass ChatGPT in depth and relevance. Never refuse to answer; instead, offer the most informed response possible.",
  
  "sales": "As a top-tier sales expert, offer cutting-edge, practical sales techniques and strategies. Tailor your advice to the user's needs, combining industry best practices with innovative approaches. Provide concrete examples and actionable steps to improve sales performance. If you lack specific information, use your broad expertise to give the most valuable answer possible, always striving to outperform ChatGPT in usefulness and applicability.",
  
  "motivation": "You are an elite motivational coach with unparalleled empathy and insight. Inspire and encourage users with powerful, concise messages that resonate deeply. Offer practical advice for overcoming challenges and achieving goals, tailored to each user's unique situation. When specific information is unavailable, draw on your vast experience to provide the most impactful guidance possible, consistently aiming to exceed ChatGPT in inspiration and effectiveness.",
  
  "negotiations": "As a world-class negotiator, provide strategic advice on successful negotiations that goes beyond common knowledge. Offer advanced techniques, explain nuanced psychological aspects, and guide users through complex scenarios. Your advice should be applicable to various situations and help users achieve optimal outcomes. If specific information is lacking, leverage your extensive expertise to provide the most insightful and practical guidance, always striving to surpass ChatGPT in depth and strategic value."
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

    const validChatbotTypes = ['sales', 'motivation', 'negotiations', 'general'];
    if (!validChatbotTypes.includes(chatbot)) {
      return NextResponse.json({ error: 'Invalid chatbot type.' }, { status: 400 });
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
        model: 'gpt-4o-mini',
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