import { describe, expect, it } from "vitest";
import { scoreQuiz } from "./scoring";

describe("scoreQuiz", () => {
  it("scores only the server-owned answer key", () => { expect(scoreQuiz([0, 2, 1])).toBe(3); expect(scoreQuiz([1, 2, 1])).toBe(2); });
  it("rejects malformed submissions", () => { expect(scoreQuiz([0])).toBeNull(); expect(scoreQuiz([0, 2, 9])).toBeNull(); expect(scoreQuiz(["0", 2, 1])).toBeNull(); });
});
