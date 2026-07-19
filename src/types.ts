export interface CartoonElement {
  id: string;
  type: string; // character | item | scenery | effect
  emoji: string;
  label: string;
  animation: string; // bounce | spin | float | shake | wiggle | pulse | none
  x: number; // percentage
  y: number; // percentage
  size: string; // small | medium | large
  bubbleText?: string;
}

export interface ChatHistoryItem {
  role: 'user' | 'model';
  message: string;
}

export interface CuratedProblem {
  id: string;
  title: string;
  problem: string;
  companion_intro: string;
  initial_elements: CartoonElement[];
}
