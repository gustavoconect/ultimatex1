import os
from supabase import create_client, Client

SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZ2ZrZ2doYnZ6amVtdG1jZGt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY1ODkxMCwiZXhwIjoyMDgxMjM0OTEwfQ.qMdbsRGhij5L7zEQqZjTPodynBtlTnEJSdhGcT4Kuj0"
SUPABASE_URL = "https://vngfkgghbvzjemtmcdkv.supabase.co"

def test_write():
    try:
        supabase: Client = create_client(SUPABASE_URL, SERVICE_KEY)
        
        # Fake match data (structure used in app)
        test_data = {
            "id": 9999,
            "player_a": "Test Player A",
            "player_b": "Test Player B",
            "phase": "Test Phase",
            "format": "MD3",
            "score": {"A": 0, "B": 0},
            "game_1": {"champion": "Ahri", "image": "...", "player": "Both"},
            "extra_info": ["some", "list"]
        }
        
        print("Attempting to insert complex JSON into match_history...")
        res = supabase.table("match_history").insert(test_data).execute()
        print("Success! Inserted:", res.data)
        
        # Cleanup
        print("Cleaning up...")
        supabase.table("match_history").delete().eq("id", 9999).execute()
        print("Cleanup done.")

    except Exception as e:
        print(f"Write Error: {e}")
        print("It seems match_history table layout does not match the JSON structure or does not accept JSONB.")

if __name__ == "__main__":
    test_write()
