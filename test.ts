const dayjs = require('dayjs');

(async () => {
	const currentMonth = `${dayjs().month()}-${dayjs().year()}`;
	const lastMonth = `${dayjs().subtract(1, 'month').month()}-${dayjs().subtract(1, 'month').year()}`;

	console.log(currentMonth);
	console.log(lastMonth);
})();
