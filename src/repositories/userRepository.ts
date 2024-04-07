import config from '@/common/utils/config';
import { DB } from '@/common/utils/db';
import { UserAccount } from '@/models/account';
import _ from 'lodash';
import SqlString from 'sqlstring';

class UserAccountRepository {
	private readonly table = config.tables.userAccount;
	private readonly insert = 'insert into ' + this.table;

	insertAndGetAccount = async (input: UserAccount) => {
		return await DB.updateAndGetTxn<UserAccount>(
			[
				SqlString.format(this.insert + ' set ?', [
					_.omit(input.data, 'id'),
				]),
			],
			SqlString.format('select * from ?? where userId = ?', [
				this.table,
				input.data.userId,
			]),
			UserAccount,
		);
	};

	getUserByUserId = async (input: { userId: string }) => {
		return await DB.get<UserAccount>(
			SqlString.format('select * from ?? where userId = ? ', [
				input.userId,
			]),
			UserAccount,
		);
	};

	getUserByEmail = async (input: { email: string, namespaceId: string }) => {
		return await DB.get<UserAccount>(
			SqlString.format('select * from ?? where email = ? and namespaceId =? ', [
				this.table,
				input.email,
				input.namespaceId
			]),
			UserAccount,
		);
	};
}

export default new UserAccountRepository();
