import { workerFetch } from "../api/client.js"
import CONSTANTS from "./ai/constants.js"

const getContent = (response) => {
  const content = response?.choices?.[0]?.message?.content
  if (!content) throw new Error("AI returned empty response.")
  return content
}

export const callAI = async ({
  systemPrompt,
  userPrompt,
  model = CONSTANTS.MODELS.POWERFUL,
  maxTokens = CONSTANTS.AI.MAX_TOKENS,
  jsonMode = false,
  temperature = CONSTANTS.AI.TEMPERATURE
}) => {
  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature,
    max_tokens: maxTokens
  }

  if (jsonMode) {
    body.response_format = { type: "json_object" }
  }

  const response = await workerFetch("/api/chat", {
    method: "POST",
    body: JSON.stringify(body)
  })
  const content = getContent(response)

  if (!jsonMode) return content

  try {
    return JSON.parse(content)
  } catch {
    throw new Error("AI returned invalid JSON.")
  }
}

export const callAIWithHistory = async ({
  systemPrompt,
  userPrompt,
  history = [],
  newMessage,
  model = CONSTANTS.MODELS.POWERFUL,
  maxTokens = CONSTANTS.AI.MAX_TOKENS_COUNSEL,
  temperature = CONSTANTS.AI.TEMPERATURE
}) => {
  const messages = [
    { role: "system", content: systemPrompt },
    ...(userPrompt ? [{ role: "user", content: userPrompt }] : []),
    ...history.flatMap((exchange) => [
      { role: "user", content: exchange.user },
      { role: "assistant", content: exchange.lex }
    ]),
    { role: "user", content: newMessage }
  ]

  const response = await workerFetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    })
  })

  return getContent(response)
}
