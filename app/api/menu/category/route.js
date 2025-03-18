import { loadData } from '../../../lib/menu-utils';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { categories } = await loadData();
    return NextResponse.json([...categories]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
