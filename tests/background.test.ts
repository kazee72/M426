import { defineBackground } from "#imports";
import { describe, expect, it } from "vitest";

describe("background entrypoint", () => {
  it("defineBackground works with the mocked browser API", () => {
    expect(typeof defineBackground).toBe("function");
    const config = defineBackground(() => {
      console.log("test");
    });
    expect(config).toEqual({ main: expect.any(Function) });
  });
});