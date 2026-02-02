# Mimicking JavaScript's console.warn and console.error in Python
from pprint import pformat
import sys
import traceback

# ANSI escape codes
RESET = "\u001b[0m"
BLACK = "\u001b[30m"
RED = "\u001b[31m"
GREEN = "\u001b[32m"
YELLOW = "\u001b[33m"
PURPLE = "\u001b[34m"
PINK_PURPLE = "\u001b[35m"
CYAN = "\u001b[36m"
WHITE = "\u001b[37m"
PINK = "\u001b[95m"  # bright magenta

BOLD = "\u001b[1m"
UNDERLINE = "\u001b[4m"
ITALIC = "\u001b[3m"
STRIKETHROUGH = "\u001b[9m"


def _format_console_part(val) -> str:
    if isinstance(val, BaseException):
        return "".join(
            traceback.format_exception(type(val), val, val.__traceback__)
        ).rstrip()
    if isinstance(val, (dict, list, tuple, set)):
        return pformat(val, compact=True)
    return str(val)


def _format_console_message(args, sep: str = " ") -> str:
    if not args:
        return ""
    first, *rest = args
    if isinstance(first, str) and "%" in first and rest:
        try:
            return first % tuple(rest)
        except Exception:
            pass
    return sep.join(_format_console_part(a) for a in args)


def warn(*args, sep: str = " ", end: str = "\n", flush: bool = True) -> None:
    print(_format_console_message(args, sep=sep), file=sys.stderr, end=end, flush=flush)


def error(*args, sep: str = " ", end: str = "\n", flush: bool = True) -> None:
    print(_format_console_message(args, sep=sep), file=sys.stderr, end=end, flush=flush)


def _print_color(
    color: str,
    *args,
    sep: str = " ",
    end: str = "\n",
    file=sys.stdout,
    flush: bool = True,
) -> None:
    msg = _format_console_message(args, sep=sep)
    print(f"{color}{msg}{RESET}", end=end, file=file, flush=flush)


# Color printers (Java-style API)
def print_black(*args, **kwargs) -> None:
    _print_color(BLACK, *args, **kwargs)


def print_red(*args, **kwargs) -> None:
    _print_color(RED, *args, **kwargs)


def print_green(*args, **kwargs) -> None:
    _print_color(GREEN, *args, **kwargs)


def print_yellow(*args, **kwargs) -> None:
    _print_color(YELLOW, *args, **kwargs)


def print_purple(*args, **kwargs) -> None:
    _print_color(PURPLE, *args, **kwargs)


def print_pink_purple(*args, **kwargs) -> None:
    _print_color(PINK_PURPLE, *args, **kwargs)


def print_cyan(*args, **kwargs) -> None:
    _print_color(CYAN, *args, **kwargs)


def print_white(*args, **kwargs) -> None:
    _print_color(WHITE, *args, **kwargs)


def print_pink(*args, **kwargs) -> None:
    _print_color(PINK, *args, **kwargs)


# print_black("This is black text")
# print_red("This is red text")
# print_green("This is green text")
# print_yellow("This is yellow text")
# print_purple("This is purple text")
# print_pink_purple("This is light purple text")
# print_cyan("This is cyan text")
# print_white("This is white text")
# print_pink("This is pink text")


def print_error(
    *args, sep: str = " ", end: str = "\n", file=sys.stderr, flush: bool = True
) -> None:
    msg = _format_console_message(args, sep=sep)
    print(f"{RED}ERROR: {msg}{RESET}", end=end, file=file, flush=flush)


def print_rainbow(
    message, end: str = "\n", file=sys.stdout, flush: bool = True
) -> None:
    colors = [RED, YELLOW, GREEN, PURPLE, PINK_PURPLE, CYAN, PINK]
    s = str(message)
    parts = [f"{colors[i % len(colors)]}{ch}" for i, ch in enumerate(s)]
    print("".join(parts) + RESET, end=end, file=file, flush=flush)


def print_bold(
    *args, sep: str = " ", end: str = "\n", file=sys.stdout, flush: bool = True
) -> None:
    msg = _format_console_message(args, sep=sep)
    print(f"{BOLD}{msg}{RESET}", end=end, file=file, flush=flush)


def print_underlined(
    *args, sep: str = " ", end: str = "\n", file=sys.stdout, flush: bool = True
) -> None:
    msg = _format_console_message(args, sep=sep)
    print(f"{UNDERLINE}{msg}{RESET}", end=end, file=file, flush=flush)


def print_italic(
    *args, sep: str = " ", end: str = "\n", file=sys.stdout, flush: bool = True
) -> None:
    msg = _format_console_message(args, sep=sep)
    print(f"{ITALIC}{msg}{RESET}", end=end, file=file, flush=flush)


def print_strikethrough(
    *args, sep: str = " ", end: str = "\n", file=sys.stdout, flush: bool = True
) -> None:
    msg = _format_console_message(args, sep=sep)
    print(f"{STRIKETHROUGH}{msg}{RESET}", end=end, file=file, flush=flush)
