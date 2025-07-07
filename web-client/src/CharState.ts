import ArkadiaClient from "./ArkadiaClient.ts";

const MAX_STATE = {
  hp: 6,
  mana: 8,
  fatigue: 8,
  improve: 14,
  form: 6,
  intox: 9,
  headache: 5,
  stuffed: 3,
  soaked: 3,
  encumbrance: 5,
  panic: 4,
} as const;

export interface CharStateData {
  hp: number;
  mana: number;
  fatigue: number;
  improve: number;
  form: number;
  intox: number;
  headache: number;
  stuffed: number;
  soaked: number;
  encumbrance: number;
  panic: number;
}

export default class CharState {
  private client: typeof ArkadiaClient;
  private container: HTMLElement | null;
  private labels: Record<keyof CharStateData, string>;

  constructor(client: typeof ArkadiaClient) {
    this.client = client;
    this.container = document.getElementById("char-state");
    this.labels = {
      hp: "HP",
      mana: "MANA",
      fatigue: "ZM",
      improve: "POS",
      form: "FOR",
      intox: "UPI",
      headache: "KAC",
      stuffed: "GLO",
      soaked: "PRA",
      encumbrance: "OBC",
      panic: "PAN",
    };

    if (this.container) {
      (Object.keys(this.labels) as (keyof CharStateData)[]).forEach((key) => {
        const attr = this.container!.getAttribute(`data-label-${key}`);
        if (attr) this.labels[key] = attr;
      });
    }

    this.client.on("gmcp.char.state", (state: CharStateData) =>
      this.update(state),
    );
  }

  private update(state: CharStateData) {
    if (!this.container) return;

    const entries: [keyof CharStateData, number][] = Object.entries(state) as [
      keyof CharStateData,
      number,
    ][];
    this.container.textContent = entries
      .map(([key, value]) => `${this.labels[key]}: [${value}/${MAX_STATE[key]}]`)
      .join(" ");
  }
}
