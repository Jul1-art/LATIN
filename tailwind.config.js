/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./script.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-on-surface": "#2f3131",
        "outline": "#a28b92",
        "surface-container-low": "#1a1c1c",
        "on-primary-fixed": "#3e0022",
        "tertiary": "#ffb3af",
        "inverse-primary": "#a0376a",
        "surface-variant": "#333535",
        "on-secondary-fixed": "#211b00",
        "surface": "#121414",
        "on-error-container": "#ffdad6",
        "background": "#121414",
        "on-primary-fixed-variant": "#821e51",
        "primary-fixed-dim": "#ffb0ce",
        "error-container": "#93000a",
        "on-primary-container": "#ea73a7",
        "on-secondary-container": "#e5d173",
        "surface-container-highest": "#333535",
        "on-error": "#690005",
        "surface-container-lowest": "#0d0e0f",
        "surface-dim": "#121414",
        "surface-container-high": "#292a2b",
        "on-primary": "#64003a",
        "tertiary-fixed": "#ffdad7",
        "on-tertiary-fixed-variant": "#802829",
        "primary-fixed": "#ffd9e5",
        "outline-variant": "#544248",
        "on-background": "#e2e2e2",
        "secondary-container": "#675900",
        "on-surface-variant": "#dac0c8",
        "on-tertiary-fixed": "#410005",
        "on-secondary-fixed-variant": "#524700",
        "tertiary-fixed-dim": "#ffb3af",
        "tertiary-container": "#641216",
        "primary-container": "#66023c",
        "secondary-fixed": "#f7e382",
        "on-tertiary-container": "#ea7875",
        "surface-tint": "#ffb0ce",
        "on-secondary": "#393000",
        "on-tertiary": "#611015",
        "error": "#ffb4ab",
        "primary": "#ffb0ce",
        "secondary": "#dac769",
        "on-surface": "#e2e2e2",
        "surface-container": "#1e2020",
        "surface-bright": "#38393a",
        "inverse-surface": "#e2e2e2",
        "secondary-fixed-dim": "#dac769"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "margin-monumental": "120px",
        "gutter-carved": "32px",
        "unit": "8px",
        "frieze-height": "64px"
      },
      fontFamily: {
        "headline-md": ["Noto Serif", "serif"],
        "label-caps": ["Noto Serif", "serif"],
        "headline-lg": ["Noto Serif", "serif"],
        "headline-display": ["Noto Serif", "serif"],
        "body-lg": ["Newsreader", "serif"],
        "body-md": ["Newsreader", "serif"],
        "handwritten": ["Caveat", "cursive"]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
