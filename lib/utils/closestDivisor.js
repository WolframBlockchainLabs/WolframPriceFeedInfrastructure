function closestDivisor(num, target) {
    return target % num === 0 ? num : closestDivisor(++num, target);
}

export default closestDivisor;
