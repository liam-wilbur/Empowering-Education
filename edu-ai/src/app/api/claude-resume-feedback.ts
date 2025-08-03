// /api/claude-resume-feedback.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { resume } = await request.json();
    if (!resume || typeof resume !== 'string' || resume.trim().length === 0) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    // Use OpenAI API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // System prompt for resume feedback
    const systemPrompt = `You are an expert career counselor and resume reviewer. Provide detailed, constructive, and actionable feedback on the content, clarity, and impact of the following resume. Focus on strengths, weaknesses, and specific suggestions for improvement. Format your response with sections for CONTENT, CLARITY, IMPACT, and OVERALL.`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 800,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: resume }
      ]
    });

    const feedback = response.choices[0]?.message?.content;
    if (!feedback) {
      return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 });
    }
    return NextResponse.json({ feedback });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
} 