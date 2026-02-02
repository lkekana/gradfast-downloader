import random
import time
from random_user_agent.user_agent import UserAgent
from random_user_agent.params import SoftwareName, OperatingSystem


DEBUG_PRINTING_ENABLED = False

software_names = [
    SoftwareName.CHROME.value,
    SoftwareName.CHROMIUM.value,
    SoftwareName.FIREFOX.value,
    SoftwareName.EDGE.value,
    SoftwareName.SAFARI.value,
]
operating_systems = [
    OperatingSystem.WINDOWS.value,
    OperatingSystem.LINUX.value,
    OperatingSystem.MAC.value,
    OperatingSystem.MACOS.value,
    OperatingSystem.MAC_OS_X.value,
    OperatingSystem.IOS.value,
    OperatingSystem.ANDROID.value,
]


def debug_print(*args, **kwargs):
    """Print debug information if debug printing is enabled."""
    if DEBUG_PRINTING_ENABLED:
        print(*args, **kwargs)


def sleep_random(min_seconds: float, max_seconds: float):
    """Sleep for a random duration between the given bounds.

    Args:
        min_seconds: Minimum number of seconds to sleep (inclusive).
        max_seconds: Maximum number of seconds to sleep (inclusive).
    """
    sleep_time = random.uniform(min_seconds, max_seconds)
    time.sleep(sleep_time)


def get_random_user_agent() -> str:
    """Generate and return a random, realistic User-Agent string.

    Uses the configured lists of browsers (software_names) and operating systems
    (operating_systems) to sample a plausible header value.

    Returns:
        A User-Agent string suitable for HTTP request headers.
    """
    user_agent_rotator = UserAgent(
        software_names=software_names, operating_systems=operating_systems, limit=100
    )
    return user_agent_rotator.get_random_user_agent()


def remove_whitespace(s: str) -> str:
    """Remove all whitespace characters from the given string.

    Args:
        s: The input string.

    Returns:
        The input string with all whitespace characters removed.
    """
    return "".join(s.split())
