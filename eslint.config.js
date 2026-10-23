import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// Mainland-usage terms and simplified-conversion leftovers from shuorenhua's taiwan-localization table; only unambiguous entries, so a hit is always a fix.
const mainlandTerms = ['軟件', '硬件', '視頻', '信息', '數據庫', '算法', '內存', '硬盤', '鼠標', '屏幕', '服務器', '網絡', '互聯網', '賬號', '緩存', '人工智能', '打印', '粘貼', '文件夾', '文檔', '優先級', '兼容', '調試', '運行', '加載', '登錄', '註銷', '界面', '交互', '實時', '在線', '郵箱', '設置', '激活', '創建', '搜索', '鏈接', '質量', '默認', '賦能', '抓手', '閉環', '賽道', '對標', '復盤', '落地', '靠譜', '發力', '體量', '顆粒度', '短信', '外賣', '着', '爲', '裏', '羣', '么', '内', '綫', '峯', '牀', '衹', '鑒'];
const mainlandPattern = `/${mainlandTerms.join('|')}/`;
const mainlandMessage = 'User-visible Chinese uses Taiwan usage; see the shuorenhua skill, references/taiwan-localization.md.';

export default tseslint.config(
  { ignores: ['dist', 'test-results', 'playwright-report', 'vite.config.js', 'vite.config.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error',
        { selector: `Literal[value=${mainlandPattern}]`, message: mainlandMessage },
        { selector: `TemplateElement[value.raw=${mainlandPattern}]`, message: mainlandMessage },
        { selector: `JSXText[value=${mainlandPattern}]`, message: mainlandMessage },
      ],
    },
  },
  {
    files: ['tests/**/*.spec.ts'],
    rules: {
      // Specs get fixed randomness from the shared fixture; see CODING_STANDARDS.md "測試".
      'no-restricted-imports': ['error', {
        paths: [{ name: '@playwright/test', importNames: ['test'], message: "Import test from './support/fixtures' so scenario picks are reproducible." }],
      }],
      'no-restricted-syntax': ['error',
        {
          selector: "CallExpression[callee.object.name='localStorage'][callee.property.name='getItem']",
          message: 'Specs reach saved state through user flows, not by reading localStorage.',
        },
        {
          selector: "BinaryExpression[operator='<='][left.property.name='scrollWidth']",
          message: 'Use expectNoHorizontalScroll from tests/support.',
        },
      ],
    },
  },
);
