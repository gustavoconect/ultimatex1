from pydantic import BaseModel
from typing import List, Optional, Dict

class PlayerSetup(BaseModel):
    player_a: str
    elo_a: str
    pdl_a: int = 0
    player_b: str
    elo_b: str
    pdl_b: int = 0
    tournament_phase: str = "Groups" # "Groups" or "Knockout"
    series_format: Optional[str] = "MD2" # MD2, MD3, MD5
    announce_first: Optional[str] = None # Name of player who announces first

class GameState(BaseModel):
    setup_complete: bool
    player_a: str
    player_b: str
    elo_a: str
    elo_b: str
    tournament_phase: str
    series_format: str
    series_score: Dict[str, int] # {"A": 0, "B": 0}
    start_player: Optional[str]
    current_action_player: Optional[str]
    announce_turn_player: Optional[str] # For Knockout announcements
    
    banned_lanes: List[str]
    selected_lane: Optional[str]
    
    # Groups Phase Data
    drawn_champions: List[str]
    
    # Knockout Phase Data
    announced_champions: Dict[str, List[str]] # {"A": [], "B": []}
    knockout_bans: List[str] # Champions banned in knockout phase
    
    picks: Dict[str, str] # Game 1 -> Champ, Game 2 -> Champ, etc.
    global_blacklist: List[Dict] # [{name, image, phase}]

class ChampionAnnounceRequest(BaseModel):
    champion: str
    image: str

class KnockoutBanRequest(BaseModel):
    champion: str


class BanLaneRequest(BaseModel):
    lane: str

class PickRequest(BaseModel):
    game: str # "Game 1" or "Game 2"
    champion: str
    image: str
    player: str

class BlacklistAddRequest(BaseModel):
    champion: str
    image: str

class PlayerRegisterRequest(BaseModel):
    name: str
    elo: Optional[str] = "Ferro IV"
    pdl: Optional[int] = 0
