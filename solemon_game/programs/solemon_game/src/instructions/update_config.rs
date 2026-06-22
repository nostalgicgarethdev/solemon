use anchor_lang::prelude::*;

use crate::constants::GAME_CONFIG_SEED;
use crate::state::GameConfig;

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump,
        has_one = authority
    )]
    pub game_config: Account<'info, GameConfig>,
}

pub fn handler(ctx: Context<UpdateConfig>, token_mint: Pubkey, min_token_balance: u64) -> Result<()> {
    let cfg = &mut ctx.accounts.game_config;
    cfg.token_mint = token_mint;
    cfg.min_token_balance = min_token_balance;
    msg!("Config updated. New mint: {}", token_mint);
    Ok(())
}