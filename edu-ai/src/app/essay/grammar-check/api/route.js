/// app/api/grammar-check/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text } = await request.json();
    
    if (!text || !text.trim()) {
      return NextResponse.json({ errors: [] });
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are a grammar and spelling assistant. Identify grammar and spelling errors in the provided text. Return a JSON object with the following format: {\"errors\": [{\"word\": \"incorrectWord\", \"startIndex\": 0, \"endIndex\": 10, \"suggestion\": \"correctedWord\", \"reason\": \"brief explanation\"}]}"
          },
          {
            role: "user",
            content: `Check this text for grammar and spelling errors: "${text}"`
          }
        ],
        temperature: 0.2,
        response_format: { "type": "json_object" }
      })
    });
    
    const data = await response.json();
    return NextResponse.json(JSON.parse(data.choices[0].message.content));
  } catch (error) {
    console.error('Error checking grammar:', error);
    return NextResponse.json({ errors: [] }, { status: 500 });
  }
}