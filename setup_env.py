
content = """SUPABASE_URL=https://vngfkgghbvzjemtmcdkv.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZ2ZrZ2doYnZ6amVtdG1jZGt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY1ODkxMCwiZXhwIjoyMDgxMjM0OTEwfQ.qMdbsRGhij5L7zEQqZjTPodynBtlTnEJSdhGcT4Kuj0
"""
with open(".env", "w") as f:
    f.write(content)
print("Created .env successfully.")
