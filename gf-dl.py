# downloader for Gradfast

# call https://api.gradfast.com/categories to get all categories / module codes available
# expected response:
'''
[
    {
        "name": "STK",
        "description": "Statistics"
    },
    {
        "name": "CIR",
        "description": "Chemical Engineering"
    },
    {
        "name": "CHM",
        "description": "Chemistry"
    },
    {
        "name": "FSK",
        "description": "Physics"
    },
    {
        "name": "COS",
        "description": "Computer Science"
    },
    {
        "name": "INF",
        "description": "Informatics"
    },
    {
        "name": "NMC",
        "description": "Material Science"
    },
    {
        "name": "JPO",
        "description": "Additional Physics"
    },
    {
        "name": "IMY",
        "description": "Multimedia"
    },
    {
        "name": "CMY",
        "description": "Chemistry"
    },
    {
        "name": "GLY",
        "description": "Geology"
    },
    {
        "name": "MBY",
        "description": "Microbiology"
    },
    {
        "name": "BME",
        "description": "Biometry"
    },
    {
        "name": "BES",
        "description": "Engineering Statistics"
    },
    {
        "name": "EBN",
        "description": "Electricity and Electronics"
    },
    {
        "name": "WTW",
        "description": "Mathematics"
    },
    {
        "name": "MGC",
        "description": "Graphical Communication"
    },
    {
        "name": "SLK",
        "description": "Psychology"
    },
    {
        "name": "PHY",
        "description": "Physics"
    },
    {
        "name": "BOT",
        "description": "Botany"
    },
    {
        "name": "SWK",
        "description": "Mechanics"
    },
    {
        "name": "WST",
        "description": "Mathematical Statistics"
    }
]
'''

# call https://api.gradfast.com/modules to get all modules available
# expected response:
'''
[
    {
        "prefix": "STK",
        "code": 110,
        "name": "Statistics"
    },
    {
        "prefix": "NMC",
        "code": 123,
        "name": "Materials science"
    },
    {
        "prefix": "COS",
        "code": 151,
        "name": "Introduction to Computer Science"
    },
    {
        "prefix": "STK",
        "code": 120,
        "name": "Statistics"
    },
    {
        "prefix": "CIR",
        "code": 113,
        "name": "Chemical engineering"
    },
    {
        "prefix": "MBY",
        "code": 161,
        "name": "Introduction to microbiology"
    },
    {
        "prefix": "COS",
        "code": 326,
        "name": "Database Systems"
    },
    {
        "prefix": "PHY",
        "code": 124,
        "name": "First course in physics"
    },
    {
        "prefix": "NMC",
        "code": 113,
        "name": "Materials science"
    },
    {
        "prefix": "COS",
        "code": 314,
        "name": "Artificial Intelligence"
    },
    {
        "prefix": "FSK",
        "code": 116,
        "name": "Physics"
    },
    {
        "prefix": "INF",
        "code": 214,
        "name": "Informatics: Database Design"
    },
    {
        "prefix": "COS",
        "code": 212,
        "name": "Data Structures and Algorithms"
    },
    {
        "prefix": "WTW",
        "code": 114,
        "name": "Calculus"
    },
    {
        "prefix": "COS",
        "code": 332,
        "name": "Computer Networks"
    },
    {
        "prefix": "EBN",
        "code": 122,
        "name": "Electricity and electronics"
    },
    {
        "prefix": "CHM",
        "code": 171,
        "name": "General chemistry"
    },
    {
        "prefix": "COS",
        "code": 216,
        "name": "Netcentric Computer Systems"
    },
    {
        "prefix": "WTW",
        "code": 161,
        "name": "Linear algebra"
    },
    {
        "prefix": "GLY",
        "code": 162,
        "name": "Environmental and hazard geology"
    },
    {
        "prefix": "COS",
        "code": 222,
        "name": "Operating Systems"
    },
    {
        "prefix": "COS",
        "code": 344,
        "name": "Computer Graphics"
    },
    {
        "prefix": "JPO",
        "code": 122,
        "name": "Additional Physics"
    },
    {
        "prefix": "SWK",
        "code": 122,
        "name": "Mechanics"
    },
    {
        "prefix": "COS",
        "code": 301,
        "name": "Software engineering"
    },
    {
        "prefix": "COS",
        "code": 284,
        "name": "Computer Organisation and Architecture"
    },
    {
        "prefix": "CMY",
        "code": 127,
        "name": "General chemistry"
    },
    {
        "prefix": "WTW",
        "code": 134,
        "name": "Mathematics"
    },
    {
        "prefix": "WTW",
        "code": 126,
        "name": "Linear algebra"
    },
    {
        "prefix": "CHM",
        "code": 172,
        "name": "General chemistry"
    },
    {
        "prefix": "WTW",
        "code": 285,
        "name": "Discrete Structures"
    },
    {
        "prefix": "WTW",
        "code": 128,
        "name": "Calculus"
    },
    {
        "prefix": "COS",
        "code": 226,
        "name": "Concurrent Systems"
    },
    {
        "prefix": "WST",
        "code": 111,
        "name": "Mathematical statistics"
    },
    {
        "prefix": "JPO",
        "code": 152,
        "name": "Additional Physics"
    },
    {
        "prefix": "WTW",
        "code": 158,
        "name": "Calculus"
    },
    {
        "prefix": "COS",
        "code": 330,
        "name": "Computer security and ethics"
    },
    {
        "prefix": "EBN",
        "code": 111,
        "name": "Electricity and electronics"
    },
    {
        "prefix": "COS",
        "code": 333,
        "name": "Programming Languages"
    },
    {
        "prefix": "IMY",
        "code": 310,
        "name": "Human-Computer Interaction"
    },
    {
        "prefix": "COS",
        "code": 132,
        "name": "Imperative Programming"
    },
    {
        "prefix": "COS",
        "code": 121,
        "name": "Software Modelling"
    },
    {
        "prefix": "MGC",
        "code": 110,
        "name": "Graphical communication"
    },
    {
        "prefix": "BES",
        "code": 220,
        "name": "Engineering statistics"
    },
    {
        "prefix": "WTW",
        "code": 148,
        "name": "Calculus"
    },
    {
        "prefix": "WTW",
        "code": 124,
        "name": "Mathematics"
    },
    {
        "prefix": "SLK",
        "code": 120,
        "name": "Psychology"
    },
    {
        "prefix": "CHM",
        "code": 181,
        "name": "General chemistry"
    },
    {
        "prefix": "BME",
        "code": 120,
        "name": "Biometry"
    },
    {
        "prefix": "CIR",
        "code": 123,
        "name": "Chemical engineering"
    },
    {
        "prefix": "WTW",
        "code": 164,
        "name": "Mathematics"
    },
    {
        "prefix": "WTW",
        "code": 152,
        "name": "Mathematical modelling"
    },
    {
        "prefix": "COS",
        "code": 110,
        "name": "Program Design: Introduction"
    },
    {
        "prefix": "BOT",
        "code": 161,
        "name": "Plant Biology"
    },
    {
        "prefix": "FSK",
        "code": 176,
        "name": "Physics"
    },
    {
        "prefix": "GLY",
        "code": 161,
        "name": "Historical geology"
    },
    {
        "prefix": "WTW",
        "code": 168,
        "name": "Calculus"
    },
    {
        "prefix": "WTW",
        "code": 146,
        "name": "Linear algebra"
    },
    {
        "prefix": "INF",
        "code": 261,
        "name": "Informatics"
    },
    {
        "prefix": "WTW",
        "code": 115,
        "name": "Discrete structures"
    }
]
'''

# call https://api.gradfast.com/module/MGC110/past-papers to get all past papers for a module (using module code from above)
# expected response:
'''
[
    {
        "category": "Semester Tests",
        "version": "1",
        "description": "Semester Test 1",
        "year": "2009",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/mgc_semester_test_1_2009%20-%201475859677706.pdf"
    },
    {
        "category": "Semester Tests",
        "version": "1",
        "description": "Semester Test 2",
        "year": "2009",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/mgc_semester_test_2_2009%20-%201475859694061.pdf"
    },
    {
        "category": "Semester Tests",
        "version": "1",
        "description": "Semester Test 1",
        "year": "2011",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/mgc_semester_test_1_2011%20-%201475859725565.pdf"
    },
    {
        "category": "Semester Tests",
        "version": "1",
        "description": "Semester Test 2",
        "year": "2011",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/mgc_semester_test_2_2011%20-%201475859750589.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Exam",
        "year": "2008",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/mgc_110_exam_2008_may%20-%201475861676202.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Exam",
        "year": "2009",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/mgc_110_exam_2009_may%20-%201475861727974.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Exam",
        "year": "2010",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/mgc_110_exam_2010_may%20-%201475861763149.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Exam",
        "year": "2011",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/mgc_110_exam_2011_june%20-%201475861784682.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Exam",
        "year": "2012",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/mgc_110_exam_2012_june%20-%201475861815580.PDF"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Exam",
        "year": "2013",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/mgc_110_exam_2013_june%20-%201475861847208.PDF"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Exam",
        "year": "2014",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/mgc_110_exam_2014_june%20-%201475861874026.PDF"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Exam",
        "year": "2001",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/MIT113%20June%202001%20-%201475861949247.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Exam",
        "year": "2002",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/MIT113%20June%202002%20-%201475861969781.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Exam",
        "year": "2004",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/MIT113%20June%202004%20-%201475861990270.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Exam",
        "year": "2005",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/MIT113%20June%202005%20-%201475862005190.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Exam",
        "year": "2006",
        "memo": "no",
        "url": "https://cdn.gradfast.com/MGC110/MIT113%20June%202006%20-%201475862026527.pdf"
    }
]
'''


# only slightly modified from this code segment from here (https://stackoverflow.com/a/69653644)
# Thanks to the author of the answer, Wesam Na (wesam-na)

import browser_cookie3
import requests
import urllib.parse
import shutil
import os 
from retrying import retry
cj = browser_cookie3.chrome(domain_name='.gradfast.com')

def download_file(url, root_des_path='./', progress_bar=None):
    local_filename = url.split('/')[-1]
    local_filename = urllib.parse.unquote(local_filename)
    local_filename = os.path.join(root_des_path, local_filename)
    # r = requests.get(link, cookies=cj)
    try:
        with requests.get(url, cookies=cj, stream=True) as r:
            r.raise_for_status() # raise exception if invalid response
            # save file
            with open(local_filename, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                            if progress_bar:
                                progress_bar.update(1)
        return local_filename
    except requests.exceptions.RequestException as e:
        print(f"Error downloading file from {url}: {e}")
        return None

# ============================================================================================= end StackOverflow code segment

# Progress bar
import time
import progressbar

# Concurrency
import threading


# based on download_file() above
def api_call(url):
    r = requests.get(url, cookies=cj)
    return r.json()

def download_module(module_code):
    # get all past papers for module
    print()
    print(f"Downloading past papers for \033[92m{module_code}\033[0m...")

    past_papers = api_call(f'https://api.gradfast.com/module/{module_code}/past-papers')
    papers_found = len(past_papers)

    directory = f"downloaded/{module_code}"
    if not os.path.exists(directory):
        os.makedirs(directory)

    print(f"Found {len(past_papers)} past papers for \033[92m{module_code}\033[0m.")
    widgets = [' [', progressbar.Timer(format= 'elapsed time: %(elapsed)s'),  '] ', progressbar.Bar('*'),' (', progressbar.ETA(), ') ', progressbar.Percentage(), ' ', progressbar.Counter(), '/', str(papers_found)]
    bar = progressbar.ProgressBar(max_value=papers_found, widgets=widgets).start()

    # download all past papers for module
    '''
    count = 0
    for past_paper in past_papers:
        bar.update(count)
        download_file(past_paper['url'], directory)
        count += 1
    '''

    # new method (with concurrency)
    @retry(wait_fixed=1000, stop_max_attempt_number=10)
    def download_and_update(paper_url):
        try:
            # sleep 1 second to avoid connection error
            time.sleep(1)
            download_file(paper_url, directory, bar)
        except requests.exceptions.ConnectionError as e:
            print(f"Connection error while downloading: {paper_url}")

    # Create a list of threads for concurrent downloads
    threads = []
    for past_paper in past_papers:
        t = threading.Thread(target=download_and_update, args=(past_paper['url'],))
        threads.append(t)
        t.start()

    # Wait for all threads to complete
    for t in threads:
        t.join()

    bar.finish()
    print(f"{module_code} download complete.")
    print()

def get_modules_by_category(category):
    modules = api_call('https://api.gradfast.com/modules')
    modules_by_category = []
    for module in modules:
        if module['prefix'] == category:
            modules_by_category.append(module)
    return modules_by_category

# greet user and ask program mode (1. web scraping, 2. download module (by short code, ie. COS, STK, etc.))
print()
# print("Welcome to Gradfast Downloader!") with Gradfast Downloader in yellow
print("Welcome to \033[93mGradfast Downloader\033[0m!")

# purple text for next 4 lines
print("Please select a mode:")
print("\033[95m1. Download all past papers for all modules")
print("2. Download all past papers for a module group. (ie. COS, STK, etc.)")
print("3. Download all past papers for a specific module. (ie. COS151, STK110, etc.)\033[0m")

mode = -1
while mode != 1 and mode != 2 and mode != 3:
    mode = input("Please enter a mode: ")
    try:
        mode = int(mode)
        if (mode != 1 and mode != 2 and mode != 3):
            print("\033[91mInvalid mode. Please try again.\033[0m")
    except:
        print("\033[91mPlease enter a number ONLY.\033[0m")
        mode = -1

# going to open Gradfast in your browser to refresh your session (open in new tab in chrome)
print()
print("Opening Gradfast in your browser to refresh your session...")
time.sleep(2)
import webbrowser
webbrowser.open('https://gradfast.com', new=2)
sleep_time = 5
time.sleep(sleep_time)
cj = browser_cookie3.chrome(domain_name='.gradfast.com')


if mode == 1:
    # get all modules
    modules = api_call('https://api.gradfast.com/modules')

    # download all past papers for all modules
    for module in modules:
        current_total_paper_count = 0
        download_module(f'{module["prefix"]}{module["code"]}')

elif mode == 2:
    # get all categories
    categories = api_call('https://api.gradfast.com/categories')

    # sort categories by name first
    categories.sort(key=lambda x: x['name'])

    # print all categories
    print()
    print("Available categories:")
    i = 1
    for category in categories:
        print(f'{i}. {category["name"]} - {category["description"]}')
        i += 1
    
    # get user input for category
    category = -1
    while category < 1 or category > len(categories):
        category = input("Please enter a category (using the number above): ")
        try:
            category = int(category)
            if (category < 1 or category > len(categories)):
                print("\033[91mInvalid category. Please try again.\033[0m")
        except:
            print("\033[91mPlease enter a number ONLY.\033[0m")
            category = -1
        


    # get all modules for category
    modules = get_modules_by_category(categories[category - 1]['name'])

    # download all past papers for all modules in category
    for module in modules:
        current_total_paper_count = 0
        download_module(f'{module["prefix"]}{module["code"]}')

elif mode == 3:
    # get all modules
    modules = api_call('https://api.gradfast.com/modules')

    # sort modules by prefix first and code (essentially sorting by module code lexographically)
    modules.sort(key=lambda x: (x['prefix'], x['code']))

    # print all modules
    print()
    print("Available modules:")
    i = 1
    for module in modules:
        print(f'{i}. {module["prefix"]}{module["code"]} - {module["name"]}')
        i += 1
    
    # get user input for module
    module = -1
    while module < 1 or module > len(modules):
        module = input("Please enter a module (using the number above): ")
        try:
            module = int(module)
            if (module < 1 or module > len(modules)):
                print("\033[91mInvalid module. Please try again.\033[0m")
        except:
            # print in red
            print("\033[91mPlease enter a number ONLY.\033[0m")
            module = -1

    # download all past papers for module
    current_total_paper_count = 0
    download_module(f'{modules[module - 1]["prefix"]}{modules[module - 1]["code"]}')

print("All downloads should be complete. Hope it helped!")