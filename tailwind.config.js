
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        claret: "#7f1734",
        "claret-light": "#9a1f3d",
        blue: "#0055a5",
        "blue-light": "#0077cc",
        accent: "#7f1734",
        "dark-bg": "#0f0f1a",
        "darker": "#080811",
      },
      keyframes: {
        gradientMove: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        },
        floaty: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0px)" }
        }
      },
      animation: {
        gradient: "gradientMove 18s ease infinite",
        floaty: "floaty 6s ease-in-out infinite"
      },
      boxShadow: {
        glow: "0 0 30px rgba(127, 23, 52, 0.45)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)"
      },
      backgroundSize: {
        grid: "40px 40px"
      }
    },
  },
  plugins: [],
}
