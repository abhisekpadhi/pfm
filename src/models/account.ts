import { z } from 'zod';
import { AuditableSchema, BaseDTO } from './base';

export const NamespaceSchema = AuditableSchema.extend({
	namespaceId: z.string().default(''),
});

const UUIDSchema = z.string().length(36).default('');

export const UserAccountSchema = NamespaceSchema.extend({
	userId: UUIDSchema,
	phone: z.string().default(''),
	name: z.string().default(''),
	currency: z.string().default(''),
});
export type TUserAccount = z.infer<typeof UserAccountSchema>;
export class UserAccount extends BaseDTO<TUserAccount> {
	constructor(init: Partial<TUserAccount>) {
		super(UserAccountSchema.parse(init));
	}
}

// net balance over time period: get last entry from Transactions table, do opening balance +- amount
export const TransactionSchema = NamespaceSchema.extend({
	txnId: UUIDSchema,
	userId: UserAccountSchema.pick({ userId: true }),
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

// total income, expense
export const BalanceSchema = NamespaceSchema.extend({
	userId: UserAccountSchema.pick({ userId: true }),
	totalIncome: z.number().default(0),
	totalExpense: z.number().default(0),
});
export type TBalance = z.infer<typeof BalanceSchema>;
export class Balance extends BaseDTO<TBalance> {
	constructor(init: Partial<TBalance>) {
		super(BalanceSchema.parse(init));
	}
}
