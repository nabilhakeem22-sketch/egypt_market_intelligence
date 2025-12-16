import requests

url = "http://localhost:8000/api/signup"
payload = {
    "username": "qa_user",
    "password": "password123"
}

try:
    response = requests.post(url, json=payload)
    if response.status_code == 200 or response.status_code == 400: # 400 means already exists, which is fine
        print("User registered successfully or already exists.")
        print(response.json())
    else:
        print(f"Failed to register user: {response.text}")
except Exception as e:
    print(f"Error: {e}")
