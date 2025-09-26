
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // Custom colors
        'leaf': {
          '50': '#f2f8f2',
          '100': '#e0eee0',
          '200': '#c1dec1',
          '300': '#95c695',
          '400': '#65aa65',
          '500': '#4a904a',
          '600': '#3a743a',
          '700': '#305b30',
          '800': '#2a4a2a',
          '900': '#253e25',
          '950': '#0f220f',
        },
        'soil': {
          '50': '#faf6f3',
          '100': '#f2eae2',
          '200': '#e5d3c5',
          '300': '#d7b8a3',
          '400': '#c79a7e',
          '500': '#bc8265',
          '600': '#b06c51',
          '700': '#925744',
          '800': '#78493c',
          '900': '#633f35',
          '950': '#351f1a',
        },
        'wheat': {
          '50': '#fefde8',
          '100': '#fffac5',
          '200': '#fff394',
          '300': '#ffe658',
          '400': '#ffd321',
          '500': '#fabe0a',
          '600': '#e19503',
          '700': '#bb6c06',
          '800': '#98540d',
          '900': '#7c4510',
          '950': '#472304',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        "accordion-down": {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        "accordion-up": {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        "pulse-gentle": {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        "float": {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-gentle": "pulse-gentle 3s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite"
      }
    }
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
