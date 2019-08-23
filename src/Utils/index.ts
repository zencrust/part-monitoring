function appendzero(num: number){
    if(num >= 10){
        return num.toString();
    }

    return "0"+ num.toString();
}

export function ToTimeFormat(diff: number) {
    let hours   = Math.floor(diff / 3600);
    let minutes = Math.floor((diff - (hours * 3600)) / 60);
    let seconds = Math.floor(diff - (hours * 3600) - (minutes * 60));
    
    return appendzero(hours) +':' + appendzero(minutes) +':'+ appendzero(seconds);
}

export function ToDateTimeFormat(val: string){
    let date = new Date(val);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}
     ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}