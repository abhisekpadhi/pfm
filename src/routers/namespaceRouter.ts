import { ApiUtils } from '@/common/utils/apiUtils';
import config from '@/common/utils/config';
import { handleResponse, validateRequest } from '@/common/utils/httpHandlers';
import { LOG } from '@/common/utils/logger';
import { NamespaceUpdateReqSchema } from '@/models/namepsace';
import namespaceWorkflows from '@/workflows/namespaceWorkflows';
import { Router } from 'express';

export const namespaceRouter: Router = (() => {
	const router = Router();
	router.post(
		'/',
		validateRequest(NamespaceUpdateReqSchema),
		async (req, res) => {
			const input = NamespaceUpdateReqSchema.parse(req.body);
			const out = await namespaceWorkflows.createNamespace(input);
			handleResponse(out, res);
		},
	);
	return router;
})();
