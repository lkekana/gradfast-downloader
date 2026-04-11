//! HTTP session management for Gradfast API.
//!
//! This module provides a session wrapper around `reqwest::Client`
//! that handles cookie persistence, user agent rotation, and
//! consistent request headers.

use crate::{cookies::{load_cookies, save_cookies}, user_agents::UserAgentGenerator};
use anyhow::{Context, Result};
use reqwest::{Client, Response};
use reqwest_cookie_store::CookieStoreMutex;
use std::sync::Arc;
use crate::config::Config;

/// Base URLs for the Gradfast service.
pub const GRADFAST_WEB_URL: &str = "https://www.gradfast.com";
pub const GRADFAST_API_URL: &str = "https://api.gradfast.com";

/// Default headers for API requests.
fn default_api_headers(user_agent: &str) -> reqwest::header::HeaderMap {
    let mut headers = reqwest::header::HeaderMap::new();

    headers.insert(
        reqwest::header::ACCEPT,
        "application/json, text/plain, */*".parse().unwrap(),
    );
    headers.insert(
        reqwest::header::ACCEPT_LANGUAGE,
        "en-US,en;q=0.9".parse().unwrap(),
    );
    headers.insert(reqwest::header::CONNECTION, "keep-alive".parse().unwrap());
    headers.insert(reqwest::header::DNT, "1".parse().unwrap());
    headers.insert(
        reqwest::header::REFERER,
        format!("{}/", GRADFAST_WEB_URL).parse().unwrap(),
    );
    headers.insert("Sec-Fetch-Dest", "empty".parse().unwrap());
    headers.insert("Sec-Fetch-Mode", "cors".parse().unwrap());
    headers.insert("Sec-Fetch-Site", "same-site".parse().unwrap());
    headers.insert(
        reqwest::header::USER_AGENT,
        user_agent.parse().unwrap(),
    );

    headers
}

/// Default headers for page requests (HTML).
fn default_page_headers(user_agent: &str) -> reqwest::header::HeaderMap {
    let mut headers = reqwest::header::HeaderMap::new();

    headers.insert(
        reqwest::header::ACCEPT,
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
            .parse()
            .unwrap(),
    );
    headers.insert(
        reqwest::header::ACCEPT_LANGUAGE,
        "en-US,en;q=0.9".parse().unwrap(),
    );
    headers.insert(reqwest::header::DNT, "1".parse().unwrap());
    headers.insert(
        reqwest::header::REFERER,
        "https://www.google.com/".parse().unwrap(),
    );
    headers.insert("Sec-Fetch-Dest", "document".parse().unwrap());
    headers.insert("Sec-Fetch-Mode", "navigate".parse().unwrap());
    headers.insert("Sec-Fetch-Site", "same-origin".parse().unwrap());
    headers.insert("Sec-Fetch-User", "?1".parse().unwrap());
    headers.insert(
        reqwest::header::UPGRADE_INSECURE_REQUESTS,
        "1".parse().unwrap(),
    );
    headers.insert(
        reqwest::header::USER_AGENT,
        user_agent.parse().unwrap(),
    );

    headers
}

/// A Gradfast API session that manages cookies and headers.
#[derive(Clone)]
pub struct GradfastSession {
    client: Client,
    user_agent: String,
    cookie_store: Arc<CookieStoreMutex>,
    pub config: Config,
}

impl GradfastSession {
    /// Creates a new Gradfast session with a random user agent.
    pub fn new(config: &Config) -> Result<Self> {
        let generator = UserAgentGenerator::new();
        let user_agent = generator.get_random_agent().to_string();
        log::debug!("Using User-Agent: {}", user_agent);

        let cookies = load_cookies();
        let cookie_store = match cookies {
            Some(store) => {
                log::debug!("Loaded {} cookies from disk", store.iter_any().count());
                Arc::new(CookieStoreMutex::new(store))
            }
            None => {
                log::debug!("No cookies found on disk, starting with empty store");
                Arc::new(CookieStoreMutex::default())
            }
        };

        let client = Client::builder()
            .user_agent(&user_agent)
            .gzip(true)
            .brotli(true)
            .deflate(true)
            .cookie_provider(cookie_store.clone())
            .build()
            .context("Failed to create HTTP client")?;

        Ok(Self {
            client,
            user_agent,
            cookie_store,
            config: config.clone(),
        })
    }

    /// Makes an API GET request to the specified endpoint.
    pub async fn api_get(&self, endpoint: &str) -> Result<Response> {
        let url = format!("{}/{}", GRADFAST_API_URL, endpoint.trim_start_matches('/'));
        let headers = default_api_headers(&self.user_agent);

        let resp = self.client
            .get(&url)
            .headers(headers)
            .send()
            .await
            .context(format!("API request failed: {}", url))?;

        self.save_cookies()
            .context("Failed to save cookies after API request")?;

        Ok(resp)
    }

    /// Makes a page GET request (for HTML content).
    pub async fn page_get(&self, endpoint: &str) -> Result<Response> {
        let url = if endpoint.starts_with("http") {
            endpoint.to_string()
        } else {
            format!("{}/{}", GRADFAST_WEB_URL, endpoint.trim_start_matches('/'))
        };
        let headers = default_page_headers(&self.user_agent);

        let resp = self.client
            .get(&url)
            .headers(headers)
            .send()
            .await
            .context(format!("Page request failed: {}", url))?;
        
        self.save_cookies()
            .context("Failed to save cookies after page request")?;
        
        Ok(resp)
    }

    /// Downloads a file from the specified URL.
    pub async fn download_file(&self, url: &str) -> Result<Response> {
        let headers = default_api_headers(&self.user_agent);

        self.client
            .get(url)
            .headers(headers)
            .send()
            .await
            .context(format!("Download failed: {}", url))
    }

    /// Returns the current user agent.
    pub fn user_agent(&self) -> &str {
        &self.user_agent
    }

    /// Returns a reference to the cookie store.
    pub fn cookie_store(&self) -> &CookieStoreMutex {
        &self.cookie_store
    }

    /// Saves the current cookies to disk.
    fn save_cookies(&self) -> Result<()> {
        let store = self.cookie_store.lock().unwrap();

        // 5. Iterate and print
        log::debug!("Current Cookies:");
        for c in store.iter_any() {
            log::debug!("{:?}", c);
        }

        save_cookies(&store)
    }
}

/// Authentication state for a Gradfast session.
#[derive(Debug, Clone)]
pub struct AuthState {
    pub authenticated: bool,
    pub has_cloudfront_cookie: bool,
}

impl AuthState {
    pub fn new() -> Self {
        Self {
            authenticated: false,
            has_cloudfront_cookie: false,
        }
    }
}

impl Default for AuthState {
    fn default() -> Self {
        Self::new()
    }
}

/// Checks if the session has received CloudFront cookies.
pub fn has_cloudfront_cookie(cookie_store: &CookieStoreMutex) -> bool {
    let store = cookie_store.lock().unwrap();
    let has_cookie = store
        .iter_any()
        .any(|c| c.name().starts_with("CloudFront-"));
    has_cookie
}

#[cfg(test)]
mod tests {
    use crate::config::ConfigManager;

    use super::*;

    #[test]
    fn test_create_session() {
        let config = ConfigManager::default_config();
        let session = GradfastSession::new(&config);
        assert!(session.is_ok());
    }

    #[test]
    fn test_user_agent() {
        let config = ConfigManager::default_config();
        let session = GradfastSession::new(&config).unwrap();
        let ua = session.user_agent();
        assert!(ua.starts_with("Mozilla/5.0"));
    }
}
