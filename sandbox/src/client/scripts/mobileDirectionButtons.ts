import Client from "@client/src/Client";

export default class MobileDirectionButtons {
    private client: Client;
    private container: HTMLDivElement;
    private enabled = false;
    private isMobile = false;
    private messageInput: HTMLInputElement | null = null;
    private contentArea: HTMLElement | null = null;

    constructor(client: Client) {
        this.client = client;
        this.container = document.getElementById('mobile-direction-buttons') as HTMLDivElement;
        this.messageInput = document.getElementById('message-input') as HTMLInputElement;
        this.contentArea = document.getElementById('main_text_output_msg_wrapper');

        if (!this.container) {
            console.error('Mobile direction buttons container not found');
            return;
        }

        this.setupEventHandlers();
        this.checkMobile();
        this.setupKeyboardHandlers();

        // Listen for window resize to check if mobile view
        window.addEventListener('resize', () => {
            this.checkMobile();
            this.scrollToBottom();
        });

        // Listen for settings changes
        this.client.addEventListener("settings", (event: CustomEvent) => {
            // Only disable if explicitly set to false
            const disabled = event.detail.mobileDirectionButtons === false;
            if (disabled) {
                this.disable();
            } else {
                this.enable();
            }
        });

        // Enable by default for mobile devices
        if (this.isMobile) {
            this.enable();
        }
    }

    private checkMobile() {
        // Simple mobile detection based on screen width
        this.isMobile = window.innerWidth < 768;

        if (this.isMobile && this.enabled) {
            this.container.style.display = 'flex';
        } else {
            this.container.style.display = 'none';
        }
    }

    private setupEventHandlers() {
        // Setup bracket right button
        const bracketRightButton = document.getElementById('bracket-right-button');
        if (bracketRightButton) {
            bracketRightButton.addEventListener('click', () => {
                // Simulate ] key press
                const event = new KeyboardEvent('keydown', {
                    key: ']',
                    code: 'BracketRight',
                    keyCode: 221,
                    which: 221,
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(event);
            });
        }

        // Setup button 1 (unassigned)
        const button1 = document.getElementById('button-1');
        if (button1) {
            button1.addEventListener('click', () => {
                // Unassigned button 1
            });
        }

        // Setup button 2 (unassigned)
        const button2 = document.getElementById('button-2');
        if (button2) {
            button2.addEventListener('click', () => {
                // Unassigned button 2
            });
        }

        // Setup direction buttons
        this.setupDirectionButton('nw-button', 'nw');
        this.setupDirectionButton('n-button', 'n');
        this.setupDirectionButton('ne-button', 'ne');
        this.setupDirectionButton('w-button', 'w');
        this.setupDirectionButton('e-button', 'e');
        this.setupDirectionButton('sw-button', 'sw');
        this.setupDirectionButton('s-button', 's');
        this.setupDirectionButton('se-button', 'se');

        // Setup center button (zerknij)
        const centerButton = document.getElementById('c-button');
        if (centerButton) {
            centerButton.addEventListener('click', () => {
                this.client.sendCommand('zerknij');
            });
        }
    }

    private setupDirectionButton(buttonId: string, direction: string) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                this.client.sendCommand(direction);
            });
        }
    }

    enable() {
        if (this.enabled) return;
        this.enabled = true;
        if (this.isMobile) {
            this.container.style.display = 'flex';
        }
    }

    disable() {
        if (!this.enabled) return;
        this.enabled = false;
        this.container.style.display = 'none';
    }

    private setupKeyboardHandlers() {
        if (!this.messageInput || !this.contentArea) return;

        // Scroll to bottom when input is focused (keyboard appears)
        this.messageInput.addEventListener('focusin', () => {
            this.scrollToBottom();

            // Add a small delay to ensure scrolling happens after keyboard appears
            setTimeout(() => this.scrollToBottom(), 300);
        });

        // Also listen for input events which can happen when keyboard is already shown
        this.messageInput.addEventListener('input', () => {
            this.scrollToBottom();
        });

        // Use VisualViewport API if available (modern browsers)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                this.scrollToBottom();
            });
        }
    }

    private scrollToBottom() {
        if (!this.contentArea || !this.isMobile) return;

        // Scroll to bottom with a small delay to ensure it happens after layout changes
        setTimeout(() => {
            if (this.contentArea) {
                this.contentArea.scrollTop = this.contentArea.scrollHeight;
            }
        }, 100);
    }
}
