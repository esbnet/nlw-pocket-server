import dayjs from 'dayjs'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'

export async function getWeekPendingGoals() {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalsCreateUpToWeek = db.$with('goals_create_up_to_wee').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeekFrequency: goals.desiredWeeklyFrequency,
        createAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek))
  )

  const goalsCompletionCounts = db.$with('goals_completion_counts').as(
    db
      .select({
        goalsId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const pendingGoals = await db
    .with(goalsCreateUpToWeek, goalsCompletionCounts)
    .select({
      id: goalsCreateUpToWeek.id,
      title: goalsCreateUpToWeek.title,
      desiredWeeklyFrequency: goalsCreateUpToWeek.desiredWeekFrequency,
      goalsCompletionCounts: sql`
        COALESCE(${goalsCompletionCounts.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goalsCreateUpToWeek)
    .leftJoin(
      goalsCompletionCounts,
      eq(goalsCompletionCounts.goalsId, goalsCreateUpToWeek.id)
    )

  return {
    pendingGoals,
  }
}
