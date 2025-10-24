/**
 * All table definitions aggregated from domain modules
 */

import type { UserTables } from '../user/user.tables'
import type { TaskTables } from '../task/task.tables'
import type { GoalTables } from '../goal/goal.tables'
import type { HabitTables } from '../habit/habit.tables'
import type { ProjectTables } from '../project/project.tables'
import type { AnalyticsTables } from '../analytics/analytics.tables'
import type { AdminTables } from '../admin/admin.tables'

export type AllTables =
  & UserTables
  & TaskTables
  & GoalTables
  & HabitTables
  & ProjectTables
  & AnalyticsTables
  & AdminTables
