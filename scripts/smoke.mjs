const base = process.env.BASE_URL ?? "http://localhost:3002";
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const study = await fetch(`${base}/api/study`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ topic: "Algebraic expressions", classLevel: "SSS 1" }) });
assert(study.ok, "study endpoint failed"); const studyBody = await study.json(); assert(studyBody.lesson?.objectives?.length >= 2, "study schema failed");
const score = await fetch(`${base}/api/quiz/score`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: [0, 2, 1] }) });
assert(score.ok && (await score.json()).score === 3, "quiz scoring failed");
console.log("EduLearn API smoke checks passed");
