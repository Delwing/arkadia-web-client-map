import Client from "@client/src/Client";

export default class MobileDirectionButtons {
    private client: Client;
    private container: HTMLDivElement;
    private enabled = false;
    private isMobile = false;

    constructor(client: Client) {
        this.client = client;
        this.createContainer();
        this.checkMobile();

        // Listen for window resize to check if mobile view
        window.addEventListener('resize', () => this.checkMobile());

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

    private createContainer() {
        // Create main container
        this.container = document.createElement('div');
        this.container.className = 'mobile-direction-buttons';
        this.container.style.display = 'none';
        this.container.style.position = 'fixed';
        this.container.style.right = '5px';
        this.container.style.bottom = '120px'; // Position closer to bottom but leave space for ~5 lines of text
        this.container.style.flexDirection = 'column';
        this.container.style.zIndex = '1000';
        this.container.style.gap = '3px';
        this.container.style.backgroundColor = 'rgba(135, 206, 235, 0.7)'; // Sky blue with transparency
        this.container.style.padding = '5px';
        this.container.style.borderRadius = '5px';

        // Create top buttons container (for the 3 additional buttons)
        const topButtonsContainer = document.createElement('div');
        topButtonsContainer.className = 'mobile-top-buttons';
        topButtonsContainer.style.display = 'flex';
        topButtonsContainer.style.justifyContent = 'center';
        topButtonsContainer.style.gap = '3px';
        topButtonsContainer.style.marginBottom = '5px';

        // Create direction buttons container
        const directionButtonsContainer = document.createElement('div');
        directionButtonsContainer.className = 'mobile-direction-grid';
        directionButtonsContainer.style.display = 'grid';
        directionButtonsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        directionButtonsContainer.style.gridTemplateRows = 'repeat(3, 1fr)';
        directionButtonsContainer.style.gap = '5px';

        // Add top buttons (] and 2 unassigned)
        this.createTopButton(topButtonsContainer, ']', () => {
            // Simulate ] key press
            const event = new KeyboardEvent('keydown', {
                key: ']',
                code: 'BracketRight',
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(event);
        });

        this.createTopButton(topButtonsContainer, '1', () => {
            // Unassigned button 1
        });

        this.createTopButton(topButtonsContainer, '2', () => {
            // Unassigned button 2
        });

        // Add direction buttons with arrow symbols
        this.createDirectionButton(directionButtonsContainer, 'nw', 0, 0, '↖');
        this.createDirectionButton(directionButtonsContainer, 'n', 0, 1, '↑');
        this.createDirectionButton(directionButtonsContainer, 'ne', 0, 2, '↗');
        this.createDirectionButton(directionButtonsContainer, 'w', 1, 0, '←');
        this.createDirectionButton(directionButtonsContainer, 'c', 1, 1, 'zerknij');
        this.createDirectionButton(directionButtonsContainer, 'e', 1, 2, '→');
        this.createDirectionButton(directionButtonsContainer, 'sw', 2, 0, '↙');
        this.createDirectionButton(directionButtonsContainer, 's', 2, 1, '↓');
        this.createDirectionButton(directionButtonsContainer, 'se', 2, 2, '↘');

        // Add containers to main container
        this.container.appendChild(topButtonsContainer);
        this.container.appendChild(directionButtonsContainer);

        // Add main container to document
        document.body.appendChild(this.container);
    }

    private createTopButton(container: HTMLDivElement, label: string, callback: () => void) {
        const button = document.createElement('button');
        button.textContent = label;
        button.style.width = '25px';
        button.style.height = '25px';
        button.style.padding = '0';
        button.style.fontSize = '10px';
        button.style.border = '1px solid #a0d0e0';
        button.style.borderRadius = '4px';
        button.style.backgroundColor = '#87CEEB'; // Sky blue
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.touchAction = 'manipulation'; // Improve touch behavior

        button.addEventListener('click', callback);
        container.appendChild(button);
        return button;
    }

    private createDirectionButton(container: HTMLDivElement, direction: string, row: number, col: number, label: string = direction) {
        const button = document.createElement('button');
        button.textContent = label;
        button.style.width = '25px';
        button.style.height = '25px';
        button.style.padding = '0';
        button.style.fontSize = '10px';
        button.style.border = '1px solid #a0d0e0';
        button.style.borderRadius = '4px';
        button.style.backgroundColor = '#87CEEB'; // Sky blue
        button.style.cursor = 'pointer';
        button.style.gridRow = `${row + 1}`;
        button.style.gridColumn = `${col + 1}`;
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.touchAction = 'manipulation'; // Improve touch behavior

        // For center button, use 'zerknij' command
        if (direction === 'c') {
            button.style.backgroundColor = '#6CA6CD'; // Slightly darker sky blue
            button.style.fontSize = '8px'; // Smaller font for 'zerknij' text
            button.addEventListener('click', () => {
                this.client.sendCommand('zerknij');
            });
        } else {
            button.addEventListener('click', () => {
                this.client.sendCommand(direction);
            });
        }

        container.appendChild(button);
        return button;
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
}
