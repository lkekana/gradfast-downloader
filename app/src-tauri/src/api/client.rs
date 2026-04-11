//! Gradfast API client functions.
//!
//! This module provides high-level API functions for interacting
//! with the Gradfast service, including authentication and data retrieval.

use crate::api::session::{has_cloudfront_cookie, GradfastSession};
use crate::models::{Module, ModuleCategory, ModuleInfo, PastPaper};
use crate::utils::{sleep_random, sleep_random_sync};
use anyhow::{Context, Result};
use rand::seq::SliceRandom;
use reqwest::Response;
use std::sync::Arc;
use tokio::sync::Semaphore;

/// Maximum retry attempts for authentication.
const MAX_AUTH_RETRIES: usize = 5;

/// Authenticates the session with Gradfast.
///
/// This function initializes the session by making sequential API calls
/// to obtain the necessary CloudFront cookies for accessing protected resources.
///
/// # Arguments
///
/// * `session` - The Gradfast session to authenticate
///
/// # Returns
///
/// * `Ok(())` if authentication succeeds
/// * `Err(anyhow::Error)` if authentication fails
pub async fn authenticate(session: &GradfastSession) -> Result<()> {
    log::info!("Connecting to Gradfast to initialize session... (should take about 10s)");

    // Step 1: Load the main page to initialize session
    let r1 = session
        .page_get("/modules")
        .await
        .context("Failed to load main page")?;

    if !r1.status().is_success() {
        anyhow::bail!(
            "Failed to load main page: {} - {}",
            r1.status(),
            r1.text().await.unwrap_or_default()
        );
    }

    // print response headers for debugging
    log::debug!("Main page response headers:");
    r1.headers()        .iter()
        .for_each(|(k, v)| log::debug!("Header: {}: {}", k, v.to_str().unwrap_or_default()));

    log::debug!("Main page loaded successfully");
    sleep_random(1, 3).await;

    // Step 2: Fetch categories
    let r2 = session
        .api_get("/categories")
        .await
        .context("Failed to load categories")?;

    if !r2.status().is_success() {
        anyhow::bail!(
            "Failed to load categories: {} - {}",
            r2.status(),
            r2.text().await.unwrap_or_default()
        );
    }

    // print response headers for debugging
    log::debug!("Categories page response headers:");
    r2.headers()
        .iter()
        .for_each(|(k, v)| log::debug!("Header: {}: {}", k, v.to_str().unwrap_or_default()));

    let _categories: Vec<ModuleCategory> = r2
        .json()
        .await
        .context("Failed to parse categories response")?;

    log::debug!("Categories loaded successfully");
    sleep_random(1, 3).await;

    // Step 3: Fetch all modules (needed for random module selection)
    let r3 = session
        .api_get("/modules")
        .await
        .context("Failed to load modules")?;

    if !r3.status().is_success() {
        anyhow::bail!(
            "Failed to load modules: {} - {}",
            r3.status(),
            r3.text().await.unwrap_or_default()
        );
    }

    // print response headers for debugging
    log::debug!("Modules page response headers:");
    r3.headers()
        .iter()
        .for_each(|(k, v)| log::debug!("Header: {}: {}", k, v.to_str().unwrap_or_default()));

    let modules: Vec<Module> = r3
        .json()
        .await
        .context("Failed to parse modules response")?;

    log::debug!("Modules loaded successfully: {} modules found", modules.len());
    sleep_random(1, 3).await;

    // Step 4: Request module pages to obtain CloudFront cookies
    let mut tries = 0;
    let mut has_cloudfront = false;
    while !has_cloudfront && tries < MAX_AUTH_RETRIES {
        println!("Attempting to obtain CloudFront cookies (try {}/{})... ", tries + 1, MAX_AUTH_RETRIES);

        // Select a random module
        let random_module = modules
            .choose(&mut rand::thread_rng())
            .context("No modules available")?;
        let module_code = random_module.full_code();

        log::info!(
            "Requesting module {} page to obtain CloudFront cookies... (attempt {})",
            module_code,
            tries + 1
        );

        // Request module info
        let lr1 = session
            .api_get(&format!("/module/{}", module_code))
            .await
            .context(format!("Failed to load module {} info", module_code))?;

        if !lr1.status().is_success() {
            log::warn!("Failed to load module {} info", module_code);
        }

        // print response headers for debugging
        log::debug!("Module info response headers:");
        lr1.headers()
            .iter()
            .for_each(|(k, v)| log::debug!("Header: {}: {}", k, v.to_str().unwrap_or_default()));

        // Request module past papers
        let lr2 = session
            .api_get(&format!("/module/{}/past-papers", module_code))
            .await
            .context(format!("Failed to load module {} past papers", module_code))?;

        if !lr2.status().is_success() {
            log::warn!("Failed to load module {} past papers", module_code);
        }

        // print response headers for debugging
        log::debug!("Module past papers response headers:");
        lr2.headers()
            .iter()
            .for_each(|(k, v)| log::debug!("Header: {}: {}", k, v.to_str().unwrap_or_default()));

        // Check for CloudFront cookies
        has_cloudfront = check_cloudfront_cookie(&lr1, &lr2, session);

        if !has_cloudfront {
            sleep_random(2, 5).await;
            tries += 1;
        }
    }

    if !has_cloudfront {
        anyhow::bail!("Failed to obtain CloudFront cookies after {} attempts", tries);
    }

    log::info!("Authentication successful");
    Ok(())
}

/// Checks if CloudFront cookies are present in the responses or cookie store.
fn check_cloudfront_cookie(r1: &Response, r2: &Response, session: &GradfastSession) -> bool {
    // Check response headers first
    let header_has_cookie = r1
        .headers()
        .get(reqwest::header::SET_COOKIE)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.contains("CloudFront-"))
        .unwrap_or(false)
        || r2
            .headers()
            .get(reqwest::header::SET_COOKIE)
            .and_then(|v| v.to_str().ok())
            .map(|s| s.contains("CloudFront-"))
            .unwrap_or(false);

    if header_has_cookie {
        return true;
    }

    // Also check the cookie store
    has_cloudfront_cookie(session.cookie_store())
}

/// Fetches all module categories.
pub async fn get_all_categories(session: &GradfastSession) -> Result<Vec<ModuleCategory>> {
    let response = session
        .api_get("/categories")
        .await
        .context("Failed to fetch categories")?;

    if !response.status().is_success() {
        anyhow::bail!(
            "Failed to load categories: {} - {}",
            response.status(),
            response.text().await.unwrap_or_default()
        );
    }

    return response
        .json()
        .await
        .context("Failed to parse categories response")
}

/// Fetches all modules.
pub async fn get_all_modules(session: &GradfastSession) -> Result<Vec<Module>> {
    let response = session
        .api_get("/modules")
        .await
        .context("Failed to fetch modules")?;

    if !response.status().is_success() {
        anyhow::bail!(
            "Failed to load modules: {} - {}",
            response.status(),
            response.text().await.unwrap_or_default()
        );
    }

    response
        .json()
        .await
        .context("Failed to parse modules response")
}

/// Fetches detailed information for a specific module.
///
/// # Arguments
///
/// * `session` - The authenticated Gradfast session
/// * `module_code` - The module code (e.g., "WTW114")
pub async fn get_module_info(
    session: &GradfastSession,
    module_code: &str,
) -> Result<ModuleInfo> {
    let endpoint = format!("/module/{}", module_code);
    let response = session
        .api_get(&endpoint)
        .await
        .context(format!("Failed to fetch module {} info", module_code))?;

    if !response.status().is_success() {
        anyhow::bail!(
            "Failed to load module {} info: {} - {}",
            module_code,
            response.status(),
            response.text().await.unwrap_or_default()
        );
    }

    response
        .json()
        .await
        .context("Failed to parse module info response")
}

/// Fetches all past papers for a specific module.
///
/// # Arguments
///
/// * `session` - The authenticated Gradfast session
/// * `module_code` - The module code (e.g., "WTW114")
pub async fn get_module_past_papers(
    session: &GradfastSession,
    module_code: &str,
) -> Result<Vec<PastPaper>> {
    let endpoint = format!("/module/{}/past-papers", module_code);
    let response = session
        .api_get(&endpoint)
        .await
        .context(format!("Failed to fetch past papers for {}", module_code))?;

    if !response.status().is_success() {
        anyhow::bail!(
            "Failed to load past papers for {}: {} - {}",
            module_code,
            response.status(),
            response.text().await.unwrap_or_default()
        );
    }

    response
        .json()
        .await
        .context("Failed to parse past papers response")
}

/// Downloads a file to the specified directory.
///
/// # Arguments
///
/// * `session` - The authenticated Gradfast session
/// * `url` - The URL of the file to download
/// * `destination_dir` - The directory to save the file to
///
/// # Returns
///
/// The path to the downloaded file
pub async fn download_file(
    session: &GradfastSession,
    url: &str,
) -> Result<std::path::PathBuf> {
    use std::io::Write;
    use std::path::Path;

    // Extract filename from URL
    let filename = url
        .split('/')
        .last()
        .and_then(|s| {
            urlencoding::decode(s)
                .map(|decoded| decoded.to_string())
                .ok()
        })
        .context("Failed to extract filename from URL")?;

    let destination_dir = session.config.download.storage_and_organisation.destination_folder.clone();
    let file_path = Path::new(&destination_dir).join(&filename);

    // Create directory if it doesn't exist
    if let Some(parent) = file_path.parent() {
        std::fs::create_dir_all(parent).context("Failed to create destination directory")?;
    }

    // Download the file
    let response = session
        .download_file(url)
        .await
        .context("Failed to initiate download")?;

    if !response.status().is_success() {
        anyhow::bail!(
            "Download failed: {} - {}",
            response.status(),
            response.text().await.unwrap_or_default()
        );
    }

    let bytes = response
        .bytes()
        .await
        .context("Failed to read response bytes")?;

    // Write to file
    let mut file =
        std::fs::File::create(&file_path).context("Failed to create destination file")?;
    file.write_all(&bytes)
        .context("Failed to write file contents")?;

    log::debug!("Downloaded: {} -> {:?}", url, file_path);
    Ok(file_path)
}

/// Downloads a file with manual retry logic.
///
/// # Arguments
///
/// * `session` - The authenticated Gradfast session
/// * `url` - The URL of the file to download
/// * `destination_dir` - The directory to save the file to
/// * `max_retries` - Maximum number of retry attempts
///
/// # Returns
///
/// The path to the downloaded file, or an error after all retries are exhausted
pub async fn download_file_with_retry(
    session: &GradfastSession,
    url: &str,
) -> Result<std::path::PathBuf> {
    let mut last_error = None;
    let max_retries = session.config.download.performance.retry_attempts as usize;

    for attempt in 1..=max_retries {
        match download_file(session, url).await {
            Ok(path) => return Ok(path),
            Err(e) => {
                log::warn!("Download attempt {} failed: {}", attempt, e);
                last_error = Some(e);
                sleep_random(1, 2).await;
            }
        }
    }

    Err(last_error.unwrap_or_else(|| anyhow::anyhow!("Download failed after {} retries", max_retries)))
}

/// Downloads all past papers for a specific module.
///
/// # Arguments
///
/// * `session` - The authenticated Gradfast session
/// * `module` - The module to download papers for
pub async fn download_entire_module(
    session: &GradfastSession,
    module_code: &str,
) -> Result<()> {
    println!("\nDownloading past papers for {}...", module_code);
    
    // Get all past papers for the module
    let past_papers = get_module_past_papers(session, &module_code)
        .await
        .with_context(|| format!("Failed to get past papers for {}", module_code))?;

    let papers_found = past_papers.len();
    println!("Found {} past papers for {}.", papers_found, module_code);

    // Limit concurrent downloads to avoid overwhelming the server
    let max_concurrent = usize::from(session.config.download.performance.parallel_downloads);
    let semaphore = Arc::new(Semaphore::new(max_concurrent));
    
    // Download all papers concurrently with limited concurrency
    let mut handles = Vec::new();
    
    for paper in past_papers {
        let session_clone = session.clone();
        let permit = semaphore.clone().acquire_owned().await?;
    
        let handle = tokio::spawn(async move {
            let _permit = permit;
    
            // inlined body of download_single_paper
            sleep_random_sync(1, 3);
            download_file_with_retry(&session_clone, &paper.url)
                .await
                .with_context(|| format!("Failed to download: {}", paper.url))
        });
    
        handles.push(handle);
    }

    // Wait for all downloads to complete
    for handle in handles {
        handle.await
            .with_context(|| "Download task failed")?
            .with_context(|| "Download failed")?;
    }

    println!("{} download complete.", module_code);
    Ok(())
}
