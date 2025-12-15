import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def log(msg):
    print(f"[TEST] {msg}")

def check_state(key, expected):
    res = requests.get(f"{BASE_URL}/state").json()
    val = res.get(key)
    if val != expected:
        print(f"FAILED: Expected {key}={expected}, got {val}")
        print(f"Full State: {json.dumps(res, indent=2)}")
        exit(1)
    else:
        print(f"PASS: {key} is {val}")

def test_knockout_flow():
    log("Starting Knockout Flow Verification")

    # 1. Setup
    setup_data = {
        "player_a": "PlayerA", "elo_a": "Desafiante", "pdl_a": 1000,
        "player_b": "PlayerB", "elo_b": "Mestre", "pdl_b": 500,
        "tournament_phase": "Knockout",
        "series_format": "MD3",
        "announce_first": "PlayerB"
    }
    log("Calling /setup with Knockout phase...")
    requests.post(f"{BASE_URL}/setup", json=setup_data)
    
    check_state("tournament_phase", "Knockout")
    check_state("announce_turn_player", "B") # PlayerB selected to start

    # 2. Announcement (MD3 needs 4 announced total)
    # Player B announces
    log("Announcing Champ 1 (Player B)...")
    requests.post(f"{BASE_URL}/announce-champion", json={"champion": "Yasuo", "image": "img1"})
    check_state("announce_turn_player", "A")

    # Player A announces
    log("Announcing Champ 2 (Player A)...")
    requests.post(f"{BASE_URL}/announce-champion", json={"champion": "Yone", "image": "img2"})
    check_state("announce_turn_player", "B")

    # Player B announces
    log("Announcing Champ 3 (Player B)...")
    requests.post(f"{BASE_URL}/announce-champion", json={"champion": "Zed", "image": "img3"})
    
    # Player A announces
    log("Announcing Champ 4 (Player A)...")
    requests.post(f"{BASE_URL}/announce-champion", json={"champion": "Ahri", "image": "img4"})
    
    # Check announced lists
    res = requests.get(f"{BASE_URL}/state").json()
    if len(res["announced_champions"]["A"]) != 2 or len(res["announced_champions"]["B"]) != 2:
        print("FAILED: Include 2 champs each.")
        exit(1)
    log("PASS: Announcement counts correct.")

    # 3. Bans
    log("Banning Yasuo...")
    requests.post(f"{BASE_URL}/knockout-ban", json={"champion": "Yasuo"})
    
    log("Banning Ahri...")
    requests.post(f"{BASE_URL}/knockout-ban", json={"champion": "Ahri"})
    
    res = requests.get(f"{BASE_URL}/state").json()
    if "Yasuo" not in res["knockout_bans"] or "Ahri" not in res["knockout_bans"]:
        print("FAILED: Bans not recorded.")
        exit(1)
    log("PASS: Bans recorded.")

    # 4. Picks (Series)
    # Pick Yone for Game 1
    log("Picking Yone for Game 1...")
    requests.post(f"{BASE_URL}/pick", json={"game": "Game 1", "champion": "Yone", "image": "img2", "player": "Both"})
    
    res = requests.get(f"{BASE_URL}/state").json()
    if res["picks"]["Game 1"]["champion"] != "Yone":
        print("FAILED: Game 1 pick mismatch")
        exit(1)
    log("PASS: Game 1 Picked.")

    print("\nSUCCESS: Knockout Flow Verified!")

if __name__ == "__main__":
    test_knockout_flow()
