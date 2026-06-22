pub const GAME_CONFIG_SEED: &[u8] = b"game_config";
pub const PLAYER_SEED: &[u8] = b"player";
pub const MAX_TEAM: usize = 6;
pub const MAX_ENERGY: u8 = 10;
pub const ENERGY_COST_EXPLORE: u8 = 1;

pub const SPECIES_COUNT: u8 = 6;

pub fn species_name(id: u8) -> &'static str {
    match id {
        0 => "SOLizard",
        1 => "RAYchu",
        2 => "BONKitten",
        3 => "JUPiter",
        4 => "WIFwolf",
        5 => "PENGUin",
        _ => "Unknown",
    }
}

pub fn base_stats(species: u8) -> (u16, u8, u8) {
    // (hp, atk, def)
    match species {
        0 => (45, 12, 10),
        1 => (40, 14, 8),
        2 => (42, 11, 11),
        3 => (48, 10, 12),
        4 => (44, 13, 9),
        5 => (46, 9, 13),
        _ => (40, 10, 10),
    }
}

pub fn level_scale(level: u8) -> u16 {
    100 + (level as u16) * 15
}