import { handleResponse, validateRequest } from '@/common/utils/httpHandlers';
import { TransactionUpdateReqSchema } from '@/models/transaction';
import transactionsWorkflows from '@/workflows/transactionsWorkflows';
import { Router } from 'express';

export const transactionsRouter: Router = (() => {
	const router = Router();
	router.post(
		'/',
		validateRequest(TransactionUpdateReqSchema),
		async (req, res) => {
			const input = TransactionUpdateReqSchema.parse(req.body);

			const out = await transactionsWorkflows.recordTransaction({
				...input,
				...(req as any).principal,
			});
			handleResponse(out, res);
		},
	);
	return router;
})();
