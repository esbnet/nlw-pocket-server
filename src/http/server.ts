import fastify from 'fastify'

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import fastifyCors from '@fastify/cors'
import { createCompletionRoute } from './router/create-completion'
import { createGoalRoute } from './router/create-goals'
import { getPendingGoalsRoute } from './router/get-pending-goals'
import { getWeekSummaryRoute } from './router/get-week-summary'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createGoalRoute)
app.register(createCompletionRoute)
app.register(getPendingGoalsRoute)
app.register(getWeekSummaryRoute)

app.listen({ port: 3333 }).then(() => {
  console.log('Server listening on port 3333 🚀 ')
})
