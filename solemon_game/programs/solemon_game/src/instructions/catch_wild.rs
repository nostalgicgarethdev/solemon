use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::constants::{GAME_CONFIG_SEED, MAX_TEAM, PLAYER_SEED};
use crate::error::SolemonError;
use crate::state::{GameConfig, Mon, Player};

#[derive(Accounts)]
pub struct CatchWild<'info> {
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

pub fn handler(ctx: Context<CatchWild>) -> Result<()> {
    require!(
        ctx.accounts.player_token_account.amount >= ctx.accounts.game_config.min_token_balance,
        SolemonError::InsufficientTokenBalance
    );

    let player = &mut ctx.accounts.player;
    require!(player.encounter_active, SolemonError::NoEncounter);
    require!(player.team_len < MAX_TEAM as u8, SolemonError::TeamFull);

    let hp_pct = (player.wild_hp as u128)
        .saturating_mul(100)
        .saturating_div(player.wild_max_hp.max(1) as u128);
    require!(hp_pct <= 50, SolemonError::WildTooHealthy);

    let clock = Clock::get()?;
    let mut roll = clock.slot.wrapping_mul(0xDEADBEEF).wrapping_add(player.catches as u64);
    roll ^= roll >> 33;
    roll = roll.wrapping_mul(0xff51afd7ed558ccd);
    roll ^= roll >> 33;

    let catch_chance = 40 + (50 - hp_pct as u64);
    require!(roll % 100 < catch_chance, SolemonError::CatchFailed);

    let idx = player.team_len as usize;
    player.team[idx] = Mon::from_species(player.wild_species, player.wild_level);
    player.team_len += 1;
    player.catches += 1;
    player.encounter_active = false;

    ctx.accounts.game_config.total_catches += 1;

    msg!(
        "Caught {} Lv{}!",
        crate::constants::species_name(player.wild_species),
        player.wild_level
    );
    Ok(())
}