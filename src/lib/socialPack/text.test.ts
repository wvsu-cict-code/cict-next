import { describe, expect, it } from "vitest";
import { TITLE_BOX } from "./brand";
import { fitText, markdownToPlain, summaryFor, wrapLines } from "./text";

const measure = (t: string, s: number) => t.length * s * 0.5;

describe("wrapLines", () => {
  it("wraps on word boundaries", () => {
    expect(wrapLines("aa bb cc", 30, 10, measure)).toEqual(["aa bb", "cc"]);
  });
  it("breaks a word that is wider than the box", () => {
    const lines = wrapLines("abcdefghij", 20, 10, measure);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join("")).toBe("abcdefghij");
    for (const l of lines) expect(measure(l, 10)).toBeLessThanOrEqual(20);
  });
});

describe("fitText", () => {
  const sizes = [84, 76, 68, 60, 52];
  it("uses the largest size that fits", () => {
    const r = fitText("Short title", TITLE_BOX, sizes, 1.1, measure);
    expect(r.fontSize).toBe(84);
    expect(r.lines).toEqual(["Short title"]);
  });
  it("truncates with an ellipsis at the smallest size", () => {
    const title = "word ".repeat(60).trim().slice(0, 300);
    const r = fitText(title, TITLE_BOX, sizes, 1.1, measure);
    expect(r.fontSize).toBe(52);
    expect(r.lines[r.lines.length - 1].endsWith("…")).toBe(true);
    expect(r.lines.length * 52 * 1.1).toBeLessThanOrEqual(420);
    expect(measure(r.lines[r.lines.length - 1], 52)).toBeLessThanOrEqual(
      TITLE_BOX.width,
    );
  });
});

describe("markdownToPlain", () => {
  it("strips headings, emphasis, links and images", () => {
    expect(
      markdownToPlain(
        "# Hi\n\n**Bold** and [link](https://x.y) ![img](/a.png)",
      ),
    ).toBe("Hi\n\nBold and link");
  });
  it("handles lists, quotes, code, html and blank runs", () => {
    expect(
      markdownToPlain(
        "- one\n- two\n1. three\n\n> quoted `code`\n\n\n\n<b>tag</b> *it* _it_",
      ),
    ).toBe("one\ntwo\nthree\n\nquoted code\n\ntag it it");
  });
});

describe("markdownToPlain structure and underscores", () => {
  it("keeps snake_case words and URL underscores", () => {
    expect(
      markdownToPlain("see my_var and other_var https://x.com/a_b_c"),
    ).toBe("see my_var and other_var https://x.com/a_b_c");
    expect(markdownToPlain("an _emphasised_ and __strong__ word")).toBe(
      "an emphasised and strong word",
    );
  });
  it("keeps the blank line between a paragraph and a list", () => {
    expect(markdownToPlain("para\n\n- item\n- two")).toBe("para\n\nitem\ntwo");
  });
  it("does not swallow the newline after a bare quote marker", () => {
    expect(markdownToPlain("a\n>\nb")).toBe("a\n\nb");
  });
  it("does not swallow the newline after a bare heading marker", () => {
    expect(markdownToPlain("a\n#\nb")).toBe("a\n#\nb");
  });
});

describe("summaryFor", () => {
  it("truncates the body at a word boundary", () => {
    const s = summaryFor(null, "word ".repeat(100));
    expect(s.length).toBeLessThanOrEqual(201);
    expect(s.endsWith("…")).toBe(true);
  });
  it("prefers a trimmed excerpt", () => {
    expect(summaryFor("  Given  ", "…")).toBe("Given");
  });
});
