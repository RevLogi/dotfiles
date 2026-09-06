#!/usr/bin/env node

import { YoutubeTranscript } from 'youtube-transcript-plus';

const args = process.argv.slice(2);
const videoId = args[0];

if (!videoId) {
  console.error('Usage: transcript.js <video-id-or-url> [--lang <language-code>]');
  console.error('Example: transcript.js EBw7gsDPAYQ');
  console.error('Example: transcript.js https://www.youtube.com/watch?v=EBw7gsDPAYQ');
  process.exit(1);
}

let language;
for (let i = 1; i < args.length; i += 1) {
  if (args[i] === '--lang') {
    language = args[i + 1];
    if (!language) {
      console.error('Error: --lang requires a language code');
      process.exit(1);
    }
    i += 1;
    continue;
  }

  console.error(`Unknown argument: ${args[i]}`);
  process.exit(1);
}

// Extract video ID if full URL is provided
let extractedId = videoId;
if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
  const match = videoId.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) {
    extractedId = match[1];
  }
}

try {
  const transcript = await YoutubeTranscript.fetchTranscript(
    extractedId,
    language ? { lang: language } : undefined,
  );

  for (const entry of transcript) {
    const timestamp = formatTimestamp(entry.offset);
    console.log(`[${timestamp}] ${decodeHtml(entry.text)}`);
  }
} catch (error) {
  console.error('Error fetching transcript:', error.message);
  process.exit(1);
}

function decodeHtml(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code.startsWith('#x')) return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
    if (code.startsWith('#')) return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
    return named[code.toLowerCase()] ?? entity;
  });
}

function formatTimestamp(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
