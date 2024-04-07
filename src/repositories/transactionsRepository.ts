import config from '@/common/utils/config';
import { DB } from '@/common/utils/db';
import { Transactions } from '@/models/transaction';
import _ from 'lodash';
import SqlString from 'sqlstring';

class TrasnactionRepository {
	private readonly table = config.tables.transaction;
	private readonly insert = 'insert into ' + config.tables.transaction;

	insertTransaction = async (input: Transactions) => {
		return await DB.updateAndGetTxn<Transactions>(
			[
				SqlString.format(this.insert + ' set ?', [
					_.omit(input.data, 'id'),
				]),
			],
			SqlString.format('select * from ?? where txnId = ?', [
				this.table,
				input.data.txnId,
			]),
			Transactions,
		);
	};

	getAllTransactions = async (input: { offset: number; limit: number }) => {
		return DB.all<Transactions>(
			SqlString.format('select * from ?? where id > ? limit ?', [
				this.table,
				input.offset,
				input.limit,
			]),
			Transactions,
		);
	};
}

export default new TrasnactionRepository();
