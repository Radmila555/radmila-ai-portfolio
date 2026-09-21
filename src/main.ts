import './styles.css'
import { aiProjects, creativeProjects, webProjects, type Language, type Project } from './projects'

let currentLanguage: Language = 'ru'

const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    }
    return entities[character]
  })

const projectCard = (project: Project): string => {
  const label = currentLanguage === 'ru' ? 'Смотреть демо' : 'Watch demo'
  const tags = project.tags?.length
    ? `<ul class="tags" aria-label="${currentLanguage === 'ru' ? 'Технологии' : 'Technologies'}">${project.tags.map(tag => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>`
    : ''
  return `
    <article class="project-card project-card-${project.kind} reveal" id="${project.id}">
      ${project.cover ? `<div class="project-media project-media-cover ${project.portrait ? 'project-media-portrait' : ''}">
        <img src="${escapeHtml(project.cover)}" alt="" loading="lazy" decoding="async" width="${project.portrait ? 570 : 960}" height="${project.portrait ? 860 : 540}" />
        <span class="cover-shade" aria-hidden="true"></span>
      </div>` : ''}
      <div class="project-copy">
        <p class="project-number">${escapeHtml(project.type[currentLanguage])}</p>
        <h4>${escapeHtml(project.name)}</h4>
        ${project.description ? `<p class="project-description">${escapeHtml(project.description[currentLanguage])}</p>` : ''}
        ${tags}
        ${project.status ? `<p class="project-status"><span aria-hidden="true"></span>${escapeHtml(project.status[currentLanguage])}</p>` : ''}
        ${project.video ? `<div class="project-actions"><button class="button button-quiet demo-button" type="button" data-demo="${project.id}" aria-haspopup="dialog" aria-controls="demo-dialog" aria-label="${label} — ${escapeHtml(project.name)}"><span aria-hidden="true">▷</span>${label}</button><span class="demo-duration" aria-label="${currentLanguage === 'ru' ? 'Длительность видео' : 'Video duration'}">${project.duration}</span></div>` : ''}
      </div>
    </article>`
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
    ['creative-projects', creativeProjects],
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

  document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'ru' ? 'Radmila G. — AI-агенты, автоматизация и веб-решения. Работающие проекты и видеодемонстрации.' : 'Radmila G. — AI agents, automation and web tools. Working projects and video demos.')
  renderProjects()
  updateMenuLabel()
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
  updateMenuLabel()
}

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true'
  menuToggle.setAttribute('aria-expanded', String(!isOpen))
  navigation?.classList.toggle('is-open', !isOpen)
  updateMenuLabel()
})

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu))

const updateMenuLabel = (): void => {
  const isOpen = menuToggle?.getAttribute('aria-expanded') === 'true'
  const label = menuToggle?.querySelector('.sr-only')
  if (label) label.textContent = currentLanguage === 'ru'
    ? (isOpen ? 'Закрыть меню' : 'Открыть меню')
    : (isOpen ? 'Close menu' : 'Open menu')
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation?.classList.contains('is-open')) {
    closeMenu()
    menuToggle?.focus()
  }
})

// A single native dialog keeps focus inside the player and supports Escape.
// No video src exists until a visitor requests a demo.
const demoDialog = document.querySelector<HTMLDialogElement>('#demo-dialog')!
const demoPlayer = document.querySelector<HTMLVideoElement>('#demo-player')!
const demoTitle = document.querySelector<HTMLElement>('#demo-title')!
const demoSummary = document.querySelector<HTMLElement>('#demo-summary')!
const demoError = document.querySelector<HTMLElement>('#demo-error')!
const demoDownload = document.querySelector<HTMLAnchorElement>('#demo-download')!
let demoTrigger: HTMLButtonElement | null = null

document.querySelector('#projects')?.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-demo]')
  const project = aiProjects.find(item => item.id === button?.dataset.demo)
  if (!button || !project?.video) return
  demoTrigger = button
  demoTitle.textContent = project.name
  demoSummary.textContent = project.description?.[currentLanguage] ?? ''
  demoError.hidden = true
  demoPlayer.poster = project.cover ?? ''
  demoPlayer.src = project.video
  demoPlayer.setAttribute('aria-label', `${currentLanguage === 'ru' ? 'Демонстрация' : 'Demo'}: ${project.name}`)
  demoDownload.href = project.video
  demoDialog.showModal()
  document.body.classList.add('demo-open')
  // Playback follows an explicit click. If the browser blocks it, native Play remains.
  void demoPlayer.play().catch(() => { /* Native controls remain available. */ })
})

demoPlayer.addEventListener('error', () => { demoError.hidden = false })
document.querySelector('[data-close-demo]')?.addEventListener('click', () => demoDialog.close())
demoDialog.addEventListener('click', (event) => {
  if (event.target !== demoDialog) return
  const rect = demoDialog.getBoundingClientRect()
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) demoDialog.close()
})
demoDialog.addEventListener('close', () => {
  demoPlayer.pause()
  demoPlayer.removeAttribute('src')
  demoPlayer.load()
  demoDownload.removeAttribute('href')
  document.body.classList.remove('demo-open')
  demoTrigger?.focus({ preventScroll: true })
})

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
// SVG filter/shape animations need an explicit pause; CSS media rules cover transforms.
const auroraScene = document.querySelector<SVGSVGElement>('.aurora-svg')
const syncAuroraMotion = (): void => {
  if (!auroraScene) return
  if (reducedMotion.matches) {
    auroraScene.pauseAnimations()
    auroraScene.setCurrentTime(0)
  } else if (document.hidden) {
    auroraScene.pauseAnimations()
  } else {
    auroraScene.unpauseAnimations()
  }
}
syncAuroraMotion()
reducedMotion.addEventListener('change', syncAuroraMotion)
document.addEventListener('visibilitychange', syncAuroraMotion)
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

updateLanguage(currentLanguage)
updateHeader()
