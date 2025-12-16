import requests
import sys
import uuid

BASE_URL = "http://localhost:8000"

def test_auth_flow():
    print(f"Testing Auth Flow against {BASE_URL}...")
    
    # 1. Generate random user
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    password = "testpassword123"
    print(f"Generated credentials: {username} / {password}")

    # 2. Signup
    print("\n[1] Testing Signup (POST /api/signup)...")
    try:
        signup_payload = {"username": username, "password": password}
        resp = requests.post(f"{BASE_URL}/api/signup", json=signup_payload)
        if resp.status_code == 200:
            print("[PASS] Signup successful")
            print(f"Response: {resp.json()}")
        else:
            print(f"[FAIL] Signup failed: {resp.status_code} - {resp.text}")
            return
    except requests.exceptions.ConnectionError:
        print("[FAIL] Could not connect to server. Is it running on port 8000?")
        return

    # 3. Login
    print("\n[2] Testing Login (POST /api/login)...")
    login_payload = {"username": username, "password": password}
    resp = requests.post(f"{BASE_URL}/api/login", json=login_payload)
    if resp.status_code == 200:
        token_data = resp.json()
        access_token = token_data.get("access_token")
        if access_token:
            print("[PASS] Login successful, token received")
        else:
            print("[FAIL] Login successful but no token found")
            return
    else:
        print(f"[FAIL] Login failed: {resp.status_code} - {resp.text}")
        return

    # 4. Protected Route (With Token)
    print("\n[3] Testing Protected Route (POST /api/profile) WITH token...")
    headers = {"Authorization": f"Bearer {access_token}"}
    profile_payload = {"industry": "Technology"}
    resp = requests.post(f"{BASE_URL}/api/profile", json=profile_payload, headers=headers)
    if resp.status_code == 200:
        print("[PASS] Protected route access successful")
        print(f"Response: {resp.json()}")
    else:
        print(f"[FAIL] Protected route failed: {resp.status_code} - {resp.text}")

    # 5. Protected Route (Without Token)
    print("\n[4] Testing Protected Route (POST /api/profile) WITHOUT token...")
    resp = requests.post(f"{BASE_URL}/api/profile", json=profile_payload) # No headers
    if resp.status_code == 401:
        print("[PASS] Correctly rejected without token (401 Unauthorized)")
    else:
        print(f"[FAIL] Unexpected response code (expected 401): {resp.status_code}")

    # 6. Protected Route (Invalid Token)
    print("\n[5] Testing Protected Route (POST /api/profile) WITH INVALID token...")
    bad_headers = {"Authorization": "Bearer invalid_token_string"}
    resp = requests.post(f"{BASE_URL}/api/profile", json=profile_payload, headers=bad_headers)
    if resp.status_code == 401:
        print("[PASS] Correctly rejected with invalid token (401 Unauthorized)")
    else:
        print(f"[FAIL] Unexpected response code (expected 401): {resp.status_code}")

if __name__ == "__main__":
    test_auth_flow()
