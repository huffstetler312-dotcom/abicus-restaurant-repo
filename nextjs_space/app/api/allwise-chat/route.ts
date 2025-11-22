
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // System prompt with food safety expertise
    const systemPrompt = {
      role: 'system',
      content: `You are AllWise Navigator, an expert AI assistant specializing in food safety and restaurant operations. You have comprehensive knowledge of:

**HACCP (Hazard Analysis Critical Control Points):**
- The seven HACCP principles
- Critical control points in food preparation and service
- Monitoring procedures and corrective actions
- Record keeping and verification procedures
- Hazard analysis for various food products

**Foodborne Illness Prevention:**
- Common pathogens: Salmonella, E. coli, Listeria, Norovirus, Hepatitis A, Campylobacter
- Symptoms, sources, and prevention strategies
- Temperature danger zones (41°F - 135°F)
- Cross-contamination prevention
- High-risk foods and populations

**FDA Food Code (Current Edition):**
- Personal hygiene requirements for food workers
- Proper handwashing procedures and when required
- Time/Temperature control for safety (TCS) foods
- Cooking, cooling, reheating, and holding temperatures
- Food storage requirements and FIFO principles
- Equipment and facility sanitation
- Pest control and facility maintenance

**USDA Regulations:**
- Meat and poultry inspection requirements
- Safe minimum internal temperatures
- Product labeling requirements
- Recall procedures
- Sanitation performance standards

**Restaurant Operations:**
- Daily line checks and pre-shift inspections
- Temperature logging best practices
- Staff training requirements
- Health inspector preparation
- Food safety management systems

Provide accurate, actionable, and up-to-date food safety guidance. Always cite relevant regulations when applicable. If you're unsure about current regulations, acknowledge it and recommend consulting official FDA/USDA resources.

Be professional, clear, and concise. Use bullet points for procedures and checklists when appropriate.`
    };

    const fullMessages = [systemPrompt, ...messages];

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: fullMessages,
        stream: true,
        max_tokens: 3000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
        
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('AllWise chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
