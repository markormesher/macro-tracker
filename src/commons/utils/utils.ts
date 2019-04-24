function delayPromise(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function roundToDp(value: number, dp: number): number {
	return Number(value.toFixed(dp));
}

export {
	delayPromise,
	roundToDp,
};
