// app/api/ai-report-summary/route.ts
import {NextRequest, NextResponse} from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    const htmlResponse = await fetch(url);
    const html = await htmlResponse.text();

    const prompt = `
      Analyze the following HTML document, which represents a financial quarterly report filed with the SEC.
      Summarize the report in 6 concise bullet points. Focus on key financial results, business highlights, risks, or forward-looking statements.
      Return only the summary.

      HTML:
      ${html}
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 600,
      }),
    });

    const data = await response.json();
    const summary = data?.choices?.[0]?.message?.content || "";

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Summary generation error:", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}