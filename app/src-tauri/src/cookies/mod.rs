//! Cookie persistence module.
//!
//! Handles loading and saving cookies to a file for session persistence
//! across application restarts.

use anyhow::Result;
use cookie_store::CookieStore;
use std::fs;
use std::io::Write;
use std::path::PathBuf;

use crate::utils;

/// Default filename for the cookies file.
const COOKIES_FILE_NAME: &str = "cookies.json";

/// Default URL to use for cookie parsing (needed by the cookie crate).
// const DEFAULT_URL: &str = "https://www.gradfast.com";

/// Returns the path to the cookies file.
///
/// The cookies are stored in the application's data directory.
pub fn get_cookies_file_path() -> Result<PathBuf> {
    let base_dir = match dirs::data_local_dir() {
        Some(dir) => dir,
        None => return Err(anyhow::anyhow!("Failed to determine home directory")),
    };

    let app_dir = base_dir.join("gradfast-downloader");
    if let Err(e) = utils::ensure_dir_exists(&app_dir) {
        log::error!("Failed to create app data directory at {:?}: {e}", app_dir);
        return Err(e.into());
    }

    // print the path for debugging
    // println!("Cookies file path: {:?}", app_dir.join(COOKIES_FILE_NAME));
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

    return match std::fs::File::open(path).map(std::io::BufReader::new) {
        Ok(file) => {
            let store = cookie_store::serde::json::load(file).unwrap();
            log::info!("Cookies loaded successfully from file");
            Some(store)
        }
        Err(e) => {
            log::error!("Failed to open cookies file: {e}");
            None
        }
    };
}

/// Saves cookies to the cookies file.
///
/// Creates the directory structure if it doesn't exist.
pub fn save_cookies(cookie_store: &CookieStore) -> Result<()> {
    let path = match get_cookies_file_path() {
        Ok(p) => p,
        Err(e) => {
            log::error!("Failed to get cookies file path: {e}");
            return Err(e);
        }
    };

    //print cookies
    log::debug!("\n\nSaving cookies:");
    cookie_store.iter_any().for_each(|c| {
        log::debug!("Saving cookie: {}={}", c.name(), c.value());
    });

    let mut writer = match std::fs::File::create(&path).map(std::io::BufWriter::new) {
        Ok(w) => w,
        Err(e) => {
            log::error!("Failed to create cookies file at {:?}: {e}", path);
            return Err(e.into());
        }
    };

    cookie_store::serde::json::save_incl_expired_and_nonpersistent(&cookie_store, &mut writer)
        .unwrap();
    return match writer.flush() {
        Ok(_) => {
            log::info!("Cookies saved successfully to {:?}", path);
            Ok(())
        }
        Err(e) => {
            log::error!("Failed to flush cookies to file at {:?}: {e}", path);
            Err(e.into())
        }
    };
}

/// Clears all saved cookies by removing the cookies file.
pub fn clear_cookies() -> Result<()> {
    let path = match get_cookies_file_path() {
        Ok(p) => p,
        Err(e) => {
            log::error!("Failed to get cookies file path: {e}");
            return Err(e);
        }
    };

    if !path.exists() {
        log::info!("No cookies file found to clear at {:?}", path);
        return Ok(());
    }

    return match fs::remove_file(&path) {
        Ok(_) => {
            log::info!("Cookies cleared");
            Ok(())
        }
        Err(e) => {
            log::error!("Failed to remove cookies file at {:?}: {e}", path);
            Err(e.into())
        }
    };
}

/// Checks if the cookies file exists.
pub fn has_saved_cookies() -> Result<bool> {
    return match get_cookies_file_path() {
        Ok(p) => {
            log::debug!(
                "Checking for cookies file at {:?}: exists={}",
                p,
                p.exists()
            );
            return Ok(p.exists());
        }
        Err(e) => {
            log::error!("Failed to get cookies file path: {e}");
            // Ok(false);
            Err(e)
        }
    };
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
