import { parseAnsiPatterns } from './ansiParser';
import { saveRecording, getRecording, getRecordingNames, deleteRecording, RecordedEvent } from './recordingStorage';

// Event emitter types
type EventListener = (...args: any[]) => void;
type EventMap = Record<string, EventListener[]>;

// WebSocket configuration
const WEBSOCKET_URL = 'wss://arkadia.rpg.pl/wss';
const GMCP_COMMAND_CODE = 201;
const TELNET_OPTION_REGEX = /\u00FF\u00FA.*?\u00FF\u00F0|\u00FF.[^\u00FF]/g;



class ArkadiaClient {
    private socket!: WebSocket;
    private events: EventMap = {};
    private receivedFirstGmcp: boolean = false;
    private userCommand: string | null = null;
    private passwordCommand: string | null = null;
    private lastConnectManual = true;
    private pingTimer: number | null = null;
    private messageBuffer: {text: string, type: string}[] = []
    private isRecording = false;
    private recordedMessages: RecordedEvent[] = [];
    private currentRecordingName: string | null = null;


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
    connect(manual: boolean = true): void {
        try {
            // Reset the flag when connecting
            this.receivedFirstGmcp = false;
            this.lastConnectManual = manual;
            this.socket = new WebSocket(WEBSOCKET_URL, []);
            this.socket.onmessage = (event: MessageEvent<string>) => {
                try {
                    const decodedData = atob(event.data);
                    if (this.isRecording) {
                        this.recordedMessages.push({
                            message: decodedData,
                            timestamp: Date.now(),
                            direction: 'in'
                        });
                    }
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
                this.emit('client.disconnect');
                this.stopPing();
            };

            this.socket.onopen = (event: Event) => {
                this.emit('open', event);
                this.emit('client.connect');
                this.startPing();
                if (!this.lastConnectManual && this.userCommand && this.passwordCommand) {
                    this.send(this.userCommand, false);
                    if (this.passwordCommand !== this.userCommand) {
                        this.send(this.passwordCommand, false);
                    }
                }
            };
        } catch (error) {
            this.emit('error', error);
        }
    }

    /**
     * Disconnect from the WebSocket server
     */
    disconnect(): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
        }
        this.stopPing();
    }

    /**
     * Check if the WebSocket is currently open
     */
    isSocketOpen(): boolean {
        return !!this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    /**
     * Check if the first GMCP event has been received
     */
    hasReceivedFirstGmcp(): boolean {
        return this.receivedFirstGmcp;
    }

    /**
     * Manually set the stored password for automatic credential sending
     */
    setStoredPassword(password: string | null): void {
        this.passwordCommand = password;
    }

    /**
     * Manually set the stored character for automatic credential sending
     */
    setStoredCharacter(character: string | null): void {
        this.userCommand = character;
    }

    /**
     * Send a message through the WebSocket
     */
    send(message: string, recordCredentials: boolean = true): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket is not connected');
            return;
        }

        if (recordCredentials && !this.receivedFirstGmcp) {
            if (!this.userCommand) {
                this.userCommand = message;
            }
            this.passwordCommand = message;
        }

        try {
            this.socket.send(btoa(message + "\r\n"));
            // Only echo commands if we've received the first GMCP event
            if (this.receivedFirstGmcp && message) {
                Output.send("-> " + message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.emit('error', error);
        }
    }

    sendGmcp(path: string, payload: any = {}): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            return;
        }
        try {
            const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
            const gmcpMessage = `\xFF\xFA${String.fromCharCode(GMCP_COMMAND_CODE)}${path} ${data}\xFF\xF0`;
            this.socket.send(btoa(gmcpMessage));
        } catch (error) {
            console.error('Error sending GMCP message:', error);
            this.emit('error', error);
        }
    }

    private startPing() {
        this.stopPing();
        this.sendGmcp('core.ping');
        this.pingTimer = window.setInterval(() => this.sendGmcp('core.ping'), 30000);
    }

    private stopPing() {
        if (this.pingTimer !== null) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    /**
     * Compatibility wrapper matching old client API
     */
    sendCommand(command: string): void {
        if (this.isRecording) {
            this.recordedMessages.push({
                message: command,
                timestamp: Date.now(),
                direction: 'out'
            });
        }
        this.send(command);
    }

    /**
     * Process incoming WebSocket data by removing telnet options
     */
    private processIncomingData(data: string) {
        if (data.length === 3) {
            return
        }

        data.match(TELNET_OPTION_REGEX)?.forEach(optionData => {})

        const leftOver = data.replace(TELNET_OPTION_REGEX, this.parseTelnetOption.bind(this)).trim();
        this.flushMessageBuffer()
        this.emit('message', leftOver.replace(/[ÿù]/g, ""))
    }

    /**
     * Parse telnet option from incoming data
     */
    private parseTelnetOption(optionData: string): string {
        if (optionData.length === 3) {

        } else {
            this.parseTelnetSubnegotiation(optionData.substring(2, optionData.length - 2));
        }
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

            try {
                const gmcp = JSON.parse(payload);
                this.receivedFirstGmcp = this.receivedFirstGmcp || type === "char.info";
                if (type === "gmcp_msgs") {
                    let text = atob(gmcp.text)
                    this.messageBuffer.push({text, type: gmcp.type})
                } else {
                    window.clientExtension.sendEvent(`gmcp.${type}`, gmcp)
                    window.clientExtension.sendEvent('gmcp', { path: type, value: gmcp })
                    this.emit(`gmcp.${type}`, gmcp);
                }
            } catch (error) {
                console.error('Error parsing GMCP JSON:', error);
            }
        }
    }

    flushMessageBuffer() {
        let processed = [];
        this.messageBuffer.forEach((message, i) => {
           if (processed[processed.length - 1]?.type === message.type) {
               processed[processed.length - 1].text += message.text
           } else {
               processed.push(message)
           }
        })
        processed.forEach((message, i) => {
            this.sendLine(message.text, message.type, i)
        })
        window.clientExtension.sendEvent('output-sent', processed.length)
        this.messageBuffer = []
    }

    private sendLine(text: string, type: string, i: number) {
        text = window.clientExtension.onLine(text, type)
        window.clientExtension.addEventListener('output-sent', () => window.clientExtension.sendEvent(`gmcp_msg.${type}`, text), {once: true})
        Output.send(parseAnsiPatterns(text), type);
        window.clientExtension.sendEvent('line-sent')
    }

    startRecording(name: string) {
        this.recordedMessages = [];
        this.currentRecordingName = name;
        this.isRecording = true;
    }

    async stopRecording(save?: boolean) {
        this.isRecording = false;
        if (save && this.currentRecordingName) {
            await saveRecording(this.currentRecordingName, this.recordedMessages);
        }
        this.currentRecordingName = null;
    }

    async loadRecording(name: string) {
        const data = await getRecording(name);
        this.recordedMessages = data || [];
    }

    listRecordings() {
        return getRecordingNames();
    }

    deleteRecording(name: string) {
        return deleteRecording(name);
    }

    getRecordedMessages() {
        return this.recordedMessages.slice();
    }

    replayRecordedMessages() {
        this.recordedMessages.forEach(ev => {
            if (ev.direction === 'in') {
                this.processIncomingData(ev.message);
            } else {
                Output.send('-> ' + ev.message);
            }
        });
    }
}

export default new ArkadiaClient();
