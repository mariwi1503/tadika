import type { Payment } from '@/types';
import { KEYS } from '../keys';
import { makeRepo } from './base';

const repo = makeRepo<Payment>(KEYS.payments);

export const getPayments = repo.list;
export const getPaymentById = repo.get;
export const createPayment = repo.create;
export const replacePayments = repo.replace;

export function getPaymentsForInvoice(invoiceId: string): Payment[] {
  return repo
    .list()
    .filter((p) => p.invoiceId === invoiceId)
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
}

export function getPaymentsForStudent(studentId: string): Payment[] {
  return repo
    .list()
    .filter((p) => p.studentId === studentId)
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
}
