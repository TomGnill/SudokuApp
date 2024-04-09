export class Stopwatch{
    constructor(){
        this.seconds = 0;
        this.minutes = 0;
        this.hours = 0;
    }

    increase(){
        this.seconds++;
        if(this.seconds === 60){
            this.minutes++;
            this.seconds = 0;
            if(this.minutes === 60){
                this.minutes = 0;
                this.hours++;
            }
        }
        setTimeout(this.increase, 1000);
    }

    getTime(){
        return this.hours + ":" + this.minutes + ":" + this.seconds;
    }
}