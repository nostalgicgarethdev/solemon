use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::constants::{GAME_CONFIG_SEED, MAX_ENERGY, PLAYER_SEED};
use crate::error::SolemonError;
use crate::state::{GameConfig, Player};

#[derive(Accounts)]
pub struct HealTeam<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
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

pub fn handler(ctx: Context<HealTeam>) -> Result<()> {
    require!(
        ctx.accounts.player_token_account.amount >= ctx.accounts.game_config.min_token_balance,
        SolemonError::InsufficientTokenBalance
    );

    let player = &mut ctx.accounts.player;
    require!(player.team_len > 0, SolemonError::EmptyTeam);

    for i in 0..player.team_len as usize {
        player.team[i].hp = player.team[i].max_hp;
    }
    player.energy = MAX_ENERGY;
    player.encounter_active = false;

    msg!("Team healed. Energy restored.");
    Ok(())
}