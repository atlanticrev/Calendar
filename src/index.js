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

    constructor () {
        this.today = new Date();

        this.year = this.today.getFullYear();
        this.month = this.today.getMonth();
        this.day = this.today.getDay();

        this.daysInMonths = this.getDaysInMonths();
        this.daysInMonth = this.daysInMonths[this.month];

        this.days = [];
        for (let i = 1; i <= this.daysInMonth; i++) {
            const date = new Date(this.year, this.month, i);
            const day = date.getDay();
            this.days.push({
                index: i,
                text: `${i}`,
                day: day,
                isHoliday: day === 6 || day === 0,
                isToday: this.isToday(date)
            });
        }

        this.state = {
            status: "selecting",
            rangeStartEl: null,
            rangeStopEl: null,
        };

        this.container = this.html(`
            <div class="container">
                <div class="month-year-container">
                    <span class="month">${this.month}</span>
                    <span class="year">${this.year}</span>
                    <div class="controllers"></div>
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
                <div class="days"></div>
            </div>
        `);

        this.monthEl = this.container.querySelector('.month');
        this.yearEl = this.container.querySelector('.year');
        this.daysEl = this.container.querySelector('.days');

        this.onDayClick = this.onDayClick.bind(this);

        this.daysEl.addEventListener('click', this.onDayClick);

        this.render();
        this.append();
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

    render () {
        this.monthEl.textContent = Calendar.monthNames[this.month];
        this.yearEl.textContent = this.year;

        for (let day of this.days) {
            if (!this.daysEl.children.length) {
                const dayIndex = day.day === 0 ? 7 : day.day;
                for (let i = 0; i < dayIndex - 1; i++) {
                    this.daysEl.appendChild(this.html(`<div class="day inactive"></div>`));
                }
            }
            this.daysEl.appendChild(this.html(`
                <div class="day active ${day.isHoliday ? 'holiday' : ''} ${day.isToday ? 'today' : ''}" data-index="${day.index}">${day.text}</div>
            `));
        }
    }

    append (root = document.body) {
        root.appendChild(this.container);
    }

    remove () {
        this.container.parentElement.removeChild(this.container);
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

    getDaysInMonths () {
        return [31, this.isLeapYear(this.year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
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