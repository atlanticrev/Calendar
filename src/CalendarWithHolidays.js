import Calendar from "./Calendar";
import Loader from "./Loader";

export default class CalendarWithHolidays extends Calendar {

    constructor () {
        super();

        // Model section
        this.selectedHolidays = {
            defaults: new Set(),
            tracking: new Set()
        };

        // this.loader = new Loader();

        // View section
        this.el.appendChild(this.html(`
            <div class="buttons">
                <button class="btn btn-send">Send</button>
                <button class="btn btn-reset">Reset</button>
            </div>
        `));

        this.btnSend = this.el.querySelector('.btn-send');
        this.btnReset = this.el.querySelector('.btn-reset');

        // Listeners
        this.onSendHolidaysClick = this.onSendHolidaysClick.bind(this);
        this.onResetHolidaysClick = this.onResetHolidaysClick.bind(this);

        this.btnSend.addEventListener('click', this.onSendHolidaysClick);
        this.btnReset.addEventListener('click', this.onResetHolidaysClick);
    }

    /**
     * @override
     */
    init () {
        super.init();

        this.loader = new Loader();

        this.loader.start();
        this.getHolidays()
            .then(holidays => {
                this.selectedHolidays.defaults = new Set([...holidays]);
                this.selectedHolidays.tracking = new Set([...holidays]);
            })
            .then(() => {
                this.loader.finish();
                this.markHolidays();
            })
            .catch(err => {
                this.loader.finish();
                console.log(err);
            });
    }

    /**
     * @override
     * @param {Object} options
     */
    render (options) {
        super.render(options);
        this.markHolidays();
    }

    markHolidays () {
        if (!this.selectedHolidays) {
            return;
        }
        this.days.forEach(day => {
            if (this.selectedHolidays.tracking.has(this._dateToStr(day.fullDate))) {
                day['template'].classList.add('selected-holiday');
            } else {
                day['template'].classList.remove('selected-holiday');
            }
        });
    }

    /**
     * @returns {Promise<Array<string>>}
     */
    getHolidays () {
        return new Promise((resolve, reject) => {
            fetch('http://test.unit.homestretch.ch')
                .then(res => res.json())
                .then(holidays => resolve(holidays))
                .catch(err => reject(err));
        });
    }

    /**
     * @param {Array<string>} holidays
     * @returns {Promise<Array<string>>}
     */
    postHolidays (holidays) {
        return new Promise((resolve, reject) => {
            fetch('http://test.unit.homestretch.ch/save', {
                method: 'POST',
                body: JSON.stringify(holidays)
            })
                .then(res => res.json())
                .then(updatedHolidays => resolve(updatedHolidays))
                .catch(err => reject(err));
        });
    }

    /**
     * @override
     * @param {MouseEvent} e
     */
    onDayClick (e) {
        super.onDayClick(e);

        if (!this.focusDayEl || this.focusDayEl.classList.contains('inactive')) {
            return;
        }

        const dateString = this._dateToStr(this.focusDayEl['model'].fullDate);
        if (this.selectedHolidays.tracking.has(dateString)) {
            this.focusDayEl.classList.remove('selected-holiday');
            this.selectedHolidays.tracking.delete(dateString);
        } else {
            this.focusDayEl.classList.add('selected-holiday');
            this.selectedHolidays.tracking.add(dateString);
        }
    }

    onSendHolidaysClick () {
        this.sendHolidays();
    }

    onResetHolidaysClick () {
        this.selectedHolidays.tracking = new Set([...this.selectedHolidays.defaults]);
        this.markHolidays();
    }

    sendHolidays () {
        const result = [];
        for (let /** @type Date */ date of this.selectedHolidays.defaults) {
            if (!this.selectedHolidays.tracking.has(date)) {
                result.push({date, value: false});
            }
        }
        for (let /** @type Date */ date of this.selectedHolidays.tracking) {
            if (!this.selectedHolidays.defaults.has(date)) {
                result.push({date, value: true});
            }
        }

        if (!result.length) {
            console.log('nothing to send');
            return;
        }

        this.loader.start();
        this.postHolidays(result)
            .then(res => {
                this.loader.finish();
                console.log(res);
            })
            .catch(err => {
                this.loader.finish();
                console.error(err);
            });
    }

}