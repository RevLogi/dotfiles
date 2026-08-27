---
name: youtube-transcript
description: Fetch timestamped YouTube transcripts for source-grounded analysis or material import. Use when a learner provides a YouTube URL or video ID and the spoken content, claims, wording, or timestamps matter.
---

# YouTube Transcript

Fetch transcripts from YouTube videos.

## Setup

```bash
cd {baseDir}
npm install
```

## Usage

```bash
{baseDir}/transcript.js <video-id-or-url> [--lang <language-code>]
```

Accepts video ID or full URL:
- `EBw7gsDPAYQ`
- `https://www.youtube.com/watch?v=EBw7gsDPAYQ`
- `https://youtu.be/EBw7gsDPAYQ`

Use `--lang zh-Hans`, `--lang en`, or another available YouTube caption language when needed.

## Output

Timestamped transcript entries:

```
[0:00] All right. So, I got this UniFi Theta
[0:15] I took the camera out, painted it
[1:23] And here's the final result
```

## Notes

- Requires the video to have captions/transcripts available
- Works with auto-generated and manual transcripts
- Treat the transcript as a source extraction, not as a complete account of visual content
- When saving it as course material, preserve the video URL and timestamps and keep any AI summary separate
