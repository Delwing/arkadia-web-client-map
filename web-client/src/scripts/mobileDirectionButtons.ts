import Client from "@client/src/Client";

export default class MobileDirectionButtons {
    private client: Client;
    private readonly container: HTMLDivElement;
    private readonly messageInput: HTMLInputElement | null = null;
    private readonly contentArea: HTMLElement | null = null;
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
        this.setupDraggable();
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

        // Setup button 3 (unassigned)
        const button3 = document.getElementById('button-3');
        if (button3) {
            button3.addEventListener('click', () => {
                // Unassigned button 3
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
        this.setupDirectionButton('u-button', 'u');
        this.setupDirectionButton('d-button', 'd');

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

    private setupDraggable() {
        if (!this.container || !this.contentArea) return;

        // Set initial position from localStorage if available
        const savedPosition = localStorage.getItem('mobileButtonsPosition');
        if (savedPosition) {
            try {
                const { x, y } = JSON.parse(savedPosition);
                this.container.style.right = `${x}px`;
                this.container.style.bottom = `${y}px`;
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

    private handleTouchStart(e: TouchEvent) {
        if (!this.container) return;

        // Don't prevent default immediately to allow button clicks
        // We'll only prevent default after long press

        // If user is scrolling, don't start long press timer
        if (this.isScrolling) return;

        // Store the target element to check if it's a button
        const target = e.target as HTMLElement;

        // Get initial touch position for later use
        const touch = e.touches[0];
        this.initialX = touch.clientX;
        this.initialY = touch.clientY;

        // Start long press timer
        this.longPressTimer = window.setTimeout(() => {
            // Now prevent default behavior for all touch events
            e.preventDefault();

            this.isDragging = true;
            this.container.classList.add('dragging');

            // Get current container position
            const rect = this.container.getBoundingClientRect();
            this.offsetX = window.innerWidth - rect.right;
            this.offsetY = window.innerHeight - rect.bottom;

            // Add visual feedback for dragging state
            this.container.style.opacity = '0.8';

            // Add a class to all buttons to temporarily disable their click events
            const buttons = this.container.querySelectorAll('button');
            buttons.forEach(button => {
                button.classList.add('no-click');
            });
        }, 500); // 500ms long press
    }

    private handleTouchMove(e: TouchEvent) {
        if (!this.isDragging || !this.container) return;

        // Prevent default to avoid scrolling while dragging
        e.preventDefault();

        const touch = e.touches[0];
        this.currentX = touch.clientX;
        this.currentY = touch.clientY;

        // Calculate new position (from right and bottom)
        const deltaX = this.initialX - this.currentX;
        const deltaY = this.initialY - this.currentY;

        const newRight = this.offsetX + deltaX;
        const newBottom = this.offsetY + deltaY;

        // Apply new position
        this.container.style.right = `${Math.max(5, newRight)}px`;
        this.container.style.bottom = `${Math.max(5, newBottom)}px`;
    }

    private handleTouchEnd(e: TouchEvent) {
        // Clear long press timer if touch ended before long press
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        if (this.isDragging && this.container) {
            // Save position to localStorage
            const rect = this.container.getBoundingClientRect();
            const position = {
                x: window.innerWidth - rect.right,
                y: window.innerHeight - rect.bottom
            };
            localStorage.setItem('mobileButtonsPosition', JSON.stringify(position));

            // Reset dragging state
            this.isDragging = false;
            this.container.classList.remove('dragging');
            this.container.style.opacity = '1';

            // Remove the no-click class from all buttons
            const buttons = this.container.querySelectorAll('button');
            buttons.forEach(button => {
                button.classList.remove('no-click');
            });

            // Prevent any click events immediately after dragging ends
            e.preventDefault();
        }
    }

    private handleMouseDown(e: MouseEvent) {
        if (!this.container || e.button !== 0) return; // Only handle left mouse button

        // If user is scrolling, don't start long press timer
        if (this.isScrolling) return;

        // Get initial mouse position for later use
        this.initialX = e.clientX;
        this.initialY = e.clientY;

        // Start long press timer
        this.longPressTimer = window.setTimeout(() => {
            this.isDragging = true;
            this.container.classList.add('dragging');

            // Get current container position
            const rect = this.container.getBoundingClientRect();
            this.offsetX = window.innerWidth - rect.right;
            this.offsetY = window.innerHeight - rect.bottom;

            // Add visual feedback for dragging state
            this.container.style.opacity = '0.8';

            // Add a class to all buttons to temporarily disable their click events
            const buttons = this.container.querySelectorAll('button');
            buttons.forEach(button => {
                button.classList.add('no-click');
            });
        }, 500); // 500ms long press
    }

    private handleMouseMove(e: MouseEvent) {
        if (!this.isDragging || !this.container) return;

        this.currentX = e.clientX;
        this.currentY = e.clientY;

        // Calculate new position (from right and bottom)
        const deltaX = this.initialX - this.currentX;
        const deltaY = this.initialY - this.currentY;

        const newRight = this.offsetX + deltaX;
        const newBottom = this.offsetY + deltaY;

        // Apply new position
        this.container.style.right = `${Math.max(5, newRight)}px`;
        this.container.style.bottom = `${Math.max(5, newBottom)}px`;
    }

    private handleMouseUp(e: MouseEvent) {
        // Clear long press timer if mouse up before long press
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        if (this.isDragging && this.container) {
            // Save position to localStorage
            const rect = this.container.getBoundingClientRect();
            const position = {
                x: window.innerWidth - rect.right,
                y: window.innerHeight - rect.bottom
            };
            localStorage.setItem('mobileButtonsPosition', JSON.stringify(position));

            // Reset dragging state
            this.isDragging = false;
            this.container.classList.remove('dragging');
            this.container.style.opacity = '1';

            // Remove the no-click class from all buttons
            const buttons = this.container.querySelectorAll('button');
            buttons.forEach(button => {
                button.classList.remove('no-click');
            });

            // Prevent any click events immediately after dragging ends
            e.preventDefault();
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
