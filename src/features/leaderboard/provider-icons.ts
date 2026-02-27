import agiIcon from '@/assets/provider-icons/agi.png';
import allenaiIcon from '@/assets/provider-icons/allenai.svg';
import antgroupIcon from '@/assets/provider-icons/antgroup.png';
import anthropicIcon from '@/assets/provider-icons/anthropic.svg';
import arceeIcon from '@/assets/provider-icons/arcee.png';
import askuiIcon from '@/assets/provider-icons/askui.svg';
import baaiIcon from '@/assets/provider-icons/baai.png';
import baiduIcon from '@/assets/provider-icons/baidu.svg';
import bigaiIcon from '@/assets/provider-icons/bigai.png';
import bytedanceIcon from '@/assets/provider-icons/bytedance.svg';
import evolutionIcon from '@/assets/provider-icons/evolution.png';
import gairIcon from '@/assets/provider-icons/gair.png';
import gboxIcon from '@/assets/provider-icons/gbox.svg';
import googleIcon from '@/assets/provider-icons/google.svg';
import hkuIcon from '@/assets/provider-icons/hku.png';
import lenovoIcon from '@/assets/provider-icons/lenovo.svg';
import lybicIcon from '@/assets/provider-icons/lybic.svg';
import meituanIcon from '@/assets/provider-icons/meituan.svg';
import metaIcon from '@/assets/provider-icons/meta.svg';
import microsoftIcon from '@/assets/provider-icons/microsoft.svg';
import milaIcon from '@/assets/provider-icons/mila.ico';
import mininglampIcon from '@/assets/provider-icons/mininglamp.png';
import mistralIcon from '@/assets/provider-icons/mistral.ico';
import moonshotIcon from '@/assets/provider-icons/moonshot.png';
import openaiIcon from '@/assets/provider-icons/openai.svg';
import openbmbIcon from '@/assets/provider-icons/openbmb.png';
import opengvlabIcon from '@/assets/provider-icons/opengvlab.png';
import openinterpreterIcon from '@/assets/provider-icons/openinterpreter.svg';
import primeIntellectIcon from '@/assets/provider-icons/prime-intellect.png';
import qwenIcon from '@/assets/provider-icons/qwen.png';
import robotIcon from '@/assets/provider-icons/robot.svg';
import salesforceIcon from '@/assets/provider-icons/salesforce.svg';
import shlabIcon from '@/assets/provider-icons/shlab.png';
import simularIcon from '@/assets/provider-icons/simular.png';
import smartmoreIcon from '@/assets/provider-icons/smartmore.png';
import tsinghuaIcon from '@/assets/provider-icons/tsinghua.png';
import uipathIcon from '@/assets/provider-icons/uipath.svg';
import xiaomiIcon from '@/assets/provider-icons/xiaomi.png';
import zhipuIcon from '@/assets/provider-icons/zhipu.png';

interface ProviderIcon {
  src: string;
  alt: string;
}

interface ProviderRule {
  icon: ProviderIcon;
  institutionKeywords?: string[];
  modelKeywords?: string[];
  sourceDomainKeywords?: string[];
}

const ICONS = {
  openai: { src: openaiIcon, alt: 'OpenAI icon' },
  agi: { src: agiIcon, alt: 'AGI Inc icon' },
  anthropic: { src: anthropicIcon, alt: 'Anthropic icon' },
  simular: { src: simularIcon, alt: 'Simular icon' },
  bytedance: { src: bytedanceIcon, alt: 'ByteDance icon' },
  evolution: { src: evolutionIcon, alt: 'Evolution icon' },
  gair: { src: gairIcon, alt: 'GAIR icon' },
  hku: { src: hkuIcon, alt: 'University of Hong Kong icon' },
  moonshot: { src: moonshotIcon, alt: 'Moonshot icon' },
  qwen: { src: qwenIcon, alt: 'Qwen icon' },
  robot: { src: robotIcon, alt: 'Robot icon' },
  salesforce: { src: salesforceIcon, alt: 'Salesforce icon' },
  google: { src: googleIcon, alt: 'Google icon' },
  zhipu: { src: zhipuIcon, alt: 'Zhipu icon' },
  shlab: { src: shlabIcon, alt: 'Shanghai AI Lab icon' },
  lenovo: { src: lenovoIcon, alt: 'Lenovo icon' },
  lybic: { src: lybicIcon, alt: 'Lybic icon' },
  meituan: { src: meituanIcon, alt: 'Meituan icon' },
  meta: { src: metaIcon, alt: 'Meta icon' },
  uipath: { src: uipathIcon, alt: 'UiPath icon' },
  microsoft: { src: microsoftIcon, alt: 'Microsoft icon' },
  mininglamp: { src: mininglampIcon, alt: 'Mininglamp icon' },
  askui: { src: askuiIcon, alt: 'AskUI icon' },
  baai: { src: baaiIcon, alt: 'BAAI icon' },
  bigai: { src: bigaiIcon, alt: 'BIGAI icon' },
  smartmore: { src: smartmoreIcon, alt: 'SmartMore icon' },
  gbox: { src: gboxIcon, alt: 'GBOX icon' },
  opengvlab: { src: opengvlabIcon, alt: 'OpenGVLab icon' },
  openinterpreter: { src: openinterpreterIcon, alt: 'OpenInterpreter icon' },
  openbmb: { src: openbmbIcon, alt: 'OpenBMB icon' },
  mistral: { src: mistralIcon, alt: 'Mistral icon' },
  mila: { src: milaIcon, alt: 'Mila icon' },
  tsinghua: { src: tsinghuaIcon, alt: 'Tsinghua icon' },
  antgroup: { src: antgroupIcon, alt: 'Ant Group icon' },
  allenai: { src: allenaiIcon, alt: 'AllenAI icon' },
  arcee: { src: arceeIcon, alt: 'Arcee icon' },
  xiaomi: { src: xiaomiIcon, alt: 'Xiaomi icon' },
  baidu: { src: baiduIcon, alt: 'Baidu icon' },
  primeIntellect: { src: primeIntellectIcon, alt: 'Prime Intellect icon' },
} as const;

const PROVIDER_RULES: ProviderRule[] = [
  {
    icon: ICONS.agi,
    institutionKeywords: ['agi inc', 'agi company'],
    sourceDomainKeywords: ['theagi.company'],
  },
  {
    icon: ICONS.openai,
    institutionKeywords: ['openai'],
    modelKeywords: ['gpt-'],
    sourceDomainKeywords: ['openai.com'],
  },
  {
    icon: ICONS.anthropic,
    institutionKeywords: ['anthropic'],
    modelKeywords: ['claude'],
    sourceDomainKeywords: ['anthropic.com'],
  },
  {
    icon: ICONS.simular,
    institutionKeywords: ['simular'],
    sourceDomainKeywords: ['simular.ai'],
  },
  {
    icon: ICONS.bytedance,
    institutionKeywords: ['bytedance', 'seed'],
    sourceDomainKeywords: ['seed.bytedance.com'],
  },
  {
    icon: ICONS.qwen,
    institutionKeywords: ['qwen', 'alibaba', 'tongyi'],
    modelKeywords: ['qwen', 'gui-owl'],
    sourceDomainKeywords: ['qwen.ai', 'qwenlm.github.io'],
  },
  {
    icon: ICONS.google,
    institutionKeywords: ['google'],
    sourceDomainKeywords: ['google.com'],
  },
  {
    icon: ICONS.salesforce,
    institutionKeywords: ['salesforce'],
    sourceDomainKeywords: ['salesforce.com'],
  },
  {
    icon: ICONS.moonshot,
    institutionKeywords: ['moonshot', 'kimi'],
    modelKeywords: ['kimi'],
    sourceDomainKeywords: ['kimi.com'],
  },
  {
    icon: ICONS.hku,
    institutionKeywords: ['university of hong kong', 'hku'],
    sourceDomainKeywords: ['opencua.xlang.ai'],
  },
  {
    icon: ICONS.zhipu,
    institutionKeywords: ['zhipu'],
    sourceDomainKeywords: ['cogagent.aminer.cn'],
  },
  {
    icon: ICONS.shlab,
    institutionKeywords: ['shanghai ai lab', 'shanghai ai laboratory', 'nanjing university'],
    sourceDomainKeywords: ['osatlas.github.io', 'os-copilot.github.io'],
  },
  {
    icon: ICONS.lenovo,
    institutionKeywords: ['lenovo'],
  },
  {
    icon: ICONS.lybic,
    institutionKeywords: ['lybic'],
  },
  {
    icon: ICONS.meituan,
    institutionKeywords: ['meituan'],
  },
  {
    icon: ICONS.meta,
    institutionKeywords: ['meta'],
    modelKeywords: ['llama'],
    sourceDomainKeywords: ['llama.meta.com'],
  },
  {
    icon: ICONS.uipath,
    institutionKeywords: ['uipath'],
  },
  {
    icon: ICONS.askui,
    institutionKeywords: ['askui'],
    sourceDomainKeywords: ['askui.com'],
  },
  {
    icon: ICONS.baai,
    institutionKeywords: ['baai'],
    sourceDomainKeywords: ['baai-agents.github.io', 'baai.ac.cn'],
  },
  {
    icon: ICONS.bigai,
    institutionKeywords: ['bigai', 'datacanvas'],
  },
  {
    icon: ICONS.smartmore,
    institutionKeywords: ['smartmore'],
  },
  {
    icon: ICONS.evolution,
    institutionKeywords: ['evolution intelligence'],
  },
  {
    icon: ICONS.gair,
    institutionKeywords: ['gair'],
    sourceDomainKeywords: ['plms.ai', 'gair-nlp.github.io'],
  },
  {
    icon: ICONS.gbox,
    institutionKeywords: ['gbox'],
  },
  {
    icon: ICONS.microsoft,
    institutionKeywords: ['microsoft'],
  },
  {
    icon: ICONS.mininglamp,
    institutionKeywords: ['mininglamp'],
  },
  {
    icon: ICONS.opengvlab,
    institutionKeywords: ['opengvlab'],
    sourceDomainKeywords: ['internvl.github.io'],
  },
  {
    icon: ICONS.openbmb,
    institutionKeywords: ['openbmb', 'minicpm-v team'],
    sourceDomainKeywords: ['openbmb.cn'],
  },
  {
    icon: ICONS.openinterpreter,
    institutionKeywords: ['openinterpreter'],
    sourceDomainKeywords: ['openinterpreter.com'],
  },
  {
    icon: ICONS.mistral,
    institutionKeywords: ['mistral'],
    sourceDomainKeywords: ['mistral.ai'],
  },
  {
    icon: ICONS.mila,
    institutionKeywords: ['mila', 'universite de montreal'],
  },
  {
    icon: ICONS.tsinghua,
    institutionKeywords: ['tsinghua'],
  },
  {
    icon: ICONS.antgroup,
    institutionKeywords: ['inclusionai', 'ant group'],
  },
  {
    icon: ICONS.allenai,
    institutionKeywords: ['allenai', 'ai2'],
  },
  {
    icon: ICONS.arcee,
    institutionKeywords: ['arcee'],
  },
  {
    icon: ICONS.xiaomi,
    institutionKeywords: ['xiaomi'],
  },
  {
    icon: ICONS.baidu,
    institutionKeywords: ['baidu'],
  },
  {
    icon: ICONS.primeIntellect,
    institutionKeywords: ['prime intellect'],
  },
];

function includesAny(target: string, keywords: string[] | undefined): boolean {
  if (!keywords || keywords.length === 0) {
    return false;
  }

  return keywords.some((keyword) => target.includes(keyword));
}

function toNormalized(value: string): string {
  return value.toLowerCase().trim();
}

function toSourceDomain(sourceUrl?: string): string {
  if (!sourceUrl) {
    return '';
  }

  try {
    return new URL(sourceUrl).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function resolveProviderIcon(
  institution: string,
  model: string,
  sourceUrl?: string,
): ProviderIcon | null {
  const normalizedInstitution = toNormalized(institution);
  const normalizedModel = toNormalized(model);
  const normalizedSourceDomain = toSourceDomain(sourceUrl);

  if (normalizedInstitution.includes('reference baseline') || normalizedModel.includes('human baseline')) {
    return ICONS.robot;
  }

  for (const rule of PROVIDER_RULES) {
    if (includesAny(normalizedInstitution, rule.institutionKeywords)) {
      return rule.icon;
    }
  }

  for (const rule of PROVIDER_RULES) {
    if (includesAny(normalizedSourceDomain, rule.sourceDomainKeywords)) {
      return rule.icon;
    }
  }

  for (const rule of PROVIDER_RULES) {
    if (includesAny(normalizedModel, rule.modelKeywords)) {
      return rule.icon;
    }
  }

  return ICONS.robot;
}
