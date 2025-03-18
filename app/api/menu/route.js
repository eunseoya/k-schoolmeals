import { loadData } from '../../lib/menu-utils';
import { NextResponse } from 'next/server';

// Handle GET requests to /api/menu
export async function GET(request) {
    try {
        const url = new URL(request.url);
        const path = url.pathname.replace('/api/menu', '');
        const searchParams = url.searchParams;
        
        // Route the request based on the path
        if (path === '/random') {
            const data = await fetchRandomItem();
            return NextResponse.json(data);
        } else if (path.startsWith('/category')) {
            const category = path.split('/category/')[1];
            if (!category) {
                const data = await fetchCategories();
                return NextResponse.json(data);
            } else {
                const data = await fetchCategoryItems(category);
                return NextResponse.json(data);
            }
        } else if (path.startsWith('/keyword')) {
            // Handle GET for keywords if needed
            return NextResponse.json({ error: "Use POST or DELETE for keywords" }, { status: 400 });
        } else if (path === '/combo/random') {
            const data = await fetchRandomWeeklyMenu();
            return NextResponse.json(data);
        } else if (path === '/combo') {
            const data = await fetchWeeklyMenu();
            return NextResponse.json(data);
        } else {
            // Default case: return data from the server
            const { allMenuItems } = await loadData();
            return NextResponse.json(allMenuItems);
        }
    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Handle POST requests to /api/menu
export async function POST(request) {
    try {
        const url = new URL(request.url);
        const path = url.pathname.replace('/api/menu', '');
        
        if (path.startsWith('/category/')) {
            const category = path.split('/category/')[1];
            const data = await updateCategories(category);
            return NextResponse.json(data);
        } else if (path.startsWith('/keyword/')) {
            const keyword = path.split('/keyword/')[1];
            const data = await addKeyword(keyword);
            return NextResponse.json(data);
        } else {
            return NextResponse.json({ error: "Invalid POST endpoint" }, { status: 400 });
        }
    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Handle DELETE requests to /api/menu
export async function DELETE(request) {
    try {
        const url = new URL(request.url);
        const path = url.pathname.replace('/api/menu', '');
        
        if (path.startsWith('/category/')) {
            const category = path.split('/category/')[1];
            const data = await removeCategory(category);
            return NextResponse.json(data);
        } else if (path.startsWith('/keyword/')) {
            const keyword = path.split('/keyword/')[1];
            const data = await removeKeyword(keyword);
            return NextResponse.json(data);
        } else {
            return NextResponse.json({ error: "Invalid DELETE endpoint" }, { status: 400 });
        }
    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
