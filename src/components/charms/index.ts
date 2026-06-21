/**
 * Charms × Sherbet — component library.
 *
 * Real React primitives extracted from the `mockups/sherbet/charms/` design set:
 * the round enamel Charm, its Setting, the Case board, the recall Tray, the HUD,
 * the candy CharmButton, and the end-of-run ScorePanel. Themed entirely from
 * `tokens.ts` (mirrors `mockups/sherbet/tokens.css`) for a future RN port.
 */
export * from './tokens'
export { Charm, type CharmProps, type CharmState } from './Charm'
export { Setting, type SettingProps, type SettingState } from './Setting'
export { Case, type CaseProps } from './Case'
export { Tray, TrayCharm, type TrayProps, type TrayCharmProps } from './Tray'
export { HUD, Lives, FindBar, type HudProps, type FindBarProps } from './HUD'
export { CharmButton, type CharmButtonProps } from './CharmButton'
export { ScorePanel, Stars, type ScorePanelProps } from './ScorePanel'
