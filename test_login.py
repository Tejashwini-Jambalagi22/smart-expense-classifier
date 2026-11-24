import requests

url = "http://127.0.0.1:8000/auth/login"
data = {
    "email": "your_registered_email@example.com",
    "password": "your_password"
}

response = requests.post(url, json=data)
print(response.status_code)
print(response.json())
