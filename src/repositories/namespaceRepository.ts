import config from '@/common/utils/config';
import { DB } from '@/common/utils/db';
import SqlString from 'sqlstring';
import _ from 'lodash';
import { Namespace } from '@/models/namepsace';

class NamespaceRepository {
	private readonly table = config.tables.namespace;
	private readonly insert = `insert into ${this.table}`;

	insertAndGet = async (input: Namespace) => {
		const { namespaceId } = input.data;
		return await DB.updateAndGetTxn<Namespace>(
			[
				SqlString.format(this.insert + ' set ?', [
					_.omit(input.data, 'id'),
				]),
			],
			SqlString.format('select * from ?? where namespaceId = ?', [
				this.table,
				namespaceId,
			]),
			Namespace,
		);
	};

	get = async (nsId: string) => {
		return await DB.get<Namespace>(
			SqlString.format('select * from ?? where namespaceId = ?', [
				this.table,
				nsId,
			]),
			Namespace,
		);
	};
}

export default new NamespaceRepository();
