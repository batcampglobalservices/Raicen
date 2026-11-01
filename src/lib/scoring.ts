export const QUIZ_ANSWER_KEY = [0, 2, 1] as const;
export function scoreQuiz(answers: unknown[]) { if (answers.length !== QUIZ_ANSWER_KEY.length || answers.some(answer => !Number.isInteger(answer) || Number(answer) < 0 || Number(answer) > 3)) return null; return answers.reduce<number>((score, answer, index) => score + (answer === QUIZ_ANSWER_KEY[index] ? 1 : 0), 0); }
