import { i18n } from '../locale';
import Component from "./Component";

export default class Calendar extends Component {

    static get monthNames () {
        return [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
    }

    static get cellsCount () {
        return 7 * 6;
    }

    constructor (options) {
        super();

        // Model ->
        this.today = new Date();

        this.dateOrigin = (options && options.date)
            ? new Date(options.date)
            : this.today;

        // @todo move it to mixin
        this.selectedHolidays = {
            defaults: new Set(),
            tracking: new Set()
        };

        this.month = this.dateOrigin.getMonth();
        this.year = this.dateOrigin.getFullYear();
        this.days = this.getDays();

        // View ->
        this.isAnimating = false;

        // Template
        this.el = this.html(`
            <div class="container">
                <div class="calendar">
                    <div class="date-container">
                        <span class="month">${this.month}</span>
                        <span class="year">${this.year}</span>
                        <div class="left-controller" data-direction="l">\<</div>
                        <div class="right-controller" data-direction="r">\></div>
                    </div>   
                    <dav class="days-names">
                        <span class="day-name">${i18n('month.mon')}</span>
                        <span class="day-name">${i18n('month.tue')}</span>
                        <span class="day-name">${i18n('month.wed')}</span>
                        <span class="day-name">${i18n('month.thu')}</span>
                        <span class="day-name">${i18n('month.fri')}</span>
                        <span class="day-name">${i18n('month.sat')}</span>
                        <span class="day-name">${i18n('month.sun')}</span>
                    </dav>               
                    <div class="days-viewport">
                        <div class="days-scroll-wrapper"></div>
                    </div>
                </div>
                <div class="buttons">
                    <button class="btn btn-send">Send</button>
                    <button class="btn btn-reset">Reset</button>
                </div>
            </div>
        `);

        // Elements
        this.monthEl = this.el.querySelector('.month');
        this.yearEl = this.el.querySelector('.year');
        this.leftCtrlEl = this.el.querySelector('.left-controller');
        this.rightCtrlEl = this.el.querySelector('.right-controller');
        this.daysScrollWrapperEl = this.el.querySelector('.days-scroll-wrapper');
        // @todo move it to mixin
        this.btnSend = this.el.querySelector('.btn-send');
        this.btnReset = this.el.querySelector('.btn-reset');

        // Listeners
        this.onDayClick = this.onDayClick.bind(this);
        this.onCtrlClick = this.onCtrlClick.bind(this);
        // @todo move it to mixin
        this.onSendClick = this.onSendClick.bind(this);
        this.onResetClick = this.onResetClick.bind(this);

        this.leftCtrlEl.addEventListener('click', this.onCtrlClick);
        this.rightCtrlEl.addEventListener('click', this.onCtrlClick);
        this.daysScrollWrapperEl.addEventListener('click', this.onDayClick);
        // @todo move it to mixin
        this.btnSend.addEventListener('click', this.onSendClick);
        this.btnReset.addEventListener('click', this.onResetClick);

        // Initial rendering
        this.init()
            .then((holidays) => {
                // @todo move it to mixin
                this.selectedHolidays.defaults = new Set([...holidays]);
                this.selectedHolidays.tracking = new Set([...holidays]);
                this.render();
                this.mount();
            });
    }

    /**
     * @returns {Promise<Array<string>>}
     */
    init () {
        // return new Promise((resolve, reject) => {
        //     fetch('http://test.unit.homestretch.ch/', {mode: "no-cors"})
        //         .then(res => res.json())
        //         .then(data => resolve(data))
        //         .catch(err => reject(err));
        // });
        return new Promise((resolve) => {
            // @todo move it to mixin
            setTimeout(() => {
                resolve([
                    "2021-01-05",
                    "2021-01-15",
                    "2021-01-27"
                ]);
            }, 500);
        });
    }

    /**
     * @returns {Array<Day>}
     */
    getDays () {
        return [
            ...this._getPrevMonthDays(),
            ...this._getCurrMonthDays(),
            ...this._getNextMonthDays()
        ];
    }

    /**
     * @param {MouseEvent} e
     */
    onDayClick (e) {
        let dayEl, day;
        for (let el of e.composedPath()) {
            if (el.classList && el.classList.contains('day')) {
                dayEl = el;
                day = dayEl['link'];
            }
        }
        if (dayEl.classList.contains('inactive')) {
            return;
        }

        // @todo move it to mixin
        const dateString = this._dateToStr(day.fullDate);
        if (this.selectedHolidays.tracking.has(dateString)) {
            dayEl.classList.remove('selected-holiday');
            this.selectedHolidays.tracking.delete(dateString);
        } else {
            dayEl.classList.add('selected-holiday');
            this.selectedHolidays.tracking.add(dateString);
        }
    }

    // @todo move it to mixin
    onSendClick () {
        this._send();
    }

    // @todo move it to mixin
    onResetClick () {
        this.selectedHolidays.tracking = new Set([...this.selectedHolidays.defaults]);
        // @todo deduplicate
        this.days.forEach(day => {
            const dateString = this._dateToStr(day.fullDate);
            if (this.selectedHolidays.tracking.has(dateString)) {
                day['link'].classList.add('selected-holiday');
            } else {
                day['link'].classList.remove('selected-holiday');
            }
        });
    }

    // @todo move it to mixin
    _send () {
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
        // @todo send to network
        console.log(result);
    }

    render (options) {
        super.render();

        // Fill Year/Month display
        this.monthEl.textContent = Calendar.monthNames[this.month];
        this.yearEl.textContent = this.year.toString();

        // Create days container
        const newDaysContainerEl = document.createElement('div');
        newDaysContainerEl.className = 'days-container';

        // Fill days container
        for (let i = 0; i < this.days.length; i++) {
            const day = this.days[i];
            const dayEl = document.createElement('div');

            // Default css classes
            dayEl.classList.add('day');
            dayEl.classList.add(day.month === this.month ? 'active' : 'inactive');
            day.isHoliday && dayEl.classList.add('holiday');
            day.isToday && dayEl.classList.add('today');

            // @todo move it to mixin
            if (this.selectedHolidays.tracking.has(this._dateToStr(day.fullDate))) {
                dayEl.classList.add('selected-holiday');
            } else {
                dayEl.classList.remove('selected-holiday');
            }

            // Linking data with template
            dayEl['link'] = day;
            day['link'] = dayEl;

            dayEl.textContent = day.date.toString();
            newDaysContainerEl.appendChild(dayEl);
        }

        // Add days container to the DOM
        // If there are no containers, add first
        if (!this.daysScrollWrapperEl.children.length) {
            this.daysScrollWrapperEl.appendChild(newDaysContainerEl);
            // Change containers (animation)
        } else {
            const currDaysContainerEl = this.daysScrollWrapperEl.firstElementChild;

            const onTransitionEnd = () => {
                this.daysScrollWrapperEl.removeEventListener('transitionend', onTransitionEnd, false);
                this.daysScrollWrapperEl.removeChild(currDaysContainerEl);
                this.daysScrollWrapperEl.style.transition = '';
                this.daysScrollWrapperEl.style.transform = 'translate3d(0, 0, 0)';
                delete this.isAnimating;
            };
            this.daysScrollWrapperEl.addEventListener('transitionend', onTransitionEnd, false);

            if (options.direction === 'l') {
                this.daysScrollWrapperEl.insertBefore(newDaysContainerEl, currDaysContainerEl);
                this.daysScrollWrapperEl.style.transform = 'translate3d(-100%, 0, 0)';
            } else if (options.direction === 'r') {
                this.daysScrollWrapperEl.style.transform = 'translate3d(0, 0, 0)';
                this.daysScrollWrapperEl.appendChild(newDaysContainerEl);
            }

            requestAnimationFrame(() =>
                requestAnimationFrame( () => {
                    this.daysScrollWrapperEl.style.transition = `transform ${Calendar.CHANGE_MONTH_ANIMATION_TIME}s ease-out`;
                    if (options.direction === 'l') {
                        this.daysScrollWrapperEl.style.transform = `translate3d(0, 0, 0)`;
                    } else if (options.direction === 'r') {
                        this.daysScrollWrapperEl.style.transform = `translate3d(-100%, 0, 0)`;
                    }
                })
            );
        }
    }

    /**
     * @param {MouseEvent} e
     */
    onCtrlClick (e) {
        if (this.isAnimating) {
            return;
        } else {
            this.isAnimating = true;
        }

        const direction = e.target.dataset.direction;

        if (direction === 'l') {
            // Jan -> Dec
            if (this.month === 0) {
                this.month = 11;
                this.year--;
            } else {
                this.month--;
            }
        } else if (direction === 'r') {
            // Dec -> Jan
            if (this.month === 11) {
                this.month = 0;
                this.year++;
            } else {
                this.month++;
            }
        }

        this.days = this.getDays();
        this.render({direction});
    }

    /**
     * @returns {Array<Day>}
     * @private
     */
    _getPrevMonthDays () {
        const days = [];

        const prevMonth = this.month === 0
            ? 11
            : this.month - 1;

        const prevMonthYear = this.month === 0
            ? this.year - 1
            : this.year;

        // Days in previous month
        let prevMonthDays = this._getDaysInMonth(prevMonth);

        const currMonthFirstDay = new Date(this.year, this.month, 1).getDay();
        // (SUN: 6, SAT: 0, MON: 1, ...)
        let needDays = currMonthFirstDay === 0 ? 6 : currMonthFirstDay - 1;

        let prevMonthDay = prevMonthDays - needDays + 1;
        for (let i = 0; i < needDays; i++) {
            const date = new Date(prevMonthYear, prevMonth, prevMonthDay);
            const day = date.getDay();
            days.push( /** @type Day */ {
                fullDate: date,
                date: prevMonthDay,
                month: date.getMonth(),
                year: date.getFullYear(),
                day,
                isHoliday: day === 6 || day === 0,
                isToday: this._isToday(date),
            });
            prevMonthDay++;
        }

        return days;
    }

    /**
     * @returns {Array<Day>}
     * @private
     */
    _getCurrMonthDays () {
        const days = [];

        const currMonthDays = this._getDaysInMonth(this.month);

        // for ex. from 1 to 30
        for (let i = 1; i <= currMonthDays; i++) {
            const date = new Date(this.year, this.month, i);
            const day = date.getDay();
            days.push( /** @type Day */ {
                fullDate: date,
                date: i, // day number
                month: date.getMonth(),
                year: date.getFullYear(),
                day,
                isHoliday: day === 6 || day === 0,
                isToday: this._isToday(date),
            });
        }

        return days;
    }

    /**
     * @returns {Array<Day>}
     * @private
     */
    _getNextMonthDays () {
        const days = [];

        const nextMonth = this.month === 11
            ? 0
            : this.month + 1;

        const nextMonthYear = this.month === 11
            ? this.year + 1
            : this.year;

        const currMonthFirstDay = new Date(this.year, this.month, 1).getDay();
        // (SUN: 6, SAT: 0, MON: 1, ...)
        const prevMonthDaysCount = currMonthFirstDay === 0 ? 6 : currMonthFirstDay - 1;
        const currMonthDaysCount = this._getDaysInMonth(this.month);
        const needDays = Calendar.cellsCount - prevMonthDaysCount - currMonthDaysCount;

        for (let i = 1; i <= needDays; i++) {
            const date = new Date(nextMonthYear, nextMonth, i);
            const day = date.getDay();
            days.push( /** @type Day */ {
                fullDate: date,
                date: i,
                month: date.getMonth(),
                year: date.getFullYear(),
                day,
                isHoliday: day === 6 || day === 0,
                isToday: this._isToday(date),
            });
        }

        return days;
    }

    /**
     * @param {number} monthIndex
     * @returns {number}
     * @private
     */
    _getDaysInMonth (monthIndex) {
        return [31, this._isLeapYear(this.year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][monthIndex];
    }

    /**
     * @param {number} year
     * @returns {boolean}
     */
    _isLeapYear (year) {
        return !(year % 4 !== 0 || year % 100 === 0 && year % 400 !== 0);
    }

    /**
     * @param {Date} date
     * @return {boolean}
     */
    _isToday (date) {
        return this._isEqualDates(this.today, date);
    }

    /**
     * @param {Date} one
     * @param {Date} another
     * @return {boolean}
     */
    _isEqualDates (one, another) {
        return !!(one.getFullYear() === another.getFullYear()
            && one.getMonth() === another.getMonth()
            && one.getDate() === another.getDate());
    }

    /**
     * @param {Date} dateObj
     * @private
     */
    _dateToStr (dateObj) {
        const year = dateObj.getFullYear().toString();
        const month = (dateObj.getMonth() + 1) < 9 ? '0' + (dateObj.getMonth() + 1) : (dateObj.getMonth() + 1).toString();
        const date = dateObj.getDate() < 9 ? '0' + dateObj.getDate() : dateObj.getDate().toString();
        return `${year}-${month}-${date}`;
    }

}

Calendar.CHANGE_MONTH_ANIMATION_TIME = 0.2;