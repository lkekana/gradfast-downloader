from http.cookiejar import MozillaCookieJar, CookieJar
from pathlib import Path
from typing import Optional

COOKIES_FILE = Path.cwd() / "cookies.txt"


def load_cookies() -> Optional[CookieJar]:
    """
    Load cookies from 'cookies.txt' in the current directory if it exists.
    Returns a CookieJar or None if the file does not exist or cannot be loaded.
    """
    if not COOKIES_FILE.exists():
        return None

    jar = MozillaCookieJar(str(COOKIES_FILE))
    try:
        jar.load(ignore_discard=True, ignore_expires=True)
        return jar
    except Exception:
        return None


def save_cookies(cookie_jar: CookieJar) -> None:
    """
    Save cookies from the given CookieJar to 'cookies.txt' in the current directory.
    """
    mozilla_jar = MozillaCookieJar(str(COOKIES_FILE))
    for cookie in cookie_jar:
        mozilla_jar.set_cookie(cookie)
    mozilla_jar.save(ignore_discard=True, ignore_expires=True)
