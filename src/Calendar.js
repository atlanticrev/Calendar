import BaseComponent from "./BaseComponent";

export default class Calendar extends BaseComponent {

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

        // Model section
        this.today = new Date();

        this.dateOrigin = (options && options.date)
            ? new Date(options.date)
            : this.today;

        this.month = this.dateOrigin.getMonth();
        this.year = this.dateOrigin.getFullYear();
        this.days = this.getDays();

        // View section
        this.focusDayEl = null;
        this.isAnimating = false;

        // Default template
        this.el = this.html(`
            <div class="container">
                <div class="calendar">
                    <div class="date-container">
                        <span class="month">${this.month}</span>
                        <span class="year">${this.year}</span>
                        <div class="left-controller" data-direction="l"></div>
                        <div class="right-controller" data-direction="r"></div>
                    </div>   
                    <dav class="days-names">
                        <span class="day-name">mon</span>
                        <span class="day-name">tue</span>
                        <span class="day-name">wed</span>
                        <span class="day-name">thu</span>
                        <span class="day-name">fri</span>
                        <span class="day-name">sat</span>
                        <span class="day-name">sun</span>
                    </dav>               
                    <div class="days-viewport">
                        <div class="days-scroll-wrapper"></div>
                    </div>
                </div>
            </div>
        `);

        // Elements
        this.monthEl = this.el.querySelector('.month');
        this.yearEl = this.el.querySelector('.year');
        this.leftCtrlEl = this.el.querySelector('.left-controller');
        this.rightCtrlEl = this.el.querySelector('.right-controller');
        this.daysScrollWrapperEl = this.el.querySelector('.days-scroll-wrapper');

        // Listeners
        this.onDayClick = this.onDayClick.bind(this);
        this.onCtrlClick = this.onCtrlClick.bind(this);

        this.leftCtrlEl.addEventListener('click', this.onCtrlClick);
        this.rightCtrlEl.addEventListener('click', this.onCtrlClick);
        this.daysScrollWrapperEl.addEventListener('click', this.onDayClick);

        this.init();
    }

    init () {
        this.render();
        this.mount();
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
        if (e.target.classList.contains('day')) {
            this.focusDayEl = e.target;
        } else {
            this.focusDayEl = null;
        }
    }

    render (options) {
        super.render();

        // Fill Year/Month rows
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
            // Linking model with template
            dayEl['model'] = day;
            day['template'] = dayEl;
            // Date
            dayEl.textContent = day.date.toString();
            newDaysContainerEl.appendChild(dayEl);
        }

        // Adding days container to the DOM, If there are no containers yet, add first
        if (!this.daysScrollWrapperEl.children.length) {
            this.daysScrollWrapperEl.appendChild(newDaysContainerEl);
        // Change containers (with animation)
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
     * @protected
     * @returns {Array<Day>}
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
     * @protected
     * @returns {Array<Day>}
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
     * @protected
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
     * @protected
     * @param {number} monthIndex
     * @returns {number}
     */
    _getDaysInMonth (monthIndex) {
        return [31, this._isLeapYear(this.year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][monthIndex];
    }

    /**
     * @protected
     * @param {number} year
     * @returns {boolean}
     */
    _isLeapYear (year) {
        return !(year % 4 !== 0 || year % 100 === 0 && year % 400 !== 0);
    }

    /**
     * @protected
     * @param {Date} date
     * @return {boolean}
     */
    _isToday (date) {
        return this._isEqualDates(this.today, date);
    }

    /**
     * @protected
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
     * @protected
     * @param {Date} dateObj
     */
    _dateToStr (dateObj) {
        const year = dateObj.getFullYear().toString();
        const month = (dateObj.getMonth() + 1) <= 9 ? '0' + (dateObj.getMonth() + 1) : (dateObj.getMonth() + 1).toString();
        const date = dateObj.getDate() <= 9 ? '0' + dateObj.getDate() : dateObj.getDate().toString();
        return `${year}-${month}-${date}`;
    }

}

Calendar.CHANGE_MONTH_ANIMATION_TIME = 0.2;