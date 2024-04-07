import { ApiUtils } from '@/common/utils/apiUtils';
import config from '@/common/utils/config';
import { LOG } from '@/common/utils/logger';
import { TPrincipal } from '@/models/account';
import { TTransactionUpdateReq, Transactions } from '@/models/transaction';
import transactionsRepository from '@/repositories/transactionsRepository';
import { randomUUID } from 'crypto';
import { StatusCodes } from 'http-status-codes';

class TransactionWorkflows {
	private readonly repo = transactionsRepository;

	recordTransaction = async (input: TTransactionUpdateReq & TPrincipal) => {
		try {
			const newData = await this.repo.insertTransaction(
				new Transactions({
					...input,
					txnId: randomUUID(),
					createdAt: Date.now(),
				}),
			);
			return ApiUtils.makeResponse(true, StatusCodes.OK, newData);
		} catch (e) {
			LOG.info({
				msg: 'Error in recording transaction',
				input,
				error: e,
			});
			return config.response.serverError;
		}
	};
}

export default new TransactionWorkflows();
