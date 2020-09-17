const locale = {
    "month.mon": {
        en: "mon",
        ru: "пн"
    },
    "month.tue": {
        en: "tue",
        ru: "вт"
    },
    "month.wed": {
        en: "wed",
        ru: "ср"
    },
    "month.thu": {
        en: "thu",
        ru: "чт"
    },
    "month.fri": {
        en: "fri",
        ru: "пт"
    },
    "month.sun": {
        en: "sun",
        ru: "сб"
    },
    "month.sat": {
        en: "sat",
        ru: "вс"
    },
    "month.names": [
        {
            en: "January",
            ru: "январь"
        },
        {
            en: "February",
            ru: "февраль"
        },
        {
            en: "March",
            ru: "март"
        },
        {
            en: "April",
            ru: "апрель"
        },
        {
            en: "May",
            ru: "май"
        },
        {
            en: "June",
            ru: "июнь"
        },
        {
            en: "July",
            ru: "июль"
        },
        {
            en: "August",
            ru: "август"
        },
        {
            en: "September",
            ru: "сентябрь"
        },
        {
            en: "October",
            ru: "октябрь"
        },
        {
            en: "November",
            ru: "ноябрь"
        },
        {
            en: "December",
            ru: "декабрь"
        }
    ]
};

export function i18n(string) {
    const lang = navigator.language.slice(0, 2);
    if (locale[string]) {
        return locale[string][lang];
    }
}