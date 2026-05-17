from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from groq import Groq

app = FastAPI(title="DevMind AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class CodeInput(BaseModel):
    code: str
    language: str = "python"

@app.get("/")
def home():
    return {"message": "DevMind AI is Live! 🚀"}

@app.post("/review")
def review_code(input: CodeInput):
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{
            "role": "user",
            "content": f"Review this {input.language} code. Find bugs, security issues and give a score out of 100:\n\n{input.code}"
        }]
    )
    return {"review": response.choices[0].message.content}