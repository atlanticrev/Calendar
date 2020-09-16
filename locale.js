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
    }
};

export function i18n(string) {
    const lang = navigator.language.slice(0, 2);
    if (locale[string]) {
        return locale[string][lang];
    }
}