//! Utility functions for the Gradfast downloader.
//!
//! Provides helper functions for user agent rotation, random delays,
//! and string manipulation.
use anyhow::Result;

/// Sleeps for a random duration between the given bounds.
///
/// # Arguments
///
/// * `min_secs` - Minimum number of seconds to sleep (inclusive)
/// * `max_secs` - Maximum number of seconds to sleep (inclusive)
pub async fn sleep_random(min_secs: u64, max_secs: u64) {
    let sleep_time = rand::random::<u64>() % (max_secs - min_secs + 1) + min_secs;
    tokio::time::sleep(tokio::time::Duration::from_secs(sleep_time)).await;
}

/// Synchronous version of `sleep_random` for non-async contexts.
pub fn sleep_random_sync(min_secs: u64, max_secs: u64) {
    let sleep_time = rand::random::<u64>() % (max_secs - min_secs + 1) + min_secs;
    std::thread::sleep(std::time::Duration::from_secs(sleep_time));
}

/// Removes all whitespace characters from a string.
///
/// # Arguments
///
/// * `s` - The input string
///
/// # Returns
///
/// A new `String` with all whitespace removed
pub fn remove_whitespace(s: &str) -> String {
    s.chars().filter(|c| !c.is_whitespace()).collect()
}

pub fn ensure_dir_exists(path: &std::path::Path) -> Result<()> {
    if !path.exists() {
        std::fs::create_dir_all(path)?;
    }
    Ok(())
}

pub fn get_app_data_dir() -> Option<std::path::PathBuf> {
    let base_dir = dirs::data_local_dir()
        .expect("Failed to determine home directory");

    let app_dir = base_dir.join("gradfast-downloader");
    match ensure_dir_exists(&app_dir) {
        Ok(_) => (app_dir).into(),
        Err(e) => {
            log::error!("Failed to create app data directory: {e}");
            return None;
        }
    }
}

pub fn get_home_dir() -> Option<std::path::PathBuf> {
    return dirs::home_dir();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_remove_whitespace() {
        assert_eq!(remove_whitespace("hello world"), "helloworld");
        assert_eq!(remove_whitespace("  test  "), "test");
        assert_eq!(remove_whitespace("a b c"), "abc");
        assert_eq!(remove_whitespace(""), "");
    }
}