import json
import requests
import datetime
import re
import os
import logging

logging.basicConfig(filename='/Users/eunseo/projects/cafeteria/backend/cafeteria.log',
                    level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

API_KEY = "74a03c420e47420ea952b0cb76108e2b"
TODAY = datetime.datetime.now().strftime("%Y%m%d")
current_dir = "./backend"

province = {
    "seoul": "B10",
    "gwangju": "F10",
    "jeonbuk": "P10",
    "gyeonggi": "J10",
    "incheon": "E10",
}

schools = [
    {"name": "sawoo",
        "edu_code": province["gyeonggi"], "school_code": "7530474"},
    {"name": "segyeong",
        "edu_code": province["gyeonggi"], "school_code": "7530947"},  # paju
    # yongin
    {"name": "singal",
        "edu_code": province["gyeonggi"], "school_code": "7530177"},
    {"name": "gyeongbokbiz",
        "edu_code": province["seoul"], "school_code": "7010062"},  # jongno
    {"name": "jamsil",
        "edu_code": province["seoul"], "school_code": "7130152"},
    {"name": "choeun",
        "edu_code": province["incheon"], "school_code": "7310374"},
    # korean foreign language university high school
    {"name": "wdb",
        "edu_code": province["gyeonggi"], "school_code": "7531146"},
]


def get_menu(edu_code, school_code, day=TODAY):
    # school specified
    url = f"https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=100&KEY={API_KEY}&ATPT_OFCDC_SC_CODE={edu_code}&SD_SCHUL_CODE={school_code}&MLSV_YMD={day}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        try:
            return {meal['MMEAL_SC_CODE']: meal['DDISH_NM'] for meal in data['mealServiceDietInfo'][1]['row']}
        except KeyError:
            return "No menu available"
    return f"Error: {response.status_code}"


def get_menu_all(edu_code, school_code):
    initial_url = f"https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=10&KEY={API_KEY}&ATPT_OFCDC_SC_CODE={edu_code}&SD_SCHUL_CODE={school_code}"
    response = requests.get(initial_url)
    list_count = 100
    if response.status_code == 200:
        data = response.json()
        try:
            list_count = data['mealServiceDietInfo'][0]['head'][0]['list_total_count']
        except KeyError:
            return "No menu available"
    # if list_count > 1000:
        # since each request can only fetch 1000 items, we need to make multiple requests
        # pIndex is the page number, and pSize is the number of items per page

    url = f"https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize={list_count}&KEY={API_KEY}&ATPT_OFCDC_SC_CODE={edu_code}&SD_SCHUL_CODE={school_code}"

    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        try:
            meals = []
            for meal in data['mealServiceDietInfo'][1]['row']:
                meals.append({
                    "date": meal['MLSV_YMD'],
                    "meal": meal['MMEAL_SC_NM'],
                    "menu": parse_menu(meal['DDISH_NM'])
                })
            return meals

        except KeyError:
            return "No menu available"
    return f"Error: {response.status_code}"


def get_menu_paginate(edu_code, school_code, p_index=1, p_size=1000, collected_meals=None):
    if collected_meals is None:
        collected_meals = []

    url = f"https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex={p_index}&pSize={p_size}&KEY={API_KEY}&ATPT_OFCDC_SC_CODE={edu_code}&SD_SCHUL_CODE={school_code}"

    response = requests.get(url)
    if response.status_code != 200:
        return f"Error: {response.status_code}"

    try:
        data = response.json()
        if 'mealServiceDietInfo' not in data:
            return "No menu available"

        if p_index == 1:
            list_count = data['mealServiceDietInfo'][0]['head'][0]['list_total_count']
        else:
            list_count = None  # Only fetch total count on the first request

        for meal in data['mealServiceDietInfo'][1]['row']:
            collected_meals.append({
                "date": meal['MLSV_YMD'],
                "meal": meal['MMEAL_SC_NM'],
                "menu": parse_menu(meal['DDISH_NM'])
            })

        # If there are more pages to fetch, recursively call the function
        if list_count and len(collected_meals) < list_count:
            return get_menu_paginate(edu_code, school_code, p_index + 1, p_size, collected_meals)

        return collected_meals

    except KeyError:
        return "No menu available"


def parse_menu(menu):
    # Implement this function to parse the menu
    # Step 1: Split by <br/> to get individual menu items
    menu_items = menu.split("<br/>")

    # Step 2: Process each item
    parsed_menu = []
    for item in menu_items:
        item = item.strip().lstrip('*')  # Remove leading '*' and extra spaces
        # Remove anything within parentheses
        item = re.sub(r"\(.*?\)", "", item).strip()
        # remove all punctuation
        item = re.sub(r'[^\w\s]', '', item)
        # remove all english alphabet
        item = re.sub(r'[a-zA-Z]', '', item)
        # remove all numbers
        item = re.sub(r'[0-9]', '', item)
        # Remove leading and trailing spaces
        item = item.strip()
        parsed_menu.append(item)

    return parsed_menu


for school in schools:
    logging.info(f"Fetching menu for {school['name']}")
    menu = get_menu_paginate(school['edu_code'], school['school_code'])
    logging.info(f"{len(menu)} menus fetched")
    with open(f"{current_dir}/{school['name']}_menu.json", "w") as f:
        json.dump(menu, f, indent=4)

# create a list of all meals
menu_files = [
    f"{current_dir}/{school['name']}_menu.json" for school in schools]

# create a dictionary of all menu items
all_menu_items = {}
initial_menu_items_count = 0
if os.path.exists(f"{current_dir}/all_menu_items.json"):
    with open(f"{current_dir}/all_menu_items.json", "r") as f:
        all_menu_items = json.load(f)
        initial_menu_items_count = len(all_menu_items)

logging.info(f"Existing menu items: {initial_menu_items_count}")

for menu_file in menu_files:
    with open(menu_file, "r") as f:
        menu = json.load(f)
        for meal in menu:
            for item in meal['menu']:
                all_menu_items[item] = all_menu_items.get(item, 0) + 1

# save the dictionary to a file
with open(f"{current_dir}/all_menu_items.json", "w") as f:
    json.dump(all_menu_items, f, indent=4)

new_menu_items_count = len(all_menu_items)
logging.info(
    f"Unique menu items added: {new_menu_items_count - initial_menu_items_count}")

all_meals = []
initial_meals_count = 0
if os.path.exists(f"{current_dir}/all_meals.json"):
    with open(f"{current_dir}/all_meals.json", "r") as f:
        all_meals = json.load(f)
        initial_meals_count = len(all_meals)

logging.info(f"Existing meals: {initial_meals_count}")

for menu_file in menu_files:
    with open(menu_file, "r") as f:
        menu = json.load(f)
        for meal in menu:
            all_meals.append(meal['menu'])

logging.info(f"Meals added: {len(all_meals) - initial_meals_count}")

# remove duplicate meals
all_meals = list(set(tuple(meal) for meal in all_meals))
logging.info(f"Unique meals: {len(all_meals)}")

with open(f"{current_dir}/all_meals.json", "w") as f:
    json.dump(all_meals, f, indent=4)

# # what is the most common menu item?
# most_common_item = max(all_menu_items, key=all_menu_items.get)
# # print(most_common_item, all_menu_items[most_common_item])
# # what is the top 10 most common menu items?

# top_10_items = sorted(all_menu_items.items(),
#                       key=lambda x: x[1], reverse=True)[:100]

# # keywords to ignore
# ignore_keywords = ["바나나", "샐러드", "밥", "김치",
#                    "시리얼", "깍두기", "생수", "요거트", "음료", "급식",
#                    "겉절이", "석박지", "우유", "사과", "요구르트"]

# top_10_items = [(item, count) for item, count in top_10_items if all(
#     keyword not in item for keyword in ignore_keywords)]

# categories = ["국", "찌개", "무침", "볶음", "면", "국수", "나물", "구이", "전", "찜", "튀김"]

# # list all items that include the category
# category_items = {}
# for category in categories:
#     category_items[category] = [
#         item for item in all_menu_items if category in item]

# for category, items in category_items.items():
#     print(category, len(items))
#     print(items[:10])

# # merge all menu files
# menu = []
# for menu_file in menu_files:
#     with open(menu_file, "r") as f:
#         menu += json.load(f)

# for menu_file in menu_files:
#     print(menu_file)
#     with open(menu_file, "r") as f:
#         menu = json.load(f)
#         print(len(menu))

#         # in each year, count of meal type?
#         year_meal_count = {}
#         for meal in menu:
#             year = meal['date'][:4]
#             meal_type = meal['meal']
#             if year in year_meal_count:
#                 if meal_type in year_meal_count[year]:
#                     year_meal_count[year][meal_type] += 1
#                 else:
#                     year_meal_count[year][meal_type] = 1
#             else:
#                 year_meal_count[year] = {meal_type: 1}
#         print(year_meal_count)
