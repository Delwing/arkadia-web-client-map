interface ClientInput {
    send(command: string): void;
}

declare var Input: ClientInput;

interface ClientOutput {
    buffer: string[];
    send(out: string, type: string): any;

    flush_buffer(): void;
}

declare var Output: ClientOutput;

interface Position {
    x: number;
    y: number;
    z: number;
    id: string;
    name: string;
}

interface ClientMap {
    refresh_position(): void

    set_position(position: Position): void

    unset_position(): void

    data?: Position
}

declare var Maps: ClientMap;

interface ClientText {
    parse_patterns(text: string): string
}

// @ts-ignore
declare var Text: ClientText;

interface ClientGmcp {
    parse_option_subnegotiation(subnegotiation: string): void
}

declare var Gmcp: ClientGmcp;
