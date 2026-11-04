import { describe, expect, it } from "vitest";
import { affiliatePrice, computeStreak, cureFollowupDate } from "./business";

describe("règles métier", () => {
  it("prix affilié = prix public − 33 %", () => {
    expect(affiliatePrice(100)).toBe(67);
    expect(affiliatePrice(59)).toBe(39.53);
  });
  it("relance fin de cure 7 jours avant la fin", () => {
    expect(cureFollowupDate("2026-01-01", 30)).toBe("2026-01-24");
  });
  it("série de jours consécutifs", () => {
    const a = [
      { day: "2026-11-02", done: true },
      { day: "2026-11-03", done: true },
      { day: "2026-11-04", done: false },
    ];
    expect(computeStreak(a, "2026-11-04")).toBe(2);
  });
});
