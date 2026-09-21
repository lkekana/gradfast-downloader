// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::Result;
use app_lib::api::{authenticate, download_entire_module, GradfastSession};
use app_lib::config::ConfigManager;

async fn test1() -> Result<()> {
    let config = match ConfigManager::load_config() {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Failed to load config: {e:#}");
            return Err(e);
        }
    };

    let session = match GradfastSession::new(&config) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Failed to create session: {e:#}");
            return Err(e);
        }
    };

    match authenticate(&session).await {
        Ok(_) => {
            println!("Authenticated successfully");
        }
        Err(e) => {
            eprintln!("Failed to authenticate: {e:#}");
            return Err(e);
        }
    };

    return match download_entire_module(&session, "WTW115").await {
        Ok(_) => {
            println!("Module downloaded successfully");
            Ok(())
        }
        Err(e) => {
            eprintln!("Failed to download module: {e:#}");
            Err(e)
        }
    };
}

fn main() {
    // hello world
    println!("Hello, world!");
    // if let Err(e) = tokio::runtime::Runtime::new()
    //     .expect("failed to create Tokio runtime")
    //     .block_on(test1())
    // {
    //     eprintln!("test1 failed: {e:#}");
    // }

    app_lib::run();
}
