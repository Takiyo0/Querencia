export class CustomMap<K, V> extends Map<K, V> {
    constructor(flushInterval: number, ...args: any[]) {
        super(args);
        setInterval(() => {
            this.clear();
        }, flushInterval);
    }
}