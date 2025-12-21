export function calculateSessionScore({
  durationSeconds,
  endedBy,
  isReported,
  isSkipper,
}) {
  let score = 0;

  if (durationSeconds >= 600) score += 5;
  else if (durationSeconds >= 300) score += 3;
  else if (durationSeconds < 120) score -= 4;

  if (endedBy === "natural") score += 2;
  if (isSkipper) score -= 2;
  if (isReported) score -= 8;

  return Math.max(-10, Math.min(10, score));
}
