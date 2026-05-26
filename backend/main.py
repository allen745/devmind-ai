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
class ComplexityInput(BaseModel):
    code: str
    language: str = "python"

@app.post("/complexity")
def analyze_complexity(input: ComplexityInput):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": f"""Analyze the time and space complexity of this {input.language} code:

{input.code}

Provide:
1. Time Complexity (Big O notation)
2. Space Complexity (Big O notation)
3. Why this complexity?
4. How to optimize it?
5. Optimized version of the code"""
        }]
    )
    return {"complexity": response.choices[0].message.content}

class CommitInput(BaseModel):
    code: str
    language: str = "python"

@app.post("/commit")
def generate_commit(input: CommitInput):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": f"""Analyze this {input.language} code and generate:
1. A concise git commit message (conventional commits format)
2. A detailed description
3. Type of change (feat/fix/refactor/docs/test)

Code:
{input.code}

Format:
Type: 
Commit: 
Description:"""
        }]
    )
    return {{"commit": response.choices[0].message.content}}