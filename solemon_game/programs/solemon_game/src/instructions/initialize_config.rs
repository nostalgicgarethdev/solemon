use anchor_lang::prelude::*;

use crate::constants::GAME_CONFIG_SEED;
use crate::state::GameConfig;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + GameConfig::INIT_SPACE,
        seeds = [GAME_CONFIG_SEED],
        bump
    )]
    pub game_config: Account<'info, GameConfig>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeConfig>, token_mint: Pubkey, min_token_balance: u64) -> Result<()> {
    let cfg = &mut ctx.accounts.game_config;
    cfg.authority = ctx.accounts.authority.key();
    cfg.token_mint = token_mint;
    cfg.min_token_balance = min_token_balance;
    cfg.total_players = 0;
    cfg.total_battles = 0;
    cfg.total_catches = 0;
    cfg.bump = ctx.bumps.game_config;

    msg!("SOLEMON config initialized. Token mint: {}", token_mint);
    Ok(())
}