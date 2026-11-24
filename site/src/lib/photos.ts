/**
 * "Photos" for glass-over-content demos. No external images: layered CSS gradients that read as a photo
 * behind blurred glass (the same stand-ins Storybook uses for the Painted Ladies frames).
 */

/** Painted Ladies: sky, a row of Victorian façades, the park. */
export const paintedLadies = [
  "radial-gradient(circle at 18% 86%, #4f7a3a 0 14%, transparent 15%)",
  "radial-gradient(circle at 72% 94%, #3d6b2f 0 18%, transparent 19%)",
  "linear-gradient(180deg, #a9c3dc 0 22%, transparent 22%)",
  "linear-gradient(90deg, #c9b8a3 0 12%, #e7d9c4 12% 24%, #8aa1b8 24% 36%, #f1e6d6 36% 50%, #b86c5a 50% 62%, #e9e0cf 62% 76%, #6f8fa8 76% 88%, #d8c7ad 88%)",
].join(", ");

/** Painted Ladies with sky on top — taller frames (phone screens, cards). */
export const paintedLadiesTall = [
  "radial-gradient(ellipse 60% 22% at 20% 92%, #3f6a30 0 60%, transparent 61%)",
  "radial-gradient(ellipse 50% 20% at 80% 96%, #345c28 0 60%, transparent 61%)",
  "linear-gradient(180deg, transparent 0 58%, #4e6b3c 58% 74%, #2f4a2a 74%)",
  "repeating-linear-gradient(90deg, #ffffff1f 0 0.25rem, transparent 0.25rem 1.6rem)",
  "linear-gradient(180deg, #7fa6d6 0%, #a9c3e2 24%, #c8d6e8 31%, transparent 31%)",
  "linear-gradient(180deg, transparent 0 31%, #00000033 31% 33%, transparent 33%)",
  "linear-gradient(90deg, #c9b8a3 0 14%, #e7d9c4 14% 28%, #8aa1b8 28% 42%, #f1e6d6 42% 57%, #b86c5a 57% 71%, #e9e0cf 71% 86%, #6f8fa8 86%)",
].join(", ");

/** Fog rolling over the bridge at dusk: warm horizon, cool fog band, dark water. */
export const bayFog = [
  "radial-gradient(ellipse 70% 40% at 72% 46%, #ffd9a866 0%, transparent 70%)",
  "linear-gradient(180deg, transparent 0 52%, #eef0f5d9 54%, #c9ced9b3 60%, transparent 70%)",
  "repeating-linear-gradient(90deg, transparent 0 3.2rem, #b5432f66 3.2rem 3.4rem, transparent 3.4rem 12rem)",
  "linear-gradient(180deg, #2a3150 0%, #6b5f86 26%, #e08a6b 44%, #f4c58f 52%, #8d9bb4 64%, #2b3a52 78%, #111827 100%)",
].join(", ");

/** Ocean Beach at night — deep blues with a moon glow. */
export const nightBeach = [
  "radial-gradient(circle at 76% 22%, #f6f1d8 0 2.5%, #f6f1d855 3.5%, transparent 14%)",
  "linear-gradient(180deg, transparent 0 62%, #ffffff14 62.5%, transparent 64%)",
  "linear-gradient(180deg, #0b1026 0%, #1b2450 40%, #2a3768 61%, #101a3a 62%, #0a1228 100%)",
].join(", ");

/** The default "photo" behind glass demos. */
export const photo = paintedLadiesTall;
