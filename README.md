# gradfast-downloader

A Python tool to download past semester test and exam papers from Gradfast, fast.

## Why

Although I've graduated now with a CS degree, uni was hard enough. Finding past papers and practice material easily should be a lot easier than it was when I was studying. While Gradfast helps, downloading papers one at a time was too slow - for me and, I imagine, for many others. This script automates and accelerates the process:

-   Scrape the entire site
-   Download for a specific module (e.g., WTW114 - Calculus)
-   Download for a whole module category/prefix (e.g., WTW - Mathematics)

Updated in 2026: no browser-based authentication needed. Everything is handled programmatically.

## Features

-   Session management and API calls via `api.make_session` and helpers:
    -   `api.get_all_modules`
    -   `api.get_all_categories`
    -   `api.get_module_past_papers`
-   Random realistic User-Agent rotation via `utils.get_random_user_agent`
-   Polite randomized delays via `utils.sleep_random`
-   Colored console output via `console.py`
-   Cookie persistence to `cookies.txt` via:
    -   `cookies.save_cookies`
    -   `cookies.load_cookies`
-   Parallel downloads with progress bars in `main.py`

The user-facing entrypoint is `main.py`. Module/category parsing lives in `models.py`.

## Requirements

-   Python 3.12 (enforced by `pyproject.toml`)
-   Dependencies:
    -   requests
    -   random-user-agent
    -   progressbar2
    -   retrying

## Setup and Run (uv)

Sync dependencies:
```sh
uv sync
```

Run the script:
```sh
uv run main.py
```

`uv` will honor `pyproject.toml` and use Python 3.12 as specified.

## Setup and Run (pip)

If you prefer pip:

1. Install:
    ```
    pip install -r requirements.txt
    ```
2. Run:
    ```
    python main.py
    ```

## Usage

On start, `main.py` presents three modes:

1. Download all past papers for all modules
2. Download for a module category (prefix), e.g., WTW
3. Download for a specific module, e.g., WTW114

Downloads are saved under `downloaded/` organized by module code.

## Authentication

The workflow in `api.authenticate` initializes the session and obtains the required CloudFront cookies. No browser interaction needed!

Cookies are stored in a local cookie jar (`cookies.txt`) and reused via `cookies.load_cookies`.

## Notes

-   Respectful scraping: requests include randomized delays via `utils.sleep_random`.
-   Progress indicators use progressbar2; see `main.py` for mode selection and threaded downloads using `api.download_file`.
-   Debugging: toggle `utils.DEBUG_PRINTING_ENABLED` and use `utils.debug_print` for verbose output.
-   ANSI-colored messages are provided by `console.py`.

## Project Structure

-   `main.py`: CLI entrypoint and orchestration
-   `api.py`: HTTP session, API calls, file download
-   `models.py`: Typed data structures for API responses
-   `utils.py`: Helper utilities (User-Agent, sleep, string sanitation)
-   `console.py`: Styled printing
-   `cookies.py`: Cookie load/save

## License

MIT — see `LICENSE`.
