import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { applyMobileCors, mobileOptions } from '@/lib/mobile-cors';

const handler = toNextJsHandler(auth);
export async function GET(request) {
  return applyMobileCors(request, await handler.GET(request));
}
export async function POST(request) {
  return applyMobileCors(request, await handler.POST(request));
}
export const OPTIONS = mobileOptions;
