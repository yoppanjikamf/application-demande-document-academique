/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obc: {
          50: "var(--obc-50)",
          100: "var(--obc-100)",
          200: "var(--obc-200)",
          300: "var(--obc-300)",
          400: "var(--obc-400)",
          500: "var(--obc-500)",
          600: "var(--obc-600)",
          700: "var(--obc-700)",
          800: "var(--obc-800)",
          900: "var(--obc-900)",
        },
        gold: {
          100: "var(--gold-100)",
          300: "var(--gold-300)",
          400: "var(--gold-400)",
          500: "var(--gold-500)",
        },
        edu: {
          50: "var(--edu-50)",
          100: "var(--edu-100)",
          200: "var(--edu-200)",
          300: "var(--edu-300)",
          400: "var(--edu-400)",
          500: "var(--edu-500)",
          600: "var(--edu-600)",
          700: "var(--edu-700)",
          800: "var(--edu-800)",
          900: "var(--edu-900)",
        },
        role: {
          eleve: "var(--role-eleve)",
          "eleve-soft": "var(--role-eleve-soft)",
          admin: "var(--role-admin)",
          "admin-soft": "var(--role-admin-soft)",
          agent: "var(--role-agent)",
          "agent-soft": "var(--role-agent-soft)",
        },
        surface: {
          0: "var(--surface-0)",
          1: "var(--surface-1)",
          2: "var(--surface-2)",
        },
        text: {
          1: "var(--text-1)",
          2: "var(--text-2)",
          3: "var(--text-3)",
          muted: "var(--text-muted)",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-xl)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        hover: "var(--shadow-hover)",
        modal: "var(--shadow-modal)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
