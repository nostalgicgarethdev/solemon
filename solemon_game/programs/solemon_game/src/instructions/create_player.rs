use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::constants::{GAME_CONFIG_SEED, MAX_ENERGY, PLAYER_SEED, SPECIES_COUNT};
use crate::error::SolemonError;
use crate::state::{GameConfig, Mon, Player};

#[derive(Accounts)]
pub struct CreatePlayer<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        init,
        payer = owner,
        space = 8 + Player::INIT_SPACE,
        seeds = [PLAYER_SEED, owner.key().as_ref()],
        bump
    )]
    pub player: Account<'info, Player>,

    #[account(
        associated_token::mint = game_config.token_mint,
        associated_token::authority = owner,
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreatePlayer>, starter: u8) -> Result<()> {
    require!(starter < SPECIES_COUNT, SolemonError::InvalidStarter);
    require!(
        ctx.accounts.player_token_account.amount >= ctx.accounts.game_config.min_token_balance,
        SolemonError::InsufficientTokenBalance
    );

    let player = &mut ctx.accounts.player;
    player.owner = ctx.accounts.owner.key();
    player.team = [Mon::default(); 6];
    player.team[0] = Mon::from_species(starter, 5);
    player.team_len = 1;
    player.active_mon = 0;
    player.energy = MAX_ENERGY;
    player.wins = 0;
    player.losses = 0;
    player.catches = 0;
    player.encounter_active = false;
    player.bump = ctx.bumps.player;

    ctx.accounts.game_config.total_players += 1;

    msg!("Trainer created with {}", crate::constants::species_name(starter));
    Ok(())
}