export const referenceSentences = [
  {
    id: "usb-cable",
    text: "I tried to plug in a USB cable, turned it twice, and it only fitted in the original position.",
    category: "tiny technical struggle",
    expectedClimax: "the cable finally connects"
  },
  {
    id: "biscuit-tea",
    text: "My biscuit broke off and fell into my tea.",
    category: "domestic disaster",
    expectedClimax: "the biscuit collapses"
  },
  {
    id: "forgot-kitchen",
    text: "I walked into the kitchen and forgot why I was there.",
    category: "lost objective",
    expectedClimax: "the original purpose disappears"
  },
  {
    id: "cat-cup",
    text: "The cat knocked my cup off the table and then looked surprised.",
    category: "animal interference",
    expectedClimax: "the cup falls"
  },
  {
    id: "duvet-cover",
    text: "I got trapped inside the duvet cover while trying to change the bedding.",
    category: "physical farce",
    expectedClimax: "the person becomes trapped"
  },
  {
    id: "shopping-bags",
    text: "I tried to carry every shopping bag from the car in one journey.",
    category: "reckless ambition",
    expectedClimax: "the bags or keys become unmanageable"
  },
  {
    id: "paper-jam",
    text: "The printer says there is a paper jam, but there is no paper in it.",
    category: "machine obstruction",
    expectedClimax: "the impossible warning persists"
  },
  {
    id: "council-committee",
    text: "The council solved the problem by creating another committee.",
    category: "bureaucratic satire",
    expectedClimax: "action is replaced by process"
  },
  {
    id: "dog-door",
    text: "The dog asked to go outside and then refused to walk through the open door.",
    category: "animal stalemate",
    expectedClimax: "the dog rejects the obvious route"
  },
  {
    id: "missing-sock",
    text: "I searched the whole room for a missing sock and found it inside my trouser leg.",
    category: "late discovery",
    expectedClimax: "the sock is revealed nearby"
  }
];

export function getReferenceSentence(id) {
  const item = referenceSentences.find((entry) => entry.id === id);
  if (!item) {
    throw new Error(`Unknown reference sentence: ${id}`);
  }
  return item;
}
