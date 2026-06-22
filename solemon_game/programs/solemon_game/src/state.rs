use anchor_lang::prelude::*;

use crate::constants::MAX_TEAM;

#[account]
#[derive(InitSpace)]
pub struct GameConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub min_token_balance: u64,
    pub total_players: u32,
    pub total_battles: u32,
    pub total_catches: u32,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace, Default)]
pub struct Mon {
    pub species: u8,
    pub level: u8,
    pub hp: u16,
    pub max_hp: u16,
    pub atk: u8,
    pub def: u8,
    pub xp: u16,
}

#[account]
#[derive(InitSpace)]
pub struct Player {
    pub owner: Pubkey,
    pub team: [Mon; MAX_TEAM],
    pub team_len: u8,
    pub active_mon: u8,
    pub energy: u8,
    pub wins: u32,
    pub losses: u32,
    pub catches: u32,
    pub wild_species: u8,
    pub wild_level: u8,
    pub wild_hp: u16,
    pub wild_max_hp: u16,
    pub encounter_active: bool,
    pub bump: u8,
}

impl Mon {
    pub fn from_species(species: u8, level: u8) -> Self {
        use crate::constants::{base_stats, level_scale};
        let (hp, atk, def) = base_stats(species);
        let scale = level_scale(level);
        let max_hp = ((hp as u32) * scale as u32 / 100) as u16;
        let atk = ((atk as u32) * scale as u32 / 100) as u8;
        let def = ((def as u32) * scale as u32 / 100) as u8;
        Self {
            species,
            level,
            hp: max_hp,
            max_hp,
            atk,
            def,
            xp: 0,
        }
    }
}