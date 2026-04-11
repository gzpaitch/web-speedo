import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

// ESLint handles Next.js/React-specific rules that Biome doesn't cover:
// react-hooks, jsx-a11y, @next/next rules.
// Formatting and general TypeScript linting is handled by Biome.
const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
])

export default eslintConfig
