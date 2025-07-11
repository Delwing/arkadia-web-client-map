import ArkadiaClient from "./ArkadiaClient.ts";

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

export interface CharStateConfig {
  label: string;
  max: number;
  default?: number;
  transform?: (
    value: number,
    max: number,
  ) => { value: number; max: number };
}

const DEFAULT_CONFIG: Record<keyof CharStateData, CharStateConfig> = {
  hp: { label: "HP", max: 6, transform: (value, max) => ({ value: value + 1, max: max + 1 }) },
  fatigue: { label: "ZM", max: 8 },
  stuffed: { label: "GLO", max: 3, default: 3 },
  encumbrance: { label: "OBC", max: 6, default: 0 },
  soaked: { label: "PRA", max: 3, default: 3 },
  mana: { label: "MANA", max: 8, default: 8 },
  improve: { label: "POS", max: 15, default: 0 },
  form: { label: "FOR", max: 3, default: 3 },
  intox: { label: "UPI", max: 9, default: 0 },
  headache: { label: "KAC", max: 6, default: 0 },
  panic: { label: "PAN", max: 4, default: 0 },
};

export default class CharState {
  private client: typeof ArkadiaClient;
  private container: HTMLElement | null;
  private text: HTMLElement | null;
  private config: Record<keyof CharStateData, CharStateConfig>;
  private state: Partial<CharStateData> = {};

  constructor(
    client: typeof ArkadiaClient,
    overrides?: Partial<
      Record<keyof CharStateData, Partial<CharStateConfig>>
    >,
  ) {
    this.client = client;
    this.container = document.getElementById("char-state");
    this.text = document.getElementById("char-state-text");

    this.config = { ...DEFAULT_CONFIG };

    if (overrides) {
      (Object.keys(overrides) as (keyof CharStateData)[]).forEach((key) => {
        this.config[key] = { ...this.config[key], ...overrides[key]! };
      });
    }

    if (this.container) {
      (Object.keys(this.config) as (keyof CharStateData)[]).forEach((key) => {
        const attr = this.container!.getAttribute(`data-label-${key}`);
        if (attr) this.config[key].label = attr;
      });
    }

    this.client.on(
      "gmcp.char.state",
      (state: Partial<CharStateData>) => this.update(state),
    );
  }

  private update(partialState: Partial<CharStateData>) {
    if (!this.container || !this.text) return;

    this.state = { ...this.state, ...partialState };

    const entries = (Object.keys(this.state) as (keyof CharStateData)[]).filter(
      (key) =>
        this.config[key].default === undefined ||
        this.state[key] !== this.config[key].default,
    );
    this.text.textContent = entries
      .map((key) => {
        let value = this.state[key] as number;
        const { max, label, transform } = this.config[key];
        let maxValue = max;
        if (transform && typeof value === "number") {
          ({ value, max: maxValue } = transform(value, maxValue));
        }
        return `${label}: [${value}/${maxValue}]`;
      })
      .join(" ");
  }
}
