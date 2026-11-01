import { NextResponse } from "next/server";
import { QUIZ_ANSWER_KEY, scoreQuiz } from "@/lib/scoring";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { answers?: unknown };
    if (!Array.isArray(body.answers) || scoreQuiz(body.answers) === null) {
      return NextResponse.json({ error: "Invalid answer submission." }, { status: 400 });
    }
    return NextResponse.json({ score: scoreQuiz(body.answers)!, total: QUIZ_ANSWER_KEY.length });
  } catch {
    return NextResponse.json({ error: "Unable to score submission." }, { status: 400 });
  }
}
