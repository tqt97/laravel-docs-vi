import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import LearningNotice from './components/LearningNotice.vue'
import OfficialSource from './components/OfficialSource.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(LearningNotice),
      'doc-after': () => h(OfficialSource),
    })
  },
} satisfies Theme

import { h } from 'vue'
