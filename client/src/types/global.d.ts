interface ClientInput {
    send(command: string): void;
}

declare var Input: ClientInput;

interface ClientOutput {
    buffer: { text: string, type: string }[];
    send(out?: string, type?: string): any;
}

declare var Output: ClientOutput;

interface Position {
    x: number;
    y: number;
    z: number;
    id: string;
    name: string;
}


interface ClientText {
    parse_patterns(text: string): string
}

// @ts-ignore
declare var Text: ClientText;

interface ClientGmcp {
    parse_option_subnegotiation(subnegotiation: string): void
}

declare var Gmcp: ClientGmcp;
