import progressbar
import requests
import console
from typing import List
import random
from cookies import save_cookies
from models import (
    Module,
    ModuleCategory,
    ModuleInfo,
    PastPaper,
    parse_categories,
    parse_module_info,
    parse_modules,
    parse_past_papers,
)
from utils import debug_print, get_random_user_agent, sleep_random
import os
import urllib

user_agent = get_random_user_agent()
debug_print(f"Using User-Agent: {user_agent}")

initial_headers = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
    "DNT": "1",
    "Referer": "https://www.gradfast.com/",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent": user_agent,
}


def make_session() -> requests.Session:
    """
    Returns a requests.Session that:
      - reuses TCP connections (keep-alive)
      - automatically updates cookies from Set-Cookie
      - can be reused for multiple requests
    """
    s = requests.Session()
    s.headers.update(initial_headers)
    # cj = browser_cookie3.chrome(domain_name="qwen.ai")
    # s.cookies.update(cj)
    return s


def request_with_session(
    s: requests.Session, method: str, url: str, **kwargs
) -> requests.Response:
    """
    Makes a request with the provided session. Cookies set by the server are stored
    in s.cookies and automatically sent on subsequent requests.
    """
    headers = kwargs.pop("headers", {})
    # headers = {**headers, "Timezone": format_gmt_date()}
    resp = s.request(method.upper(), url, headers=headers, **kwargs)
    # s.cookies now includes any Set-Cookie from resp
    save_cookies(s.cookies)
    return resp


def page_request(s: requests.Session, URL: str) -> requests.Response:
    """
    Makes a GET request to the given URL with default headers for page requests.
    """
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "DNT": "1",
        "Referer": "https://www.google.com/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": user_agent,
    }
    return request_with_session(s, "GET", URL, headers=headers)


def api_request(s: requests.Session, URL: str) -> requests.Response:
    """
    Makes a GET request to the given URL with default headers.
    """
    headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "DNT": "1",
        "Origin": "https://www.gradfast.com",
        "Referer": "https://www.gradfast.com/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "User-Agent": user_agent,
    }
    return request_with_session(s, "GET", URL, headers=headers)


def cloudfront_cookie_received(s: requests.Session) -> bool:
    return any(cookie.name.startswith("CloudFront-") for cookie in s.cookies)


def authenticate(s: requests.Session):
    print("Connecting to Gradfast to initialize session... (should take about 10s)")
    r1 = page_request(s, "https://www.gradfast.com/modules")
    if r1.status_code != 200:
        console.error("Failed to load main page", r1.status_code, r1.text)
        raise Exception("Failed to load main page")
    debug_print(r1.headers)
    debug_print(r1.text)
    sleep_random(1, 3)

    r2 = api_request(s, "https://api.gradfast.com/categories")
    if r2.status_code != 200:
        console.error("Failed to load categories", r2.status_code, r2.text)
        raise Exception("Failed to load categories")
    debug_print(r2.headers)
    categories: List[ModuleCategory] = parse_categories(r2.json())
    debug_print(categories)
    sleep_random(1, 3)

    r3 = api_request(s, "https://api.gradfast.com/modules")
    if r3.status_code != 200:
        console.error("Failed to load modules", r3.status_code, r3.text)
        raise Exception("Failed to load modules")
    debug_print(r3.headers)
    modules: List[Module] = parse_modules(r3.json())
    debug_print(modules)
    sleep_random(1, 3)

    # random_module = random.choice(modules)
    # random_module_code = f"{random_module.prefix}{random_module.code}"
    # debug_print(f"Selected random module: {random_module_code}")
    # r4 = api_request(s, f"https://api.gradfast.com/module/{random_module_code}")
    # if (r4.status_code != 200):
    #     console.error(f"Failed to load module {random_module_code} info", r4.status_code, r4.text)
    #     raise Exception(f"Failed to load module {random_module_code} info")
    # debug_print(r4.headers)
    # info: ModuleInfo = parse_module_info(r4.json())
    # debug_print(info)
    # sleep_random(1, 3)

    # r5 = api_request(s, f"https://api.gradfast.com/module/{random_module_code}/past-papers")
    # if (r5.status_code != 200):
    #     console.error(f"Failed to load module {random_module_code} past papers", r5.status_code, r5.text)
    #     raise Exception(f"Failed to load module {random_module_code} past papers")
    # debug_print(r5.headers)
    # past_papers: List[PastPaper] = parse_past_papers(r5.json())
    # debug_print(past_papers)
    # sleep_random(1, 3)

    tries = 0
    while not cloudfront_cookie_received(s) and tries < 5:
        random_module = random.choice(modules)
        random_module_code = f"{random_module.prefix}{random_module.code}"
        debug_print(
            f"Requesting module {random_module_code} page to obtain CloudFront cookies..."
        )
        lr1 = api_request(s, f"https://api.gradfast.com/module/{random_module_code}")
        if lr1.status_code != 200:
            debug_print(f"Failed to load module {random_module_code} page")
            raise Exception(f"Failed to load module {random_module_code} page")
        debug_print(lr1.headers)

        lr2 = api_request(
            s, f"https://api.gradfast.com/module/{random_module_code}/past-papers"
        )
        if lr2.status_code != 200:
            debug_print(f"Failed to load module {random_module_code} past papers")
            raise Exception(f"Failed to load module {random_module_code} past papers")
        debug_print(lr2.headers)
        sleep_random(2, 5)
        tries += 1

    if not cloudfront_cookie_received(s):
        raise Exception("Failed to obtain CloudFront cookies")

    print("Authentication successful.")
    debug_print(s.cookies)


def get_all_categories(s: requests.Session) -> List[ModuleCategory]:
    rq = api_request(s, "https://api.gradfast.com/categories")
    if rq.status_code != 200:
        console.error("Failed to load categories", rq.status_code, rq.text)
        raise Exception("Failed to load categories")
    categories: List[ModuleCategory] = parse_categories(rq.json())
    return categories


def get_all_modules(s: requests.Session) -> List[Module]:
    rq = api_request(s, "https://api.gradfast.com/modules")
    if rq.status_code != 200:
        console.error("Failed to load modules", rq.status_code, rq.text)
        raise Exception("Failed to load modules")
    modules: List[Module] = parse_modules(rq.json())
    return modules


def get_module_info(s: requests.Session, module_code: str) -> ModuleInfo:
    rq = api_request(s, f"https://api.gradfast.com/module/{module_code}")
    if rq.status_code != 200:
        console.error(
            f"Failed to load module {module_code} info", rq.status_code, rq.text
        )
        raise Exception(f"Failed to load module {module_code} info")
    module_info: ModuleInfo = parse_module_info(rq.json())
    return module_info


def get_module_past_papers(s: requests.Session, module_code: str) -> List[PastPaper]:
    rq = api_request(s, f"https://api.gradfast.com/module/{module_code}/past-papers")
    if rq.status_code != 200:
        console.error(
            f"Failed to load module {module_code} past papers", rq.status_code, rq.text
        )
        raise Exception(f"Failed to load module {module_code} past papers")
    past_papers: List[PastPaper] = parse_past_papers(rq.json())
    return past_papers


def download_file(
    s: requests.Session,
    url: str,
    root_des_path: str = "./",
    progress_bar: progressbar.ProgressBar | None = None,
) -> str | None:
    """Download a file via the provided session and save it to disk.

    Streams the response to avoid loading the whole file into memory. If a
    progress bar is provided, it is updated per chunk.

    Args:
        s: An authenticated/initialized requests.Session to use for the request.
        url: The file URL to download.
        root_des_path: Directory where the file will be saved.
        progress_bar: Optional progressbar.ProgressBar to update after each chunk.

    Returns:
        The local file path if the download succeeds, otherwise None.
    """
    local_filename = url.split("/")[-1]
    local_filename = urllib.parse.unquote(local_filename)
    local_filename = os.path.join(root_des_path, local_filename)
    try:
        with request_with_session(s, "GET", url, stream=True) as r:
            r.raise_for_status()  # raise exception if invalid response
            with open(local_filename, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        if progress_bar:
                            progress_bar.update(1)
        return local_filename
    except requests.exceptions.RequestException as e:
        console.error(f"Error downloading file from {url}: {e}")
        return None
