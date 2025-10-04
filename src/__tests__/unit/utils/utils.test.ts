import { describe, it, expect } from "vitest";
import { cn, formatTime } from "@/lib/utils";

describe("Utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      const result = cn("foo", "bar");
      expect(result).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      const result = cn("foo", false && "bar", "baz");
      expect(result).toBe("foo baz");
    });

    it("should merge tailwind classes correctly", () => {
      const result = cn("px-2 py-1", "px-4");
      expect(result).toBe("py-1 px-4");
    });
  });

  describe("formatTime", () => {
    it("should format seconds correctly", () => {
      expect(formatTime(45)).toBe("0:45");
    });

    it("should format minutes and seconds", () => {
      expect(formatTime(125)).toBe("2:05");
    });

    it("should format hours, minutes, and seconds", () => {
      expect(formatTime(3665)).toBe("1:01:05");
    });

    it("should handle zero seconds", () => {
      expect(formatTime(0)).toBe("0:00");
    });

    it("should pad single digits correctly", () => {
      expect(formatTime(65)).toBe("1:05");
      expect(formatTime(3605)).toBe("1:00:05");
    });
  });
});
