import appConfig from '../../config/appConfig'

// Maps theme color keys onto the base "--piveau-*" source CSS variables defined
// in src/assets/base.css. Overriding these cascades through the token layer
// (--primary, --secondary, --header-bg, …) to every Tailwind utility and
// component that consumes them.
const COLOR_VAR_MAP: Record<string, string> = {
  primary: '--piveau-primary',
  primaryHover: '--piveau-primary-variant',
  secondary: '--piveau-secondary',
  secondaryHover: '--piveau-secondary-variant',
  headerBg: '--piveau-header-bg',
  headerText: '--piveau-header-text',
  footerBg: '--piveau-footer-bg',
  footerText: '--piveau-footer-text',
}

const STYLE_ELEMENT_ID = 'runtime-theme'

// Parses the VITE_THEME_COLORS JSON string. Returns an empty object on missing
// or invalid input so a bad value never breaks rendering.
function parseThemeColors(raw: string): Record<string, string> {
  if (!raw || !raw.trim()) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  }
  catch {
    console.warn('[runtime-theme] VITE_THEME_COLORS is not valid JSON; ignoring.')
    return {}
  }
}

/**
 * Applies runtime-configurable theme colors (from the VITE_THEME_COLORS env
 * JSON via appConfig) by injecting a `:root { … }` style block. Only known,
 * non-empty keys are emitted, so unset colors fall back to the built-in
 * palette. Injecting via a stylesheet (rather than inline styles on the root
 * element) keeps normal specificity, so the dark-mode
 * `:root[data-theme="dark"]` overrides still take precedence.
 */
export function useRuntimeTheme(): void {
  if (typeof document === 'undefined') return

  // TEMP DIAGNOSTIC — remove once theming is confirmed working.
  console.debug('[runtime-theme] raw themeColors =', JSON.stringify(appConfig.themeColors), '| mode =', import.meta.env.MODE)

  const colors = parseThemeColors(appConfig.themeColors)

  const declarations = Object.entries(COLOR_VAR_MAP)
    .map(([key, cssVar]) => {
      const value = colors[key]
      return typeof value === 'string' && value.trim() ? `${cssVar}: ${value};` : ''
    })
    .filter(Boolean)
    .join(' ')

  if (!declarations) return

  let style = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null
  if (!style) {
    style = document.createElement('style')
    style.id = STYLE_ELEMENT_ID
    document.head.appendChild(style)
  }
  style.textContent = `:root { ${declarations} }`
}
