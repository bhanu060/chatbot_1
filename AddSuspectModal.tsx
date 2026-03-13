/**
 * Offline AI profiling service — no API key required.
 * Generates a randomised tactical physical description locally.
 */

const GENDERS = ['Male', 'Female'];
const AGE_RANGES = ['early 20s', 'mid 20s', 'late 20s', 'early 30s', 'mid 30s', 'late 30s', 'early 40s', 'mid 40s'];
const BUILDS = ['slim build', 'average build', 'athletic build', 'heavy build', 'medium build'];
const HAIR = [
  'short dark hair', 'short blonde hair', 'short brown hair', 'bald', 'shaved head',
  'medium-length dark hair', 'medium-length brown hair', 'long dark hair', 'long blonde hair',
  'short grey hair', 'cropped hair', 'curly dark hair',
];
const TOPS = [
  'dark jacket', 'grey hoodie', 'black t-shirt', 'white shirt', 'navy jacket',
  'brown coat', 'blue denim jacket', 'olive jacket', 'red hoodie', 'black sweater',
  'plaid shirt', 'grey sweatshirt',
];
const ACCESSORIES = [
  'No accessories visible.',
  'Wearing glasses.',
  'Wearing sunglasses.',
  'Baseball cap, dark color.',
  'Beanie hat.',
  'Backpack visible.',
  'Wearing earphones.',
  'Light facial hair.',
  'Full beard.',
  'Wearing a face mask.',
];
const NOTES = [
  'Subject moving at a steady pace.',
  'Subject appears to be looking around.',
  'Subject stationary near entry point.',
  'Subject appears agitated.',
  'Subject moving quickly through frame.',
  'Subject appears calm and composed.',
  'Partial facial obstruction.',
  'Low confidence match — further verification recommended.',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function profileUnknownSuspect(_base64Image: string): Promise<string> {
  // Simulate async network latency (800ms – 1.8s)
  await new Promise(res => setTimeout(res, 800 + Math.random() * 1000));

  const gender = pick(GENDERS);
  const age = pick(AGE_RANGES);
  const build = pick(BUILDS);
  const hair = pick(HAIR);
  const top = pick(TOPS);
  const accessory = pick(ACCESSORIES);
  const note = pick(NOTES);

  return `${gender}, approx. ${age}, ${build}. ${hair}, wearing ${top}. ${accessory} ${note}`;
}
