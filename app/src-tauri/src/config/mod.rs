use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use strum::{Display, EnumIter, EnumString};

const CONFIG_FILE_NAME: &str = "config.json";

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Config {
    pub general: GeneralConfig,
    pub programme: ProgrammeConfig,
    pub download: DownloadConfig,
    pub filters: FiltersConfig,
    pub papers: PapersConfig,
    pub advanced: AdvancedConfig,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GeneralConfig {
    pub theme: String,
    pub auto_selection: AutoSelectionConfig,
    pub check_for_updates: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AutoSelectionConfig {
    pub auto_select_modules: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProgrammeConfig {
    pub programme_code: Option<String>,
    pub programme_year: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DownloadConfig {
    pub storage_and_organisation: StorageAndOrganisationConfig,
    pub performance: PerformanceConfig,
}

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, EnumString, Display, EnumIter, Serialize, Deserialize,
)]
#[strum(serialize_all = "kebab_case")] // "code-year-type", etc.
pub enum FileNamePattern {
    CodeYearType,    // "{code}_{year}_{type}.pdf" eg. "COS301_2024_exam
    NameYearType,    // "{name}_{year}_{type}.pdf" eg. "Software Engineering_2024_exam.pdf"
    CodeNameYear,    // "{code}_{name}_{year}.pdf" eg. "COS301_Software Engineering_2024.pdf"
    FacultyCodeYear, // "{faculty}/{code}/{year}_{type}.pdf" eg. "EBIT/COS301/2024_exam.pdf"
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StorageAndOrganisationConfig {
    pub destination_folder: String,
    pub organise_by_module: bool,
    pub file_name_pattern: FileNamePattern,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PerformanceConfig {
    pub parallel_downloads: u8,
    pub retry_attempts: u8,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FiltersConfig {
    pub module: ModuleFilterConfig,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ModuleFilterConfig {
    pub roles: RolesConfig,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RolesConfig {
    pub fundamental: bool,
    pub core: bool,
    pub elective: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PapersConfig {
    pub types: PaperTypesConfig,
    pub year_range: YearRangeConfig,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PaperTypesConfig {
    pub exams: bool,
    pub class_tests: bool,
    pub tutorials: bool,
    pub semester_tests: bool,
    pub practicals: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct YearRangeConfig {
    pub minimum_year: u16,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AdvancedConfig {
    pub metadata_and_content: MetadataAndContentConfig,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MetadataAndContentConfig {
    pub include_metadata: bool,
    pub include_module_info: bool,
}

pub struct ConfigManager;

impl ConfigManager {
    /// Returns the path to the configuration file.
    ///
    /// The configuration is stored in the application's data directory.
    pub fn get_config_file_path() -> Result<PathBuf> {
        // Try to get the app data directory first
        let base_dir = match dirs::data_local_dir() {
            Some(dir) => dir,
            None => return Err(anyhow::anyhow!("Failed to determine home directory")),
        };

        let app_dir = base_dir.join("gradfast-downloader");
        if let Err(e) = fs::create_dir_all(&app_dir) {
            log::error!(
                "Failed to create app data directory at {:?}: {:?}",
                app_dir,
                e
            );
            return Err(e.into());
        }

        Ok(app_dir.join(CONFIG_FILE_NAME))
    }

    pub fn default_config() -> Result<Config> {
        let home = match crate::utils::get_home_dir() {
            Some(dir) => dir,
            None => return Err(anyhow::anyhow!("Failed to determine home directory")),
        };

        Ok(Config {
            general: GeneralConfig {
                theme: "system".to_string(),
                auto_selection: AutoSelectionConfig {
                    auto_select_modules: true,
                },
                check_for_updates: true,
            },
            programme: ProgrammeConfig {
                programme_code: None,
                programme_year: None,
            },
            download: DownloadConfig {
                storage_and_organisation: StorageAndOrganisationConfig {
                    // destination_folder: format!("{}/Downloads/PastPapers", crate::utils::get_home_dir()),
                    destination_folder: {
                        home.join("Downloads")
                            .join("PastPapers")
                            .to_string_lossy()
                            .to_string()
                    },
                    organise_by_module: true,
                    file_name_pattern: FileNamePattern::CodeYearType,
                },
                performance: PerformanceConfig {
                    parallel_downloads: 3,
                    retry_attempts: 3,
                },
            },
            filters: FiltersConfig {
                module: ModuleFilterConfig {
                    roles: RolesConfig {
                        fundamental: true,
                        core: true,
                        elective: true,
                    },
                },
            },
            papers: PapersConfig {
                types: PaperTypesConfig {
                    exams: true,
                    class_tests: true,
                    tutorials: true,
                    semester_tests: true,
                    practicals: true,
                },
                year_range: YearRangeConfig { minimum_year: 2010 },
            },
            advanced: AdvancedConfig {
                metadata_and_content: MetadataAndContentConfig {
                    include_metadata: true,
                    include_module_info: false,
                },
            },
        })
    }

    pub fn load_config() -> Result<Config> {
        let config_path = match Self::get_config_file_path() {
            Ok(path) => path,
            Err(e) => {
                log::error!("Failed to get config file path: {:?}", e);
                return Err(e);
            }
        };
        println!("Loading config from: {:?}", config_path);

        if !config_path.exists() {
            log::info!("No config file found, creating a default one.");
            let default = match Self::default_config() {
                Ok(config) => config,
                Err(e) => {
                    log::error!("Failed to create default config: {:?}", e);
                    return Err(e);
                }
            };
            return match Self::save_config(&default) {
                Ok(_) => {
                    log::info!("Default config file created successfully.");
                    Ok(default)
                }
                Err(e) => {
                    log::error!("Failed to create default config file: {:?}", e);
                    Err(e)
                }
            };
        }

        let config_data = match fs::read_to_string(&config_path) {
            Ok(data) => data,
            Err(e) => {
                log::error!("Failed to read config file at {:?}: {:?}", config_path, e);
                return Err(e.into());
            }
        };

        return match serde_json::from_str(&config_data) {
            Ok(config) => Ok(config),
            Err(e) => {
                log::error!("Failed to parse config file at {:?}: {:?}", config_path, e);
                Err(e.into())
            }
        };
    }

    pub fn save_config(config: &Config) -> Result<()> {
        let config_path = match Self::get_config_file_path() {
            Ok(path) => path,
            Err(e) => {
                log::error!("Failed to get config file path: {:?}", e);
                return Err(e);
            }
        };
        let config_data = match serde_json::to_string_pretty(config) {
            Ok(data) => data,
            Err(e) => {
                log::error!("Failed to serialize config to JSON: {:?}", e);
                return Err(e.into());
            }
        };

        return match fs::write(config_path, config_data) {
            Ok(_) => {
                log::info!("Config saved successfully.");
                Ok(())
            }
            Err(e) => {
                log::error!("Failed to write config file: {:?}", e);
                Err(e.into())
            }
        };
    }
}
