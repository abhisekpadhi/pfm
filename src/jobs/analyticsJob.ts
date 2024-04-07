import { CronJob } from 'cron';
export default CronJob.from({
	cronTime: '* * * * * *', // every second
	onTick: function () {
		// console.log('You will see this message every second');
	},
	timeZone: 'Asia/Kolkata',
});
