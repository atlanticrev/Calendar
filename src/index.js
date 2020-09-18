import './scss/index.scss';
import './styles.css';

import { i18n } from '../locale';
import Component from "./Component";

class Calendar extends Component {

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

        this.today = new Date();

        this.date = null;
        if (options && options.date) {
            this.date = new Date(options.date);
        } else {
            this.date = this.today;
        }

        this.state = {
            status: "selecting",
            year: this.date.getFullYear(),
            month: this.date.getMonth(),
            day: this.date.getDay(),
            rangeStartEl: null,
            rangeStopEl: null
        };
        this.state.days = this.getDays();

        this.el = this.html(`
            <div class="calendar">
                <div class="date-container">
                    <span class="month">${this.state.month}</span>
                    <span class="year">${this.state.year}</span>
                    <div class="left-controller" data-direction="l"></div>
                    <div class="right-controller" data-direction="r"></div>
                </div>
                <dav class="days-names">
                    <span class="day-name">${i18n('month.mon')}</span>
                    <span class="day-name">${i18n('month.tue')}</span>
                    <span class="day-name">${i18n('month.wed')}</span>
                    <span class="day-name">${i18n('month.thu')}</span>
                    <span class="day-name">${i18n('month.fri')}</span>
                    <span class="day-name">${i18n('month.sun')}</span>
                    <span class="day-name">${i18n('month.sat')}</span>
                </dav>
                <div class="days-viewport">
                    <div class="days-scroll-wrapper"></div>
                </div>
            </div>
        `);

        this.monthEl = this.el.querySelector('.month');
        this.yearEl = this.el.querySelector('.year');
        this.daysScrollWrapperEl = this.el.querySelector('.days-scroll-wrapper');
        this.leftCtrlEl = this.el.querySelector('.left-controller');
        this.rightCtrlEl = this.el.querySelector('.right-controller');

        this.onDayClick = this.onDayClick.bind(this);
        this.onCtrlClick = this.onCtrlClick.bind(this);

        this.leftCtrlEl.addEventListener('click', this.onCtrlClick);
        this.rightCtrlEl.addEventListener('click', this.onCtrlClick);
        this.daysScrollWrapperEl.addEventListener('click', this.onDayClick);

        this.render();
        this.append();
    }

    // @todo Упростить
    getDays () {
        const days = [];

        // Days of current month
        const daysInMonth = this._getDaysInMonth(this.state.month);
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(this.state.year, this.state.month, i);
            const day = date.getDay();
            days.push({
                text: `${i}`,
                day: day,
                date: i,
                month: date.getMonth(),
                year: date.getFullYear(),
                isHoliday: day === 6 || day === 0,
                isToday: this._isToday(date)
            });
        }

        // Days of prev month
        let prevMonth;
        let prevMonthYear;
        if (this.state.month === 0) {
            prevMonth = 11;
            prevMonthYear = this.state.year - 1;
        } else {
            prevMonth = this.state.month - 1;
            prevMonthYear = this.state.year;
        }
        let prevMonthDay = this._getDaysInMonth(prevMonth);

        const firstDay = days[0].day === 0 ? 7 : days[0].day;
        let needDays = firstDay - 1;

        for (let i = 0; i < needDays; i++) {
            const date = new Date(prevMonthYear, prevMonth, prevMonthDay);
            const day = date.getDay();
            days.unshift({
                text: `${prevMonthDay}`,
                day: day,
                date: prevMonthDay,
                month: date.getMonth(),
                year: date.getFullYear(),
                isHoliday: day === 6 || day === 0,
                isToday: this._isToday(date)
            });
            prevMonthDay--;
        }

        // Days of succ month
        let succMonth;
        let succMonthYear;
        if (this.state.month === 11) {
            succMonth = 0;
            succMonthYear = this.state.year + 1;
        } else {
            succMonth = this.state.month + 1;
            succMonthYear = this.state.year;
        }
        needDays = Calendar.cellsCount - days.length;

        for (let i = 1; i <= needDays; i++) {
            const date = new Date(succMonthYear, succMonth, i);
            const day = date.getDay();
            days.push({
                text: `${i}`,
                day: day,
                date: i,
                month: date.getMonth(),
                year: date.getFullYear(),
                isHoliday: day === 6 || day === 0,
                isToday: this._isToday(date)
            });
        }

        return days;
    }

    onDayClick (e) {
        let dayEl;
        for (let el of e.composedPath()) {
            if (el.classList && el.classList.contains('day')) {
                dayEl = el;
            }
        }
        if (dayEl.classList.contains('inactive')) {
            return;
        }
        this.state.rangeStartEl && this.state.rangeStartEl.classList.remove('in-range');
        this.state.rangeStartEl = dayEl;
        this.state.rangeStartEl.classList.add('in-range');

        const date = this.state.days[dayEl.dataset.index];
        console.warn(new Date(date.year, date.month, date.date));
    }

    render (options) {
        super.render();
        // Fill Year/Month display
        this.monthEl.textContent = Calendar.monthNames[this.state.month];
        this.yearEl.textContent = this.state.year.toString();

        // Create days container
        const daysContainerEl = document.createElement('div');
        daysContainerEl.className = 'days-container';

        // Fill days container
        this.state.days.forEach((day, i) => {
            daysContainerEl.appendChild(this.html(`
                <div class="day ${day.month === this.state.month ? 'active' : 'inactive'} ${day.isHoliday ? 'holiday' : ''} ${day.isToday ? 'today' : ''}" data-index="${i}">${day.text}</div>
            `));
        });

        // Add days container to the DOM
        // If there are no containers
        if (!this.daysScrollWrapperEl.children.length) {
            this.daysScrollWrapperEl.appendChild(daysContainerEl);
            // Change containers (animation)
        } else {
            const prevContainer = this.daysScrollWrapperEl.firstElementChild;

            const transitionTime = 0.1;

            const onTransitionEnd = () => {
                this.daysScrollWrapperEl.removeEventListener('transitionend', onTransitionEnd, false);
                this.daysScrollWrapperEl.removeChild(prevContainer);
                this.daysScrollWrapperEl.style.transition = '';
                this.daysScrollWrapperEl.style.transform = 'translate3d(0, 0, 0)';
                delete this.isAnimating;
            };
            this.daysScrollWrapperEl.addEventListener('transitionend', onTransitionEnd, false);

            if (options.direction === 'l') {
                this.daysScrollWrapperEl.insertBefore(daysContainerEl, prevContainer);
                this.daysScrollWrapperEl.style.transform = 'translate3d(-100%, 0, 0)';
            } else if (options.direction === 'r') {
                this.daysScrollWrapperEl.style.transform = 'translate3d(0, 0, 0)';
                this.daysScrollWrapperEl.appendChild(daysContainerEl);
            }

            requestAnimationFrame(() =>
                requestAnimationFrame( () => {
                    this.daysScrollWrapperEl.style.transition = `transform ${transitionTime}s ease-out`;
                    if (options.direction === 'l') {
                        this.daysScrollWrapperEl.style.transform = `translate3d(0, 0, 0)`;
                    } else if (options.direction === 'r') {
                        this.daysScrollWrapperEl.style.transform = `translate3d(-100%, 0, 0)`;
                    }
                }));
        }
    }

    onCtrlClick (e) {
        if (this.isAnimating) {
            return;
        } else {
            this.isAnimating = true;
        }

        const direction = e.target.dataset.direction;

        let newYear = this.state.year;
        let newMonth = this.state.month;
        if (direction === 'l') {
            if (newMonth === 0) {
                newMonth = 11;
                newYear--;
            } else {
                newMonth = this.state.month - 1;
            }
        } else if (direction === 'r') {
            if (newMonth === 11) {
                newMonth = 0;
                newYear++;
            } else {
                newMonth = this.state.month + 1;
            }
        }

        this.updateState({year: newYear, month: newMonth});
        this.render({direction: direction});
    }

    updateState (newState) {
        this.state = Object.assign({}, this.state, newState);
        this.state.days = this.getDays();
    }

    _getDaysInMonth (month) {
        return [31, this._isLeapYear(this.state.year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    }

    /**
     * @param {number} year
     * @returns {boolean}
     */
    _isLeapYear (year) {
        return !(year % 4 !== 0 || year % 100 === 0 && year % 400 !== 0)
    }

    /**
     * @param {Date} date
     * @return {boolean}
     */
    _isToday (date) {
        return !!(this.today.getFullYear() === date.getFullYear()
            && this.today.getMonth() === date.getMonth()
            && this.today.getDate() === date.getDate());
    }

}

const calendar = new Calendar();
// const calendar = new Calendar({date: '1990, 3, 4'});