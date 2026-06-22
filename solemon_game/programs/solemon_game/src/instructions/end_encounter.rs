use anchor_lang::prelude::*;

use crate::constants::{PLAYER_SEED};
use crate::error::SolemonError;
use crate::state::Player;

#[derive(Accounts)]
pub struct EndEncounter<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, owner.key().as_ref()],
        bump = player.bump,
        constraint = player.owner == owner.key()
    )]
    pub player: Account<'info, Player>,
}

pub fn handler(ctx: Context<EndEncounter>) -> Result<()> {
    require!(ctx.accounts.player.encounter_active, SolemonError::NoEncounter);
    ctx.accounts.player.encounter_active = false;
    msg!("Encounter ended.");
    Ok(())
}