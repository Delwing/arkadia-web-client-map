// Overlay for scrolling history above the latest lines
export default class HistoryOverlay {
    private contentArea: HTMLElement;
    private overlay: HTMLElement;
    private divider: HTMLElement;
    private visible = false;
    private readonly bottomLines = 10;

    constructor() {
        const content = document.getElementById('main_text_output_msg_wrapper');
        const overlay = document.getElementById('history-overlay');
        const divider = document.getElementById('history-divider');
        if (!content || !overlay || !divider) {
            throw new Error('HistoryOverlay elements missing');
        }
        this.contentArea = content;
        this.overlay = overlay;
        this.divider = divider;
        this.attachEvents();
    }

    private attachEvents() {
        this.contentArea.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight, clientHeight } = this.contentArea;
            if (!this.visible && scrollTop < scrollHeight - clientHeight) {
                this.show();
            }
        });

        this.overlay.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight, clientHeight } = this.overlay;
            if (this.visible && scrollTop >= scrollHeight - clientHeight) {
                this.hide();
            }
        });
    }

    private show() {
        this.visible = true;
        this.overlay.innerHTML = this.contentArea.innerHTML;
        this.updateBottomHeight();
        this.overlay.style.display = 'block';
        this.divider.style.display = 'block';
        this.overlay.scrollTop = this.contentArea.scrollTop;
        this.contentArea.scrollTop = this.contentArea.scrollHeight;
        this.overlay.style.pointerEvents = 'auto';
    }

    private hide() {
        this.visible = false;
        this.overlay.style.display = 'none';
        this.divider.style.display = 'none';
        this.overlay.style.pointerEvents = 'none';
    }

    private updateBottomHeight() {
        const children = Array.from(this.contentArea.children);
        const start = Math.max(0, children.length - this.bottomLines);
        let bottomHeight = 0;
        for (let i = start; i < children.length; i++) {
            bottomHeight += (children[i] as HTMLElement).offsetHeight;
        }
        const rect = this.contentArea.getBoundingClientRect();
        this.overlay.style.left = `${rect.left}px`;
        this.overlay.style.right = `${window.innerWidth - rect.right}px`;
        this.overlay.style.top = `${rect.top}px`;
        const bottomOffset = window.innerHeight - rect.bottom + bottomHeight;
        this.overlay.style.bottom = `${bottomOffset}px`;
        this.divider.style.left = `${rect.left}px`;
        this.divider.style.right = `${window.innerWidth - rect.right}px`;
        this.divider.style.bottom = `${bottomOffset}px`;
    }

    public update() {
        if (this.visible) {
            this.overlay.innerHTML = this.contentArea.innerHTML;
            this.updateBottomHeight();
        }
    }
}
