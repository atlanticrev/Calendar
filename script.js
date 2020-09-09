const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

`
January – Jan.
February – Feb.
March – Mar.
April – Apr.
May – May
June – Jun.
July – Jul.
August – Aug.
September – Sep. or Sept.
October – Oct.
November – Nov.
December – Dec.
`

const months = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11
};

const monthNames = [
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

function isLeapYear (year) {
    return !(year % 4 !== 0 || year % 100 === 0 && year % 400 !== 0)
}

/**
 * @param {string} string
 */
function createTemplate (string) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = string.trim();
    return wrapper.firstElementChild;
}

// Models
let year = 2018;
let month = months.jul;

// Fix leap year
isLeapYear(year) && (daysInMonths[1] = 29);

let days = [];

for (let i = 1; i <= daysInMonths[month]; i++) {
    const date = new Date(year, month, i);
    const day = date.getDay();
    days.push({
        index: i,
        text: `${i}`,
        day: day,
        isHoliday: day === 6 || day === 0,
    });
}

// Views
const daysContainer = document.querySelector('.days');

const monthYear = document.querySelector('.month-year');
monthYear.textContent = `${monthNames[month]} ${year}`;

for (let day of days) {
    if (!daysContainer.children.length) {
        const dayIndex = day.day === 0 ? 7 : day.day;
        for (let i = 0; i < dayIndex - 1; i++) {
            const el = createTemplate(`<div class="day inactive"></div>`);
            daysContainer.appendChild(el);
        }
    }
    const el = createTemplate(`<div class="day active ${day.isHoliday ? 'holiday' : ''}">${day.text}</div>`);
    daysContainer.appendChild(el);
}