export const CRISIS_KEYWORDS = [
  // Suicidal thoughts
  "suicide",
  "suicidal",
  "kill myself",
  "end my life",
  "want to die",
  "better off dead",
  "no reason to live",
  "take my life",
  "end it all",
  "not worth living",

  // Self-harm
  "self harm",
  "cut myself",
  "hurt myself",
  "harm myself",
  "self-harm",

  // Hopelessness
  "hopeless",
  "no hope",
  "give up",
  "can't go on",
  "nothing matters",
  "no point",
  "meaningless",
  "worthless",
  "burden",
  "everyone would be better without me",

  // Depression indicators
  "nobody cares",
  "alone forever",
  "can't take it anymore",
  "done with life",
  "tired of living",
  "wish I wasn't here",
  "disappear",
  "end the pain",
]

export function detectCrisisKeywords(message: string): { found: boolean; matches: string[] } {
  const lowerMessage = message.toLowerCase()
  const matches: string[] = []

  for (const keyword of CRISIS_KEYWORDS) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      matches.push(keyword)
    }
  }

  return {
    found: matches.length > 0,
    matches,
  }
}

export function getCrisisLevel(count: number): "low" | "medium" | "high" | "critical" {
  if (count >= 3) return "critical"
  if (count >= 2) return "high"
  if (count >= 1) return "medium"
  return "low"
}
