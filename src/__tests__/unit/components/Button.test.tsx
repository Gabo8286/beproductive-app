import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen } from "@/test/utils/test-utils";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("should render with text", () => {
    renderWithProviders(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithProviders(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button", { name: /click me/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    renderWithProviders(<Button disabled>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeDisabled();
  });

  it("should apply variant classes correctly", () => {
    const { rerender } = renderWithProviders(
      <Button variant="destructive">Delete</Button>,
    );

    let button = screen.getByRole("button", { name: /delete/i });
    expect(button).toHaveClass("bg-destructive");

    rerender(<Button variant="outline">Cancel</Button>);
    button = screen.getByRole("button", { name: /cancel/i });
    expect(button).toHaveClass("border");
  });

  it("should apply size classes correctly", () => {
    renderWithProviders(<Button size="sm">Small</Button>);

    const button = screen.getByRole("button", { name: /small/i });
    expect(button).toHaveClass("h-9");
  });

  it("should not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithProviders(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>,
    );

    const button = screen.getByRole("button", { name: /click me/i });
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
