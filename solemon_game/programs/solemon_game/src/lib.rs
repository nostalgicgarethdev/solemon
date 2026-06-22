pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use instructions::*;
pub use state::*;

declare_id!("GwTaRnwmL5qXbmdAqNdcoWeuWFxNLcNiWoNmRFNGhPdL");

#[program]
pub mod solemon_game {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        token_mint: Pubkey,
        min_token_balance: u64,
    ) -> Result<()> {
        initialize_config::handler(ctx, token_mint, min_token_balance)
    }

    pub fn create_player(ctx: Context<CreatePlayer>, starter: u8) -> Result<()> {
        create_player::handler(ctx, starter)
    }

    pub fn explore(ctx: Context<Explore>) -> Result<()> {
        explore::handler(ctx)
    }

    pub fn catch_wild(ctx: Context<CatchWild>) -> Result<()> {
        catch_wild::handler(ctx)
    }

    pub fn heal_team(ctx: Context<HealTeam>) -> Result<()> {
        heal_team::handler(ctx)
    }

    pub fn end_encounter(ctx: Context<EndEncounter>) -> Result<()> {
        end_encounter::handler(ctx)
    }

    pub fn update_config(
        ctx: Context<UpdateConfig>,
        token_mint: Pubkey,
        min_token_balance: u64,
    ) -> Result<()> {
        update_config::handler(ctx, token_mint, min_token_balance)
    }
}