export const TOTAL_TASKS = 13;

export const REVISIT_THOUGHTS: Record<string, string[]> = {
  glasses: ["The frames are warm now.", "You could clean them, but not today."],
  note: ["The handwriting looks less scared today.", "One step. Then the next."],
  alarm: ["The lamp is patient.", "It has waited longer than this."],
  curtains: ["The light is a shade less grey.", "The room agrees to be seen."],
  phone: ["The screen is dim again. Good."],
  coat: ["It remembers the shape of your arm."],
  keys: ["Two, still. That's enough."],
  mail: ["It'll wait. It always waits."],
  "k-fridge": ["Sunday-you did well."],
  "k-kettle": ["Steam still, faintly."],
  "k-toast": ["Crumbs. Small evidence of a morning."],
  "b-mirror": ["Hello again."],
  "b-meds": ["The little compartment is empty and honest."],
  "b-tap": ["The basin holds a trace of cold."],
  "b-teeth": ["Mint, faint."],
};

export const KITCHEN_TASKS = ["k-kettle", "k-fridge", "k-toast"] as const;
export const BATH_TASKS = ["b-mirror", "b-meds", "b-tap", "b-teeth"] as const;
export const KITCHEN_MIN = 2;
export const BATH_MIN = 2;
