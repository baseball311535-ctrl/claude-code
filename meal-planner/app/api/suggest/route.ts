import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { ingredients, freeText } = await req.json()

    const prompt = freeText
      ? `あなたは日本の家庭料理に詳しい料理アドバイザーです。マークダウンを使わずシンプルなテキストで回答してください。\n\n${freeText}`
      : `あなたは日本の家庭料理に詳しい料理アドバイザーです。マークダウンを使わずシンプルなテキストで回答してください。\n\n以下の食材を使って作れる夕食レシピを2つ提案してください：${ingredients.join('、')}。\n各レシピは「料理名」「材料」「簡単な作り方（3ステップ程度）」を含めてください。`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return NextResponse.json({ suggestion: text })
  } catch (error) {
    console.error('AI suggest error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ suggestion: `エラー: ${msg}` }, { status: 500 })
  }
}
