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

    constructor () {
        this.monthNames = [
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
        this.today = new Date();
        this.year = this.today.getFullYear();
        this.month = this.today.getMonth();

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
            });
        }

        this.container = this.createDomEl(`
            <div class="container">
                <div class="month-year-container">
                    <span class="month">july</span>
                    <span class="year">2020</span>
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

        this.render();
        this.append();
    }

    render () {
        this.monthEl.textContent = this.monthNames[this.month];
        this.yearEl.textContent = this.year;

        for (let day of this.days) {
            if (!this.daysEl.children.length) {
                const dayIndex = day.day === 0 ? 7 : day.day;
                for (let i = 0; i < dayIndex - 1; i++) {
                    this.daysEl.appendChild(this.createDomEl(`<div class="day inactive"></div>`));
                }
            }
            this.daysEl.appendChild(this.createDomEl(`<div class="day active ${day.isHoliday ? 'holiday' : ''}">${day.text}</div>`));
        }
    }

    append () {
        document.body.appendChild(this.container);
    }

    /**
     * @param {string} string
     * @return {Element}
     */
    createDomEl (string) {
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

}

const calendar = new Calendar();