import { z } from "zod";
import { AuditableSchema, BaseDTO } from "./base";

export const NamespaceSchema = AuditableSchema.extend({
	namespaceId: z.string().min(3).max(36).default(''),
});
export type TNamespace = z.infer<typeof NamespaceSchema>;
export class Namespace extends BaseDTO<TNamespace> {
	constructor(init: Partial<TNamespace>) {
		super(NamespaceSchema.parse(init));
	}
}
export const NamespaceUpdateReqSchema = NamespaceSchema.pick({
	namespaceId: true,
});
export type TNamespaceUpdateReq = z.infer<typeof NamespaceUpdateReqSchema>;
