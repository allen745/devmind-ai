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
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": f"Review this {input.language} code. Find bugs, security issues and give a score out of 100:\n\n{input.code}"
        }]
    )
    return {"review": response.choices[0].message.content}
class BugInput(BaseModel):
    error: str
    code: str = ""
    language: str = "python"

@app.post("/bughunt")
def hunt_bug(input: BugInput):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": f"I got this error in my {input.language} code:\n\nError: {input.error}\n\nCode: {input.code}\n\nExplain why this bug occurred and provide the fixed code."
        }]
    )
    return {"solution": response.choices[0].message.content}

class DocInput(BaseModel):
    code: str
    doc_type: str = "readme"
    language: str = "python"

@app.post("/devdocs")
def generate_docs(input: DocInput):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": f"Generate a {input.doc_type} for this {input.language} code:\n\n{input.code}"
        }]
    )
    return {"documentation": response.choices[0].message.content}