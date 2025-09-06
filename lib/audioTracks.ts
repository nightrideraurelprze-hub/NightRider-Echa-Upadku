const audioTracks: { [key: string]: string } = {
  default: "https://storage.googleapis.com/gemini-prod-us-central1-820540103345/ba586358-d27e-4003-b52b-1087198114be", // Ambient Wind
  tense: "https://storage.googleapis.com/gemini-prod-us-central1-820540103345/f0a3e8c0-2b4a-4b2a-8c88-067201c18e3d", // Tense Drone
  workshop: "https://storage.googleapis.com/gemini-prod-us-central1-820540103345/d1c3a7e5-1c5c-4b5a-9b5f-1e7a5d3f2a1b", // Workshop sounds
  battle: "https://storage.googleapis.com/gemini-prod-us-central1-820540103345/8a1b6e4e-8d3e-4b7a-9a8c-4a3d1c1b9b0c", // Distant battle
  engine: "https://storage.googleapis.com/gemini-prod-us-central1-820540103345/5a7a1b3e-7a2e-4b8a-8a4c-9a2c3d1b8c7c", // Truck Engine
  quiet: "https://storage.googleapis.com/gemini-prod-us-central1-820540103345/0c1d2e3f-6a7b-4c8d-9e1f-2a3b4c5d6e7f", // Soft ambience
  fortress: "https://storage.googleapis.com/gemini-prod-us-central1-820540103345/7f6a5b4c-3d2e-1a0b-9c8d-7e6f5a4b3c2d", // Fortress ambience
  rain: "https://storage.googleapis.com/gemini-prod-us-central1-820540103345/a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6" // Rain and thunder
};

const keywordMapping: { [key: string]: string[] } = {
  tense: ['napięcie', 'cisza', 'niepokój', 'zagrożenie', 'cichy', 'ciemność', 'mrok', 'dron', 'tension', 'silence', 'anxiety', 'threat', 'quiet', 'darkness', 'gloom'],
  workshop: ['warsztat', 'narzędzia', 'metaliczne', 'iskry', 'workshop', 'tools', 'metallic', 'sparks', 'damiano'],
  battle: ['walka', 'strzały', 'eksplozje', 'krzyki', 'bitwa', 'battle', 'shots', 'explosions', 'screams', 'fight', 'atak', 'attack'],
  engine: ['silnik', 'pomruk', 'ciężarówka', 'dominator', 'wóz', 'engine', 'rumble', 'truck', 'vehicle'],
  fortress: ['forteca', 'brama', 'mury', 'miasto', 'eden', 'bastion', 'fortress', 'gate', 'walls', 'city'],
  rain: ['deszcz', 'burza', 'wiatr', 'rain', 'storm', 'wind', 'chłód', 'zimno', 'cold'],
  quiet: ['spokój', 'nadzieja', 'rozmowa', 'słońce', 'peace', 'hope', 'conversation', 'sun', 'świt', 'dawn', 'noc', 'night']
};

export const getTrackForSoundscape = (soundscape: string): string | null => {
  if (!soundscape) return audioTracks.default;

  const lowerSoundscape = soundscape.toLowerCase();

  for (const track in keywordMapping) {
    for (const keyword of keywordMapping[track]) {
      if (lowerSoundscape.includes(keyword)) {
        return audioTracks[track] || audioTracks.default;
      }
    }
  }

  return audioTracks.default;
};