import { LOG } from '@/common/utils/logger';
import analyticsWorkflows from '@/workflows/analyticsWorkflows';
import { CronJob } from 'cron';
export default CronJob.from({
	cronTime: '*/5 * * * * *', // every second
	onTick: async function () {
		LOG.info({ msg: 'analytics job started' });
		await analyticsWorkflows.aggregate();
		LOG.info({ msg: 'analytics job completed' });
	},
	timeZone: 'Asia/Kolkata',
});
