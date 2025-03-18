'use client'

import React, { useEffect, useState } from 'react';

const MenuApp: React.FC = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [randomItem, setRandomItem] = useState(null);
    const [categoryItems, setCategoryItems] = useState([]);
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [ignoreKeyword, setIgnoreKeyword] = useState('');
    const [ignoredKeywords, setIgnoredKeywords] = useState<string[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [randomWeeklyMenu, setRandomWeeklyMenu] = useState<(string | string[])[]>([]);
    const days = ['월', '화', '수', '목', '금'];
    
    const fetchRandomItem = () => {
        console.log('Fetching random menu item...');
        fetch('/api/menu/random')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Random menu item:', data);
                setRandomItem(data);
            })
            .catch(error => console.error('Fetch error:', error));
    };

    const fetchCategoryItems = (category: string) => {
        console.log(`Fetching menu items for category: ${category}...`);
        fetch(`/api/menu/category/${category}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(`Menu items for category ${category}:`, data);
                setCategoryItems(data);
            })
            .catch(error => console.error('Fetch error:', error));
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`/api/menu/category/`);
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const updateCategories = () => {
        if (!category) return;

        fetch(`/api/menu/category/${category}`, { method: 'POST' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Updated categories:', data);
                setCategories(data);
                setCategory('');
            })
            .catch(error => console.error('Fetch error:', error ));
    }   

    const removeCategory = (category: string) => {
        fetch(`/api/menu/category/${category}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Deleted category:', data);
                setCategories(data);
            })
            .catch(error => console.error('Fetch error:', error));
    }

    const addKeyword = () => {
        if (!ignoreKeyword) return;
        fetch(`/api/menu/keyword/${ignoreKeyword}`, { method: 'POST' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Updated ignore keywords:', data);
                setIgnoredKeywords(data);
                setIgnoreKeyword('');
            })
            .catch(error => console.error('Fetch error:', error));
    };

    const removeKeyword = (ignoreKeyword: string) => {
        if (!ignoreKeyword) return;
        fetch(`/api/menu/keyword/${ignoreKeyword}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Updated ignore keywords:', data);
                setIgnoredKeywords(data);
                setIgnoreKeyword('');
            })
            .catch(error => console.error('Fetch error:', error));
    };

    const fetchRandomWeeklyMenu = () => {
        console.log('Fetching random weekly menu...');
        fetch('/api/menu/combo/random', {
            method: 'GET'})
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Random weekly menu:', data);
                setRandomWeeklyMenu(data);
            })
            .catch(error => console.error('Fetch error:', error));
    }
    
    const fetchWeeklyMenu = () => {
        console.log('Fetching weekly menu...');
        fetch('/api/menu/combo', {
            method: 'GET'})
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Weekly menu:', data);
                setRandomWeeklyMenu(data);
            })
            .catch(error => console.error('Fetch error:', error));
    }
    
    // initialize categories 
    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="container">
            <header>
                <h1>급식 기반 메뉴 추천</h1>
            </header>
            <div className="card">
                <h3>나이스 교육정보 개방 포털 급식식단 정보에서 긁어온 메뉴</h3>
                <p>추가한 학교들: 사우고, 세경고, 신갈고, 경복비즈고, 잠실고, 초은고, 외대부고</p>
            </div>

            <div className="card">
                <button className="btn" onClick={fetchRandomItem}>랜덤 메뉴 뽑기</button>
                {randomItem && 
                <div>
                    <a href={`https://www.10000recipe.com/recipe/list.html?q=${randomItem}`} target="_blank" className="result green" onClick={() => navigator.clipboard.writeText(randomItem)}>{randomItem}</a>
                </div>}
            </div>
            <div className="card">
                <button className="btn" onClick={fetchRandomWeeklyMenu}>랜덤 식단 짜기</button>
                <button className="btn" onClick={fetchWeeklyMenu}>급식 식단 짜기</button>
                {randomWeeklyMenu &&
                <div>
                    <h2>주간 식단</h2>
                    <ul>
                        {randomWeeklyMenu.map((menu, index) => (
                            <li key={index}>
                                <h3>{days[index]}</h3>
                                {Array.isArray(menu)
                                    ? menu.map((item, i) => (
                                        <div key={i}>{item}</div>
                                    ))
                                    : menu}
                            </li>
                        ))}
                    </ul>
                </div>} 
            </div>
            <div className="card">
             
                <h2>키워드별 메뉴</h2>
                <div className="category-description">
                <p> 키워드 버튼을 누를 때마다 키워드별 메뉴가 다섯개씩 랜덤으로 추천됩니다. <br/> 추천된 메뉴를 눌러 메뉴를 클립보드에 복사하고 만개의 레시피 사이트에서 검색할 수 있습니다.</p>
                
                </div>
                <div> 
                        <input
                            className="input"   
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    updateCategories();
                                }
                            }}
                            placeholder="키워드 추가하기"
                        />
                        <button className="btn" onClick={() => updateCategories()}>+</button>
                        <button className="btn red" onClick={() => setEditMode(!editMode)}>
                    {editMode ? 'done' : 'edit'}
                            </button>
                    </div>
                <div className="keywords-grid">  
                    {categories.map((cat, index) => (
                        <button className={`btn category ${editMode ? 'edit-mode' : ''}`}
                        onClick={() => { 
                            if (editMode) {
                                removeCategory(cat);
                            } else {
                                setCategory(cat); 
                                fetchCategoryItems(cat); 
                            }
                        }} key={index}>
                            {cat}
                            {editMode && <div className="btn-x">x</div>}
                        </button>
                        
                    ))}
                </div>
                
                <div className="recommendation-grid">
                    {categoryItems.map((item, index) => (
                        <a href={`https://www.10000recipe.com/recipe/list.html?q=${item}`} target="_blank" key={index}
                        onClick={() => navigator.clipboard.writeText(item)} className="result green"> {item}
                        </a>
                    ))}
                </div>
            </div>

            <div className="card">
                <h2>키워드 빼기</h2>
                <input
                    className="input"
                    type="text"
                    value={ignoreKeyword}
                    onChange={(e) => setIgnoreKeyword(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            addKeyword();
                        }
                    }}
                    placeholder="무시할 키워드를 입력하세요"
                />
                <button className="btn red" onClick={addKeyword}>키워드 빼기</button>
                {ignoredKeywords.length > 0 && (
                    <div>
                        <h3>뺀 키워드</h3>
                        <p>뺀 키워드를 누르면 다시 추가됩니다.</p>
                        <div className="keywords-grid">
                            {ignoredKeywords.map((kw, index) => (
                                <div key={index} className="keyword-item">
                                    <button className="btn red" onClick={() => removeKeyword(kw)}>{kw} x</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuApp;
