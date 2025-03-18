import { loadData, getPlannedWeeklyMenu } from '../../../lib/menu-utils';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { allMeals, ignoreKeywords } = await loadData();
        const plannedMenu = getPlannedWeeklyMenu(allMeals, ignoreKeywords);
        return NextResponse.json(plannedMenu);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
