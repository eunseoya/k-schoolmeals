import { loadData, writeIgnoreKeywords, writeCategories } from '../../../../lib/menu-utils';
import { NextResponse } from 'next/server';

// Helper Functions (adapted from Python)
function getRandomMenuItem(allMenuItems, ignoreKeywords) {
    const allItems = Object.keys(allMenuItems).filter(
        item => !ignoreKeywords.some(keyword => item.includes(keyword))
    );
    if (allItems.length === 0) return null;
    return allItems[Math.floor(Math.random() * allItems.length)];
}

function getMenuByCategory(allMenuItems, category, ignoreKeywords) {
    const items = Object.keys(allMenuItems).filter(
        item => item.includes(category) && !ignoreKeywords.some(keyword => item.includes(keyword))
    );
    const limit = Math.min(5, items.length);
    const shuffledItems = [...items].sort(() => Math.random() - 0.5); // Shuffle array
    return shuffledItems.slice(0, limit);
}

function getRandomCombination() {
    const pairings = {
        "밥": ['국', '찌개', '나물', '조림', '볶음'],
        "면": ['볶음', '구이'],
        "파스타": ['구이', '샐러드'],
        "소고기": ['국', '구이'],
        "돼지고기": ['찌개', '볶음']
    };

    const main = Object.keys(pairings)[Math.floor(Math.random() * Object.keys(pairings).length)];
    const side = pairings[main][Math.floor(Math.random() * pairings[main].length)];

    return [main, side];
}

function getRandomCombinationMeal(allMenuItems, ignoreKeywords) {
    const randomCombination = getRandomCombination();
    const allItems = Object.keys(allMenuItems).filter(
        item => !ignoreKeywords.some(keyword => item.includes(keyword))
    );

    const randomItems = [];
    const usedKeywords = new Set();

    for (const keyword of randomCombination) {
        const items = allItems.filter(
            item => item.includes(keyword) &&
                ![...usedKeywords].some(used => item.includes(used))
        );

        if (items.length) {
            const chosenItem = items[Math.floor(Math.random() * items.length)];
            randomItems.push(chosenItem);
            keyword.split(' ').forEach(k => usedKeywords.add(k));
        }
    }

    return randomItems;
}

function getRandomWeeklyMenu(allMenuItems, ignoreKeywords) {
    const randomMeals = [];
    for (let i = 0; i < 5; i++) {
        randomMeals.push(getRandomCombinationMeal(allMenuItems, ignoreKeywords));
    }
    return randomMeals;
}

function getPlannedWeeklyMenu(allMeals, ignoreKeywords) {
    const plannedMeals = [];
    for (let i = 0; i < 5; i++) {
        const setMeal = allMeals[Math.floor(Math.random() * allMeals.length)];
        const keywordsIgnoredMeal = setMeal.filter(
            item => !ignoreKeywords.some(keyword => item.includes(keyword))
        );
        plannedMeals.push(keywordsIgnoredMeal);
    }
    return plannedMeals;
}

// API Route Handlers
export async function GET(request, { params }) {
    try {
        const { allMenuItems, ignoreKeywords, categories, allMeals } = await loadData();
        const path = params.path ? params.path.join('/') : '';

        if (path === 'random') {
            const randomItem = getRandomMenuItem(allMenuItems, ignoreKeywords);
            return NextResponse.json(randomItem);
        } else if (path.startsWith('category')) {
            const category = path.split('/')[2];
            if (!category) {
                return NextResponse.json([...categories]);
            } else {
                const menuByCategory = getMenuByCategory(allMenuItems, category, ignoreKeywords);
                return NextResponse.json(menuByCategory);
            }
        } else if (path === 'combo/random') {
            const randomWeeklyMenu = getRandomWeeklyMenu(allMenuItems, ignoreKeywords);
            return NextResponse.json(randomWeeklyMenu);
        } else if (path === 'combo') {
            const plannedWeeklyMenu = getPlannedWeeklyMenu(allMeals, ignoreKeywords);
            return NextResponse.json(plannedWeeklyMenu);
        } else {
            return NextResponse.json(allMenuItems);
        }
    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const { allMenuItems, ignoreKeywords, categories, allMeals } = await loadData();
        
        // Access the keyword directly from params.keyword
        const keyword = params.keyword;
        const newIgnoreKeywords = [...ignoreKeywords, keyword];
        await writeIgnoreKeywords(newIgnoreKeywords);
        return NextResponse.json(newIgnoreKeywords);
    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { allMenuItems, ignoreKeywords, categories, allMeals } = await loadData();
        
        // Access the keyword directly from params.keyword
        const keyword = params.keyword;
        const newIgnoreKeywords = ignoreKeywords.filter(k => k !== keyword);
        await writeIgnoreKeywords(newIgnoreKeywords);
        return NextResponse.json(newIgnoreKeywords);
    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}