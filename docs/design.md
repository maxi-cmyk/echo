# Design Guidelines: Neuro-Inclusive UI

## 1. Core Philosophy

**"Clarity over Beauty."**
For users with cognitive impairment, standard UI patterns (hamburgers, small text, complex gestures) are barriers. The interface must be "Invisible."

## 2. Adaptation Engine

The UI is not static. It breathes and changes based on context.

### 2.1. Sundowning Mode

- **Trigger**: Time of day (e.g., > 6:00 PM).
- **Changes**:
  - **Color Palette**: Shifts from Blue/White (High Energy) to Amber/Black (Low Energy/Warm).
  - **Contrast**: Reduced glare.

### 2.2. Error Tolerance (Voice Mode)

- **Trigger**: >3 Missed taps (tapping empty space) within 5 seconds.
- **Changes**:
  - Activate "Voice Command" overlay.
  - Audio Prompt: "I'm listening."
  - Increases touch target size for next interaction.

## 3. Visual Language

### 3.1. Typography

- **Font**: Inter or System Sans-Serif.
- **Size**: Minimum 18px body, 32px headers.
- **Weight**: Bold/Medium (Avoid thin fonts).

### 3.2. Interaction Design

- **Scroll**: Vertical Snap (One item at a time). No "free scrolling" momentum that can disorient.
- **Feedback**: Immediate Visual Pulse on taps. "The button must feel real."

## 4. Components

### 4.1. The Memory Card

- **Fullscreen Media**: Immersive.
- **Caption Overlay**: Bottom 20%, heavily shadowed text for readability against any background.

### 4.2. PIN Pad

- **Purpose**: Security barrier to prevent patients from accidentally changing settings or deleting memories.
- **Design**: Large, calculator-style buttons.
