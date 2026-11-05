import { defineBackground } from "#imports";
import { describe, expect, it } from "vitest";

describe("background entrypoint", () => {
  it("defineBackground works with the mocked browser API", () => {
    expect(typeof defineBackground).toBe("function");
    const config = defineBackground(() => {
      console.log("test");
    }) as { main: unknown };
    expect(typeof config.main).toBe("function");
  });
});
