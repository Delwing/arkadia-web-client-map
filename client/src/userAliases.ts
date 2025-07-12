export interface UserAlias { pattern: string; command: string }
export interface AliasEntry { pattern: RegExp; callback: (m: RegExpMatchArray) => void }

let userAliasEntries: AliasEntry[] = []
let sendRaw: (cmd: string) => void = () => {}

function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function applyUserAliases(list: UserAlias[]) {
    userAliasEntries = list.map(a => {
        const regex = new RegExp("^" + escapeRegExp(a.pattern) + "(?:\\s+(.*))?$")
        return {
            pattern: regex,
            callback: (m: RegExpMatchArray) => {
                const rest = m[1] ? " " + m[1] : ""
                sendRaw(a.command + rest)
            }
        }
    })
}

function loadUserAliases() {
    try {
        const raw = localStorage.getItem('aliases')
        if (raw) {
            const arr = JSON.parse(raw) as UserAlias[]
            applyUserAliases(arr)
        }
    } catch {}
}

export function getUserAliasEntries(): AliasEntry[] {
    return userAliasEntries
}

export function initUserAliasHandling(sendFn: (cmd: string) => void) {
    sendRaw = sendFn
    loadUserAliases()
    window.addEventListener('aliases-changed', (ev: Event) => {
        const detail = (ev as CustomEvent<UserAlias[]>).detail
        if (Array.isArray(detail)) applyUserAliases(detail)
    })
    window.addEventListener('storage', (ev: StorageEvent) => {
        if (ev.key === 'aliases' && ev.newValue) {
            try { applyUserAliases(JSON.parse(ev.newValue)) } catch {}
        }
    })
}
