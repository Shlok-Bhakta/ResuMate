import { getHighlighter, bundledThemes, bundledLanguages } from 'shiki';

const customMarkdownLangName = 'cartamd';
const loadDefaultTheme = async () => ({
    light: structuredClone((await import('./theme-light.CBYe8bJx.js')).default),
    dark: structuredClone((await import('./theme-dark.4fxZnLhE.js')).default)
});
/**
 * Loads the highlighter instance, with custom rules and options. Uses Shiki under the hood.
 * @param rules Custom rules for the highlighter, from plugins.
 * @param options Custom options for the highlighter.
 * @returns The highlighter instance.
 */
async function loadHighlighter({ grammarRules, highlightingRules, theme, shiki }) {
    // Inject rules into the custom markdown language
    const injectGrammarRules = (lang, rules) => {
        lang.repository = {
            ...langDefinition.repository,
            ...Object.fromEntries(rules.map(({ name, definition }) => [name, definition]))
        };
        for (const rule of rules) {
            if (rule.type === 'block') {
                lang.repository.block.patterns.unshift({ include: `#${rule.name}` });
            }
            else {
                lang.repository.inline.patterns.unshift({ include: `#${rule.name}` });
            }
        }
    };
    const injectHighlightRules = (theme, rules) => {
        if (theme.type === 'light') {
            theme.tokenColors ||= [];
            theme.tokenColors.unshift(...rules.map(({ light }) => light));
        }
        else {
            theme.tokenColors ||= [];
            theme.tokenColors.unshift(...rules.map(({ dark }) => dark));
        }
    };
    // Additional themes and languages provided by the user
    const themes = shiki?.themes ?? [];
    const langs = shiki?.langs ?? [];
    const highlighter = await getHighlighter({
        themes,
        langs
    });
    // Custom markdown language
    const langDefinition = (await import('./markdown.2HH4awoJ.js')).default;
    injectGrammarRules(langDefinition, grammarRules);
    await highlighter.loadLanguage(langDefinition);
    // Custom themes
    if (isSingleTheme(theme)) {
        let registration;
        if (isThemeRegistration(theme)) {
            registration = theme;
        }
        else {
            registration = (await bundledThemes[theme]()).default;
        }
        injectHighlightRules(registration, highlightingRules);
        await highlighter.loadTheme(registration);
    }
    else {
        const { light, dark } = theme;
        let lightRegistration;
        let darkRegistration;
        if (isThemeRegistration(light)) {
            lightRegistration = light;
        }
        else {
            lightRegistration = (await bundledThemes[light]()).default;
        }
        if (isThemeRegistration(dark)) {
            darkRegistration = dark;
        }
        else {
            darkRegistration = (await bundledThemes[dark]()).default;
        }
        injectHighlightRules(lightRegistration, highlightingRules);
        injectHighlightRules(darkRegistration, highlightingRules);
        await highlighter.loadTheme(lightRegistration);
        await highlighter.loadTheme(darkRegistration);
    }
    return {
        theme,
        lang: customMarkdownLangName,
        ...highlighter
    };
}
/**
 * Checks if a language is a bundled language.
 * @param lang The language to check.
 * @returns Whether the language is a bundled language.
 */
const isBundleLanguage = (lang) => Object.keys(bundledLanguages).includes(lang);
/**
 * Checks if a theme is a dual theme.
 * @param theme The theme to check.
 * @returns Whether the theme is a dual theme.
 */
const isDualTheme = (theme) => typeof theme == 'object' && 'light' in theme && 'dark' in theme;
/**
 * Checks if a theme is a single theme.
 * @param theme The theme to check.
 * @returns Whether the theme is a single theme.
 */
const isSingleTheme = (theme) => !isDualTheme(theme);
/**
 * Checks if a theme is a theme registration.
 * @param theme The theme to check.
 * @returns Whether the theme is a theme registration.
 */
const isThemeRegistration = (theme) => typeof theme == 'object';
/**
 * Find all nested languages in the markdown text and load them into the highlighter.
 * @param text Markdown text to parse for nested languages.
 * @returns The set of nested languages found in the text.
 */
const findNestedLanguages = (text) => {
    const languages = new Set();
    const regex = /```(\w+)$/gm;
    let match;
    while ((match = regex.exec(text))) {
        languages.add(match[1]);
    }
    return languages;
};
/**
 * Load all nested languages found in the markdown text into the highlighter.
 * @param highlighter The highlighter instance.
 * @param text The text to parse for nested languages.
 * @returns Whether the highlighter was updated with new languages.
 */
const loadNestedLanguages = async (highlighter, text) => {
    text = text.replaceAll('\r\n', '\n'); // Normalize line endings
    const languages = findNestedLanguages(text);
    const loadedLanguages = highlighter.getLoadedLanguages();
    let updated = false;
    for (const lang of languages) {
        if (isBundleLanguage(lang) && !loadedLanguages.includes(lang)) {
            await highlighter.loadLanguage(lang);
            loadedLanguages.push(lang);
            updated = true;
        }
    }
    return {
        updated
    };
};

export { customMarkdownLangName, isBundleLanguage, isDualTheme, isSingleTheme, isThemeRegistration, loadDefaultTheme, loadHighlighter, loadNestedLanguages };
