import { ApiUtils } from '@/common/utils/apiUtils';
import config from '@/common/utils/config';
import cache from '@/common/utils/redisUtils';
import { Analytics, AnalyticsSchema, TAnalytics } from '@/models/analytics';
import transactionsRepository from '@/repositories/transactionsRepository';
import dayjs from 'dayjs';
import { StatusCodes } from 'http-status-codes';
import _ from 'lodash';

class AnalyticsWorkflow {
	private readonly txnRepo = transactionsRepository;
	getAnalytics = async (input: { userId: string; namespaceId: string }) => {
		const key = config.redisKeyAnalytics(input.userId, input.namespaceId);
		const redisData = await cache.get(key);
		if (redisData && redisData.length > 0) {
			const data = AnalyticsSchema.parse(JSON.parse(redisData));
			return ApiUtils.makeResponse(true, StatusCodes.OK, data);
		}
		return ApiUtils.makeResponse(
			true,
			StatusCodes.OK,
			new Analytics({
				userId: input.userId,
				namespaceId: input.namespaceId,
			}).data,
		);
	};

	// update in redis
	updateAnalytics = async (input: TAnalytics) => {
		const key = config.redisKeyAnalytics(input.userId, input.namespaceId);
		const value = JSON.stringify(input);
		await cache.set(key, value);
	};

	updateAnalyticsDelta = async (input: {
		[userId: string]: {
			expense: number;
			income: number;
			monthlyBalanceMap: { [month: string]: number };
		};
	}) => {
		const currentMonthYear = `${dayjs().month()}-${dayjs().year()}`;
		const lastMonthYear = `${dayjs().subtract(1, 'month').month()}-${dayjs().subtract(1, 'month').year()}`;

		for (const key of Object.keys(input)) {
			const namespaceId = key.split(':')[0];
			const userId = key.split(':')[1];
			const redisKey = config.redisKeyAnalytics(userId, namespaceId);
			const cached = await cache.get(redisKey);
			const analyticsData =
				cached.length > 0 && cached != null
					? AnalyticsSchema.parse(JSON.parse(cached))
					: new Analytics({
							userId,
							namespaceId,
							currentMonthYear,
							lastMonthYear,
						}).data;

			// update income & expense
			analyticsData.totalExpense += input[userId].expense;
			analyticsData.totalIncome += input[userId].income;

			// update last month & current month balance
			if (analyticsData.currentMonthYear != currentMonthYear) {
				(analyticsData.netBalanceCurrMonth =
					input[userId].monthlyBalanceMap[currentMonthYear] ?? 0),
					(analyticsData.currentMonthYear = currentMonthYear);
			} else {
				analyticsData.netBalanceCurrMonth +=
					input[userId].monthlyBalanceMap[currentMonthYear] ?? 0;
			}

			if (analyticsData.lastMonthYear != lastMonthYear) {
				(analyticsData.netBalanceLastMonth =
					input[userId].monthlyBalanceMap[lastMonthYear] ?? 0),
					(analyticsData.lastMonthYear = lastMonthYear);
			} else {
				analyticsData.netBalanceLastMonth +=
					input[userId].monthlyBalanceMap[lastMonthYear] ?? 0;
			}
			await this.updateAnalytics(analyticsData);
		}
	};

	aggregate = async () => {
		// fetch offset from redis
		let offset = parseInt(
			(await cache.get(config.redisKeyForTxnTableIdOffset)) ?? '0',
			10,
		);
		const limit = 100;
		// read chunked from txn table
		let records = await this.txnRepo.getAllTransactions({ offset, limit });
		const aggregatedData = {};
		while (records.length > 0) {
			// aggregate data & write to redis
			const groupedByUserId = _.groupBy(
				records.map((it) => it.data),
				(o) => `${o.namespaceId}:${o.userId}`,
			);
			Object.keys(groupedByUserId).forEach((userId) => {
				const txns = groupedByUserId[userId];
				let expense = 0;
				let income = 0;
				const monthlyBalanceMap = {};

				txns.forEach((txn) => {
					const txnMonth = dayjs(txn.createdAt).format('MM-YYYY');

					if (!(txnMonth in monthlyBalanceMap)) {
						monthlyBalanceMap[txnMonth] = 0;
					}

					if (txn.type === 'expense') {
						expense += txn.amount;
						monthlyBalanceMap[txnMonth] -= txn.amount;
					}
					if (txn.type === 'income') {
						income += txn.amount;
						monthlyBalanceMap[txnMonth] += txn.amount;
					}
				});
				aggregatedData[userId] = { expense, income, monthlyBalanceMap };
			});
			offset += limit;
			records = await this.txnRepo.getAllTransactions({ offset, limit });
		}

		// continue reading from db until no more rows, then commit offset to redis
		await this.updateAnalyticsDelta(aggregatedData);
		await cache.set(config.redisKeyForTxnTableIdOffset, offset.toString());
	};
}

export default new AnalyticsWorkflow();
