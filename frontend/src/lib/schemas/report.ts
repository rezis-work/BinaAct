import { z } from 'zod';
import type { HandoverReport } from '$lib/types/report';

export const ConditionSchema = z.enum(['GOOD', 'MINOR_DAMAGE', 'DAMAGED', 'NOT_INSPECTED']);

export const InspectionTypeSchema = z.enum(['MOVE_IN', 'MOVE_OUT']);

export const ApartmentDetailsSchema = z.object({
	address: z.string().trim().min(3, 'გთხოვთ მიუთითოთ ბინის სრული მისამართი'),
	apartmentNumber: z.string().trim().optional(),
	notes: z.string().trim().optional()
});

export const PersonDetailsSchema = z.object({
	fullName: z.string().trim().min(2, 'გთხოვთ მიუთითოთ სახელი და გვარი'),
	phone: z.string().trim().optional()
});

export const RoomComponentSchema = z.object({
	name: z.string().trim().min(1),
	condition: ConditionSchema
});

export const RoomInspectionSchema = z.object({
	id: z.string().min(1),
	name: z.string().trim().min(1, 'გთხოვთ მიუთითოთ ოთახის დასახელება'),
	components: z.array(RoomComponentSchema).min(1),
	notes: z.string().trim().optional(),
	photoIds: z.array(z.string()).max(12, 'მაქსიმუმ 12 ფოტო არის დაშვებული')
});

export const InventoryItemSchema = z.object({
	id: z.string().min(1),
	name: z.string().trim().min(1, 'გთხოვთ მიუთითოთ ნივთის დასახელება'),
	quantity: z
		.number()
		.int('რაოდენობა უნდა იყოს მთელი რიცხვი')
		.min(1, 'რაოდენობა უნდა იყოს მინიმუმ 1'),
	condition: ConditionSchema,
	notes: z.string().trim().optional()
});

export const UtilityReadingsSchema = z.object({
	electricity: z.number().nonnegative('მნიშვნელობა არ შეიძლება იყოს უარყოფითი').optional(),
	water: z.number().nonnegative('მნიშვნელობა არ შეიძლება იყოს უარყოფითი').optional(),
	gas: z.number().nonnegative('მნიშვნელობა არ შეიძლება იყოს უარყოფითი').optional()
});

export const KeyHandoverSchema = z.object({
	apartmentKeys: z.number().int().nonnegative('რაოდენობა არ შეიძლება იყოს უარყოფითი').optional(),
	entranceKeys: z.number().int().nonnegative('რაოდენობა არ შეიძლება იყოს უარყოფითი').optional(),
	notes: z.string().trim().optional()
});

export const HandoverReportSchema = z.object({
	id: z.string().min(1),
	type: InspectionTypeSchema,
	apartment: ApartmentDetailsSchema,
	landlord: PersonDetailsSchema,
	tenant: PersonDetailsSchema,
	inspectionDate: z.string().min(1, 'გთხოვთ მიუთითოთ შემოწმების თარიღი'),
	rooms: z.array(RoomInspectionSchema),
	inventory: z.array(InventoryItemSchema),
	utilities: UtilityReadingsSchema,
	keys: KeyHandoverSchema,
	notes: z.string().trim().optional()
});

export const Step1Schema = HandoverReportSchema.pick({
	type: true,
	inspectionDate: true,
	apartment: true,
	landlord: true,
	tenant: true
});

export interface Step1ValidationErrors {
	type?: string;
	address?: string;
	inspectionDate?: string;
	landlordFullName?: string;
	tenantFullName?: string;
}

export interface Step1ValidationResult {
	success: boolean;
	errors: Step1ValidationErrors;
}

export function validateStep1(report: HandoverReport): Step1ValidationResult {
	const parsed = Step1Schema.safeParse({
		type: report.type,
		inspectionDate: report.inspectionDate,
		apartment: report.apartment,
		landlord: report.landlord,
		tenant: report.tenant
	});

	if (parsed.success) {
		return { success: true, errors: {} };
	}

	const errors: Step1ValidationErrors = {};

	for (const issue of parsed.error.issues) {
		const pathStr = issue.path.join('.');
		if (pathStr === 'type' && !errors.type) {
			errors.type = issue.message;
		} else if (pathStr === 'apartment.address' && !errors.address) {
			errors.address = issue.message;
		} else if (pathStr === 'inspectionDate' && !errors.inspectionDate) {
			errors.inspectionDate = issue.message;
		} else if (pathStr === 'landlord.fullName' && !errors.landlordFullName) {
			errors.landlordFullName = issue.message;
		} else if (pathStr === 'tenant.fullName' && !errors.tenantFullName) {
			errors.tenantFullName = issue.message;
		}
	}

	return {
		success: false,
		errors
	};
}

export interface FullReportValidationResult {
	success: boolean;
	errors: Record<string, string>;
}

export function validateFullReport(report: HandoverReport): FullReportValidationResult {
	const parsed = HandoverReportSchema.safeParse(report);
	const errors: Record<string, string> = {};

	if (!parsed.success) {
		for (const issue of parsed.error.issues) {
			const pathStr = issue.path.join('.') || 'report';
			if (!errors[pathStr]) {
				errors[pathStr] = issue.message;
			}
		}
	}

	const totalPhotos = report.rooms.reduce((sum, room) => sum + room.photoIds.length, 0);
	if (totalPhotos > 12) {
		errors['photos.total'] = 'მაქსიმუმ 12 ფოტო არის დაშვებული მთლიან აქტში';
	}

	return {
		success: Object.keys(errors).length === 0,
		errors
	};
}
