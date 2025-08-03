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

    // Enhanced system prompt for structured resume feedback
    const systemPrompt = `You are an expert career counselor and resume reviewer. Provide detailed, constructive, and actionable feedback ONLY on the content that is actually present in the following resume. Do NOT comment on missing sections, formatting, or suggest adding sections that are not present. Do not mention formatting inconsistencies or recommend adding sections like 'Work Experience' if they do not exist in the resume. Focus your feedback solely on the quality and content of what is included.

Please structure your response with the following sections:

**CLARITY:**
Analyze readability and organization of the provided content. Evaluate how easy it is to scan and understand the resume as written.

**IMPACT:**
Evaluate how well achievements are quantified and the strength of action verbs used in the provided content. Identify opportunities to make accomplishments more compelling and measurable.

**CONTENT:**
Evaluate the completeness and relevance of each section that is present. Assess the quality of descriptions and information provided, but do NOT mention missing sections or suggest adding new ones.

**STRUCTURE:**
Focus specifically on the ordering and prioritization of the activities and experiences that are present. Provide guidance on how to reorder or improve the content that exists.

**FULL FEEDBACK:**
Provide the complete feedback in one comprehensive section, again only addressing what is actually present in the resume.

Be specific, constructive, and encouraging. Use bullet points for clarity and provide concrete examples. Focus on actionable advice that the student can implement immediately, but do NOT comment on missing sections or formatting.`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 1500,
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
    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      const statusCode = error.status || 500;
      return NextResponse.json({ error: error.message }, { status: statusCode });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }, { status: 500 });
  }
} 