import { describe, it, expect } from "vitest";

import { extractTextFromReactNode } from "../../common/react-node";

describe("extractTextFromReactNode", () => {
  it("should extract text from string", () => {
    expect(extractTextFromReactNode("hello")).toBe("hello");
  });

  it("should extract text from number", () => {
    expect(extractTextFromReactNode(123)).toBe("123");
  });

  it("should return empty string for null/undefined/boolean", () => {
    expect(extractTextFromReactNode(null)).toBe("");
    expect(extractTextFromReactNode(undefined)).toBe("");
    expect(extractTextFromReactNode(true)).toBe("");
    expect(extractTextFromReactNode(false)).toBe("");
  });

  it("should extract text from simple React element", () => {
    const element = <span>hello world</span>;
    expect(extractTextFromReactNode(element)).toBe("hello world");
  });

  it("should extract text from nested React elements", () => {
    const element = (
      <div>
        <span>hello</span>
        <span> world</span>
      </div>
    );
    expect(extractTextFromReactNode(element)).toBe("hello world");
  });

  it("should extract text from array of nodes", () => {
    const nodes = ["hello", " ", "world"];
    expect(extractTextFromReactNode(nodes)).toBe("hello world");
  });

  it("should handle mixed content", () => {
    const element = (
      <div>
        text before
        <span>inner text</span>
        text after
      </div>
    );
    expect(extractTextFromReactNode(element)).toBe(
      "text beforeinner texttext after",
    );
  });
});
