from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

# Configuration
SECRET_KEY = "egypt-market-secret-key-mvp" # In prod, use env var
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Mock Database
import json
import os

auth_router = APIRouter()
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

# Persistence
# Models
class User(BaseModel):
    username: str
    password_hash: str
    industry: str = "General"

class UserCreate(BaseModel):
    username: str
    password: str

class ProfileUpdate(BaseModel):
    industry: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Persistence
USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            data = json.load(f)
            # Reconstruct User objects
            return {u: User(**d) for u, d in data.items()}
    return {}

def save_users():
    # Save as dicts
    data = {u: d.dict() for u, d in USERS_DB.items()}
    with open(USERS_FILE, "w") as f:
        json.dump(data, f)

USERS_DB = load_users()

class UserCreate(BaseModel):
    username: str
    password: str

class ProfileUpdate(BaseModel):
    industry: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Helpers
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Dependency
def get_current_user(token: str = Depends(lambda: "")): # Placeholder, real auth logic below
    # This is a bit hacky for the MVP structure where main.py usually handles auth middleware
    # But for this file to be self-contained for the router, we need to decode the token here
    # or rely on the router dependency.
    # Let's implement full decoding here for the profile endpoint.
    pass

# Re-implementing get_current_user properly for the router
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # In a real DB, we'd fetch the user object. Here we check the dict.
    user = USERS_DB.get(username)
    if user is None:
        raise credentials_exception
    return user

# Endpoints
@auth_router.post("/signup", response_model=Token)
async def signup(user: UserCreate):
    if user.username in USERS_DB:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    # Store as User object
    new_user = User(username=user.username, password_hash=hashed_password)
    USERS_DB[user.username] = new_user
    save_users()
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@auth_router.post("/login", response_model=Token)
async def login(form_data: UserCreate):
    print(f"Login attempt for: {form_data.username} with password: {form_data.password}")
    user = USERS_DB.get(form_data.username)
    if user:
        print(f"User found: {user.username}, Hash: {user.password_hash}")
        chk = verify_password(form_data.password, user.password_hash)
        print(f"Password check result: {chk}")
    else:
        print("User not found in USERS_DB")
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@auth_router.post("/profile")
async def update_profile(profile: ProfileUpdate, current_user: User = Depends(get_current_user)):
    current_user.industry = profile.industry
    USERS_DB[current_user.username] = current_user
    save_users()
    return {"message": "Profile updated", "industry": current_user.industry}
