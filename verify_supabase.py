import jwt
import json
import os
from supabase import create_client, Client

# User provided Service Role Key
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZ2ZrZ2doYnZ6amVtdG1jZGt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY1ODkxMCwiZXhwIjoyMDgxMjM0OTEwfQ.qMdbsRGhij5L7zEQqZjTPodynBtlTnEJSdhGcT4Kuj0"

def decode_and_connect():
    try:
        # Decode JWT (no verify, just to get payload)
        payload = jwt.decode(SERVICE_KEY, options={"verify_signature": False})
        project_ref = payload.get("ref")
        
        if not project_ref:
            print("ERROR: Could not find project ref in token.")
            return

        supabase_url = f"https://{project_ref}.supabase.co"
        print(f"Project URL: {supabase_url}")
        
        # Connect
        supabase: Client = create_client(supabase_url, SERVICE_KEY)
        
        # Test Tables
        print("\n--- Testing 'players' table ---")
        try:
            res = supabase.table("players").select("*").limit(1).execute()
            print("Players OK. Data:", res.data)
        except Exception as e:
            print(f"Players Error: {e}")

        print("\n--- Testing 'match_history' table ---")
        try:
            res = supabase.table("match_history").select("*").limit(1).execute()
            print("Match History OK. Data:", res.data)
        except Exception as e:
            print(f"Match History Error: {e}")
            
        print("\n--- Testing 'blacklist' table ---")
        try:
            res = supabase.table("blacklist").select("*").limit(1).execute()
            print("Blacklist OK. Data:", res.data)
        except Exception as e:
            print(f"Blacklist Error: {e}")

    except Exception as e:
        print(f"General Error: {e}")

if __name__ == "__main__":
    decode_and_connect()
