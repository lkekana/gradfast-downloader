# downloader for Gradfast

import requests
import os
from retrying import retry
from api import (
    authenticate,
    download_file,
    get_all_categories,
    get_all_modules,
    get_module_past_papers,
    make_session,
)
import progressbar
import threading
from typing import List
import console
from cookies import load_cookies
from models import Module, ModuleCategory, PastPaper
from utils import remove_whitespace, sleep_random


def download_entire_module(s: requests.Session, module_code: str):
    # get all past papers for module
    print()
    print(f"Downloading past papers for \033[92m{module_code}\033[0m...")

    past_papers: List[PastPaper] = get_module_past_papers(s, module_code)
    papers_found = len(past_papers)

    directory = f"downloaded/{module_code}"
    if not os.path.exists(directory):
        os.makedirs(directory)

    print(f"Found {len(past_papers)} past papers for \033[92m{module_code}\033[0m.")
    widgets = [
        " [",
        progressbar.Timer(format="elapsed time: %(elapsed)s"),
        "] ",
        progressbar.Bar("*"),
        " (",
        progressbar.ETA(),
        ") ",
        progressbar.Percentage(),
        " ",
        progressbar.Counter(),
        "/",
        str(papers_found),
    ]
    bar = progressbar.ProgressBar(maxvalue=papers_found, widgets=widgets).start()

    @retry(wait_fixed=1000, stop_max_attempt_number=10)
    def download_and_update(paper_url):
        try:
            sleep_random(1, 3)
            download_file(s, paper_url, directory, bar)
        except requests.exceptions.ConnectionError:
            print(f"Connection error while downloading: {paper_url}")

    # Create a list of threads for concurrent downloads
    threads = []
    for past_paper in past_papers:
        t = threading.Thread(target=download_and_update, args=(past_paper.url,))
        threads.append(t)
        t.start()

    # Wait for all threads to complete
    for t in threads:
        t.join()

    bar.finish()
    print(f"{module_code} download complete.")
    print()


def get_modules_by_category(s: requests.Session, category: str) -> List[Module]:
    modules: List[Module] = get_all_modules(s)
    modules_by_category = []
    for module in modules:
        if module.prefix == category:
            modules_by_category.append(module)
    return modules_by_category


def main():
    print()
    print(f"Welcome to {console.CYAN}Gradfast Downloader{console.RESET}!")
    print("Please select a mode:")
    console.print_purple("1. Download all past papers for all modules.")
    console.print_purple(
        "2. Download all past papers for a module group. (ie. COS, STK, etc.)"
    )
    console.print_purple(
        "3. Download all past papers for a specific module. (ie. COS151, STK110, etc.)"
    )

    mode = -1
    while mode != 1 and mode != 2 and mode != 3:
        mode = input("Please enter a mode: ")
        try:
            mode = int(mode)
            if mode != 1 and mode != 2 and mode != 3:
                console.print_red("Invalid mode. Please try again.")
        except ValueError:
            console.print_red("Invalid mode. Please try again.")
            mode = -1

    print()
    s = make_session()
    cookie_from_file = load_cookies()
    if cookie_from_file:
        s.cookies.update(cookie_from_file)
        print("Resuming session from saved cookies file...")
    else:
        authenticate(s)

    if mode == 1:
        modules: List[Module] = get_all_modules(s)
        for module in modules:
            download_entire_module(f"{module.prefix}{module.code}")

    elif mode == 2:
        categories: List[ModuleCategory] = get_all_categories(s)
        categories.sort(key=lambda x: x.name)  # sort by name

        print()
        print("Available categories:")
        i = 1
        for category in categories:
            print(f"{i}. {category.name} - {category.description}")
            i += 1

        # get user input for category
        category = -1
        while category < 1 or category > len(categories):
            category = input("Please enter a category (using the number above): ")

            try:
                sanitized_category = remove_whitespace(category)
                i = (
                    categories.index(
                        next(
                            (c for c in categories if c.name == sanitized_category),
                            None,
                        )
                    )
                    + 1
                )
                if i > 0:
                    category = i
                    break
            except ValueError:
                pass

            try:
                category = int(category)
                if category < 1 or category > len(categories):
                    console.print_red(
                        "Invalid category: Number out of range. Please try again."
                    )
            except ValueError:
                category = -1

        modules: List[Module] = get_modules_by_category(
            s, categories[category - 1].name
        )
        modules.sort(key=lambda x: (x.prefix, x.code))  # sort by prefix then code

        for module in modules:
            download_entire_module(s, f"{module.prefix}{module.code}")

    elif mode == 3:
        modules: List[Module] = get_all_modules(s)
        modules.sort(key=lambda x: (x.prefix, x.code))  # sort by prefix then code
        module_codes = [f"{module.prefix}{module.code}" for module in modules]

        # print all modules
        print()
        print("Available modules:")
        i = 1
        for module in modules:
            print(f"{i}. {module.prefix}{module.code} - {module.name}")
            i += 1

        # get user input for module
        module = -1
        while module < 1 or module > len(modules):
            module = input(
                "Please enter a module (using the number above or the module code): "
            )

            try:
                sanitized_module = remove_whitespace(module)
                i = module_codes.index(sanitized_module) + 1
                if i > 0:
                    module = i
                    break
            except ValueError:
                pass

            try:
                module = int(module)
                if module < 1 or module > len(modules):
                    console.print_red(
                        "Invalid module: Number out of range. Please try again."
                    )
                    console.print_yellow("You can also enter the module code directly.")
            except ValueError:
                module = -1

        # download all past papers for module
        download_entire_module(
            s, f"{modules[module - 1].prefix}{modules[module - 1].code}"
        )

    print("All downloads should be complete. Hope it helped!")


if __name__ == "__main__":
    main()
