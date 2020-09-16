import './styles.css';

// `
// January – Jan.
// February – Feb.
// March – Mar.
// April – Apr.
// May – May
// June – Jun.
// July – Jul.
// August – Aug.
// September – Sep. or Sept.
// October – Oct.
// November – Nov.
// December – Dec.
// `

// const months = {
//     jan: 0,
//     feb: 1,
//     mar: 2,
//     apr: 3,
//     may: 4,
//     jun: 5,
//     jul: 6,
//     aug: 7,
//     sep: 8,
//     oct: 9,
//     nov: 10,
//     dec: 11
// };

class Calendar {

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

    constructor () {
        this.today = new Date();

        this.date = this.today;

        this.chosenDate = {
            year: this.date.getFullYear(),
            month: this.date.getMonth(),
            day: this.date.getDay()
        };

        this.state = {
            status: "selecting",
            rangeStartEl: null,
            rangeStopEl: null,
            year: this.chosenDate.year,
            month: this.chosenDate.month,
            days: this.getDays()
        };

        this.el = this.html(`
            <div class="container">
                <div class="month-year-container">
                    <span class="month">${this.chosenDate.month}</span>
                    <span class="year">${this.chosenDate.year}</span>
                    <div class="left-controller" data-direction="l"></div>
                    <div class="right-controller" data-direction="r"></div>
                </div>
                <dav class="day-names">
                    <span class="day-name">mon</span>
                    <span class="day-name">tue</span>
                    <span class="day-name">wed</span>
                    <span class="day-name">thu</span>
                    <span class="day-name">fri</span>
                    <span class="day-name">sun</span>
                    <span class="day-name">sat</span>
                </dav>
                <div class="days">
                    <div class="days-scroll-wrapper"></div>
                </div>
            </div>
        `);

        this.chosenDate.monthEl = this.el.querySelector('.month');
        this.chosenDate.yearEl = this.el.querySelector('.year');

        this.daysScrollWrapperEl = this.el.querySelector('.days > .days-scroll-wrapper');

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

    getDays () {
        const days = [];
        const daysInMonth = this.getDaysInMonths(this.chosenDate.month);
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(this.chosenDate.year, this.chosenDate.month, i);
            const day = date.getDay();
            days.push({
                index: i,
                text: `${i}`,
                day: day,
                isHoliday: day === 6 || day === 0,
                isToday: this.isToday(date)
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
        this.state.rangeStartEl && this.state.rangeStartEl.classList.remove('in-range');
        this.state.rangeStartEl = dayEl;
        this.state.rangeStartEl.classList.add('in-range');
    }

    getDaysFromPrevMonth () {
        const firstDayIndex = this.state.days[0].day === 0 ? 7 : this.state.days[0].day;
        const days = [];
        const monthIndex = this.state.month === 0 ? 11 : this.state.month - 1;
        let lastDayIndex = this.getDaysInMonths(monthIndex);
        const needDays = firstDayIndex - 1;
        for (let i = 0; i < needDays; i++) {
            days.push(lastDayIndex--);
        }
        days.reverse();
        return days;
    }

    getDaysFromSucMonth (daysFromPrevMonth) {
        const days = [];
        const needDays = Calendar.cellsCount - daysFromPrevMonth.length - this.state.days.length;
        for (let i = 0; i < needDays; i++) {
            days.push(i + 1);
        }
        return days;
    }

    render (options) {
        // Fill Year/Month display
        this.chosenDate.monthEl.textContent = Calendar.monthNames[this.state.month];
        this.chosenDate.yearEl.textContent = this.state.year.toString();

        // Create days container
        const daysContainerEl = document.createElement('div');
        daysContainerEl.className = 'days-container';

        // Fill days container
        const daysFromPrevMonth = this.getDaysFromPrevMonth();
        const daysFromSucMonth = this.getDaysFromSucMonth(daysFromPrevMonth);
        // Add days from previous month
        for (let day of daysFromPrevMonth) {
            daysContainerEl.appendChild(this.html(`<div class="day inactive">${day}</div>`));
        }
        // Add days from current month
        for (let day of this.state.days) {
            daysContainerEl.appendChild(this.html(`
                <div class="day active ${day.isHoliday ? 'holiday' : ''} ${day.isToday ? 'today' : ''}" data-index="${day.index}">${day.text}</div>
            `));
        }
        // Add days from successor month
        for (let day of daysFromSucMonth) {
            daysContainerEl.appendChild(this.html(`<div class="day inactive">${day}</div>`));
        }

        // Add days container to the DOM
        // If there are no containers
        if (!this.daysScrollWrapperEl.children.length) {
            this.daysScrollWrapperEl.appendChild(daysContainerEl);
            // Change containers (animation)
        } else {
            const prevContainer = this.daysScrollWrapperEl.firstElementChild;

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
                    this.daysScrollWrapperEl.style.transition = 'transform .3s ease-out';
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
        let newYear = this.chosenDate.year;
        let newMonth;
        if (direction === 'l') {
            newMonth = this.chosenDate.month - 1;
            if (newMonth < 0) {
                newYear--;
                newMonth = 11;
            }
        } else if (direction === 'r') {
            newMonth = this.chosenDate.month + 1;
            if (newMonth > 11) {
                newYear++;
                newMonth = 0;
            }
        }

        this.chosenDate.month = newMonth;
        this.chosenDate.year = newYear;

        this.state = Object.assign({}, this.state,{
            year: this.chosenDate.year,
            month: this.chosenDate.month,
            days: this.getDays()
        });

        this.render({direction: direction});
    }

    append (root = document.body) {
        root.appendChild(this.el);
    }

    remove () {
        this.el.parentElement.removeChild(this.el);
    }

    /**
     * @param {string} string
     * @return {Element}
     */
    html (string) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = string.trim();
        return wrapper.firstElementChild;
    }

    getDaysInMonths (month) {
        return [31, this.isLeapYear(this.chosenDate.year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    }

    /**
     * @param {number} year
     * @returns {boolean}
     */
    isLeapYear (year) {
        return !(year % 4 !== 0 || year % 100 === 0 && year % 400 !== 0)
    }

    /**
     * @param {Date} date
     * @return {boolean}
     */
    isToday (date) {
        return !!(this.today.getFullYear() === date.getFullYear()
            && this.today.getMonth() === date.getMonth()
            && this.today.getDate() === date.getDate());
    }

}

const calendar = new Calendar();