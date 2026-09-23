<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:bilingual-development-rules -->
# Bilingual Development Requirements

This platform supports both English and Vietnamese languages. All new features and content changes must include Vietnamese translations.

## Language Implementation Requirements

1. **Dictionary Files**: 
   - All new text strings must be added to both `content/dictionaries/en.json` and `content/dictionaries/vi.json`
   - Vietnamese translations should be natural and accurate, not literal translations
   - Keep dictionary keys consistent between both language files

2. **Type Definitions**:
   - Update `lib/dictionary.ts` TypeScript interface when adding new dictionary keys
   - Ensure all new keys are properly typed in the `Dictionary` interface

3. **Component Usage**:
   - Always use dictionary keys instead of hardcoded English text
   - Use fallback values: `dict?.section?.key || 'Fallback text'`
   - Consider both English and Vietnamese users when designing UI

4. **Translation Quality**:
   - Vietnamese should be natural and culturally appropriate
   - Use appropriate terminology for Vietnamese cube/speedcubing community
   - Consider text length differences between languages in UI design

## Current Translation Status

### ✅ Fully Translated:
- Main navigation
- Home page
- Learn page
- Algorithms page (including history feature)
- Algorithm cards (including alternatives and learning status)
- Authentication pages
- Theme toggle
- Language switcher

### 🔄 Partially Translated:
- Trainer page (some elements still need translation)
- Timer page (some elements still need translation)
- Community page (most elements still need translation)
- Admin pages (most elements still need translation)

## Verification Checklist

When adding new features:
- [ ] Added English text to `content/dictionaries/en.json`
- [ ] Added Vietnamese text to `content/dictionaries/vi.json`
- [ ] Updated `lib/dictionary.ts` TypeScript interface
- [ ] Component uses dictionary keys instead of hardcoded text
- [ ] Tested both English and Vietnamese versions
- [ ] Vietnamese translation is natural and accurate
<!-- END:bilingual-development-rules -->