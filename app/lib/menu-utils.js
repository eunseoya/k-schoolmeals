import path from 'path';

let fs;
let fsPromises;

if (typeof window === 'undefined') {
    fs = require('fs');
    fsPromises = require('fs').promises;
}

// Define file paths
const dataDir = path.join(process.cwd(), 'data');
const allMenuItemsPath = path.join(dataDir, 'all_menu_items.json');
const ignoreKeywordsPath = path.join(dataDir, 'ignore_keywords.json');
const categoriesPath = path.join(dataDir, 'categories.json');
const allMealsPath = path.join(dataDir, 'all_meals.json');

// Load data files
export async function loadData() {
    if (typeof window !== 'undefined') {
        throw new Error('loadData can only be used on the server side');
    }
    try {
        const [allMenuItems, ignoreKeywords, categories, allMeals] = await Promise.all([
            fsPromises.readFile(allMenuItemsPath, 'utf8').then(JSON.parse),
            fsPromises.readFile(ignoreKeywordsPath, 'utf8').then(JSON.parse),
            fsPromises.readFile(categoriesPath, 'utf8').then((data) => new Set(JSON.parse(data))),
            fsPromises.readFile(allMealsPath, 'utf8').then(JSON.parse)
        ]);
        return { allMenuItems, ignoreKeywords, categories, allMeals };
    } catch (error) {
        console.error('Failed to load data:', error);
        throw error;
    }
}

// Write data to files
export async function writeIgnoreKeywords(ignoreKeywords) {
    if (typeof window !== 'undefined') {
        throw new Error('writeIgnoreKeywords can only be used on the server side');
    }
    await fsPromises.writeFile(ignoreKeywordsPath, JSON.stringify(ignoreKeywords));
    return ignoreKeywords;
}

export async function writeCategories(categories) {
    if (typeof window !== 'undefined') {
        throw new Error('writeCategories can only be used on the server side');
    }
    await fsPromises.writeFile(categoriesPath, JSON.stringify([...categories]));
    return [...categories];
}

// Helper functions
export function getRandomMenuItem(allMenuItems, ignoreKeywords) {
    const allItems = Object.keys(allMenuItems).filter(
        (item) => !ignoreKeywords.some((keyword) => item.includes(keyword))
    );
    const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
    return randomItem;
}

export function getMenuByCategory(category, allMenuItems, ignoreKeywords) {
    const items = Object.keys(allMenuItems).filter(
        (item) => item.includes(category) && !ignoreKeywords.some((keyword) => item.includes(keyword))
    );

    const limit = Math.min(5, items.length);
    if (limit === 5) {
        // Shuffle array
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
    }

    return items.slice(0, limit);
}

export function getRandomCombination() {
    const pairings = {
        밥: ['국', '찌개', '나물', '조림', '볶음'],
        면: ['볶음', '구이'],
        파스타: ['구이', '샐러드'],
        소고기: ['국', '구이'],
        돼지고기: ['찌개', '볶음']
    };

    const main = Object.keys(pairings)[Math.floor(Math.random() * Object.keys(pairings).length)];
    const side = pairings[main][Math.floor(Math.random() * pairings[main].length)];

    return [main, side];
}

export function getRandomCombinationMeal(allMenuItems, ignoreKeywords) {
    const randomCombination = getRandomCombination();
    const allItems = Object.keys(allMenuItems).filter(
        (item) => !ignoreKeywords.some((keyword) => item.includes(keyword))
    );

    const randomItems = [];
    const usedKeywords = new Set();

    for (const keyword of randomCombination) {
        const items = allItems.filter(
            (item) => item.includes(keyword) && ![...usedKeywords].some((used) => item.includes(used))
        );

        if (items.length) {
            const chosenItem = items[Math.floor(Math.random() * items.length)];
            randomItems.push(chosenItem);
            keyword.split(' ').forEach((k) => usedKeywords.add(k));
        }
    }

    return randomItems;
}

export function getRandomWeeklyMenu(allMenuItems, ignoreKeywords) {
    const randomMeals = [];
    for (let i = 0; i < 5; i++) {
        randomMeals.push(getRandomCombinationMeal(allMenuItems, ignoreKeywords));
    }
    return randomMeals;
}

export function getPlannedWeeklyMenu(allMeals, ignoreKeywords) {
    const plannedMeals = [];
    for (let i = 0; i < 5; i++) {
        const setMeal = allMeals[Math.floor(Math.random() * allMeals.length)];
        const keywordsIgnoredMeal = setMeal.filter((item) => !ignoreKeywords.some((keyword) => item.includes(keyword)));
        plannedMeals.push(keywordsIgnoredMeal);
    }
    return plannedMeals;
}
