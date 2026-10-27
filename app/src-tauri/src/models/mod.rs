//! Data models for Gradfast API responses.
//!
//! This module defines the typed data structures used to represent
//! API responses from the Gradfast service.

use serde::{Deserialize, Serialize};

/// Module category returned by the `/categories` endpoint.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModuleCategory {
    pub name: String,
    pub description: String,
}

/// Module returned by the `/modules` endpoint.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Module {
    pub prefix: String,
    pub code: u16,
    pub name: String,
}

impl Module {
    /// Returns the full module code (e.g., "WTW114").
    pub fn full_code(&self) -> String {
        format!("{}{}", self.prefix, self.code)
    }
}

/// Detailed module information returned by `/module/{code}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModuleInfo {
    pub prefix: String,
    pub code: u16,
    pub name: String,
    pub credits: String,
    pub period: String,
    pub prerequisites: Vec<String>,
}

impl ModuleInfo {
    /// Returns the full module code (e.g., "WTW114").
    pub fn full_code(&self) -> String {
        format!("{}{}", self.prefix, self.code)
    }
}

/// Past paper entry returned by `/module/{code}/past-papers`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PastPaper {
    pub category: String,
    pub version: String,
    pub description: String,
    pub year: String,
    pub memo: String,
    pub url: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_module_full_code() {
        let module = Module {
            prefix: "WTW".to_string(),
            code: 114,
            name: "Calculus".to_string(),
        };
        assert_eq!(module.full_code(), "WTW114");
    }

    #[test]
    fn test_module_info_full_code() {
        let info = ModuleInfo {
            prefix: "COS".to_string(),
            code: 151,
            name: "Computer Science".to_string(),
            credits: "24".to_string(),
            period: "1".to_string(),
            prerequisites: vec![],
        };
        assert_eq!(info.full_code(), "COS151");
    }
}
