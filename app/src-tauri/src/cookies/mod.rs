//! Cookie persistence module.
//!
//! Handles loading and saving cookies to a file for session persistence
//! across application restarts.

use anyhow::{Context, Result};
use cookie_store::CookieStore;
use std::fs;
use std::io::Write;
use std::path::PathBuf;

/// Default filename for the cookies file.
const COOKIES_FILE_NAME: &str = "cookies.json";

/// Default URL to use for cookie parsing (needed by the cookie crate).
// const DEFAULT_URL: &str = "https://www.gradfast.com";

/// Returns the path to the cookies file.
///
/// The cookies are stored in the application's data directory.
pub fn get_cookies_file_path() -> Result<PathBuf> {
    // Try to get the app data directory first
    let base_dir = dirs::data_local_dir()
        .or_else(|| dirs::home_dir())
        .context("Failed to determine home directory")?;

    let app_dir = base_dir.join("gradfast-downloader");
    fs::create_dir_all(&app_dir).context("Failed to create app data directory")?;

    // print the path for debugging
    println!("Cookies file path: {:?}", app_dir.join(COOKIES_FILE_NAME));
    Ok(app_dir.join(COOKIES_FILE_NAME))
}

/// Loads cookies from the cookies file if it exists.
///
/// Returns `None` if the file doesn't exist or is empty, and `Some(CookieStore)` if cookies were successfully loaded.
/// Returns `Ok(Some(CookieStore))` if cookies were successfully loaded.
pub fn load_cookies() -> Option<CookieStore> {
    let path = match get_cookies_file_path() {
        Ok(p) => p,
        Err(e) => {
            log::error!("Failed to get cookies file path: {e}");
            return None;
        }
    };

    if !path.exists() {
        return None;
    }

    let cookie_store = {
    if let Ok(file) = std::fs::File::open(path)
        .map(std::io::BufReader::new) {
        cookie_store::serde::json::load(file).unwrap()
        }
        else {
        reqwest_cookie_store::CookieStore::new(None)
        }
    };
    let cookie_store = reqwest_cookie_store::CookieStoreMutex::new(cookie_store);
    return Some(cookie_store.into_inner().unwrap());
}

/// Saves cookies to the cookies file.
///
/// Creates the directory structure if it doesn't exist.
pub fn save_cookies(cookie_store: &CookieStore) -> Result<()> {
    let path = get_cookies_file_path()?;
    
    //print cookies
    log::debug!("\n\nSaving cookies:");
    cookie_store.iter_any().for_each(|c| {
      log::debug!("Saving cookie: {}={}", c.name(), c.value());
    });

    let mut writer = std::fs::File::create(&path)
      .map(std::io::BufWriter::new)
      .unwrap();
    
    cookie_store::serde::json::save_incl_expired_and_nonpersistent(&cookie_store, &mut writer).unwrap();
    writer.flush()
        .context("Failed to flush cookies to disk")?; // ← Critical!
    Ok(())
}

/// Clears all saved cookies by removing the cookies file.
pub fn clear_cookies() -> Result<()> {
    let path = get_cookies_file_path()?;

    if path.exists() {
        fs::remove_file(&path).context("Failed to remove cookies file")?;
        log::info!("Cookies cleared");
    }

    Ok(())
}

/// Checks if the cookies file exists.
pub fn has_saved_cookies() -> bool {
    get_cookies_file_path()
        .map(|p| p.exists())
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cookies_persistence() {
        // Create a cookie store with a test cookie
        let store = CookieStore::default();

        // Save and load back
        save_cookies(&store).unwrap();
        let loaded = load_cookies();

        // Empty store should return None
        assert!(loaded.is_none());

        // Clean up
        clear_cookies().unwrap();
    }
}
