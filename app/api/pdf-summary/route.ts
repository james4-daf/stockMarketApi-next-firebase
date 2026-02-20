import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';

export const dynamic = 'force-dynamic';

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_TEXT_LENGTH = 80_000;

async function extractTextFromBuffer(buffer: Uint8Array): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const textResult = await parser.getText();
  await parser.destroy();
  return textResult.text || '';
}

function buildPrompt(text: string, ticker?: string, reportType?: string): string {
  const reportLabel = reportType === 'annual' ? 'annual' : reportType === 'quarterly' ? 'quarterly' : 'financial';

  return `Analyze the following text extracted from a ${reportLabel} report${ticker ? ` for ${ticker}` : ''}.
Provide a concise summary in exactly 6 bullet points. Focus on:
1. Key financial results (revenue, profit, margins)
2. Business highlights and achievements
3. Segment performance or product updates
4. Risks or challenges mentioned
5. Forward-looking guidance or outlook
6. Notable strategic initiatives or changes

Return only the 6 bullet points, each starting with "•".

Report text:
${text}`;
}

async function getSummary(text: string, ticker?: string, reportType?: string): Promise<string> {
  const prompt = buildPrompt(text, ticker, reportType);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = (errData as { error?: { message?: string } })?.error?.message || `OpenAI error ${response.status}`;
    throw new Error(message);
  }

  const aiData = await response.json();
  return aiData?.choices?.[0]?.message?.content || '';
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let pdfBuffer: Uint8Array;
    let ticker: string | undefined;
    let reportType: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      // File upload
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      ticker = (formData.get('ticker') as string) || undefined;
      reportType = (formData.get('reportType') as string) || undefined;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      if (file.size > MAX_PDF_SIZE) {
        return NextResponse.json({ error: 'PDF file is too large (max 50MB)' }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      pdfBuffer = new Uint8Array(arrayBuffer);
    } else {
      // JSON with URL
      const { pdfUrl, ticker: t, reportType: rt } = await req.json();
      ticker = t;
      reportType = rt;

      if (!pdfUrl) {
        return NextResponse.json({ error: 'No PDF URL provided' }, { status: 400 });
      }

      const pdfResponse = await fetch(pdfUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      if (!pdfResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 400 });
      }

      const cl = pdfResponse.headers.get('content-length');
      if (cl && parseInt(cl) > MAX_PDF_SIZE) {
        return NextResponse.json({ error: 'PDF file is too large (max 50MB)' }, { status: 400 });
      }

      const arrayBuffer = await pdfResponse.arrayBuffer();
      pdfBuffer = new Uint8Array(arrayBuffer);
    }

    // Extract text
    let text = await extractTextFromBuffer(pdfBuffer);

    if (text.length > MAX_TEXT_LENGTH) {
      text = text.substring(0, MAX_TEXT_LENGTH);
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. It may be image-based.' },
        { status: 400 },
      );
    }

    const summary = await getSummary(text, ticker, reportType);
    return NextResponse.json({ summary });
  } catch (err) {
    console.error('PDF summary error:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate PDF summary';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
