import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

export default {
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-nunito)", "ui-sans-serif", "system-ui"],
      },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
        // Custom colors from globals.css for Tailwind utility classes
        'custom-technical-norm-blue': {
          DEFAULT: 'hsl(var(--custom-technical-norm-blue))',
          foreground: 'hsl(var(--custom-technical-norm-blue-foreground))',
        },
        'custom-alert-minor-error-bg': 'hsl(var(--custom-alert-minor-error-bg))', // May not be used if severity colors cover it
        'custom-alert-major-error-bg': 'hsl(var(--custom-alert-major-error-bg))', // Should match destructive
        'custom-warning-yellow': {
          DEFAULT:'hsl(var(--custom-warning-yellow-bg))',
          foreground: 'hsl(var(--custom-warning-yellow-fg))',
        },
        'custom-technical-text-blue': 'hsl(var(--custom-technical-text-blue))',
        
        'custom-severity-low': {
          DEFAULT: 'hsl(var(--custom-severity-low-bg))',
          foreground: 'hsl(var(--custom-severity-low-fg))',
        },
        'custom-severity-medium':{
          DEFAULT: 'hsl(var(--custom-severity-medium-bg))',
          foreground: 'hsl(var(--custom-severity-medium-fg))',
        },
        'custom-severity-high': {
          DEFAULT: 'hsl(var(--custom-severity-high-bg))',
          foreground: 'hsl(var(--custom-severity-high-fg))',
        },
  		},
      boxShadow: {
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'gradient-bg': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        'subtle-breathing': {
          '0%, 100%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.03)',
          },
        },
        'slide-in-from-bottom-center': {
          '0%': {
            transform: 'translateY(100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          }
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'gradient-bg': 'gradient-bg 10s ease infinite',
        'subtle-breathing': 'subtle-breathing 4s ease-in-out infinite',
        'slide-in-from-bottom-center': 'slide-in-from-bottom-center 0.5s ease-out forwards',
      },
      backgroundSize: {
        '200%': '200% 200%',
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function({ addComponents, theme }) {
      addComponents({
        '.glass': {
          backgroundColor: 'hsl(var(--background) / 0.8)',
          backdropFilter: 'blur(12px)',
          borderWidth: '1px',
          borderColor: 'hsl(var(--border) / 0.3)',
        },
        '.btn-neu-green': {
            backgroundColor: 'hsl(142 71% 45% / 0.9)', // green-500
            border: '1px solid hsl(142 71% 35% / 0.5)', // green-600
            color: 'white',
            transition: 'all 0.2s ease-in-out',
             '&:hover': {
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                backgroundColor: 'hsl(142 71% 45%)',
            }
        },
      })
    })
  ],
} satisfies Config;
