import js from "@eslint/js";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import prettier from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

/**
 * Direção de dependência entre camadas:
 *
 *     ui -> layout -> features -> pages -> routes/app
 *
 * Uma camada pode importar das que estão acima dela, mais `shared`. As regras abaixo
 * transformam isso em erro de lint em vez de convenção escrita num documento — que é o
 * que o real-estate-app faz, e pelo motivo que ele registra: a estrutura anterior tinha
 * a mesma intenção escrita em markdown, e desviou mesmo assim.
 *
 * O alias `@/` é pré-requisito: as regras casam por especificador de import, e um
 * `../../ui` escaparia de todas elas.
 */
export default tseslint.config([
  globalIgnores(["dist", "coverage"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "./*/*"],
              message:
                "Use o alias absoluto `@/...` entre pastas. Caminhos relativos escapam das zonas de camada definidas neste arquivo.",
            },
          ],
        },
      ],
      // Erro em vez de aviso: `console.error` era usado como tratamento de erro em cinco
      // lugares, e o usuário não via nada.
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  },

  {
    files: ["src/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/pages/*", "@/routes/*", "@/layouts/*", "@/shared/api/*"],
              message:
                "ui/ é o design system: não pode conhecer domínio, rede nem rota. Receba tudo por props — se o componente precisa de um tipo da API, ele pertence a features/.",
            },
            {
              group: ["react-redux", "@reduxjs/toolkit"],
              message:
                "Um primitivo acoplado ao store não é reutilizável fora deste app. Receba os dados por props.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["src/layouts/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/pages/*"],
              message:
                "layout/ define a estrutura da página; o conteúdo chega por children ou pelo Outlet.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/pages/*", "@/routes/*"],
              message:
                "Uma feature não conhece as telas que a usam. Se precisa navegar, receba o destino por prop ou use o hook do router.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["src/pages/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/pages/*"],
              message:
                "Uma página não importa outra. O que as duas compartilham pertence a features/ ou a ui/.",
            },
          ],
        },
      ],
    },
  },

  {
    // Testes e mocks compõem através das camadas por natureza.
    files: ["src/**/*.spec.{ts,tsx}", "src/test/**", "src/mocks/**"],
    rules: { "no-restricted-imports": "off", "no-console": "off" },
  },
]);
