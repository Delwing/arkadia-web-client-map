export const gmcp: Record<string, any> = (window as any).gmcp || ((window as any).gmcp = {});

export function setGmcp(path: string, value: any) {
    const parts = path.split('.');
    let obj: any = gmcp;
    for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]] = obj[parts[i]] || {};
    }
    obj[parts[parts.length - 1]] = value;
}

export function attachGmcpListener(target: { addEventListener: Function }) {
    target.addEventListener('gmcp', (event: CustomEvent<{ path: string; value: any }>) => {
        const { path, value } = event.detail || {};
        if (typeof path === 'string') {
            setGmcp(path, value);
        }
    });
}
