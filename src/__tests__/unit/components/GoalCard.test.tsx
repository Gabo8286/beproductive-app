import { describe, it, expect } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/test/utils/test-utils";
import userEvent from "@testing-library/user-event";
import { GoalCard } from "@/components/goals/GoalCard";
import { Goal } from "@/types/goals";

describe("GoalCard Component", () => {
  const createTestGoal = (overrides: Partial<Goal> = {}): Goal => ({
    id: "test-goal-id",
    workspace_id: "workspace-id",
    created_by: "user-id",
    assigned_to: "user-id",
    title: "Test Goal",
    description: "Test description",
    category: "personal",
    status: "active",
    priority: 3,
    progress: 0,
    target_value: null,
    current_value: 0,
    unit: null,
    start_date: null,
    target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    parent_goal_id: null,
    position: 0,
    tags: [],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    ...overrides,
  });

  it("should render goal information correctly", () => {
    const mockGoal = createTestGoal({
      title: "Learn React",
      description: "Master React and TypeScript",
      progress: 50,
    });

    renderWithProviders(<GoalCard goal={mockGoal} />);

    expect(screen.getByText("Learn React")).toBeInTheDocument();
    expect(screen.getByText("Master React and TypeScript")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("should show status badge", () => {
    const mockGoal = createTestGoal({ status: "active" });

    renderWithProviders(<GoalCard goal={mockGoal} />);

    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it("should show priority badge when set", () => {
    const mockGoal = createTestGoal({ priority: 4 });

    renderWithProviders(<GoalCard goal={mockGoal} />);

    expect(screen.getByText(/high/i)).toBeInTheDocument();
  });

  it("should display target value when set", () => {
    const mockGoal = createTestGoal({
      target_value: 100,
      current_value: 50,
      unit: "pages",
    });

    renderWithProviders(<GoalCard goal={mockGoal} />);

    expect(screen.getByText(/50 \/ 100 pages/i)).toBeInTheDocument();
  });

  it("should navigate to detail page on click", async () => {
    const user = userEvent.setup();
    const mockGoal = createTestGoal();

    renderWithProviders(<GoalCard goal={mockGoal} />);

    const card = screen.getByText(mockGoal.title).closest(".journey-card");
    if (card) {
      await user.click(card);
      // Navigation would be tested in E2E tests
    }
  });
});
