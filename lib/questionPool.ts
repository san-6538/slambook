export const questionPool = [
  { question: "What is your first memory of me?", tags: ["Best Friend", "Close Friend", "Friend", "nostalgic"] },
  { question: "What is one thing I always say or do without realizing?", tags: ["Best Friend", "Close Friend", "funny"] },
  { question: "If we were arrested together, what would it probably be for?", tags: ["Best Friend", "Close Friend", "savage", "funny"] },
  { question: "What is my most chaotic trait?", tags: ["Best Friend", "Close Friend", "savage"] },
  { question: "What’s one secret you never told me until now?", tags: ["Best Friend", "Special", "deep"] },
  { question: "If I were a character in a movie, who would I be?", tags: ["Batchmate", "Friend", "funny"] },
  { question: "Describe our dynamic in exactly three words.", tags: ["Friend", "Close Friend", "emotional"] },
  { question: "What’s a song that instantly reminds you of us?", tags: ["Close Friend", "Special", "nostalgic"] },
  { question: "What’s an unpopular opinion we both weirdly agree on?", tags: ["Friend", "Close Friend", "funny"] },
  { question: "If we survived a zombie apocalypse, what would be our roles?", tags: ["Batchmate", "Friend", "funny"] },
  { question: "What’s the most embarrassing thing I’ve done that you still laugh at?", tags: ["Best Friend", "Close Friend", "savage"] },
  { question: "When did you realize we were actually going to be good friends?", tags: ["Close Friend", "Best Friend", "emotional"] },
  { question: "What’s one thing you admire about me?", tags: ["Friend", "Close Friend", "Special", "deep"] },
  { question: "What was your first impression of me, honestly?", tags: ["Batchmate", "Friend", "nostalgic"] },
  { question: "If I could only eat one meal for the rest of my life, what would it be?", tags: ["Close Friend", "Best Friend", "funny"] }
];

export function getRecommendedQuestions(relationship: string, limit: number = 5) {
  const matching = questionPool.filter(q => q.tags.includes(relationship));
  const fallback = questionPool.filter(q => !q.tags.includes(relationship));
  let pool = [...matching, ...fallback];
  // Shuffle array
  pool = pool.sort(() => 0.5 - Math.random());
  return pool.slice(0, limit);
}
