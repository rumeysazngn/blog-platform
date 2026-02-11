/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",   // 🌙 Light/Dark mode desteği

  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },

        glow: {
          "0%, 100%": {
            textShadow: "0 0 10px #8b5cf6, 0 0 20px #6366f1",
          },
          "50%": {
            textShadow: "0 0 20px #a855f7, 0 0 40px #60a5fa",
          },
        },

        float: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "25%": { transform: "translateY(-20px) translateX(10px)" },
          "50%": { transform: "translateY(-10px) translateX(-10px)" },
          "75%": { transform: "translateY(-30px) translateX(5px)" },
        },

        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(20px, -50px) scale(1.1)" },
          "50%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "75%": { transform: "translate(50px, 50px) scale(1.05)" },
        },

        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        }
      },

      animation: {
        fadeIn: "fadeIn 1.2s ease-out forwards",
        "fade-in": "fadeIn 1s ease-out",
        glow: "glow 3s ease-in-out infinite alternate",
        float: "float 6s ease-in-out infinite",
        blob: "blob 7s infinite",
        gradient: "gradient 3s ease infinite",
      },

      backgroundSize: {
        "200": "200% 200%",
      },
    },
  },

  plugins: [],
};
