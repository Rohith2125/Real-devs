import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def score_submission(challenge, submission):

    prompt = f"""
    Evaluate this AI MVP submission.

    Challenge:
    {challenge['title']}
    {challenge['problem_statement']}

    Submission:
    Repo: {submission['repo_url']}
    Pitch Deck: {submission['pitch_deck_url']}
    Demo Video: {submission['demo_video_url']}

    Score on:
    - Code Quality
    - Completeness
    - Clarity
    - Innovation

    Return JSON with:
    scores (object),
    overall_score (number),
    rationale (string),
    confidence (number between 0 and 1).
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": """
                    You are an AI competition evaluator.

                    You carefully assess submissions based on the provided challenge.

                    You MUST return ONLY valid JSON.
                    Do not include markdown.
                    Do not include explanations outside JSON.
                    Do not wrap in code blocks.
                    """
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.5,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Scoring Engine Error: {e}")
        return None