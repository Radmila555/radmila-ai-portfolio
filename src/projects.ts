import roadmapCover from '../Video/posters/roadmap.webp'
import artCover from '../Video/posters/art-detective.webp'
import autoCover from '../Video/posters/autoprofi.webp'
import mailCover from '../Video/posters/yandex-mail.webp'
import quoteCover from '../Video/posters/quote.webp'
import sorterCover from '../Video/posters/sorter.webp'
import pageCover from '../Video/posters/page.webp'
import autoVideo from '../Video/AutoProfi_Voice_Agent_GR.mp4?url'
import mailVideo from '../Video/Yandex_Mail_Agent_PRIVATE_GR.mp4?url'
import quoteVideo from '../Video/AI_Quote_Assistant_GR.mp4?url'
import sorterVideo from '../Video/Smart_Downloads_Sorter_CLEAN_GR.mp4?url'
import roadmapVideo from '../Video/AI_Roadmap_Generator_FINAL_GR.mp4?url'
import pageVideo from '../Video/AI_Page_Assistant_GR.mp4?url'

export type Language = 'ru' | 'en'
type LocalizedText = Record<Language, string>
export type Project = {
  id: string
  name: string
  kind: 'primary' | 'secondary' | 'creative' | 'web'
  type: LocalizedText
  description?: LocalizedText
  tags?: string[]
  cover?: string
  video?: string
  duration?: string
  portrait?: boolean
  status?: LocalizedText
}

// Evidence: supplied brief and demonstration frames. Do not infer backend stacks
// from interfaces. TODO: confirm stacks for the five non-Roadmap AI tools.
export const aiProjects: Project[] = [
  {
    id: 'autoprofi', name: 'AutoProfi Voice Agent', kind: 'primary',
    type: { ru: 'Голосовой AI-агент', en: 'Voice AI agent' },
    description: {
      ru: 'Голосовой ассистент для автосервиса: общается с клиентом и помогает пройти сценарий записи. Рабочий прототип показывает, как автоматизировать первичный диалог с посетителем.',
      en: 'A voice assistant for an auto service business. It talks with a customer and guides them through a booking scenario. This working prototype demonstrates an automated first conversation.',
    },
    cover: autoCover, video: autoVideo, duration: '2:20', portrait: true,
    status: { ru: 'Рабочий прототип · бизнес-сценарий', en: 'Working prototype · business use case' },
  },
  {
    id: 'roadmap', name: 'AI Roadmap Generator', kind: 'primary',
    type: { ru: 'Голосовое интервью → план действий', en: 'Voice interview → action plan' },
    description: {
      ru: 'Помогает перейти от идеи к конкретным шагам. Агент проводит голосовое интервью в три раунда, анализирует ответы и формирует персональный пошаговый план действий.',
      en: 'Helps turn an idea into concrete next steps. The agent runs a three-round voice interview, analyzes the answers and builds a personalized action plan.',
    },
    // Stack shown on the existing portfolio demo cover and in the original data.
    tags: ['Next.js', 'Cloudflare Workers', 'NanoGPT', 'Groq Whisper'],
    cover: roadmapCover, video: roadmapVideo, duration: '1:30',
  },
  {
    id: 'yandex-mail', name: 'Yandex Mail Agent', kind: 'primary',
    type: { ru: 'Автоматизация почты', en: 'Email workflow automation' },
    description: {
      ru: 'Управление Яндекс Почтой из Telegram. Агент показывает почтовые папки и создаёт новые по команде — повседневные действия с почтой становятся частью одного диалога.',
      en: 'Manage Yandex Mail from Telegram. The agent lists mail folders and creates new ones on request, bringing everyday email tasks into a single conversation.',
    },
    cover: mailCover, video: mailVideo, duration: '1:00',
    status: { ru: 'Работающий сценарий · видеодемонстрация', en: 'Working workflow · video walkthrough' },
  },
  {
    id: 'quote', name: 'AI Quote Assistant', kind: 'primary',
    type: { ru: 'Бизнес-инструмент', en: 'Business tool' },
    description: {
      ru: 'Помогает превратить заявку клиента в коммерческое предложение. В демо — ввод задачи, оценка стоимости и сроков, затем подготовка предложения с составом работ.',
      en: 'Turns a client request into a project proposal. The demo follows the process from a brief to a cost and timeline estimate, then a proposal outlining the work.',
    },
    cover: quoteCover, video: quoteVideo, duration: '0:51',
  },
  {
    id: 'sorter', name: 'Smart Downloads Sorter', kind: 'secondary',
    type: { ru: 'Автоматизация файлов', en: 'File automation' },
    description: {
      ru: 'Наводит порядок в загрузках без ручной сортировки каждого файла. Показывает план распределения по папкам перед применением и организует файлы в понятную структуру.',
      en: 'Organizes downloads without sorting every file by hand. It previews a folder plan before applying it, turning a cluttered folder into an organized file structure.',
    },
    cover: sorterCover, video: sorterVideo, duration: '0:41',
  },
  {
    id: 'page', name: 'AI Page Assistant', kind: 'secondary',
    type: { ru: 'AI-расширение для браузера', en: 'AI browser extension' },
    description: {
      ru: 'Помогает разобраться в содержимом открытой страницы. Отвечает на вопросы по её тексту прямо в боковой панели браузера и поддерживает озвучивание ответов.',
      en: 'Helps make sense of the page you are reading. Ask questions about its content in the browser sidebar and listen to answers with text-to-speech.',
    },
    cover: pageCover, video: pageVideo, duration: '0:57',
  },
]

export const creativeProjects: Project[] = [{
  id: 'art-detective', name: 'Art Detective', kind: 'creative',
  type: { ru: 'AI · искусство и образование', en: 'AI · art and education' },
  description: {
    ru: 'Творческий образовательный проект на пересечении искусства, AI и веб-технологий. Пример применения AI в художественном и учебном контексте.',
    en: 'A creative learning project combining art, AI and web technology. An exploration of AI in an artistic and educational setting.',
  },
  cover: artCover,
}]

// TODO: add verified URLs, screenshots, stacks and project briefs when supplied.
// No working public URLs are present in the source portfolio.
export const webProjects: Project[] = [
  ['nexora', 'PCServiceDemo Nexora'], ['english', 'English website'],
  ['norden', 'NORDEN-HOME'], ['mira', 'MIRA'], ['artcloseup', 'artcloseup'],
].map(([id, name]) => ({ id, name, kind: 'web', type: { ru: 'Веб-проект', en: 'Web project' } }))
