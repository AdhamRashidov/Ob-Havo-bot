const weekdayNames = [
    "Yakshanba",
    "Dushanba",
    "Seshanba",
    "Chorshanba",
    "Payshanba",
    "Juma",
    "Shanba"
];
export function normalizeCityQuery(input) {
    return input
        .trim()
        .replace(/[’`]/g, "'")
        .replace(/\s+/g, " ");
}
export function toPrettyDate(dateText) {
    const date = new Date(dateText);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}.${date.getFullYear()}`;
}
export function getDayLabel(dateText, index) {
    if (index === 0) {
        return "Bugun";
    }
    if (index === 1) {
        return "Ertaga";
    }
    const date = new Date(dateText);
    return weekdayNames[date.getDay()];
}
