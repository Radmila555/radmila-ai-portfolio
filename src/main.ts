import './styles.css'
import roadmapCoverUrl from '../Video/ai-roadmap-cover.png'
import artDetectiveCoverUrl from '../ChatGPT Image 7 сент. 2026 г., 12_32_44.png'

type Language = 'ru' | 'en'

type LocalizedText = {
  ru: string
  en: string
}

type Project = {
  name: string
  eyebrow: string
  kind: 'featured' | 'standard' | 'automation'
  description?: LocalizedText
  tags?: string[]
  cover?: string
  accent: string
  mark: string
  status?: LocalizedText
}

const aiProjects: Project[] = [
  {
    name: 'AI Roadmap Generator',
    eyebrow: 'PROJECT 01',
    kind: 'featured',
    description: {
      ru: 'Голосовой AI‑агент проводит адаптивное интервью в три раунда, распознаёт ответы и формирует персональный пошаговый план действий.',
      en: 'A voice AI agent runs a three-round adaptive interview, transcribes answers and generates a personalized action plan.',
    },
    tags: ['Next.js', 'Cloudflare', 'NanoGPT', 'Groq Whisper'],
    cover: roadmapCoverUrl,
    accent: 'cyan',
    mark: 'AI / 01',
    status: {
      ru: 'Обложка и демонстрация подготовлены',
      en: 'Cover and demo are ready',
    },
  },
  {
    name: 'Art Detective',
    eyebrow: 'PROJECT 02',
    kind: 'standard',
    cover: artDetectiveCoverUrl,
    tags: ['AI PROJECT'],
    accent: 'violet',
    mark: 'ART / AI',
    status: {
      ru: 'Описание добавим после анализа проекта',
      en: 'Details will follow after project review',
    },
  },
]

const webProjects: Project[] = [
  { name: 'PCServiceDemo Nexora', eyebrow: 'WEB 01', kind: 'standard', accent: 'blue', mark: 'NEXORA' },
  { name: 'English website', eyebrow: 'WEB 02', kind: 'standard', accent: 'cyan', mark: 'ENGLISH' },
  { name: 'NORDEN-HOME', eyebrow: 'WEB 03', kind: 'standard', accent: 'violet', mark: 'NORDEN' },
  { name: 'MIRA', eyebrow: 'WEB 04', kind: 'standard', accent: 'blue', mark: 'MIRA' },
  { name: 'artcloseup', eyebrow: 'WEB 05', kind: 'standard', accent: 'cyan', mark: 'ART / WEB' },
]

const automationProjects: Project[] = [
  { name: 'AI Page Assistant', eyebrow: 'DEMO 01', kind: 'automation', accent: 'cyan', mark: 'PAGE / AI' },
  { name: 'AI Quote Assistant', eyebrow: 'DEMO 02', kind: 'automation', accent: 'violet', mark: 'QUOTE / AI' },
  { name: 'Smart Downloads Sorter', eyebrow: 'DEMO 03', kind: 'automation', accent: 'blue', mark: 'SORT / FILES' },
  { name: 'Yandex Mail Agent', eyebrow: 'DEMO 04', kind: 'automation', accent: 'cyan', mark: 'MAIL / AI' },
]

let currentLanguage: Language = 'ru'

const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }
    return entities[character]
  })

const projectVisual = (project: Project): string => {
  if (project.cover) {
    return `
      <div class="project-media project-media-cover">
        <img src="${project.cover}" alt="${escapeHtml(project.name)}" />
        <span class="cover-shade" aria-hidden="true"></span>
      </div>
    `
  }

  return `
    <div class="project-media project-media-abstract accent-${project.accent}" aria-hidden="true">
      <span class="project-mark">${escapeHtml(project.mark)}</span>
      <span class="project-stroke project-stroke-one"></span>
      <span class="project-stroke project-stroke-two"></span>
      <span class="project-dot"></span>
    </div>
  `
}

const projectCard = (project: Project): string => {
  const description = project.description?.[currentLanguage]
  const defaultStatus = currentLanguage === 'ru' ? 'Содержание уточним после анализа проекта' : 'Details will follow after project review'
  const status = project.status?.[currentLanguage] ?? defaultStatus
  const tags = project.tags?.length
    ? `<ul class="tags" aria-label="${currentLanguage === 'ru' ? 'Технологии' : 'Technologies'}">${project.tags
        .map((tag) => `<li>${escapeHtml(tag)}</li>`)
        .join('')}</ul>`
    : ''

  return `
    <article class="project-card project-card-${project.kind} reveal">
      ${projectVisual(project)}
      <div class="project-copy">
        <p class="project-number">${escapeHtml(project.eyebrow)}</p>
        <h4>${escapeHtml(project.name)}</h4>
        ${description ? `<p class="project-description">${escapeHtml(description)}</p>` : ''}
        ${tags}
        <p class="project-status"><span aria-hidden="true"></span>${escapeHtml(status)}</p>
      </div>
    </article>
  `
}

// Glue short Russian words to the following word, including generated cards.
// Walk text nodes only: attributes, URLs, project data and English stay intact.
const applyRussianTypography = (): void => {
  if (currentLanguage !== 'ru') return
  const shortWords = /(?<![\p{L}\p{N}])(?:а|и|но|да|в|во|к|ко|с|со|у|о|об|обо|от|ото|до|за|из|изо|на|по|под|подо|над|надо|при|про|без|безо|для|не|ни|я)[ \t\r\n]+(?=\S)/giu
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest('script, style, code, pre, [aria-hidden="true"]')) continue
    node.textContent = (node.textContent ?? '').replace(shortWords, (match) => `${match.trimEnd()}\u00a0`)
  }
}

const renderProjects = (): void => {
  const groups: Array<[string, Project[]]> = [
    ['ai-projects', aiProjects],
    ['web-projects', webProjects],
    ['automation-projects', automationProjects],
  ]

  groups.forEach(([id, projects]) => {
    const container = document.getElementById(id)
    if (container) container.innerHTML = projects.map(projectCard).join('')
  })
  applyRussianTypography()
}

const updateLanguage = (language: Language): void => {
  currentLanguage = language
  document.documentElement.lang = language

  document.querySelectorAll<HTMLElement>('[data-ru][data-en]').forEach((element) => {
    element.textContent = element.dataset[language] ?? ''
  })

  document.querySelectorAll<HTMLElement>('[data-aria-ru][data-aria-en]').forEach((element) => {
    element.setAttribute('aria-label', element.dataset[`aria${language === 'ru' ? 'Ru' : 'En'}`] ?? '')
  })

  document.querySelectorAll<HTMLSpanElement>('[data-language-switch] span').forEach((label) => {
    label.classList.toggle('active', label.textContent?.toLowerCase() === language)
  })

  renderProjects()
  activateRevealObserver()
}

const languageSwitch = document.querySelector<HTMLButtonElement>('[data-language-switch]')
languageSwitch?.addEventListener('click', () => {
  updateLanguage(currentLanguage === 'ru' ? 'en' : 'ru')
})

const menuToggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]')
const navigation = document.querySelector<HTMLElement>('[data-nav]')

const closeMenu = (): void => {
  menuToggle?.setAttribute('aria-expanded', 'false')
  navigation?.classList.remove('is-open')
}

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true'
  menuToggle.setAttribute('aria-expanded', String(!isOpen))
  navigation?.classList.toggle('is-open', !isOpen)
})

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu))

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
let revealObserver: IntersectionObserver | undefined

function activateRevealObserver(): void {
  revealObserver?.disconnect()
  const items = document.querySelectorAll<HTMLElement>('.reveal')

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'))
    return
  }

  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  )

  items.forEach((item) => revealObserver?.observe(item))
}

const header = document.querySelector<HTMLElement>('[data-header]')
const updateHeader = (): void => {
  header?.classList.toggle('is-scrolled', window.scrollY > 18)
}

window.addEventListener('scroll', updateHeader, { passive: true })
window.addEventListener('resize', () => {
  if (window.innerWidth > 860) closeMenu()
})

const currentYear = document.querySelector<HTMLElement>('[data-current-year]')
if (currentYear) currentYear.textContent = String(new Date().getFullYear())

renderProjects()
activateRevealObserver()
updateHeader()
