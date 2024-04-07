import { z } from 'zod';
import { UserAccountSchema } from './account';
import { BaseDTO, UUIDSchema } from './base';
import { NamespaceSchema } from './namepsace';

// net balance over time period: get last entry from Transactions table, do opening balance +- amount
export const TransactionSchema = NamespaceSchema.extend({
	txnId: UUIDSchema,
	userId: UUIDSchema,
	amount: z.number().default(0),
	type: z.enum(['income', 'expense'] as const).default('income'),
	category: z.string().default(''),
	description: z.string().default(''),
	openingBalance: z.number().default(0),
});
export type TTxn = z.infer<typeof TransactionSchema>;
export class Transactions extends BaseDTO<TTxn> {
	constructor(init: Partial<TTxn>) {
		super(TransactionSchema.parse(init));
	}
}

export const TransactionUpdateReqSchema = TransactionSchema.pick({
	amount: true,
	type: true,
	category: true,
	description: true,
});
export type TTransactionUpdateReq = z.infer<typeof TransactionUpdateReqSchema>;
