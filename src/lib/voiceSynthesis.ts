// Voice Synthesis Service for Learning Sounds

export class VoiceSynthesisService {
  private synth: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private preferredVoice: SpeechSynthesisVoice | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis
      this.loadVoices()
      
      // Load voices when they become available
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices()
      }
    }
  }

  private loadVoices(): void {
    if (!this.synth) return
    this.voices = this.synth.getVoices()
    
    // Prefer English voices
    const englishVoices = this.voices.filter(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.default)
    )
    
    // Select the best English voice
    this.preferredVoice = englishVoices.find(voice => 
      voice.name.includes('Google UK English Female') ||
      voice.name.includes('Microsoft Zira') ||
      voice.name.includes('Alex') ||
      voice.default
    ) || englishVoices[0] || this.voices[0] || null
  }

  // Play letter sound with phonetic pronunciation
  async playLetterSound(letter: string): Promise<void> {
    const letterSounds: Record<string, string> = {
      'A': 'A as in Apple',
      'B': 'B as in Ball',
      'C': 'C as in Cat',
      'D': 'D as in Dog',
      'E': 'E as in Elephant',
      'F': 'F as in Fish',
      'G': 'G as in Grape',
      'H': 'H as in House',
      'I': 'I as in Ice cream',
      'J': 'J as in Juice',
      'K': 'K as in Key',
      'L': 'L as in Lemon',
      'M': 'M as in Moon',
      'N': 'N as in Nose',
      'O': 'O as in Orange',
      'P': 'P as in Pizza',
      'Q': 'Q as in Queen',
      'R': 'R as in Rain',
      'S': 'S as in Sun',
      'T': 'T as in Tree',
      'U': 'U as in Umbrella',
      'V': 'V as in Violin',
      'W': 'W as in Water',
      'X': 'X as in X-ray',
      'Y': 'Y as in Yellow',
      'Z': 'Z as in Zebra'
    }

    const text = letterSounds[letter.toUpperCase()] || `Letter ${letter.toUpperCase()}`
    await this.speak(text, { rate: 0.8, pitch: 1.1 })
  }

  // Play number sound
  async playNumberSound(number: string): Promise<void> {
    const numberWords: Record<string, string> = {
      '1': 'One',
      '2': 'Two', 
      '3': 'Three',
      '4': 'Four',
      '5': 'Five',
      '6': 'Six',
      '7': 'Seven',
      '8': 'Eight',
      '9': 'Nine',
      '10': 'Ten'
    }

    const text = numberWords[number] || `Number ${number}`
    await this.speak(text, { rate: 0.8, pitch: 1.1 })
  }

  // Play word pronunciation
  async playWord(word: string): Promise<void> {
    await this.speak(word, { rate: 0.7, pitch: 1.0 })
  }

  // Play phonetic sound
  async playPhoneticSound(sound: string): Promise<void> {
    const phoneticSounds: Record<string, string> = {
      '/eɪ/': 'ay',
      '/biː/': 'bee',
      '/siː/': 'see',
      '/diː/': 'dee',
      '/iː/': 'ee',
      '/ɛf/': 'eff',
      '/dʒiː/': 'jee',
      '/eɪtʃ/': 'aych',
      '/aɪ/': 'eye',
      '/dʒeɪ/': 'jay',
      '/keɪ/': 'kay',
      '/ɛl/': 'ell',
      '/ɛm/': 'em',
      '/ɛn/': 'en',
      '/oʊ/': 'oh',
      '/piː/': 'pee',
      '/kjuː/': 'cue',
      '/ɑː/': 'arr',
      '/ɛs/': 'ess',
      '/tiː/': 'tee',
      '/juː/': 'you',
      '/viː/': 'vee',
      '/ˈdʌbəl.juː/': 'double you',
      '/ɛks/': 'ex',
      '/waɪ/': 'why',
      '/ziː/': 'zee'
    }

    const text = phoneticSounds[sound] || sound
    await this.speak(text, { rate: 0.6, pitch: 1.2 })
  }

  // Play all letters sequentially
  async playAllLetters(): Promise<void> {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    
    for (let i = 0; i < letters.length; i++) {
      await this.playLetterSound(letters[i])
      await this.delay(1500) // 1.5 second pause between letters
    }
  }

  // Play all numbers sequentially
  async playAllNumbers(): Promise<void> {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    
    for (let i = 0; i < numbers.length; i++) {
      await this.playNumberSound(numbers[i])
      await this.delay(1200) // 1.2 second pause between numbers
    }
  }

  // Generic speak method
  async speak(text: string, options: {
    rate?: number
    pitch?: number
    volume?: number
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not available'))
        return
      }

      // Stop any currently speaking utterance
      this.synth.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Set voice options
      utterance.rate = options.rate || 0.8
      utterance.pitch = options.pitch || 1.0
      utterance.volume = options.volume || 1.0
      
      // Use preferred voice if available
      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice
      }

      // Set event handlers
      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`))

      // Speak the text
      this.synth.speak(utterance)
    })
  }

  // Stop current speech
  stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel()
    }
  }

  // Check if speech synthesis is available and ready
  isAvailable(): boolean {
    return !!(this.synth && this.voices.length > 0)
  }

  // Get available voices
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  // Set preferred voice
  setPreferredVoice(voiceName: string): void {
    const voice = this.voices.find(v => v.name === voiceName)
    if (voice) {
      this.preferredVoice = voice
    }
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Special pronunciation for assessment questions
  async speakAssessmentQuestion(question: string): Promise<void> {
    await this.speak(question, { rate: 0.7, pitch: 1.0 })
  }

  // Encouraging phrases for correct answers
  async playEncouragement(): Promise<void> {
    const encouragements = [
      'Great job!',
      'Excellent work!',
      'Well done!',
      'Perfect!',
      'Amazing!',
      'You got it right!',
      'Fantastic!',
      'Outstanding!'
    ]
    
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
    await this.speak(randomEncouragement, { rate: 1.0, pitch: 1.2 })
  }

  // Supportive phrases for incorrect answers
  async playSupport(): Promise<void> {
    const supportPhrases = [
      'Good try! Let\'s practice more.',
      'Almost there! Keep going.',
      'Nice effort! Try again.',
      'You\'re learning! Keep practicing.',
      'Great attempt! Let\'s try once more.'
    ]
    
    const randomSupport = supportPhrases[Math.floor(Math.random() * supportPhrases.length)]
    await this.speak(randomSupport, { rate: 0.9, pitch: 1.0 })
  }
}

// Create singleton instance
export const voiceService = new VoiceSynthesisService()

// Utility function for easy access
export const playSound = {
  letter: (letter: string) => voiceService.playLetterSound(letter),
  number: (number: string) => voiceService.playNumberSound(number),
  word: (word: string) => voiceService.playWord(word),
  phonetic: (sound: string) => voiceService.playPhoneticSound(sound),
  allLetters: () => voiceService.playAllLetters(),
  allNumbers: () => voiceService.playAllNumbers(),
  encouragement: () => voiceService.playEncouragement(),
  support: () => voiceService.playSupport(),
  speak: (text: string, options?: any) => voiceService.speak(text, options),
  stop: () => voiceService.stopSpeaking()
}