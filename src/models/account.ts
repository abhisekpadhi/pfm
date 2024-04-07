import { string, z } from 'zod';
import { BaseDTO, UUIDSchema } from './base';
import { NamespaceSchema } from './namepsace';
import config from '@/common/utils/config';

export const UserAccountSchema = NamespaceSchema.extend({
	userId: UUIDSchema,
	email: z.string().email(),
	name: z.string().min(3).max(64),
	currency: z.string().length(3).default('INR'),
});
export type TUserAccount = z.infer<typeof UserAccountSchema>;
export class UserAccount extends BaseDTO<TUserAccount> {
	constructor(init: Partial<TUserAccount>) {
		super(UserAccountSchema.parse(init));
	}
}

export const UserAccountRegisterReqSchema = UserAccountSchema.pick({
	namespaceId: true,
	email: true,
	name: true,
	currency: true,
});
export type TUserAccountRegisterReq = z.infer<
	typeof UserAccountRegisterReqSchema
>;

export const UserAccountLoginOTPReqSchema = UserAccountSchema.pick({
	namespaceId: true,
	email: true,
});
export type TUserAccountLoginOTPReq = z.infer<
	typeof UserAccountLoginOTPReqSchema
>;

export const UserAccountLoginReqSchema = UserAccountSchema.pick({
	email: true,
	namespaceId: true,
}).extend({ otp: z.string().length(config.otpLen) });
export type TUserAccountLoginReq = z.infer<typeof UserAccountLoginReqSchema>;


export type TPrincipal = { userId: string; namespaceId: string }