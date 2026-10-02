import type { Invoice } from '@/types';
import { KEYS } from '../keys';
import { makeRepo } from './base';

const repo = makeRepo<Invoice>(KEYS.invoices);

export const getInvoices = repo.list;
export const getInvoiceById = repo.get;
export const createInvoice = repo.create;
export const updateInvoice = repo.update;
export const deleteInvoice = repo.remove;
export const replaceInvoices = repo.replace;

export function getInvoicesForStudent(studentId: string): Invoice[] {
  return repo
    .list()
    .filter((i) => i.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function findInvoicesForPeriod(periodLabel: string, title: string): Invoice[] {
  return repo.list().filter((i) => i.periodLabel === periodLabel && i.title === title);
}
