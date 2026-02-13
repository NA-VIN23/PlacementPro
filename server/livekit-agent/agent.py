"""
PlacementPro AI Interview Agent
Powered by LiveKit Agents + Google Gemini Realtime (Live API)
Uses Gemini's native voice-to-voice capabilities - no separate STT/TTS needed!
"""

import os
import re
import json
import asyncio
import httpx
import logging
from dotenv import load_dotenv
from prompts import build_interview_prompt
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


def parse_scores_from_text(text: str) -> dict | None:
    """
    Parse the JSON scores block from the agent's transcript.
    Looks for: ###SCORES_JSON###{ ... }###END_SCORES###
    """
    pattern = r"###SCORES_JSON###\s*(\{.*?\})\s*###END_SCORES###"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        try:
            scores = json.loads(match.group(1))
            logger.info(f"Parsed scores: {scores}")
            return scores
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse scores JSON: {e}")
    return None


async def submit_scores_to_backend(room_name: str, scores: dict):
    """POST the parsed scores to the backend API"""
    payload = {
        "roomName": room_name,
        "fluencyScore": scores.get("fluency", 0),
        "grammarScore": scores.get("grammar", 0),
        "communicationScore": scores.get("communication", 0),
        "confidenceScore": scores.get("confidence", 0),
        "correctnessScore": scores.get("correctness", 0),
        "overallScore": scores.get("overall", 0),
        "feedback": scores.get("feedback", ""),
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{BACKEND_API_URL}/interviews/scores",
                json=payload,
                timeout=10.0,
            )
            if response.status_code == 200:
                logger.info("Scores submitted to backend successfully")
            else:
                logger.error(f"Backend returned {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Failed to submit scores to backend: {e}")


async def send_scores_to_client(room, scores: dict):
    """Send scores to the frontend via LiveKit data channel"""
    try:
        from livekit.rtc import DataPacket
        data = json.dumps({"type": "interview_scores", "scores": scores}).encode("utf-8")
        await room.local_participant.publish_data(data, reliable=True)
        logger.info("Scores sent to client via data channel")
    except Exception as e:
        logger.error(f"Failed to send scores via data channel: {e}")


async def entrypoint(ctx: JobContext):
    """Main entry point for the interview agent"""

    # Get metadata from room
    room_name = ctx.room.name
    student_id = room_name.split("-")[-1] if "-" in room_name else ""

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

    # Collect transcript for score parsing
    collected_text = []

    # Create an Agent that uses the RealtimeModel
    agent = Agent(
        instructions=system_prompt,
        llm=realtime_model,  # Pass the RealtimeModel as the LLM
    )

    # Create and start the AgentSession
    session = AgentSession()

    # Listen for agent speech to collect transcript
    @session.on("agent_speech_committed")
    def on_agent_speech(msg):
        """Collect the agent's spoken text to parse scores later"""
        if hasattr(msg, "content") and msg.content:
            collected_text.append(msg.content)
            logger.debug(f"Agent said: {msg.content[:100]}...")

    await session.start(
        agent=agent,
        room=ctx.room,
    )

    logger.info("Gemini Realtime agent started...")

    # Greet the user
    await session.say(
        "Good morning. Thank you for attending this interview. "
        "I am your interviewer today. Let us begin with a brief "
        "introduction about yourself."
    )

    # Keep agent running until session closes
    await session.aclose()

    # ── After session ends, parse and submit scores ──────────────
    logger.info("Session closed. Attempting to parse scores from transcript...")
    full_transcript = "\n".join(collected_text)
    scores = parse_scores_from_text(full_transcript)

    if scores:
        # Submit scores to backend
        await submit_scores_to_backend(room_name, scores)
        # Also try to send to client via data channel (may fail if client already left)
        await send_scores_to_client(ctx.room, scores)
    else:
        logger.warning("Could not parse scores from agent transcript")


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
