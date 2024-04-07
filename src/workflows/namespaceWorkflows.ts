import { ApiUtils } from '@/common/utils/apiUtils';
import config from '@/common/utils/config';
import { LOG } from '@/common/utils/logger';
import { Namespace, TNamespaceUpdateReq } from '@/models/namepsace';
import namespaceRepository from '@/repositories/namespaceRepository';
import { StatusCodes } from 'http-status-codes';

const repo = namespaceRepository;

class NamespaceWorkflow {
	createNamespace = async (input: TNamespaceUpdateReq) => {
		const newData = new Namespace({ namespaceId: input.namespaceId });
		try {
			const existing = await repo.get(input.namespaceId);

			if (existing != null && existing.data.namespaceId.length > 0) {
				return ApiUtils.makeResponse(
					true,
					StatusCodes.OK,
					existing.data,
				);
			}
			const fromDB = await repo.insertAndGet(newData);
			return ApiUtils.makeResponse(
				true,
				StatusCodes.CREATED,
				fromDB.data,
			);
		} catch (error) {
			console.log(error);
			LOG.info({
				msg: 'failed to insert & get namespace',
				input,
				error,
			});
			return config.response.serverError;
		}
	};

	getNamespace = async (input: { namespaceId: string }) => {
		const fromDB = await repo.get(input.namespaceId);
		if (fromDB === null) {
			return config.response.notFound;
		}
		return ApiUtils.makeResponse(true, StatusCodes.OK, fromDB.data);
	};
}

export default new NamespaceWorkflow();
