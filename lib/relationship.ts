export function determineRelationship(
  yearsKnown: number,
  interactionFrequency: string,
  bondType: string
): string {
  const isFrequent = interactionFrequency === 'daily' || interactionFrequency === 'weekly';
  const isDeep = bondType === 'deep' || bondType === 'special';

  if (isDeep && yearsKnown > 3 && isFrequent) {
    return 'Special';
  } else if (yearsKnown > 3 && isFrequent) {
    return 'Best Friend';
  } else if (isFrequent && bondType === 'deep') {
    return 'Close Friend';
  } else if (interactionFrequency === 'rarely' && bondType === 'casual') {
    return 'Batchmate';
  } else if (yearsKnown > 1 && bondType !== 'deep') {
    return 'Friend';
  } else {
    return 'Friend'; // default fallback
  }
}
