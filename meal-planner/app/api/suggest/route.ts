import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { ingredients, freeText } = await req.json()

    const prompt = freeText
      ? `あなたは日本の家庭料理に詳しい料理アドバイザーです。マークダウンを使わずシンプルなテキストで回答してください。\n\n${freeText}`
      : `あなたは日本の家庭料理に詳しい料理アドバイザーです。マークダウンを使わずシンプルなテキストで回答してください。\n\n以下の食材を使って作れる夕食レシピを2つ提案してください：${ingredients.join('、')}。\n各レシピは「料理名」「材料」「簡単な作り方（3ステップ程度）」を含めてください。`

    const apiKey = process.env.GEMINI_API_KEY!
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Gemini API error ${res.status}: ${errText}`)
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'レシピを取得できませんでした'

    return NextResponse.json({ suggestion: text })
  } catch (error) {
    console.error('AI suggest error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ suggestion: `エラー: ${msg}` }, { status: 500 })
  }
}
