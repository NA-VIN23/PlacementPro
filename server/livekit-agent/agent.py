"""
PlacementPro AI Interview Agent
Powered by LiveKit Agents + Google Gemini Realtime (Live API)
Uses Gemini's native voice-to-voice capabilities - no separate STT/TTS needed!
"""

import os
import asyncio
import httpx
import logging
from dotenv import load_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
)
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import google, silero

load_dotenv()

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000/api")
logger = logging.getLogger("placementpro-agent")


async def fetch_student_profile(student_id: str, token: str) -> dict:
    """Fetch student profile from backend API"""
    if not token:
        logger.info("No token provided, using empty profile")
        return {}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BACKEND_API_URL}/students/profile",
                headers={"Authorization": f"Bearer {token}"}
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"Error fetching profile: {e}")
    return {}


def build_interview_prompt(profile: dict) -> str:
    """Build personalized interview prompt based on student profile"""
    
    skills = profile.get("skills", [])
    projects = profile.get("projects", [])
    education = profile.get("education", [])
    internships = profile.get("internships", [])
    
    skills_str = ", ".join(skills) if skills else "not specified"
    
    projects_str = ""
    for p in projects[:3]:
        projects_str += f"- {p.get('title', 'Untitled')}: {p.get('description', '')[:100]}\n"
    
    edu_str = ""
    for e in education[:2]:
        edu_str += f"- {e.get('degree', '')} at {e.get('institution', '')}\n"
    
    intern_str = ""
    for i in internships[:2]:
        intern_str += f"- {i.get('role', '')} at {i.get('company', '')}\n"
    
    return f"""You are a professional AI interviewer for PlacementPro, conducting a mock placement interview.

## Candidate Profile:
- **Skills**: {skills_str}
- **Projects**:
{projects_str if projects_str else "  No projects listed"}
- **Education**:
{edu_str if edu_str else "  Not specified"}
- **Internships**:
{intern_str if intern_str else "  No internship experience"}

## Interview Guidelines:
1. Start with a warm greeting and ask them to introduce themselves
2. Ask about their educational background and why they chose their field
3. Deep-dive into their strongest skills from the list above
4. Discuss one of their projects in detail - ask about challenges faced
5. If they have internship experience, ask what they learned
6. Ask behavioral questions (teamwork, handling pressure, problem-solving)
7. End with asking if they have any questions

## Important Rules:
- Be encouraging and professional
- Ask ONE question at a time
- Listen actively and ask follow-up questions
- Keep responses concise (2-3 sentences max)
- After 8-10 exchanges, wrap up the interview naturally
- Personalize questions based on their actual profile data above

Start by greeting the user warmly and asking them to introduce themselves.
"""


async def entrypoint(ctx: JobContext):
    """Main entry point for the interview agent"""
    
    # Get metadata from room
    student_id = ctx.room.name.split("-")[-1] if "-" in ctx.room.name else ""
    
    # Fetch student profile (empty for now since no token)
    profile = await fetch_student_profile(student_id, "")
    
    # Build personalized system prompt
    system_prompt = build_interview_prompt(profile)
    
    # Connect to the room
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    # Wait for participant to join
    participant = await ctx.wait_for_participant()
    logger.info(f"Participant joined: {participant.identity}")
    
    # Use Google Gemini Realtime Model as the LLM
    # This handles voice-to-voice natively without separate STT/TTS
    realtime_model = google.realtime.RealtimeModel(
        voice="Puck",  # Available voices: Puck, Charon, Kore, Fenrir, Aoede
        temperature=0.8,
    )
    
    # Create an Agent that uses the RealtimeModel
    agent = Agent(
        instructions=system_prompt,
        llm=realtime_model,  # Pass the RealtimeModel as the LLM
    )
    
    # Create and start the AgentSession
    session = AgentSession()
    await session.start(
        agent=agent,
        room=ctx.room,
    )
    
    logger.info("Gemini Realtime agent started...")
    
    # Greet the user
    await session.say("Hello! Welcome to your mock interview session. I'm your AI interviewer today. Please introduce yourself and tell me a bit about your background.")
    
    # Keep agent running until session closes
    await session.aclose()


def prewarm(proc: JobProcess):
    """Prewarm the agent process"""
    proc.userdata["vad"] = silero.VAD.load()


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        )
    )
