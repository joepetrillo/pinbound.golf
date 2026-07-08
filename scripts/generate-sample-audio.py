"""Generate mock pro-shop call recordings with macOS `say`, stitch lines
with pauses, export m4a to public/audio, and print durations + waveform peaks."""

import json
import struct
import subprocess
import tempfile
import wave
from pathlib import Path

PROJECT = Path("/Users/jpetrillo/Documents/Projects/pinbound.golf")
OUT_DIR = PROJECT / "public" / "audio"
RATE = 22050
GAP_SECONDS = 0.45
PEAK_BUCKETS = 48

AGENT = "Samantha"
CALLER = "Eddy (English (US))"

CALLS = {
    "sample-call-booking": [
        (CALLER, "Hi — do you have any tee times tomorrow morning for two?"),
        (AGENT, "Let me check the tee sheet. Tomorrow morning I have 7:40 and 8:10, both walking. Want me to hold one?"),
        (CALLER, "Yeah, the 7:40 works."),
        (AGENT, "You're all set — 7:40 AM for two players. I'll text a confirmation to this number."),
    ],
    "sample-call-policy": [
        (CALLER, "Can I cancel tomorrow's 8 AM tee time?"),
        (AGENT, "Cancellations need 24 hours notice, and that time is inside the window, so I can't cancel it by phone. Want me to transfer you to the shop?"),
        (CALLER, "Sure, put me through."),
        (AGENT, "One moment while I connect you."),
    ],
    "sample-call-handoff": [
        (CALLER, "I need to talk to someone about a league outing."),
        (AGENT, "Of course — I'll get the shop. One moment while I transfer you."),
    ],
    "sample-call-hours": [
        (CALLER, "What time do you open tomorrow, and what's the weekday rate?"),
        (AGENT, "We open at 6:30. Eighteen holes on a weekday is 52 dollars with a cart, or 38 walking. Anything else?"),
        (CALLER, "Nope, that's it. Thanks."),
    ],
    "sample-call-weather": [
        (CALLER, "It's supposed to storm this afternoon — what happens to our 1:30 if it rains out?"),
        (AGENT, "If the course closes, you get a rain check for the unplayed holes, good for 30 days. Your booking stays as is unless we close."),
    ],
}


def synth_line(voice: str, text: str, tmp: Path, idx: int) -> Path:
    aiff = tmp / f"line-{idx}.aiff"
    wav = tmp / f"line-{idx}.wav"
    subprocess.run(["say", "-v", voice, "-o", str(aiff), text], check=True)
    subprocess.run(
        ["afconvert", "-f", "WAVE", "-d", f"LEI16@{RATE}", "-c", "1", str(aiff), str(wav)],
        check=True,
    )
    return wav


def read_frames(path: Path) -> bytes:
    with wave.open(str(path), "rb") as w:
        assert w.getframerate() == RATE and w.getnchannels() == 1
        return w.readframes(w.getnframes())


def peaks(frames: bytes, buckets: int) -> list[float]:
    samples = struct.unpack(f"<{len(frames) // 2}h", frames)
    n = len(samples)
    out = []
    for b in range(buckets):
        chunk = samples[n * b // buckets : n * (b + 1) // buckets]
        rms = (sum(s * s for s in chunk) / max(len(chunk), 1)) ** 0.5
        out.append(rms / 32768)
    top = max(out) or 1
    return [round(min(1.0, 0.08 + 0.92 * (v / top)), 3) for v in out]


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    gap = b"\x00\x00" * int(RATE * GAP_SECONDS)
    meta = {}
    for name, lines in CALLS.items():
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            frames = gap.join(
                read_frames(synth_line(voice, text, tmp, i))
                for i, (voice, text) in enumerate(lines)
            )
            joined = tmp / "joined.wav"
            with wave.open(str(joined), "wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(RATE)
                w.writeframes(frames)
            m4a = OUT_DIR / f"{name}.m4a"
            m4a.unlink(missing_ok=True)
            subprocess.run(
                ["afconvert", "-f", "m4af", "-d", "aac", "-b", "48000", str(joined), str(m4a)],
                check=True,
            )
            duration = len(frames) / 2 / RATE
            meta[name] = {
                "durationSeconds": round(duration, 2),
                "label": f"{int(duration // 60)}:{int(duration % 60):02d}",
                "peaks": peaks(frames, PEAK_BUCKETS),
            }
    print(json.dumps(meta, indent=2))


if __name__ == "__main__":
    main()
