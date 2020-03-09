function appendzero(num: number) {
    if (num >= 10) {
        return num.toString();
    }

    return "0" + num.toString();
}

export function isstring(x: any): x is string {
    return typeof x === 'string';
}

export function ToTimeFormat(diff: number) {
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff - (hours * 3600)) / 60);
    const seconds = Math.floor(diff - (hours * 3600) - (minutes * 60));

    return appendzero(hours) + ":" + appendzero(minutes) + ":" + appendzero(seconds);
}

export function ToDateTimeFormat(val: string) {
    const date = new Date(val);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}
     ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}
