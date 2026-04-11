// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::{Context, Result};
use app_lib::config::ConfigManager;
use app_lib::api::{GradfastSession, authenticate, download_entire_module};
use app_lib::user_agents::UserAgentGenerator;

async fn test1() -> Result<()> {
    let config = ConfigManager::load_config();

    let session = GradfastSession::new(&config)
        .context("Failed to create session").unwrap();

    authenticate(&session).await
        .context("Authentication failed").unwrap();

    download_entire_module(&session, "WTW114").await?;

    Ok(())
}

fn main() {
  // app_lib::run();

  // hello world
  println!("Hello, world!");
  let generator = UserAgentGenerator::new();
  println!("Test: random user agent: {}", generator.get_random_agent());
  if let Err(e) = tokio::runtime::Runtime::new()
        .expect("failed to create Tokio runtime")
        .block_on(test1())
    {
        eprintln!("test1 failed: {e:#}");
    }

}
