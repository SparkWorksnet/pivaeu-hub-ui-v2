import developmentConfig from './config.dev.js'
import productionConfig from './config.js'

export interface Configuration {
  appUrl: string
  keycloakUrl: string
  keycloakRealm: string
  keycloakClientId: string
  supersetUrl: string
  piveauHubSearchUrl: string
  piveauHubRepoUrl: string
  piveauHubStoreUrl: string
  middlewareUrl: string
  piveauSparqlUrl: string
  piveauDataQualityUrl: string
  projectTitle: string
  projectUrl: string
  logoUrl: string
  appTitle: string
  // JSON string of theme color overrides, e.g.
  // '{"primary":"#1a3c7d","secondary":"#00b3a4","headerBg":"#0d1b2a"}'
  // Parsed at runtime by useRuntimeTheme. Empty = keep the built-in palette.
  themeColors: string
  socialLinkedIn: string
  socialTwitter: string
  socialYouTube: string
  socialFacebook: string
  socialGitHub: string
  contactEmail: string
}

export default import.meta.env.MODE === 'production' ? productionConfig : developmentConfig
