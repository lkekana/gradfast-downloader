//! Gradfast Downloader Library
//!
//! This library provides a Rust implementation of the Gradfast downloader,
//! enabling programmatic access to past exam papers and module information.
//!
//! # Modules
//!
//! - `api`: HTTP session management and API client functions
//! - `config`: Configuration management for user settings and preferences
//! - `cookies`: Cookie persistence for session management
//! - `models`: Typed data structures for API responses
//! - `utils`: Utility functions
//! - `user_agents`: User agent generation

pub mod api;
pub mod config;
pub mod cookies;
pub mod models;
pub mod user_agents;
pub mod utils;

// Re-export commonly used types for convenience
pub use api::{
    authenticate, download_file, download_file_with_retry, get_all_categories, get_all_modules,
    get_module_info, get_module_past_papers, GradfastSession,
};
pub use cookies::{clear_cookies, has_saved_cookies, load_cookies, save_cookies};
pub use models::{Module, ModuleCategory, ModuleInfo, PastPaper};
pub use utils::{remove_whitespace, sleep_random, sleep_random_sync};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
