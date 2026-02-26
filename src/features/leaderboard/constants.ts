import type { SelfReportedTab, VerifiedRawRow } from './types';

export const VERIFIED_RESULTS_URL =
  'https://os-world.github.io/static/data/osworld_verified_results.xlsx';

export const SELF_REPORTED_RESULTS_URL =
  'https://os-world.github.io/static/data/self_reported_results.xlsx';

export const VERIFIED_ONLY_TAB: SelfReportedTab = 'Verified';

export const TAB_ORDER: SelfReportedTab[] = [
  'Verified',
  'Screenshot',
  'A11y tree',
  'Screenshot + A11y tree',
  'Set-of-Mark',
];

export const SHEET_NAME_BY_TAB: Record<Exclude<SelfReportedTab, 'Verified'>, string> = {
  Screenshot: 'Screenshot',
  'A11y tree': 'A11y_tree',
  'Screenshot + A11y tree': 'Screenshot_A11y_tree',
  'Set-of-Mark': 'Set-of-Mark',
};

export const INJECTED_VERIFIED_ENTRIES: VerifiedRawRow[] = [
  {
    Model: 'AGI Inc. OSAgent',
    Institution: 'AGI Inc. (The AGI Company)',
    PaperLink: 'https://www.theagi.company/blog/osworld',
    PaperAuthors: "The World's Most Capable Computer Agent",
    'Approach type': 'Specialized model',
    'Max steps': 100,
    'Additional a11y tree used': 'No',
    'Additional coding-based action': 'No',
    'Multiple rollout': 'Yes',
    'Retry / Self-Verification': 'Yes',
    Date: '2026-02-22',
    'Success rate': 76.26,
  },
  {
    Model: 'Human Baseline',
    Institution: 'Reference baseline',
    PaperLink: 'https://www.askui.com/benchmarks',
    PaperAuthors: 'Human expert average',
    'Approach type': 'Specialized model',
    'Max steps': 100,
    'Additional a11y tree used': 'No',
    'Additional coding-based action': 'No',
    'Multiple rollout': 'No',
    Date: '2026-02-22',
    'Success rate': 72.36,
  },
  {
    Model: 'Claude Opus 4.6',
    Institution: 'Anthropic',
    PaperLink: 'https://www.anthropic.com/news/claude-opus-4-6',
    PaperAuthors: 'Introducing Claude Opus 4.6',
    'Approach type': 'General model',
    'Max steps': 100,
    'Additional a11y tree used': 'No',
    'Additional coding-based action': 'No',
    'Multiple rollout': 'No',
    Date: '2026-02-22',
    'Success rate': 72.7,
  },
  {
    Model: 'Claude Sonnet 4.6',
    Institution: 'Anthropic',
    PaperLink: 'https://www.anthropic.com/news/claude-sonnet-4-6',
    PaperAuthors: 'Introducing Claude Sonnet 4.6',
    'Approach type': 'General model',
    'Max steps': 100,
    'Additional a11y tree used': 'No',
    'Additional coding-based action': 'No',
    'Multiple rollout': 'No',
    Date: '2026-02-22',
    'Success rate': 72.5,
  },
  {
    Model: 'AskUI VisionAgent',
    Institution: 'AskUI',
    PaperLink: 'https://www.askui.com/benchmarks',
    PaperAuthors: 'AskUI Benchmarks',
    'Approach type': 'Specialized model',
    'Max steps': 100,
    'Additional a11y tree used': 'No',
    'Additional coding-based action': 'No',
    'Multiple rollout': 'No',
    Date: '2026-02-22',
    'Success rate': 66.2,
  },
  {
    Model: 'Kimi K2.5 (Thinking)',
    Institution: 'Moonshot AI',
    PaperLink: 'https://www.kimi.com/blog/kimi-k2-5.html',
    PaperAuthors: 'Kimi K2.5 Tech Blog',
    'Approach type': 'General model',
    'Max steps': 100,
    'Additional a11y tree used': 'No',
    'Additional coding-based action': 'No',
    'Multiple rollout': 'No',
    Date: '2026-02-22',
    'Success rate': 63.3,
  },
  {
    Model: 'Seed-1.8 (ByteDance)',
    Institution: 'ByteDance Seed',
    PaperLink:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/lapzild-tss/ljhwZthlaukjlkulzlp/research/Seed-1.8-Modelcard.pdf',
    PaperAuthors: 'Seed-1.8 resources',
    PaperLinks: [
      {
        label: 'Seed-1.8 Model Card (PDF)',
        url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/lapzild-tss/ljhwZthlaukjlkulzlp/research/Seed-1.8-Modelcard.pdf',
      },
      {
        label: 'Official Release Blog',
        url: 'https://seed.bytedance.com/en/blog/official-release-of-seed1-8-a-generalized-agentic-model',
      },
    ],
    'Approach type': 'General model',
    'Max steps': 100,
    'Additional a11y tree used': 'No',
    'Additional coding-based action': 'No',
    'Multiple rollout': 'No',
    Date: '2026-02-22',
    'Success rate': 61.9,
  },
  {
    Model: 'EvoCUA (Meituan)',
    Institution: 'Meituan LongCat Team',
    PaperLink: 'https://arxiv.org/abs/2601.15876',
    PaperAuthors: 'LongCat Team',
    'Approach type': 'General model',
    'Max steps': 50,
    'Additional a11y tree used': 'No',
    'Additional coding-based action': 'No',
    'Multiple rollout': 'No',
    Date: '2026-02-22',
    'Success rate': 56.7,
  },
  {
    Model: 'OpenAI GPT-5.2',
    Institution: 'OpenAI',
    PaperLink: 'https://openai.com/index/introducing-gpt-5-2/',
    PaperAuthors: 'OpenAI technical posts',
    PaperLinks: [
      {
        label: 'Introducing GPT-5.2',
        url: 'https://openai.com/index/introducing-gpt-5-2/',
      },
      {
        label: 'Model Release Notes (Feb 2026)',
        url: 'https://help.openai.com/en/articles/9624314-model-release-notes',
      },
    ],
    'Approach type': 'General model',
    'Max steps': 100,
    'Additional a11y tree used': 'No',
    'Additional coding-based action': 'No',
    'Multiple rollout': 'No',
    Date: '2026-02-22',
    'Success rate': 38.2,
  },
  {
    Model: 'UltraCUA-32B-RL',
    Institution: 'Apple; The University of Hong Kong',
    PaperLink: 'https://arxiv.org/abs/2510.17790',
    PaperAuthors: 'Yang et al., 2025',
    PaperLinks: [
      {
        label: 'arXiv Abstract',
        url: 'https://arxiv.org/abs/2510.17790',
      },
      {
        label: 'arXiv PDF (v2)',
        url: 'https://arxiv.org/pdf/2510.17790v2',
      },
    ],
    'Approach type': 'Agentic framework',
    'Max steps': 15,
    'Additional a11y tree used': 'No',
    'Additional coding-based action': 'No',
    'Multiple rollout': 'No',
    Date: '2025-12-10',
    'Success rate': 41,
  },
  {
    Model: 'UltraCUA-7B-RL',
    Institution: 'Apple; The University of Hong Kong',
    PaperLink: 'https://arxiv.org/abs/2510.17790',
    PaperAuthors: 'Yang et al., 2025',
    PaperLinks: [
      {
        label: 'arXiv Abstract',
        url: 'https://arxiv.org/abs/2510.17790',
      },
      {
        label: 'arXiv PDF (v2)',
        url: 'https://arxiv.org/pdf/2510.17790v2',
      },
    ],
    'Approach type': 'Agentic framework',
    'Max steps': 15,
    'Additional a11y tree used': 'No',
    'Additional coding-based action': 'No',
    'Multiple rollout': 'No',
    Date: '2025-12-10',
    'Success rate': 28.9,
  },
];
