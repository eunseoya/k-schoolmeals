import { loadData, writeCategories, getMenuByCategory } from '../../../../lib/menu-utils';
import { NextResponse } from 'next/server';

export async function GET(request, context) {
    try {
        const params = await context.params;
        const { category } = params;
        const { allMenuItems, ignoreKeywords } = await loadData();

        const menuItems = getMenuByCategory(category, allMenuItems, ignoreKeywords);
        return NextResponse.json(menuItems);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function POST(request, context) {
    try {
        const params = await context.params;
        const { category } = params;
        const { categories } = await loadData();

        categories.add(category);
        const updatedCategories = await writeCategories(categories);

        return NextResponse.json(updatedCategories);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, context) {
    try {
        const params = await context.params;
        const { category } = params;
        const { categories } = await loadData();

        categories.delete(category);
        const updatedCategories = await writeCategories(categories);

        return NextResponse.json(updatedCategories);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
