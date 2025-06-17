interface Storage {
    getItem(key: string): Promise<any>;

    setItem(key: string, value: any): Promise<any>;

    downloadItem(url: string, ttl: number): Promise<{value: any, cacheTime: number, ttl: number }>;
}

let download = async (storage: Storage, url: string, ttl: number) => {
    return storage.getItem(url).then(cacheContent => {
        if (cacheContent && cacheContent.value && cacheContent.cacheTime && cacheContent.cacheTime + cacheContent.ttl > Date.now()) {
            return cacheContent.value;
        } else {
            return fetch(url).then(data => data.json()).then(data => {
                storage.setItem(url, {value: data, cacheTime: Date.now(), ttl: ttl});
                return {value: data, cacheTime: Date.now(), ttl: ttl}
            })
        }
    })
}


class LocalStorage implements Storage {
    getItem(key: string): Promise<any> {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                const parsed = JSON.parse(value)
                return Promise.resolve({[key]: parsed})
            } catch (e) {
                return Promise.resolve({[key]: value})
            }
        }
        return Promise.resolve();
    }

    setItem(key: string, value: any): Promise<void> {
        return Promise.resolve(localStorage.setItem(key, JSON.stringify(value)));
    }

    downloadItem(url: string, ttl: number): Promise<any> {
        return download(this, url, ttl)
    }
}

class ChromeLocalStorage implements Storage {
    getItem(key: string): Promise<any> {
        return chrome.storage.local.get(key)
    }

    setItem(key: string, value: any): Promise<void> {
        return chrome.storage.local.set({[key]: value})
    }

    downloadItem(url: string, ttl: number): Promise<any> {
        return download(this, url, ttl)
    }

}

const storage: Storage = chrome.storage ? new ChromeLocalStorage() : new LocalStorage();
export default storage;