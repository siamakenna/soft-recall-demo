import type { EndingId } from "../state";

export interface EndingCopy {
  title: string;
  body: string;
  tone: string;
}

export const ENDING_ORDER: EndingId[] = ["supported", "smaller", "overloaded"];

export const ENDING_COPY: Record<EndingId, EndingCopy> = {
  supported: {
    title: "Supported Departure",
    body: "You leave with the small things you needed: keys, coat, phone, and a morning you actually met. The door closes behind you like an agreement.",
    tone: "The morning was met.",
  },
  smaller: {
    title: "Smaller Morning",
    body: "The whole day can wait outside. You choose one errand, one pocket of air, and a route short enough to hold. The door opens to that much.",
    tone: "One thing can still be a morning.",
  },
  overloaded: {
    title: "Overloaded but Not Alone",
    body: "The list grows teeth when you look at it all at once. You send one honest line. Ana answers before your hand leaves the phone, and the threshold feels less like something to cross alone.",
    tone: "Someone knows where you are.",
  },
};
