use anyhow::{Result};
use std::fs::File;
use std::io::BufReader;
use std::path::{Path};
use serde::Deserialize;
use std::env;

fn make_cumulative_weight_index_pairs(agents: &Vec<UserAgent>) -> Vec<(f32, usize)> {
    let total_weight: f32 = agents.iter().map(|agent| agent.weight).sum();
    let mut sum = 0.0;
    return agents.iter().enumerate().map(|(index, agent)| {
        sum += agent.weight / total_weight;
        // println!("Agent: {}, Weight: {}, Cumulative Sum: {}", agent.user_agent, agent.weight, sum);
        (sum, index)
    }).collect();
}

fn load_user_agents_json() -> Result<Vec<UserAgent>> {
    let cwd = env::current_dir()?;
    println!("Current working dir: {:?}", cwd);

    let path = Path::new("./user-agents.json");
    if !path.exists() {
        panic!("user-agents.json file not found");
    }

    let file = File::open(path).expect("Failed to open user-agents.json");
    let reader = BufReader::new(file);
    let data: Vec<UserAgent> = serde_json::from_reader(reader)?;
    if data.is_empty() {
        panic!("No user agents found in user-agents.json");
    }
    Ok(data)
}
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionData {
    pub downlink: f32,
    pub effective_type: String,
    pub rtt: u32,
    pub downlink_max: Option<f32>,
    pub connection_type: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserAgent {
    pub app_name: String,
    pub connection: Option<ConnectionData>,
    pub language: Option<String>,
    pub oscpu: Option<String>,
    pub platform: String,
    pub plugins_length: usize,
    pub screen_height: u32,
    pub screen_width: u32,
    pub user_agent: String,
    pub vendor: String,
    pub weight: f32,
}

pub struct UserAgentGenerator {
    agents: Vec<UserAgent>,
    weight_index_pairs: Vec<(f32, usize)>,
}

impl UserAgentGenerator {
    pub fn new() -> Self {
        let agents = match load_user_agents_json() {
            Ok(agents) => agents,
            Err(e) => {
                panic!("Failed to load user agents: {:?}", e);
            }
        };

        let weight_index_pairs = make_cumulative_weight_index_pairs(&agents);

        Self {
            agents,
            weight_index_pairs,
        }
    }

    pub fn get_random_agent(&self) -> &str {
        let random_value: f32 = rand::random();
        let index = self.weight_index_pairs.iter()
            .position(|(cumulative_weight, _)| *cumulative_weight >= random_value)
            .expect("Failed to find a user agent based on weights");
        let agent_index = self.weight_index_pairs[index].1;
        return self.agents[agent_index].user_agent.as_str();
    }
}