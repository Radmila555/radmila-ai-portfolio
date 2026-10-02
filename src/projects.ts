import roadmapCover from '../Video/posters/roadmap.webp'
import artCover from '../Video/posters/art-detective.webp'
import autoCover from '../Video/posters/autoprofi.webp'
import mailCover from '../Video/posters/yandex-mail.webp'
import quoteCover from '../Video/posters/quote.webp'
import sorterCover from '../Video/posters/sorter.webp'
import pageCover from '../Video/posters/page.webp'
import nexoraPreview from './assets/web-projects/nexora-preview.webp'
import nordenPreview from './assets/web-projects/norden-preview.webp'
import miraPreview from './assets/web-projects/mira-preview.webp'
import artCloseupCover from './assets/art-education/artcloseup-preview.webp'
import autoConversation from '../Video/frames/autoprofi-conversation.webp'
import autoBooking from '../Video/frames/autoprofi-booking.webp'
import quoteEstimate from '../Video/frames/quote-estimate.webp'
import quoteProposal from '../Video/frames/quote-proposal.webp'
import roadmapInterview from '../Video/frames/roadmap-interview.webp'
import roadmapPlan from '../Video/frames/roadmap-plan.webp'
import autoVideo from '../Video/AutoProfi_Voice_Agent_GR.mp4?url'
import mailVideo from '../Video/Yandex_Mail_Agent_PRIVATE_GR.mp4?url'
import quoteVideo from '../Video/AI_Quote_Assistant_GR.mp4?url'
import sorterVideo from '../Video/Smart_Downloads_Sorter_CLEAN_GR.mp4?url'
import roadmapVideo from '../Video/AI_Roadmap_Generator_WEB_GR.mp4?url'
import pageVideo from '../Video/AI_Page_Assistant_GR.mp4?url'

export type Language = 'ru' | 'en'
type LocalizedText = Record<Language, string>
type FeaturedContent = {
  heading: LocalizedText
  role: LocalizedText
  result: LocalizedText
  status: LocalizedText
  meta: LocalizedText
  mainImage: string
  resultImage: string
  mainLabel: LocalizedText
  resultLabel: LocalizedText
  credit?: {
    prefix: LocalizedText
    linkLabel: LocalizedText
    suffix: LocalizedText
    url: string
  }
}
export type Project = {
  id: string
  name: string
  title?: LocalizedText
  kind: 'primary' | 'secondary' | 'creative' | 'web'
  type: LocalizedText
  description?: LocalizedText
  tags?: string[]
  cover?: string
  video?: string
  duration?: string
  portrait?: boolean
  status?: LocalizedText
  summary?: LocalizedText
  feature?: FeaturedContent
  liveUrl?: string
  liveKind?: 'site' | 'demo'
  localizedTags?: LocalizedText[]
  previewAlt?: LocalizedText
}

// Evidence: supplied brief and demonstration frames. Do not infer backend stacks
// from interfaces. TODO: confirm stacks for the five non-Roadmap AI tools.
export const aiProjects: Project[] = [
  {
    id: 'autoprofi', name: 'AutoProfi Voice Agent', kind: 'primary',
    type: { ru: 'Голосовой AI-агент', en: 'Voice AI agent' },
    description: {
      ru: 'Помогает автоматизировать типовой разговор с клиентом: уточняет запрос, собирает нужные данные и проводит человека до оформления записи.',
      en: 'Automates a typical customer conversation: clarifies the request, collects the necessary details, and guides the customer through the booking process.',
    },
    cover: autoCover, video: autoVideo, duration: '2:20', portrait: true,
    status: { ru: 'Рабочий прототип · бизнес-сценарий', en: 'Working prototype · business use case' },
    feature: {
      heading: { ru: 'Голосовой AI-агент для записи в автосервис', en: 'AI voice agent for auto service bookings' },
      role: {
        ru: 'Продумала, как агент должен общаться с клиентом, какие данные собирать и как доводить разговор до записи, затем собрала рабочую демонстрационную версию.',
        en: 'I designed how the agent communicates with customers, what information it collects, and how the conversation leads to a booking, then built a working demo version.',
      },
      result: {
        ru: 'В демо агент самостоятельно проходит сценарий разговора и завершает его созданием записи.',
        en: 'In the demo, the agent completes the conversation flow and finishes by creating a booking.',
      },
      status: { ru: 'Рабочий демонстрационный прототип', en: 'Working demo prototype' },
      meta: { ru: 'Voice AI · React / Vite · Node.js · SQLite', en: 'Voice AI · React / Vite · Node.js · SQLite' },
      mainImage: autoConversation, resultImage: autoBooking,
      mainLabel: { ru: 'Агент отвечает клиенту', en: 'The agent responds to the customer' },
      resultLabel: { ru: 'Запись создана', en: 'Booking created' },
    },
  },
  {
    id: 'roadmap', name: 'AI Roadmap Generator', kind: 'primary',
    type: { ru: 'Голосовое интервью → план действий', en: 'Voice interview → action plan' },
    description: {
      ru: 'Помогает человеку разобраться с идеей или задачей: задаёт вопросы, собирает ответы голосом и превращает их в структурированный план дальнейших действий.',
      en: 'Helps a person structure an idea or task through a short voice interview and turns the answers into a clear action plan.',
    },
    // Stack shown on the existing portfolio demo cover and in the original data.
    tags: ['Next.js', 'Cloudflare Workers', 'NanoGPT', 'Groq Whisper'],
    cover: roadmapCover, video: roadmapVideo, duration: '1:30',
    feature: {
      heading: { ru: 'Голосовое интервью превращается в пошаговый план', en: 'A voice interview becomes a step-by-step plan' },
      role: {
        ru: 'Продумала структуру интервью, логику вопросов и то, как ответы превращаются в последовательный план действий, затем собрала рабочий прототип.',
        en: 'I designed the interview structure, question flow, and the logic for turning answers into a sequence of actionable steps, then built a working prototype.',
      },
      result: {
        ru: 'Пользователь проходит три этапа голосового интервью и получает персонализированный roadmap с конкретными следующими шагами.',
        en: 'The user completes three stages of a voice interview and receives a personalized roadmap with clear next steps.',
      },
      status: { ru: 'Рабочий демонстрационный прототип', en: 'Working demo prototype' },
      meta: { ru: 'Next.js · Cloudflare Workers · Groq Whisper · AI', en: 'Next.js · Cloudflare Workers · Groq Whisper · AI' },
      mainImage: roadmapInterview, resultImage: roadmapPlan,
      mainLabel: { ru: 'Голосовое интервью', en: 'Voice interview' },
      resultLabel: { ru: 'Готовый план', en: 'Completed roadmap' },
      credit: {
        prefix: { ru: 'Проект создан в рамках курса ', en: 'Created as part of the ' },
        linkLabel: {
          ru: 'Profile School «Разработка с AI: автоматизация и продуктивность»',
          en: 'Profile School course “Developing with AI: Automation and Productivity”',
        },
        suffix: { ru: '. Преподаватель — Александр Свет.', en: '. Instructor — Alexander Svet.' },
        url: 'https://www.profileschool.ru/category/ai/course_developing_with_ai_automation_and_productivity',
      },
    },
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
    summary: { ru: 'Показывает и создаёт папки Яндекс Почты по команде из Telegram.', en: 'Lists and creates Yandex Mail folders through Telegram commands.' },
  },
  {
    id: 'quote', name: 'AI Quote Assistant', kind: 'primary',
    type: { ru: 'Бизнес-инструмент', en: 'Business tool' },
    description: {
      ru: 'Помогает превратить необработанную заявку в понятную структуру: выделяет задачу и нужные услуги, находит недостающие данные, помогает рассчитать предложение и подготовить его черновик.',
      en: 'Turns an unstructured client request into a clear workflow: identifies the task and required services, finds missing information, helps calculate the estimate, and prepares a draft proposal.',
    },
    cover: quoteCover, video: quoteVideo, duration: '0:51',
    feature: {
      heading: { ru: 'От заявки клиента до черновика коммерческого предложения', en: 'From a client request to a draft proposal' },
      role: {
        ru: 'Продумала, как превратить клиентскую заявку в понятный рабочий процесс — разобрать запрос, определить нужные услуги и недостающие данные, рассчитать предложение и подготовить черновик коммерческого предложения, затем собрала рабочий прототип.',
        en: 'I designed the workflow for turning a client request into a structured process — analysing the request, identifying services and missing information, calculating the proposal, and preparing a draft commercial offer — then built a working prototype.',
      },
      result: {
        ru: 'В демо показан полный путь от исходной заявки до расчёта и подготовленного предложения.',
        en: 'The demo shows the complete flow from the original request to the estimate and prepared proposal.',
      },
      status: { ru: 'Демонстрационный прототип', en: 'Demo prototype' },
      meta: { ru: 'AI · Обработка заявок · Автоматизация предложений', en: 'AI · Request analysis · Proposal automation' },
      mainImage: quoteEstimate, resultImage: quoteProposal,
      mainLabel: { ru: 'Расчёт и проверка', en: 'Estimate and review' },
      resultLabel: { ru: 'Черновик предложения', en: 'Draft proposal' },
    },
  },
  {
    id: 'sorter', name: 'Smart Downloads Sorter', kind: 'secondary',
    type: { ru: 'Автоматизация файлов', en: 'File automation' },
    description: {
      ru: 'Наводит порядок в загрузках без ручной сортировки каждого файла. Показывает план распределения по папкам перед применением и организует файлы в понятную структуру.',
      en: 'Organizes downloads without sorting every file by hand. It previews a folder plan before applying it, turning a cluttered folder into an organized file structure.',
    },
    cover: sorterCover, video: sorterVideo, duration: '0:41',
    summary: { ru: 'Предлагает план сортировки загрузок перед применением.', en: 'Previews a plan for organizing downloads before applying it.' },
  },
  {
    id: 'page', name: 'AI Page Assistant', kind: 'secondary',
    type: { ru: 'AI-расширение для браузера', en: 'AI browser extension' },
    description: {
      ru: 'Помогает разобраться в содержимом открытой страницы. Отвечает на вопросы по её тексту прямо в боковой панели браузера и поддерживает озвучивание ответов.',
      en: 'Helps make sense of the page you are reading. Ask questions about its content in the browser sidebar and listen to answers with text-to-speech.',
    },
    cover: pageCover, video: pageVideo, duration: '0:57',
    summary: { ru: 'Отвечает на вопросы по открытой странице в боковой панели.', en: 'Answers questions about the open page in a browser sidebar.' },
  },
]

export const artEducationProjects: Project[] = [
  {
    id: 'artcloseup', name: 'ArtCloseup', kind: 'creative',
    title: { ru: 'Искусство крупным планом', en: 'ArtCloseup' },
    type: { ru: 'Авторский сайт по истории искусства', en: 'Independent art history website' },
    description: {
      ru: 'Авторский образовательный сайт по истории искусства. Статьи, презентации и интерактивные игры помогают внимательнее смотреть на произведения, замечать детали и понимать замысел художника.',
      en: 'An independent educational website about art history. Articles, presentations and interactive games encourage closer looking, attention to detail and a clearer understanding of artistic intent.',
    },
    cover: artCloseupCover,
    previewAlt: {
      ru: 'Главная страница проекта «Искусство крупным планом» с гравюрой «Большая волна в Канагаве»',
      en: 'ArtCloseup homepage featuring The Great Wave off Kanagawa',
    },
    liveUrl: 'https://radmila555-artcloseup-090d.twc1.net/',
    liveKind: 'site',
  },
  {
    id: 'art-detective', name: 'Art Detective', kind: 'creative',
    type: { ru: 'AI · искусство и образование', en: 'AI · art and education' },
    description: {
      ru: 'Творческий образовательный проект на пересечении искусства, AI и веб-технологий. Пример применения AI в художественном и учебном контексте.',
      en: 'A creative learning project combining art, AI and web technology. An exploration of AI in an artistic and educational setting.',
    },
    cover: artCover,
    liveUrl: 'https://Radmila555.github.io/art-detective/',
  },
]

// Entries without a verified liveUrl stay in the content model but are not rendered.
export const webProjects: Project[] = [
  {
    id: 'nexora', name: 'NEXORA', kind: 'web',
    type: { ru: 'Демонстрационный сайт', en: 'Demo website' },
    description: {
      ru: 'Демонстрационный сайт компьютерного сервиса с каталогом, фильтрами, калькулятором и формой заявки. В проекте также есть backend и read-only admin demo.',
      en: 'A computer service demo with a catalogue, filters, a price calculator and a request form, supported by a backend and a read-only admin demo.',
    },
    localizedTags: [
      { ru: 'Каталог', en: 'Catalogue' },
      { ru: 'Фильтры', en: 'Filters' },
      { ru: 'Калькулятор', en: 'Calculator' },
      { ru: 'Backend', en: 'Backend' },
    ],
    cover: nexoraPreview,
    previewAlt: {
      ru: 'Главная страница сайта компьютерного сервиса NEXORA',
      en: 'NEXORA computer service website homepage',
    },
    liveUrl: 'https://nexora-demo-3ro5.onrender.com/',
    liveKind: 'demo',
  },
  {
    id: 'norden', name: 'NORDEN HOME', kind: 'web',
    type: { ru: 'Веб-проект', en: 'Web project' },
    description: {
      ru: 'Демонстрационный full-stack сервис подбора недвижимости: каталог с картой, умный подбор, избранное, ипотечный калькулятор и админ-панель.',
      en: 'A full-stack real-estate discovery demo with a map-based catalog, smart matching, favorites, mortgage calculator, and admin dashboard.',
    },
    localizedTags: [
      { ru: 'React', en: 'React' },
      { ru: 'Express', en: 'Express' },
      { ru: 'SQLite', en: 'SQLite' },
      { ru: 'Leaflet', en: 'Leaflet' },
    ],
    cover: nordenPreview,
    previewAlt: {
      ru: 'Главная страница демонстрационного сервиса недвижимости NORDEN HOME',
      en: 'NORDEN HOME real-estate demo homepage',
    },
    liveUrl: 'https://norden-home.onrender.com/',
    liveKind: 'demo',
  },
  {
    id: 'mira', name: 'MIRA — студия массажа и восстановления', kind: 'web',
    type: { ru: 'Веб-проект', en: 'Web project' },
    description: {
      ru: 'Адаптивный demo-сайт студии массажа с пошаговой онлайн-записью, Express API, SQLite и админ-панелью.',
      en: 'Responsive massage studio demo with step-by-step booking, an Express API, SQLite, and an admin dashboard.',
    },
    localizedTags: [
      { ru: 'JavaScript', en: 'JavaScript' },
      { ru: 'Express', en: 'Express' },
      { ru: 'SQLite', en: 'SQLite' },
      { ru: 'Responsive Design', en: 'Responsive Design' },
    ],
    cover: miraPreview,
    previewAlt: {
      ru: 'Главная страница студии массажа и восстановления MIRA',
      en: 'MIRA massage and recovery studio homepage',
    },
    liveUrl: 'https://mira-smx2.onrender.com/',
    liveKind: 'demo',
  },
  {
    id: 'english-tutor', name: 'English Tutor', kind: 'web',
    type: { ru: 'Веб-проект', en: 'Web project' },
  },
  {
    id: 'goal-pilot', name: 'Goal Pilot', kind: 'web',
    type: { ru: 'Веб-проект', en: 'Web project' },
  },
]
