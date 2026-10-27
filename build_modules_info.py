from http.cookies import SimpleCookie
import json
import base64
import random
import time
from typing import List
from requests.cookies import RequestsCookieJar, create_cookie

from models import Module, ModuleInfo
from api import get_all_modules, make_session, get_module_info


def main():
    cookies_b64 = input("Enter Cookies string (base64): ")
    cookies: list[SimpleCookie] = json.loads(
        base64.b64decode(cookies_b64).decode("utf-8")
    )

    # add to CookieJar
    cj = RequestsCookieJar()
    for cookie in cookies:
        c = create_cookie(
            name=cookie["name"],
            value=cookie["value"],
            expires=cookie.get("expires"),
            path=cookie.get("path", "/"),
            domain=cookie.get("domain", "gradfast.com"),
            secure=cookie.get("secure", True),
            rest={
                "HttpOnly": cookie.get("httpOnly", True),
                "SameSite": cookie.get("sameSite"),
            },
        )
        cj.set_cookie(c)

    s = make_session()
    s.cookies.update(cj)
    modules: List[Module] = get_all_modules(s)
    random.shuffle(modules)  # shuffle modules to avoid any bias

    # catalog: dict[Module, List[PastPaper]] = {}
    modules_info: List[ModuleInfo] = []
    print("Modules:")
    for i, module in enumerate(modules):
        print(f"{i + 1}/{len(modules)}: {module.prefix}{module.code} - {module.name}")

        info: ModuleInfo = get_module_info(s, f"{module.prefix}{module.code}")
        modules_info.append(info)

        sleep_time = random.uniform(1, 5)
        time.sleep(sleep_time)

    # save modules to json file
    with open("modules.json", "w") as f:
        json.dump(
            [
                {
                    "code": {
                        "prefix": info.prefix,
                        "number": info.code,
                    },
                    "name": info.name,
                    "credits": info.credits,
                    "period": info.period,
                    "prerequisites": info.prerequisites,
                }
                for info in modules_info
            ],
            f,
            indent=4,
        )


if __name__ == "__main__":
    main()
