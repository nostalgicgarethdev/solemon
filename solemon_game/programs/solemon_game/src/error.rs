use anchor_lang::prelude::*;

#[error_code]
pub enum SolemonError {
    #[msg("Invalid starter species")]
    InvalidStarter,
    #[msg("Team is full")]
    TeamFull,
    #[msg("Not enough energy")]
    NotEnoughEnergy,
    #[msg("Insufficient token balance — hold the SOLEMON CA to play")]
    InsufficientTokenBalance,
    #[msg("No active encounter")]
    NoEncounter,
    #[msg("Encounter already in progress")]
    EncounterInProgress,
    #[msg("Wild mon too healthy to catch")]
    WildTooHealthy,
    #[msg("Catch failed")]
    CatchFailed,
    #[msg("Invalid species")]
    InvalidSpecies,
    #[msg("Player already initialized")]
    PlayerAlreadyExists,
    #[msg("No mon to heal")]
    EmptyTeam,
}