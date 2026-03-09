import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ── 폰트 ── */
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },

      /* ── UI_DESIGN_SYSTEM.md 컬러 시스템 ── */
      colors: {
        /* shadcn/ui CSS 변수 매핑 */
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          50: "#FFF8F0",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          50: "#F0F4FF",
          100: "#DDE5F9",
          200: "#B8C9F2",
          300: "#8BA7E8",
          400: "#5B7FD6",
          500: "#3B5CC0",
          600: "#2D4A9E",
          700: "#1E3578",
          800: "#162758",
          900: "#0F1B3D",
        },
        neutral: {
          50: "#FAFAF8",
          100: "#F5F5F0",
          200: "#E8E8E3",
          300: "#D4D4CD",
          400: "#A8A89F",
          500: "#737369",
          600: "#545449",
          700: "#3D3D35",
          800: "#27271F",
          900: "#171712",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        /* ── Semantic 컬러 ── */
        success: {
          DEFAULT: "#16A34A",
          soft: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#EAB308",
          soft: "#FEF9C3",
        },
        danger: {
          DEFAULT: "#DC2626",
          soft: "#FEE2E2",
        },
        info: {
          DEFAULT: "#0EA5E9",
          soft: "#E0F2FE",
        },

        /* ── 수수료/매출 전용 ── */
        fee: {
          deducted: "#EF4444",
          net: "#10B981",
          gross: "#F97316",
        },
      },

      /* ── 보더 라디우스 ── */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "16px",
        "2xl": "20px",
      },

      /* ── 스페이싱 ── */
      spacing: {
        "4.5": "18px",
        "13": "52px",
        "15": "60px",
        "18": "72px",
        "20": "80px",
      },

      /* ── 애니메이션 ── */
      transitionTimingFunction: {
        "ease-out-custom": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-in-out-custom": "cubic-bezier(0.65, 0, 0.35, 1)",
        "ease-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      keyframes: {
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
      },

      animation: {
        "shimmer": "shimmer 2s infinite",
        "fade-in": "fade-in 0.3s var(--ease-out) forwards",
        "slide-up": "slide-up 0.3s var(--ease-out) forwards",
        "slide-in-right": "slide-in-right 0.3s var(--ease-out) forwards",
        "count-up": "count-up 0.2s var(--ease-out) forwards",
        "shake": "shake 0.3s ease-in-out",
      },

      /* ── 박스 셰도우 ── */
      boxShadow: {
        "glow-orange": "0 0 40px rgba(249, 115, 22, 0.06)",
        "glow-orange-md": "0 0 60px rgba(249, 115, 22, 0.1)",
        "card": "0 8px 32px rgba(0, 0, 0, 0.12)",
        "card-hover": "0 12px 40px rgba(0, 0, 0, 0.16)",
      },

      /* ── 백드롭 필터 ── */
      backdropBlur: {
        "glass": "20px",
      },

      /* ── 폰트 사이즈 (디자인 시스템 스케일) ── */
      fontSize: {
        "amount-hero": ["2.5rem", { lineHeight: "1.1", fontWeight: "800", letterSpacing: "-0.02em" }],
        "amount-card": ["1.75rem", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.01em" }],
        "amount-inline": ["1.125rem", { lineHeight: "1.3", fontWeight: "600" }],
        "heading-lg": ["1.5rem", { lineHeight: "1.3", fontWeight: "700", letterSpacing: "-0.01em" }],
        "heading-md": ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-default": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-small": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "caption": ["0.75rem", { lineHeight: "1.4", fontWeight: "500", letterSpacing: "0.02em" }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
