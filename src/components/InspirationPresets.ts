export interface BusinessPreset {
  id: string;
  title: string;
  emoji: string;
  problem: string;
  solution: string;
  shortDesc: string;
}

export const INSPIRATION_PRESETS: BusinessPreset[] = [
  {
    id: "muddy-puppies",
    title: "Muddy Puppies",
    emoji: "🐶",
    shortDesc: "Wash dog paws after park fun",
    problem: "When dogs run in the wet park grass, their paws get super muddy and they ruin car seats or carpets.",
    solution: "Setting up a 'Paw Washing Station' right at the park exit with towels, warm water cups, and fun stenciled clean-paw stamps."
  },
  {
    id: "backyard-birds",
    title: "Bird Watcher Guide",
    emoji: "🦜",
    shortDesc: "Custom bird seed & drawings",
    problem: "Our grandparents love seeing colorful birds in the garden, but they don't know what food attracts which birds.",
    solution: "Drawing illustrated bird identification cards and pairing them with small paper packets of sunflower seeds and grain mixes."
  },
  {
    id: "cool-cats",
    title: "Cool Cats Pinwheels",
    emoji: "🐱",
    shortDesc: "Fun fans to keep pets cool",
    problem: "Pets get very hot and lazy during summer afternoons, and there's no air conditioning on the backyard patio.",
    solution: "Making hand-held paper pinwheels decorated with shiny glitter and catnip scent to wave and cool down neighbor cats."
  },
  {
    id: "toy-detective",
    title: "Toy Detective Agency",
    emoji: "🔍",
    shortDesc: "Find lost garden toys",
    problem: "Kids are always losing small puzzle pieces, toy cars, or keys in the thick playground grass.",
    solution: "A local 'Toy Detective Service' using a cardboard magnifying glass and a paper notebook to map out lost items and find them."
  }
];
