function median(numbers) {
    if (numbers.length === 0) return null;

    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    const half = Math.floor(sortedNumbers.length / 2);

    return sortedNumbers[half];
}

export default median;
