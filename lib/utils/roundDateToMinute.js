function roundDateToMinute(date) {
    const roundedDate = new Date(date);

    return roundedDate.setSeconds(0, 0);
}

export default roundDateToMinute;
