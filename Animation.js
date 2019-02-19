class FTAnimation {
    static mapValueRegEx = /(\d+)(px|rem|em|%|pc)?/
    constructor (props) {
        this.object = props.object;
        this.effect = props.effect;
        this.runTime = props.runTime || 350;
        if ( typeof props.movement == 'function' ) {
            this.movement = props.movement;
        }
        if ( typeof props.specificity == 'function' ) {
            this.specificity = props.specificity;
        }

        this.queue = [];
        this.running = false;
        this.runTimeID = null;
        this.run = this.run.bind(this);
    }
    createKeyfram (props) {
        let mappedEndValue = FTAnimation.mapValueRegEx.exec(props.end),
            end = +mappedEndValue[1],
            unit = mappedEndValue[2] || '',
            effect = props.effect || this.effect,
            object = props.object || this.object,
            start = props.start === undefined ? object[effect] : props.start,
            mappedStartValue = FTAnimation.mapValueRegEx.exec(start),
            runTime = props.runTime || this.runTime,
            travel = props.end - start,
            loop = props.loop || 1,
            infinite = props.infinite || false;
        start = +mappedStartValue[0];
        if ( mappedEndValue[2] != mappedStartValue[2] ) {

        }
        let keyfram = {
            object,
            effect,
            start,
            travel,
            unit,
            runTime,
            end,
            loop,
            infinite,
            started: false,
            startTime: null
        };
        if ( typeof props.movement == 'function' ) {
            keyfram.movement = props.movement;
        } else if ( this.movement ) {
            keyfram.movement = this.movement;
        }
        if ( typeof props.specificity == 'function' ) {
            keyfram.specificity = props.specificity;
        } else if ( this.specificity ) {
            keyfram.specificity = this.specificity;
        }
        if ( typeof props.callback == 'function' ) {
            keyfram.callback = props.callback;
        }
        this.queue.push(keyfram);
        return keyfram;
    }
    reset (props) {
        if ( this.running ) {
            this.queue[0] = this.createKeyfram(props);
        } else {
            this.step(props);
        }
    }
    step (props) {
        this.queue.push(this.createKeyfram(props));
        if ( !this.running ) {
            this.run();
        }
    }
    stop () {
        clearTimeout(this.runTimeID);
        this.stoped = true;
    }
    start () {
        this.stoped = false;
        this.running || this.run();
    }
    end () {
        this.run(true);
    }
    run (end) {
        if ( this.queue.length ) {
            this.running = true;
            let keyfram = this.queue[0];
            if ( !keyfram.started ) {
                keyfram.started = true;
                keyfram.startTime = Date.now();
            }
            let passedTime = Date.now() - keyfram.startTime;
            passedTime = passedTime > keyfram.runTime || end ? keyfram.runTime : passedTime;
            let travel = keyfram.travel * passedTime / keyfram.runTime;
            let current = keyfram.start + ( keyfram.movement ? keyfram.movement(passedTime, keyfram.runTime, keyfram.travel) : travel );
            if ( keyfram.specificity ) {
                keyfram.object[keyfram.effect] = keyfram.specificity(current);
            } else {
                keyfram.object[keyfram.effect] = current + keyfram.unit;
            }
            if ( !this.stoped ) {
                if ( passedTime == keyfram.runTime ) {
                    keyfram.callback && keyfram.callback();
                    if ( keyfram.infinite ) {
                        keyfram.started = false;
                    } else if ( keyfram.times ) {
                        keyfram.times--;
                    } else {
                        this.queue.shift();
                    }
                }
                this.runTimeID = setTimeout(this.run, 24);
            } else {
                keyfram.runTime = keyfram.runTime - passedTime;
                keyfram.started = false;
            }
        } else {
            this.running = false;
        }
    }
}

export default FTAnimation;