import Client from "@client/src/Client.ts";


declare global {
    interface Window {
        clientExtension: Client
    }

    interface Position {
        x: number;
        y: number;
        z: number;
        id: string;
        name: string;
    }
}