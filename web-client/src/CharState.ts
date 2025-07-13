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

const TEXT_LABELS: Record<keyof CharStateData, string> = {
  hp: "HP",
  fatigue: "ZM",
  stuffed: "GLO",
  encumbrance: "OBC",
  soaked: "PRA",
  mana: "MANA",
  improve: "POS",
  form: "FOR",
  intox: "UPI",
  headache: "KAC",
  panic: "PAN",
};

const EMOJI_LABELS: Record<keyof CharStateData, string> = {
  hp: "❤",
  fatigue: "💤",
  stuffed: "🍞",
  encumbrance: "🎒",
  soaked: "💧",
  mana: "🔮",
  improve: "⭐",
  form: "💪",
  intox: "🍺",
  headache: "🤕",
  panic: "😱",
};

const DEFAULT_CONFIG: Record<keyof CharStateData, CharStateConfig> = {
  hp: { label: TEXT_LABELS.hp, max: 6, transform: (value, max) => ({ value: value + 1, max: max + 1 }) },
  fatigue: { label: TEXT_LABELS.fatigue, max: 9 },
  stuffed: { label: TEXT_LABELS.stuffed, max: 3, default: 3 },
  encumbrance: { label: TEXT_LABELS.encumbrance, max: 6, default: 0 },
  soaked: { label: TEXT_LABELS.soaked, max: 3, default: 3 },
  mana: { label: TEXT_LABELS.mana, max: 8, default: 8 },
  improve: { label: TEXT_LABELS.improve, max: 15, default: 0 },
  form: { label: TEXT_LABELS.form, max: 3, default: 3 },
  intox: { label: TEXT_LABELS.intox, max: 9, default: 0 },
  headache: { label: TEXT_LABELS.headache, max: 6, default: 0 },
  panic: { label: TEXT_LABELS.panic, max: 4, default: 0 },
};

export default class CharState {
  private client: typeof ArkadiaClient;
  private container: HTMLElement | null;
  private text: HTMLElement | null;
  private config: Record<keyof CharStateData, CharStateConfig>;
  private state: Partial<CharStateData> = {};
  private useEmoji = false;

  private applyLabelMode(useEmoji: boolean) {
    this.useEmoji = useEmoji;
    const labels = useEmoji ? EMOJI_LABELS : TEXT_LABELS;
    (Object.keys(this.config) as (keyof CharStateData)[]).forEach((key) => {
      this.config[key].label = labels[key];
    });
    this.update({});
  }

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
      const emojiAttr = this.container.getAttribute('data-emoji-labels');
      if (emojiAttr) {
        this.applyLabelMode(emojiAttr === 'true' || emojiAttr === '1');
      }
    }

    this.client.on('settings', (ev: any) => {
      if (typeof ev.detail?.emojiLabels === 'boolean') {
        this.applyLabelMode(ev.detail.emojiLabels);
      }
    });

    const ext: any = (window as any).clientExtension;
    if (ext?.addEventListener) {
      ext.addEventListener('uiSettings', (ev: CustomEvent) => {
        if (typeof ev.detail?.emojiLabels === 'boolean') {
          this.applyLabelMode(ev.detail.emojiLabels);
        }
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
    this.text.innerHTML = entries
      .map((key) => {
        let value = this.state[key] as number;
        const { max, label, transform, default: def } = this.config[key];
        let maxValue = max;
        if (transform && typeof value === "number") {
          ({ value, max: maxValue } = transform(value, maxValue));
        }
        const opposite = def !== undefined ? (def > 0 ? 0 : maxValue) : null;
        const highlight = opposite !== null && value === opposite;
        const text = `${label}: [${value}/${maxValue}]`;
        return highlight ? `<span style="color:tomato">${text}</span>` : text;
      })
      .join(" ");
  }
}
