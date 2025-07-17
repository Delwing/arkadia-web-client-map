import Client from "@client/src/Client";
import { formatLabel } from "@client/src/scripts/functionalBind";

export default class MobileDirectionButtons {
    private client: Client;
    private readonly container: HTMLDivElement;
    private readonly messageInput: HTMLInputElement | null = null;
    private readonly contentArea: HTMLElement | null = null;
    private readonly zList: HTMLDivElement | null = null;
    private readonly zasList: HTMLDivElement | null = null;
    private readonly zToggle: HTMLButtonElement | null = null;
    private readonly zasToggle: HTMLButtonElement | null = null;
    private readonly bracketRightButton: HTMLButtonElement | null = null;
    private readonly toggleButton: HTMLButtonElement | null = null;
    private boundKey = 'BracketRight';
    private boundCtrl = false;
    private boundAlt = false;
    private boundShift = false;
    private enabled = false;
    private isMobile = false;

    // Variables for dragging functionality
    private isDragging = false;
    private longPressTimer: number | null = null;
    private initialX = 0;
    private initialY = 0;
    private currentX = 0;
    private currentY = 0;
    private offsetX = 0;
    private offsetY = 0;
    private isScrolling = false;
    private lastScrollTop = 0;
    private collapsed = false;

    constructor(client: Client) {
        this.client = client;
        this.container = document.getElementById('mobile-direction-buttons') as HTMLDivElement;
        this.messageInput = document.getElementById('message-input') as HTMLInputElement;
        this.contentArea = document.getElementById('main_text_output_msg_wrapper');
        this.zList = document.getElementById('z-buttons-list') as HTMLDivElement;
        this.zasList = document.getElementById('zas-buttons-list') as HTMLDivElement;
        this.zToggle = document.getElementById('z-list-toggle') as HTMLButtonElement;
        this.zasToggle = document.getElementById('zas-list-toggle') as HTMLButtonElement;
        this.bracketRightButton = document.getElementById('bracket-right-button') as HTMLButtonElement;
        this.toggleButton = document.getElementById('buttons-toggle') as HTMLButtonElement;

        if (!this.container) {
            console.error('Mobile direction buttons container not found');
            return;
        }

        this.setupEventHandlers();
        this.updateBracketRightButton();
        this.updateToggleButton();
        this.setupDraggable();
        this.checkMobile();
        this.setupKeyboardHandlers();

        // Listen for window resize to check if mobile view
        window.addEventListener('resize', () => {
            this.checkMobile();
            this.scrollToBottom();
        });

        // Listen for UI settings changes
        this.client.addEventListener("uiSettings", (event: CustomEvent) => {
            const detail = event.detail || {};
            if (!Object.prototype.hasOwnProperty.call(detail, "mobileDirectionButtons")) {
                return;
            }
            // Only disable if explicitly set to false
            const disabled = detail.mobileDirectionButtons === false;
            if (disabled) {
                this.disable();
            } else {
                this.enable();
            }
        });

        // Listen for bind settings changes
        this.client.addEventListener('settings', (ev: CustomEvent) => {
            const bind = ev.detail?.binds?.main;
            if (bind) {
                this.boundKey = bind.key;
                this.boundCtrl = !!bind.ctrl;
                this.boundAlt = !!bind.alt;
                this.boundShift = !!bind.shift;
                this.updateBracketRightButton();
            }
        });

        // Enable by default for all devices
        this.enable();
    }

    private checkMobile() {
        // Simple mobile detection based on screen width (still needed for other functionality)
        this.isMobile = window.innerWidth < 768;

        // Show buttons if enabled, regardless of device type
        if (this.enabled) {
            this.container.style.display = 'flex';
        } else {
            this.container.style.display = 'none';
        }
    }

    private setupEventHandlers() {
        // Setup bracket right button
        if (this.bracketRightButton) {
            this.bracketRightButton.addEventListener('click', () => {
                const event = new KeyboardEvent('keydown', {
                    code: this.boundKey,
                    key: this.boundKey,
                    ctrlKey: this.boundCtrl,
                    altKey: this.boundAlt,
                    shiftKey: this.boundShift,
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(event);
            });
        }

        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => {
                this.toggleVisibility();
            });
        }

        // Setup button 1 (unassigned)
        const button1 = document.getElementById('button-1');
        if (button1) {
            button1.addEventListener('click', () => {
                this.client.sendCommand("wesprzyj")
            });
        }

        // Setup button 2 (unassigned)
        const button2 = document.getElementById('button-2');
        if (button2) {
            button2.addEventListener('click', () => {
                if (window.clientExtension.TeamManager.getAttackTargetId()) {
                    this.client.sendCommand(`zabij ob_${window.clientExtension.TeamManager.getAttackTargetId()}`)
                }
            });
        }

        // Setup button 3 (unassigned)
        const button3 = document.getElementById('button-3');
        if (button3) {
            button3.addEventListener('click', () => {
                if (window.clientExtension.TeamManager.getAttackTargetId()) {
                    this.client.sendCommand(`zaslon ob_${window.clientExtension.TeamManager.getAttackTargetId()}`)
                }
            });
        }

        const goButton = document.getElementById('go-button');
        if (goButton) {
            goButton.addEventListener('click', () => {
                this.client.sendCommand('/go');
            });
        }

        if (this.zToggle) {
            this.zToggle.addEventListener('click', () => {
                if (this.zList && this.zList.style.display === 'grid') {
                    this.hideLists();
                } else {
                    this.hideLists();
                    this.renderZList();
                    if (this.zList) this.zList.style.display = 'grid';
                }
            });
        }

        if (this.zasToggle) {
            this.zasToggle.addEventListener('click', () => {
                if (this.zasList && this.zasList.style.display === 'grid') {
                    this.hideLists();
                } else {
                    this.hideLists();
                    this.renderZasList();
                    if (this.zasList) this.zasList.style.display = 'grid';
                }
            });
        }

        // Setup direction buttons
        const directionButtons = [
            { id: 'nw-button', cmd: 'nw' },
            { id: 'n-button', cmd: 'n' },
            { id: 'ne-button', cmd: 'ne' },
            { id: 'w-button', cmd: 'w' },
            { id: 'e-button', cmd: 'e' },
            { id: 'sw-button', cmd: 'sw' },
            { id: 's-button', cmd: 's' },
            { id: 'se-button', cmd: 'se' },
            { id: 'u-button', cmd: 'u' },
            { id: 'd-button', cmd: 'd' },
        ];

        directionButtons.forEach(b => this.setupDirectionButton(b.id, b.cmd));

        // Setup special exit button below up/down
        const specialExitButton = document.getElementById('special-exit-button');
        if (specialExitButton) {
            specialExitButton.addEventListener('click', () => {
                const specialExits = this.client.Map.currentRoom?.specialExits ?? {};
                const firstExit = Object.keys(specialExits)[0];
                if (firstExit) {
                    this.client.sendCommand(firstExit);
                }
            });

            const updateLabel = () => {
                const specialExits = this.client.Map.currentRoom?.specialExits ?? {};
                const firstExit = Object.keys(specialExits)[0];
                if (firstExit) {
                    specialExitButton.textContent = firstExit.length > 5 ? firstExit.slice(0, 4) + '…' : firstExit;
                    specialExitButton.title = firstExit;
                } else {
                    specialExitButton.textContent = 'sp ex';
                    specialExitButton.title = '';
                }
            };

            this.client.addEventListener('enterLocation', updateLabel as EventListener);
            updateLabel();
        }

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
        // Show buttons regardless of device type
        this.container.style.display = 'flex';
    }

    disable() {
        if (!this.enabled) return;
        this.enabled = false;
        this.container.style.display = 'none';
    }

    private setupKeyboardHandlers() {
        if (!this.messageInput || !this.contentArea) return;

        // Scroll to bottom and select text when input is focused (keyboard appears)
        this.messageInput.addEventListener('focusin', () => {
            this.scrollToBottom();
            // Delay selection to avoid mouse click clearing it on some browsers
            setTimeout(() => this.messageInput!.select());

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

    private setupDraggable() {
        if (!this.container || !this.contentArea) return;

        // Set initial position from localStorage if available
        const savedPosition = localStorage.getItem('mobileButtonsPosition');
        if (savedPosition) {
            try {
                const { x, y } = JSON.parse(savedPosition);
                this.container.style.right = `${x}px`;
                this.container.style.top = `${y}px`;
            } catch (e) {
                console.error('Error parsing saved position:', e);
            }
        }
        // Add touch event listeners for long press and drag
        this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));
        this.container.addEventListener('touchcancel', this.handleTouchEnd.bind(this));

        // Add mouse event listeners for desktop testing
        this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));

        // Add scroll detection
        this.lastScrollTop = this.contentArea.scrollTop;
        this.contentArea.addEventListener('scroll', () => {
            // Detect if user is scrolling
            const currentScrollTop = this.contentArea.scrollTop;
            if (Math.abs(currentScrollTop - this.lastScrollTop) > 5) {
                this.isScrolling = true;

                // Clear any existing long press timer
                if (this.longPressTimer) {
                    clearTimeout(this.longPressTimer);
                    this.longPressTimer = null;
                }

                // Reset scrolling flag after a short delay
                setTimeout(() => {
                    this.isScrolling = false;
                }, 100);
            }
            this.lastScrollTop = currentScrollTop;
        });
    }

    private dragStart(x: number, y: number, preventDefault?: () => void) {
        if (!this.container) return;

        if (this.isScrolling) return;

        this.initialX = x;
        this.initialY = y;

        this.longPressTimer = window.setTimeout(() => {
            if (preventDefault) preventDefault();

            this.isDragging = true;
            this.container.classList.add('dragging');

            const rect = this.container.getBoundingClientRect();
            this.offsetX = window.innerWidth - rect.right;
            this.offsetY = rect.top;

            this.container.style.opacity = '0.8';

            const buttons = this.container.querySelectorAll('button');
            buttons.forEach(button => {
                button.classList.add('no-click');
            });
        }, 500);
    }

    private dragMove(x: number, y: number) {
        if (!this.isDragging || !this.container) return;

        this.currentX = x;
        this.currentY = y;

        const deltaX = this.initialX - this.currentX;
        const deltaY = this.currentY - this.initialY;

        const newRight = this.offsetX + deltaX;
        const newTop = this.offsetY + deltaY;

        const maxRight = window.innerWidth - this.container.offsetWidth - 5;
        const clampedRight = Math.min(maxRight, Math.max(5, newRight));
        const clampedTop = Math.max(5, newTop);

        this.container.style.right = `${clampedRight}px`;
        this.container.style.top = `${clampedTop}px`;
    }

    private dragEnd(preventDefault?: () => void) {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        if (this.isDragging && this.container) {
            const rect = this.container.getBoundingClientRect();
            const position = {
                x: window.innerWidth - rect.right,
                y: rect.top,
            };
            localStorage.setItem('mobileButtonsPosition', JSON.stringify(position));

            this.isDragging = false;
            this.container.classList.remove('dragging');
            this.container.style.opacity = '1';

            const buttons = this.container.querySelectorAll('button');
            buttons.forEach(button => {
                button.classList.remove('no-click');
            });

            if (preventDefault) preventDefault();
        }
    }

    private handleTouchStart(e: TouchEvent) {
        const touch = e.touches[0];
        this.dragStart(touch.clientX, touch.clientY, () => e.preventDefault());
    }

    private handleTouchMove(e: TouchEvent) {
        e.preventDefault();
        const touch = e.touches[0];
        this.dragMove(touch.clientX, touch.clientY);
    }

    private handleTouchEnd(e: TouchEvent) {
        this.dragEnd(() => e.preventDefault());
    }

    private handleMouseDown(e: MouseEvent) {
        if (e.button !== 0) return;
        this.dragStart(e.clientX, e.clientY);
    }

    private handleMouseMove(e: MouseEvent) {
        this.dragMove(e.clientX, e.clientY);
    }

    private handleMouseUp(e: MouseEvent) {
        this.dragEnd(() => e.preventDefault());
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

    private hideLists() {
        if (this.zList) this.zList.style.display = 'none';
        if (this.zasList) this.zasList.style.display = 'none';
    }

    private applyButtonSize(btn: HTMLButtonElement) {
        const ref = this.container.querySelector('.mobile-button') as HTMLButtonElement | null;
        if (ref) {
            const styles = window.getComputedStyle(ref);
            btn.style.width = styles.width;
            btn.style.height = styles.height;
            btn.style.fontSize = styles.fontSize;
        }
    }

    private updateBracketRightButton() {
        if (!this.bracketRightButton) return;
        this.bracketRightButton.textContent = formatLabel({
            key: this.boundKey,
            ctrl: this.boundCtrl,
            alt: this.boundAlt,
            shift: this.boundShift,
        });
    }

    private updateToggleButton() {
        if (!this.toggleButton) return;
        this.toggleButton.textContent = this.collapsed ? '⇧' : '⇩';
    }

    private toggleVisibility() {
        if (!this.container) return;
        this.collapsed = !this.collapsed;
        if (this.collapsed) {
            this.container.classList.add('collapsed');
        } else {
            this.container.classList.remove('collapsed');
        }
        this.updateToggleButton();
    }

    private renderList(target: HTMLDivElement | null, regex: RegExp, prefix: string) {
        if (!target) return;
        target.innerHTML = '';
        const objects = (window as any).clientExtension?.ObjectManager?.getObjectsOnLocation?.() || [];
        const values = Array.from(new Set(objects
            .filter((o: any) => regex.test(o.shortcut))
            .map((o: any) => o.shortcut)));
        values.forEach((v: string) => {
            const b = document.createElement('button');
            b.className = 'mobile-button';
            this.applyButtonSize(b);
            b.textContent = v;
            b.addEventListener('click', () => {
                window.Input.send(`/${prefix} ${v}`);
                this.hideLists();
            });
            target.appendChild(b);
        });
    }

    private renderZList() {
        this.renderList(this.zList, /^[0-9]+$/, 'z');
    }

    private renderZasList() {
        this.renderList(this.zasList, /^[A-Z]$/, 'zas');
    }

}
