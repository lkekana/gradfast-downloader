//! Gradfast API module.
//!
//! This module provides HTTP session management and API client functions
//! for interacting with the Gradfast service.
//!
//! # Modules
//!
//! - `session`: HTTP session management with cookie handling
//! - `client`: High-level API client functions

pub mod client;
pub mod session;

pub use client::*;
pub use session::*;
