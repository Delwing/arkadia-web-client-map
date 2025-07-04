import { parseAnsiPatterns } from './ansiParser';
import {setGmcp} from "@client/src/gmcp.ts";

// Event emitter types
type EventListener = (...args: any[]) => void;
type EventMap = Record<string, EventListener[]>;

export interface ClientMessageEvent {
    message: string;
    timestamp: Date;
}

// WebSocket configuration
const WEBSOCKET_URL = 'wss://arkadia.rpg.pl/wss';
const GMCP_COMMAND_CODE = 201;
const TELNET_OPTION_REGEX = /\u00FF\u00FA.*?\u00FF\u00F0|\u00FF.[^\u00FF]/g;



class ArkadiaClient {
    private socket!: WebSocket;
    private events: EventMap = {};


    /**
     * Register an event listener
     */
    on(event: string, listener: EventListener): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    /**
     * Remove an event listener
     */
    off(event: string, listener: EventListener): void {
        if (!this.events[event]) return;
        const index = this.events[event].indexOf(listener);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
    }

    /**
     * Emit an event to all registered listeners
     */
    emit(event: string, ...args: any[]): void {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(...args));
    }

    /**
     * Connect to the WebSocket server
     */
    connect(): void {
        try {
            this.socket = new WebSocket(WEBSOCKET_URL, []);
            this.socket.onmessage = (event: MessageEvent<string>) => {
                try {
                    const decodedData = atob(event.data);
                    this.processIncomingData(decodedData);
                } catch (error) {
                    console.error('Error processing incoming message:', error);
                }
            };

            this.socket.onerror = (error: Event) => {
                this.emit('error', error);
            };

            this.socket.onclose = (event: CloseEvent) => {
                this.emit('close', event);
            };

            this.socket.onopen = (event: Event) => {
                this.emit('open', event);
            };
        } catch (error) {
            this.emit('error', error);
        }
    }

    /**
     * Send a message through the WebSocket
     */
    send(message: string): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket is not connected');
            return;
        }

        try {
            this.socket.send(btoa(message + "\r\n"));
        } catch (error) {
            console.error('Error sending message:', error);
            this.emit('error', error);
        }
    }

    /**
     * Process incoming WebSocket data by removing telnet options
     */
    private processIncomingData(data: string) {
        if (data.length === 3) {
            return
        }

        const leftOver = data.replace(TELNET_OPTION_REGEX, this.parseTelnetOption.bind(this));
        if (leftOver.length > 2) {
            this.emit('message', leftOver.substring(2, leftOver.length - 2));
        }
    }

    /**
     * Parse telnet option from incoming data
     */
    private parseTelnetOption(optionData: string): string {
        this.parseTelnetSubnegotiation(optionData.substring(2, optionData.length - 2));
        return "";
    }

    /**
     * Parse telnet subnegotiation, specifically GMCP (Generic MUD Communication Protocol)
     */
    private parseTelnetSubnegotiation(data: string): void {
        if (data.length === 0) return;

        const firstChar = data.charCodeAt(0);
        if (firstChar === GMCP_COMMAND_CODE) {
            const gmcpData = data.substring(1);
            if (!gmcpData.length) return;

            const spaceIndex = gmcpData.indexOf(" ");
            if (spaceIndex === -1) return;

            const type = gmcpData.substring(0, spaceIndex).toLowerCase();
            let payload = gmcpData.substring(spaceIndex + 1);

            // Handle special case for gmcp_msgs
            if (type === "gmcp_msgs") {
                payload = payload.replace(//g, "\\u001B");
            }
            //this.emit(type, payload);

            try {
                const gmcp = JSON.parse(payload);
                setGmcp(type, gmcp)
                window.clientExtension.sendEvent(`gmcp.${type}`, gmcp)
                if (type === "gmcp_msgs") {
                    let text = atob(gmcp.text)
                    text = window.clientExtension.onLine(text, gmcp.type)
                    gmcp.text = btoa(text)
                    window.clientExtension.addEventListener('output-sent', () => window.clientExtension.sendEvent(`gmcp_msg.${gmcp.type}`, gmcp), {once: true})
                    Output.send(parseAnsiPatterns(text), gmcp.type);
                }
            } catch (error) {
                console.error('Error parsing GMCP JSON:', error);
            }
        }
    }

}

export default new ArkadiaClient();