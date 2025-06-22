interface ClientInput {
    send(command: string): void;
}

interface ClientOutput {
    buffer: string[];

    send(out: string, type?: string): any;

    clear(): void

    flush_buffer(): void;
}


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

interface ClientText {
    parse_patterns(text: string): string
}

declare var Text: ClientText;

interface ClientGmcp {
    parse_option_subnegotiation(subnegotiation: string): void
}


interface ClientConf {

}


declare var clientExtensions: ClientExtension

interface Window {
    Input: ClientInput;
    Output: ClientOutput;
    Maps: ClientMap;
    Text: ClientText;
    Conf: ClientConf
    Gmcp: ClientGmcp;
    clientExtension: ClientExtension
}

declare var Input: ClientInput;
declare var Maps: ClientMap;
declare var Gmcp: ClientGmcp;
declare var Output: ClientOutput;