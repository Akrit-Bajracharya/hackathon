import axios from 'axios';

// Mock transcription for demo (replace with actual Google Cloud API)
async function transcribeNepaliVoice(audioBase64) {
  try {
    // In production, call Google Cloud Speech-to-Text API
    // For hackathon demo, return mock transcript
    console.log('Transcribing Nepali voice...');
    
    // Mock response for demo
    return "म हो राम श्रेष्ठ, काठमाडौंमा चिया पसल चलाउँछु, मेरो व्यालेट आईडी १२३४५६ हो";
    
  } catch (error) {
    console.error('Voice transcription error:', error);
    throw new Error('Voice transcription failed');
  }
}

// Production version (commented out)
/*
async function transcribeNepaliVoice(audioBase64) {
  const response = await axios.post(
    'https://speech.googleapis.com/v1/speech:recognize',
    {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'ne-NP'
      },
      audio: {
        content: audioBase64
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.GOOGLE_CLOUD_SPEECH_API_KEY}`
      }
    }
  );
  
  return response.data.results[0]?.alternatives[0]?.transcript || '';
}
*/
export { transcribeNepaliVoice };