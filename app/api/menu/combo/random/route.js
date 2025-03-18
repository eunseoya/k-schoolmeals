import { loadData, getRandomWeeklyMenu } from '../../../../lib/menu-utils';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { allMenuItems, ignoreKeywords } = await loadData();
        const randomMenu = getRandomWeeklyMenu(allMenuItems, ignoreKeywords);
        return NextResponse.json(randomMenu);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
