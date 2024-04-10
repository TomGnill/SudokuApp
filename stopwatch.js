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
    }

    getTime(){
        return (this.hours > 0 ? this.hours + ":" : "") + 
               (this.minutes > 0 ? this.minutes + ":" : "") + 
               (this.seconds);
    }
}