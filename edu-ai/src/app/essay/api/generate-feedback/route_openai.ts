// app/api/generate-feedback/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { title, essay } = await request.json();

    if (!essay || essay.trim().length === 0) {
      return NextResponse.json({ error: 'Essay text is required' }, { status: 400 });
    }

    // Use OpenAI API key
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' }, 
        { status: 500 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // System and user prompts
    const systemPrompt = `You are a supportive academic writing assistant who provides detailed feedback on essays. 
      Your feedback should be constructive, specific, and actionable.
      Always write what sentences or words are wrong.
      Include sections for GRAMMAR, STRUCTURE, CONTENT, LANGUAGE, OVERALL assessment.`;
      
    const userPrompt = `Please provide feedback on my essay titled "${title}": \n\n${essay}`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4", // or "gpt-3.5-turbo" if you prefer
      temperature: 0.7,
      max_tokens: 1000,
      messages: [
        { 
          role: "system", 
          content: systemPrompt 
        },
        { 
          role: "user", 
          content: userPrompt 
        }
      ]
    });

    // Extract feedback from response
    const feedback = response.choices[0]?.message?.content;
    
    if (!feedback) {
      return NextResponse.json(
        { error: 'Failed to generate feedback' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error generating feedback:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      const statusCode = error.status || 500;
      return NextResponse.json({ error: error.message }, { status: statusCode });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}