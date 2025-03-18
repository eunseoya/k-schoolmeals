# backend api for menu suggestion

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import json

# db file
all_menu_items_file = "./backend/all_menu_items.json"
all_menu_items = json.load(open(all_menu_items_file))

ignore_keyword_file = "./backend/ignore_keywords.json"
ignore_keywords = json.load(open(ignore_keyword_file))

category_file = "./backend/categories.json"
categories = set(json.load(open(category_file)))

all_meals_file = "./backend/all_meals.json"
all_meals = json.load(open(all_meals_file))

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route('/menu', methods=['GET'])
def get_menu():
    return jsonify(all_menu_items)


@app.route('/menu/random', methods=['GET'])
def get_random_menu():
    return jsonify(get_random_menu_item())


@app.route('/menu/keyword/<keyword>', methods=['POST'])
def ignore_menu(keyword):
    ignore_keywords.append(keyword)
    # update the file
    with open(ignore_keyword_file, 'w') as f:
        json.dump(ignore_keywords, f)
    return jsonify(ignore_keywords)


@app.route('/menu/keyword/<keyword>', methods=['DELETE'])
def add_menu(keyword):
    ignore_keywords.remove(keyword)
    # update the file
    with open(ignore_keyword_file, 'w') as f:
        json.dump(ignore_keywords, f)
    return jsonify(ignore_keywords)


@app.route('/menu/category/', methods=['GET'])
def get_categories():
    return jsonify(list(categories))


@app.route('/menu/category/<category>', methods=['POST'])
def add_category_route(category):
    return add_category(category)


@app.route('/menu/category/<category>', methods=['DELETE'])
def remove_category_route(category):
    return remove_category(category)


@app.route('/menu/category/<category>', methods=['GET'])
def get_menu_by_category_route(category):
    return jsonify(get_menu_by_category(category))


@app.route('/menu/combo/random', methods=['GET'])
def get_random_weekly_menu_route():
    return jsonify(get_random_weekly_menu())


@app.route('/menu/combo/', methods=['GET'])
def get_planned_weekly_menu_route():
    return jsonify(get_planned_weekly_menu())


def get_random_menu_item():
    # remove items with ignore keywords
    all_items = [item[0] for item in all_menu_items.items() if not any(
        keyword in item[0] for keyword in ignore_keywords)]
    random_item = random.choice(all_items)
    print(random_item)
    return random_item


def get_menu_by_category(category):
    # remove items with ignore keywords
    items = [item[0] for item in all_menu_items.items() if category in item[0] and not any(
        keyword in item[0] for keyword in ignore_keywords)]
    limit = min(5, len(items))
    if limit == 5:
        random.shuffle(items)
    return items[:limit]


def add_category(category):
    # add category to the ignore list
    categories.add(category)
    # update the file
    with open(category_file, 'w') as f:
        json.dump(list(categories), f)
    return jsonify(list(categories))


def remove_category(category):
    # remove category from the ignore list
    categories.remove(category)
    # update the file
    with open(category_file, 'w') as f:
        json.dump(list(categories), f)
    return jsonify(list(categories))


def get_random_weekly_menu():
    random_meals = []
    for _ in range(5):
        random_meals.append(get_random_combination_meal())
    return random_meals


def get_random_combination_meal():
    random_combination = get_random_combination()
    all_items = [item[0] for item in all_menu_items.items() if not any(
        keyword in item[0] for keyword in ignore_keywords)]
    random_items = []
    used_keywords = set()
    for keyword in random_combination:
        items = [item for item in all_items if keyword in item and not any(
            used_keyword in item for used_keyword in used_keywords)]
        if items:
            chosen_item = random.choice(items)
            random_items.append(chosen_item)
            used_keywords.update(keyword.split())
    return random_items


def get_random_combination():
    pairings = {
        "밥": ['국', '찌개', '나물', '조림', '볶음'],
        "면": ['볶음', '구이'],
        "파스타": ['구이', '샐러드'],
        "소고기": ['국', '구이'],
        "돼지고기": ['찌개', '볶음']
    }

    main = random.choice(list(pairings.keys()))
    side = random.choice(pairings[main])

    return [main, side]


def get_planned_weekly_menu():
    planned_meals = []
    for _ in range(5):
        set_meal = random.choice(all_meals)
        # remove the items with ignore keywords
        keywords_ignored_meal = [item for item in set_meal if not any(
            keyword in item for keyword in ignore_keywords)]

        planned_meals.append(keywords_ignored_meal)
    return planned_meals

# how to deploy this api?
# python3 backend.py

# how would i use this api?
# example usage:
# curl http://localhost:5000/menu/random
# curl http://localhost:5000/menu/category/<category>


if __name__ == '__main__':
    app.run(debug=True, port=5001)
