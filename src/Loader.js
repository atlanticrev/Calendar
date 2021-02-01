import BaseComponent from "./BaseComponent";

export default class Loader extends BaseComponent {

    constructor () {
        super();

        // Model section
        this.progress = 0;
        this._interval = null;

        // Template section
        this.el = this.html(`
            <div class="loader" style="--progress: ${this.progress}%"></div>
        `);

        this.tick = this.tick.bind(this);

        this.mount(document.body);
    }

    start () {
        this.reset();
        this.show();
        this._interval = setInterval(this.tick, 0);
    }

    stop () {
        clearInterval(this._interval);
    }

    reset () {
        this.progress = 0;
        this.render();
    }

    complete () {
        this.progress = 100;
        this.render();
        this.hide();
    }

    finish () {
        this.stop();
        this.complete();
    }

    tick () {
        if (this.progress >= 100) {
            this.finish();
            return;
        }
        this.progress += Loader.INTERVAL_TICK_STEP;
        this.render();
    }

    show () {
        this.el.classList.add('show');
    }

    hide () {
        this.el.classList.remove('show');
    }

    render () {
        this.el.style.setProperty('--progress', `${this.progress}%`);
    }

}

/** @type number */
Loader.INTERVAL_TICK_STEP = 0.1;