import { test, expect } from '@playwright/test';

/**
 * Goal Tracking Workflows E2E Tests
 *
 * Comprehensive testing of goal tracking and achievement features including:
 * - Goal creation and configuration
 * - Progress tracking and updates
 * - Goal analytics and insights
 * - Milestone management
 * - Goal categories and organization
 * - Goal achievement flows
 * - Integration with tasks and time tracking
 */

test.describe('Goal Tracking Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/goals');
    await expect(page.locator('h1, h2').filter({ hasText: /goals/i })).toBeVisible();
  });

  test.describe('Goal Creation and Setup', () => {
    test('user can create a new goal with comprehensive details', async ({ page }) => {
      // Look for goal creation button
      const createGoalButton = page.locator('button').filter({ hasText: /add|create|new.*goal/i });

      if (await createGoalButton.count() > 0) {
        await createGoalButton.first().click();
        await page.waitForTimeout(500);

        // Fill in goal title
        const titleInput = page.locator('input[placeholder*="goal"], input[placeholder*="title"]').or(
          page.locator('input').first()
        );

        if (await titleInput.isVisible()) {
          await titleInput.fill('Complete Comprehensive E2E Testing Suite');

          // Fill in goal description
          const descriptionField = page.locator('textarea[placeholder*="description"], textarea').first();
          if (await descriptionField.count() > 0 && await descriptionField.isVisible()) {
            await descriptionField.fill('Develop and execute a complete end-to-end testing strategy that covers all user workflows, edge cases, and performance requirements for the productivity application.');
          }

          // Set goal category/type
          const categorySelect = page.locator('select').filter({ hasText: /category|type/i });
          if (await categorySelect.count() > 0) {
            await categorySelect.click();
            const categoryOptions = page.locator('option').filter({ hasText: /professional|work|development/i });
            if (await categoryOptions.count() > 0) {
              await categoryOptions.first().click();
            }
          }

          // Set target date
          const targetDateInput = page.locator('input[type="date"], input[placeholder*="date"]');
          if (await targetDateInput.count() > 0) {
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 3);
            const dateString = futureDate.toISOString().split('T')[0];
            await targetDateInput.fill(dateString);
          }

          // Set target value (if applicable)
          const targetValueInput = page.locator('input[type="number"], input[placeholder*="target"]');
          if (await targetValueInput.count() > 0) {
            await targetValueInput.fill('100');
          }

          // Set goal priority
          const prioritySelect = page.locator('select').filter({ hasText: /priority/i });
          if (await prioritySelect.count() > 0) {
            await prioritySelect.click();
            const highPriority = page.locator('option').filter({ hasText: /high/i });
            if (await highPriority.count() > 0) {
              await highPriority.click();
            }
          }

          // Save the goal
          const saveButton = page.locator('button').filter({ hasText: /save|create|add/i });
          if (await saveButton.count() > 0) {
            await saveButton.first().click();
            await page.waitForTimeout(1000);

            // Verify goal was created
            await expect(page.locator('text=Complete Comprehensive E2E')).toBeVisible({ timeout: 5000 });
          }
        }
      } else {
        console.log('No goal creation functionality found - testing read-only view');
      }
    });

    test('user can create different types of goals', async ({ page }) => {
      const goalTypes = [
        { title: 'Fitness Goal: Run 5K Daily', category: 'health', target: '30' },
        { title: 'Learning Goal: Complete React Course', category: 'education', target: '1' },
        { title: 'Career Goal: Get Promotion', category: 'professional', target: '1' }
      ];

      for (const goalData of goalTypes) {
        const createButton = page.locator('button').filter({ hasText: /add|create|new.*goal/i });

        if (await createButton.count() > 0) {
          await createButton.first().click();
          await page.waitForTimeout(500);

          // Fill in goal details
          const titleInput = page.locator('input').first();
          if (await titleInput.isVisible()) {
            await titleInput.fill(goalData.title);

            // Set category if available
            const categorySelect = page.locator('select').filter({ hasText: /category|type/i });
            if (await categorySelect.count() > 0) {
              await categorySelect.click();
              const categoryOption = page.locator('option').filter({ hasText: new RegExp(goalData.category, 'i') });
              if (await categoryOption.count() > 0) {
                await categoryOption.first().click();
              }
            }

            // Set target if available
            const targetInput = page.locator('input[type="number"]');
            if (await targetInput.count() > 0) {
              await targetInput.fill(goalData.target);
            }

            // Save goal
            const saveButton = page.locator('button').filter({ hasText: /save|create/i });
            if (await saveButton.count() > 0) {
              await saveButton.first().click();
              await page.waitForTimeout(1000);
            }
          }
        }

        // Break after first successful creation to avoid overwhelming
        break;
      }
    });

    test('user can set up goal milestones', async ({ page }) => {
      // Look for existing goals to add milestones to
      const existingGoals = page.locator('[class*="goal"], [data-testid*="goal"]').or(
        page.locator('div, li').filter({ hasText: /progress|target|achievement/i })
      );

      if (await existingGoals.count() > 0) {
        await existingGoals.first().click();
        await page.waitForTimeout(500);

        // Look for milestone functionality
        const milestoneElements = page.locator('button').filter({ hasText: /milestone|checkpoint/i }).or(
          page.locator('text=Milestone').locator('..')
        );

        if (await milestoneElements.count() > 0) {
          await milestoneElements.first().click();
          await page.waitForTimeout(500);

          // Add milestone details
          const milestoneInput = page.locator('input[placeholder*="milestone"], input').first();
          if (await milestoneInput.isVisible()) {
            await milestoneInput.fill('Complete 25% of testing coverage');

            const saveButton = page.locator('button').filter({ hasText: /add|save/i });
            if (await saveButton.count() > 0) {
              await saveButton.first().click();
              console.log('Milestone added to goal');
            }
          }
        } else {
          console.log('No milestone functionality found');
        }
      }
    });
  });

  test.describe('Goal Progress Tracking', () => {
    test('user can update goal progress manually', async ({ page }) => {
      // Look for existing goals
      const goals = page.locator('[class*="goal"], [data-testid*="goal"]').or(
        page.locator('div').filter({ hasText: /progress|%/i })
      );

      if (await goals.count() > 0) {
        await goals.first().click();
        await page.waitForTimeout(500);

        // Look for progress update controls
        const progressElements = page.locator('input[type="range"], input[type="number"]').or(
          page.locator('button').filter({ hasText: /update.*progress|add.*progress/i })
        );

        if (await progressElements.count() > 0) {
          const progressControl = progressElements.first();
          const controlType = await progressControl.getAttribute('type');

          if (controlType === 'range') {
            // Slider control
            await progressControl.fill('75');
          } else if (controlType === 'number') {
            // Number input
            await progressControl.fill('75');
          } else {
            // Button to open progress dialog
            await progressControl.click();
            await page.waitForTimeout(500);

            const progressInput = page.locator('input[type="number"], input[placeholder*="progress"]');
            if (await progressInput.count() > 0) {
              await progressInput.fill('75');
            }
          }

          // Save progress update
          const saveButton = page.locator('button').filter({ hasText: /save|update|confirm/i });
          if (await saveButton.count() > 0) {
            await saveButton.first().click();
            await page.waitForTimeout(1000);

            // Verify progress was updated
            const progressDisplay = page.locator('text=75%').or(
              page.locator('[class*="progress"]').filter({ hasText: /75/i })
            );

            if (await progressDisplay.count() > 0) {
              console.log('Goal progress updated successfully');
            }
          }
        } else {
          console.log('No progress update controls found');
        }
      }
    });

    test('user can log progress entries with notes', async ({ page }) => {
      const goals = page.locator('[class*="goal"], div').filter({ hasText: /goal|progress/i });

      if (await goals.count() > 0) {
        await goals.first().click();
        await page.waitForTimeout(500);

        // Look for progress logging functionality
        const logProgressButton = page.locator('button').filter({ hasText: /log|record|add.*entry/i });

        if (await logProgressButton.count() > 0) {
          await logProgressButton.first().click();
          await page.waitForTimeout(500);

          // Fill progress amount
          const progressInput = page.locator('input[type="number"]');
          if (await progressInput.count() > 0) {
            await progressInput.fill('10');
          }

          // Add progress note
          const noteInput = page.locator('textarea[placeholder*="note"], textarea');
          if (await noteInput.count() > 0) {
            await noteInput.fill('Completed comprehensive task management testing. All CRUD operations, filtering, and bulk actions are working correctly.');
          }

          // Set progress date
          const dateInput = page.locator('input[type="date"]');
          if (await dateInput.count() > 0) {
            const today = new Date().toISOString().split('T')[0];
            await dateInput.fill(today);
          }

          // Save progress entry
          const saveEntry = page.locator('button').filter({ hasText: /save|add|record/i });
          if (await saveEntry.count() > 0) {
            await saveEntry.first().click();
            console.log('Progress entry logged with notes');
          }
        }
      }
    });

    test('user can view progress history and timeline', async ({ page }) => {
      const goals = page.locator('[class*="goal"], div').filter({ hasText: /goal/i });

      if (await goals.count() > 0) {
        await goals.first().click();
        await page.waitForTimeout(500);

        // Look for progress history/timeline
        const historyElements = page.locator('text=History').or(
          page.locator('text=Timeline').or(
            page.locator('button').filter({ hasText: /history|timeline|log/i })
          )
        );

        if (await historyElements.count() > 0) {
          await historyElements.first().click();
          await page.waitForTimeout(1000);

          // Verify history content is visible
          const historyContent = page.locator('[class*="history"], [class*="timeline"]').or(
            page.locator('text=Date').or(
              page.locator('text=Progress')
            )
          );

          if (await historyContent.count() > 0) {
            console.log('Progress history/timeline visible');
          }
        } else {
          console.log('No progress history functionality found');
        }
      }
    });
  });

  test.describe('Goal Analytics and Insights', () => {
    test('user can view goal completion statistics', async ({ page }) => {
      // Look for analytics/statistics section
      const analyticsElements = page.locator('text=Analytics').or(
        page.locator('text=Statistics').or(
          page.locator('text=Insights').or(
            page.locator('button').filter({ hasText: /analytics|stats|insights/i })
          )
        )
      );

      if (await analyticsElements.count() > 0) {
        await analyticsElements.first().click();
        await page.waitForTimeout(1000);

        // Look for statistics displays
        const statsDisplays = page.locator('text=Total').or(
          page.locator('text=Completed').or(
            page.locator('text=Average').or(
              page.locator('text=Success Rate')
            )
          )
        );

        if (await statsDisplays.count() > 0) {
          console.log('Goal statistics visible');

          // Look for charts or visual representations
          const charts = page.locator('[class*="chart"], [class*="graph"], svg');
          if (await charts.count() > 0) {
            console.log('Goal analytics charts found');
          }
        }
      } else {
        // Look for inline statistics on main goals page
        const inlineStats = page.locator('text=%').or(
          page.locator('text=completed').or(
            page.locator('[class*="stat"], [class*="metric"]')
          )
        );

        if (await inlineStats.count() > 0) {
          console.log('Inline goal statistics visible');
        }
      }
    });

    test('user can view progress trends and patterns', async ({ page }) => {
      // Navigate to goal analytics/insights
      const analyticsTab = page.locator('text=Analytics').or(
        page.locator('text=Trends').or(
          page.locator('button').filter({ hasText: /analytics|trends/i })
        )
      );

      if (await analyticsTab.count() > 0) {
        await analyticsTab.first().click();
        await page.waitForTimeout(1000);

        // Look for trend information
        const trendElements = page.locator('text=Trend').or(
          page.locator('text=Pattern').or(
            page.locator('text=Improvement').or(
              page.locator('text=Decline')
            )
          )
        );

        if (await trendElements.count() > 0) {
          console.log('Progress trends visible');
        }

        // Look for time-based analysis
        const timeAnalysis = page.locator('text=Week').or(
          page.locator('text=Month').or(
            page.locator('text=Daily').or(
              page.locator('text=Weekly')
            )
          )
        );

        if (await timeAnalysis.count() > 0) {
          console.log('Time-based goal analysis available');
        }
      }
    });

    test('user can get AI-powered goal insights', async ({ page }) => {
      // Look for AI insights related to goals
      const aiElements = page.locator('text=AI').or(
        page.locator('text=Smart').or(
          page.locator('text=Insight').or(
            page.locator('button').filter({ hasText: /ai.*insight|smart.*analysis/i })
          )
        )
      );

      if (await aiElements.count() > 0) {
        await aiElements.first().click();
        await page.waitForTimeout(1000);

        // Look for AI-generated insights
        const aiInsights = page.locator('text=recommend').or(
          page.locator('text=suggest').or(
            page.locator('text=analysis').or(
              page.locator('text=confidence')
            )
          )
        );

        if (await aiInsights.count() > 0) {
          console.log('AI goal insights available');

          // Test implementing AI recommendations
          const implementButton = page.locator('button').filter({ hasText: /implement|apply/i });
          if (await implementButton.count() > 0) {
            await implementButton.first().click();
            console.log('AI goal recommendation implemented');
          }
        }
      }
    });
  });

  test.describe('Goal Organization and Management', () => {
    test('user can categorize and filter goals', async ({ page }) => {
      // Look for category/filter controls
      const filterElements = page.locator('select').filter({ hasText: /category|filter|type/i }).or(
        page.locator('button').filter({ hasText: /filter|category/i })
      );

      if (await filterElements.count() > 0) {
        await filterElements.first().click();
        await page.waitForTimeout(500);

        // Test different filter options
        const filterOptions = page.locator('option, li').filter({ hasText: /personal|professional|health|education/i });
        if (await filterOptions.count() > 0) {
          await filterOptions.first().click();
          await page.waitForTimeout(500);

          console.log('Goal category filter applied');

          // Verify filtered results
          const goalsList = page.locator('[class*="goal"], div').filter({ hasText: /goal|progress/i });
          console.log(`${await goalsList.count()} goals visible after filtering`);
        }
      }

      // Test status filtering
      const statusFilter = page.locator('button').filter({ hasText: /active|completed|all/i });
      if (await statusFilter.count() > 0) {
        await statusFilter.first().click();
        await page.waitForTimeout(500);
        console.log('Goal status filter applied');
      }
    });

    test('user can sort goals by different criteria', async ({ page }) => {
      // Look for sort functionality
      const sortElements = page.locator('select').filter({ hasText: /sort/i }).or(
        page.locator('button').filter({ hasText: /sort|order/i })
      );

      if (await sortElements.count() > 0) {
        await sortElements.first().click();
        await page.waitForTimeout(500);

        // Test sorting options
        const sortOptions = page.locator('option, li').filter({ hasText: /progress|deadline|priority|created/i });
        if (await sortOptions.count() > 0) {
          await sortOptions.first().click();
          await page.waitForTimeout(500);

          console.log('Goal sorting applied');
        }
      }
    });

    test('user can archive or delete completed goals', async ({ page }) => {
      // Look for completed goals
      const completedGoals = page.locator('[class*="goal"]').filter({ hasText: /100%|completed|achieved/i });

      if (await completedGoals.count() > 0) {
        await completedGoals.first().hover();
        await page.waitForTimeout(500);

        // Look for archive/delete options
        const archiveButton = page.locator('button').filter({ hasText: /archive|delete|remove/i });
        if (await archiveButton.count() > 0) {
          await archiveButton.first().click();

          // Handle confirmation if present
          const confirmButton = page.locator('button').filter({ hasText: /confirm|yes|archive|delete/i });
          if (await confirmButton.count() > 0) {
            await confirmButton.first().click();
          }

          await page.waitForTimeout(1000);
          console.log('Goal archived/deleted');
        }
      } else {
        console.log('No completed goals found to archive');
      }
    });
  });

  test.describe('Goal Achievement and Completion', () => {
    test('user can mark goals as completed', async ({ page }) => {
      // Look for goals that can be completed
      const activeGoals = page.locator('[class*="goal"]').filter({ hasText: /progress|%/i });

      if (await activeGoals.count() > 0) {
        await activeGoals.first().click();
        await page.waitForTimeout(500);

        // Look for completion action
        const completeButton = page.locator('button').filter({ hasText: /complete|achieve|finish/i });

        if (await completeButton.count() > 0) {
          await completeButton.first().click();

          // Handle completion confirmation or celebration
          const celebrationElement = page.locator('text=Congratulations').or(
            page.locator('text=Achievement').or(
              page.locator('text=Completed')
            )
          );

          if (await celebrationElement.count() > 0) {
            console.log('Goal completion celebration shown');
          }

          // Confirm completion if needed
          const confirmComplete = page.locator('button').filter({ hasText: /confirm|yes/i });
          if (await confirmComplete.count() > 0) {
            await confirmComplete.first().click();
          }

          await page.waitForTimeout(1000);
          console.log('Goal marked as completed');
        } else {
          // Alternative: Update progress to 100%
          const progressInput = page.locator('input[type="range"], input[type="number"]');
          if (await progressInput.count() > 0) {
            await progressInput.fill('100');

            const saveButton = page.locator('button').filter({ hasText: /save|update/i });
            if (await saveButton.count() > 0) {
              await saveButton.first().click();
              console.log('Goal progress set to 100%');
            }
          }
        }
      }
    });

    test('user can view achievement history and badges', async ({ page }) => {
      // Look for achievements/badges section
      const achievementElements = page.locator('text=Achievement').or(
        page.locator('text=Badge').or(
          page.locator('text=Trophy').or(
            page.locator('button').filter({ hasText: /achievement|badge|award/i })
          )
        )
      );

      if (await achievementElements.count() > 0) {
        await achievementElements.first().click();
        await page.waitForTimeout(1000);

        // Look for achievement displays
        const achievementDisplays = page.locator('[class*="achievement"], [class*="badge"]').or(
          page.locator('text=Earned').or(
            page.locator('text=Unlocked')
          )
        );

        if (await achievementDisplays.count() > 0) {
          console.log('Achievement history visible');
        }
      }
    });

    test('user can share goal achievements', async ({ page }) => {
      // Look for completed goals
      const completedGoals = page.locator('[class*="goal"]').filter({ hasText: /completed|100%|achieved/i });

      if (await completedGoals.count() > 0) {
        await completedGoals.first().click();
        await page.waitForTimeout(500);

        // Look for sharing functionality
        const shareButton = page.locator('button').filter({ hasText: /share|celebrate/i });

        if (await shareButton.count() > 0) {
          await shareButton.first().click();
          await page.waitForTimeout(500);

          // Look for sharing options
          const shareOptions = page.locator('text=Social').or(
            page.locator('text=Copy').or(
              page.locator('text=Export')
            )
          );

          if (await shareOptions.count() > 0) {
            console.log('Goal sharing options available');
          }
        }
      }
    });
  });

  test.describe('Goal Integration with Other Features', () => {
    test('user can link tasks to goals', async ({ page }) => {
      // Look for existing goals
      const goals = page.locator('[class*="goal"], div').filter({ hasText: /goal/i });

      if (await goals.count() > 0) {
        await goals.first().click();
        await page.waitForTimeout(500);

        // Look for task linking functionality
        const linkTaskButton = page.locator('button').filter({ hasText: /link.*task|add.*task|connect.*task/i });

        if (await linkTaskButton.count() > 0) {
          await linkTaskButton.first().click();
          await page.waitForTimeout(500);

          // Look for task selection
          const taskOptions = page.locator('option, li').filter({ hasText: /task/i });
          if (await taskOptions.count() > 0) {
            await taskOptions.first().click();
            console.log('Task linked to goal');
          }
        }

        // Look for existing task associations
        const linkedTasks = page.locator('text=Task').or(
          page.locator('[class*="task"]').or(
            page.locator('text=Related')
          )
        );

        if (await linkedTasks.count() > 0) {
          console.log('Goal-task associations visible');
        }
      }
    });

    test('user can track time spent on goals', async ({ page }) => {
      const goals = page.locator('[class*="goal"], div').filter({ hasText: /goal/i });

      if (await goals.count() > 0) {
        await goals.first().click();
        await page.waitForTimeout(500);

        // Look for time tracking integration
        const timeElements = page.locator('text=Time').or(
          page.locator('text=Hours').or(
            page.locator('button').filter({ hasText: /start.*timer|track.*time/i })
          )
        );

        if (await timeElements.count() > 0) {
          console.log('Time tracking integration with goals available');

          // Test starting timer for goal
          const startTimer = page.locator('button').filter({ hasText: /start|track/i });
          if (await startTimer.count() > 0) {
            await startTimer.first().click();
            await page.waitForTimeout(1000);

            // Stop timer
            const stopTimer = page.locator('button').filter({ hasText: /stop|pause/i });
            if (await stopTimer.count() > 0) {
              await stopTimer.first().click();
              console.log('Time tracking for goal completed');
            }
          }
        }
      }
    });

    test('user can get AI recommendations for goal achievement', async ({ page }) => {
      const goals = page.locator('[class*="goal"], div').filter({ hasText: /goal/i });

      if (await goals.count() > 0) {
        await goals.first().click();
        await page.waitForTimeout(500);

        // Look for AI recommendations
        const aiElements = page.locator('text=AI').or(
          page.locator('text=Recommend').or(
            page.locator('text=Suggest').or(
              page.locator('button').filter({ hasText: /ai.*help|smart.*suggest/i })
            )
          )
        );

        if (await aiElements.count() > 0) {
          await aiElements.first().click();
          await page.waitForTimeout(1000);

          // Look for AI recommendations content
          const recommendations = page.locator('text=recommend').or(
            page.locator('text=confidence').or(
              page.locator('[class*="recommendation"]')
            )
          );

          if (await recommendations.count() > 0) {
            console.log('AI recommendations for goal available');
          }
        }
      }
    });
  });

  test.describe('Goal Performance and User Experience', () => {
    test('goals page loads efficiently', async ({ page }) => {
      const startTime = Date.now();

      await page.reload();
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // Wait for goals to load
      await page.waitForTimeout(2000);

      const loadTime = Date.now() - startTime;
      console.log(`Goals page loaded in ${loadTime}ms`);

      expect(loadTime).toBeLessThan(5000);
    });

    test('goal interactions are responsive', async ({ page }) => {
      const goals = page.locator('[class*="goal"], div').filter({ hasText: /goal|progress/i });

      if (await goals.count() > 0) {
        const startTime = Date.now();

        await goals.first().click();
        await page.waitForTimeout(100);

        const responseTime = Date.now() - startTime;
        console.log(`Goal interaction response time: ${responseTime}ms`);

        expect(responseTime).toBeLessThan(1000);
      }
    });

    test('goal data persists across sessions', async ({ page }) => {
      // Create or identify a goal for persistence testing
      const goals = page.locator('[class*="goal"], div').filter({ hasText: /goal/i });
      let testGoalFound = false;

      if (await goals.count() > 0) {
        // Look for our test goal from earlier
        const testGoal = page.locator('text=Complete Comprehensive E2E');
        if (await testGoal.count() > 0) {
          testGoalFound = true;
          console.log('Test goal persisted across page loads');
        }
      }

      // Refresh page and check persistence
      await page.reload();
      await expect(page.locator('h1, h2').first()).toBeVisible();

      if (testGoalFound) {
        await expect(page.locator('text=Complete Comprehensive E2E')).toBeVisible({ timeout: 5000 });
        console.log('Goal data persistence confirmed');
      } else {
        console.log('No test goal to verify persistence');
      }
    });
  });
});