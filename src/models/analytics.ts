import { z } from 'zod';
import { BaseDTO, UUIDSchema } from './base';
import { NamespaceSchema } from './namepsace';
import { UserAccountSchema } from './account';

// total income, expense
export const AnalyticsSchema = NamespaceSchema.extend({
	userId: UUIDSchema,
	totalIncome: z.number().default(0),
	totalExpense: z.number().default(0),
	netBalanceCurrMonth: z.number().default(0),
	netBalanceLastMonth: z.number().default(0),
	currentMonthYear: z.string().default(''),
	lastMonthYear: z.string().default(''),
});
export type TAnalytics = z.infer<typeof AnalyticsSchema>;
export class Analytics extends BaseDTO<TAnalytics> {
	constructor(init: Partial<TAnalytics>) {
		super(AnalyticsSchema.parse(init));
	}
}
