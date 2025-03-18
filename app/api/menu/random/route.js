import { loadData, getRandomMenuItem } from '../../../lib/menu-utils';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { allMenuItems, ignoreKeywords } = await loadData();
        const randomItem = getRandomMenuItem(allMenuItems, ignoreKeywords);
        return NextResponse.json(randomItem);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
