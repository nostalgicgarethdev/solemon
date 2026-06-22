use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::constants::{ENERGY_COST_EXPLORE, GAME_CONFIG_SEED, PLAYER_SEED, SPECIES_COUNT};
use crate::error::SolemonError;
use crate::state::{GameConfig, Player};

#[derive(Accounts)]
pub struct Explore<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, owner.key().as_ref()],
        bump = player.bump,
        constraint = player.owner == owner.key()
    )]
    pub player: Account<'info, Player>,

    #[account(
        associated_token::mint = game_config.token_mint,
        associated_token::authority = owner,
    )]
    pub player_token_account: Account<'info, TokenAccount>,
}

fn rand_u64(slot: u64, salt: u8, extra: u8) -> u64 {
    let mut x = slot
        .wrapping_mul(0x9E3779B97F4A7C15)
        .wrapping_add(salt as u64)
        .wrapping_add((extra as u64) << 32);
    x ^= x >> 30;
    x = x.wrapping_mul(0xBF58476D1CE4E5B9);
    x ^= x >> 27;
    x = x.wrapping_mul(0x94D049BB133111EB);
    x ^ (x >> 31)
}

pub fn handler(ctx: Context<Explore>) -> Result<()> {
    require!(
        ctx.accounts.player_token_account.amount >= ctx.accounts.game_config.min_token_balance,
        SolemonError::InsufficientTokenBalance
    );

    let player = &mut ctx.accounts.player;
    require!(player.energy >= ENERGY_COST_EXPLORE, SolemonError::NotEnoughEnergy);
    require!(player.team_len > 0, SolemonError::EmptyTeam);
    require!(!player.encounter_active, SolemonError::EncounterInProgress);

    let clock = Clock::get()?;
    let roll = rand_u64(clock.slot, player.wins as u8, player.losses as u8);

    let wild_species = (roll % SPECIES_COUNT as u64) as u8;
    let wild_level = (3 + ((roll >> 8) % 8)) as u8;
    let wild = crate::state::Mon::from_species(wild_species, wild_level);

    let idx = player.active_mon as usize;
    let player_power = player.team[idx].atk as u32 + player.team[idx].level as u32 * 2;
    let wild_power = wild.atk as u32 + wild_level as u32 * 2;
    let variance = ((roll >> 16) % 10) as u32;
    let won = player_power + variance >= wild_power;

    player.energy -= ENERGY_COST_EXPLORE;
    player.wild_species = wild_species;
    player.wild_level = wild_level;
    player.wild_hp = wild.hp;
    player.wild_max_hp = wild.max_hp;
    player.encounter_active = true;

    if won {
        player.wins += 1;
        player.wild_hp = player.wild_hp.saturating_div(2).max(1);
        let mon = &mut player.team[idx];
        mon.xp = mon.xp.saturating_add(25);
        if mon.xp >= 100 && mon.level < 50 {
            mon.level += 1;
            mon.xp = 0;
            let refreshed = crate::state::Mon::from_species(mon.species, mon.level);
            mon.max_hp = refreshed.max_hp;
            mon.hp = refreshed.max_hp;
            mon.atk = refreshed.atk;
            mon.def = refreshed.def;
        }
        msg!("Victory vs {} Lv{}", crate::constants::species_name(wild_species), wild_level);
    } else {
        player.losses += 1;
        let mon = &mut player.team[idx];
        mon.hp = mon.hp.saturating_sub(mon.max_hp / 4);
        msg!("Defeat vs {} Lv{}", crate::constants::species_name(wild_species), wild_level);
    }

    ctx.accounts.game_config.total_battles += 1;
    Ok(())
}