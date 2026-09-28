import './styles.css'
import { aiProjects, creativeProjects, type Language, type Project } from './projects'

let currentLanguage: Language = 'ru'
let stopHeroEntrance = (): void => {}
type TextSize = 'normal' | 'large'

const textSizeStorageKey = 'portfolio-text-size'
const readTextSize = (): TextSize => {
  try {
    return window.localStorage.getItem(textSizeStorageKey) === 'large' ? 'large' : 'normal'
  } catch {
    return 'normal'
  }
}

let currentTextSize: TextSize = readTextSize()
document.documentElement.dataset.textSize = currentTextSize

const updateTextSizeControls = (): void => {
  const isLarge = currentTextSize === 'large'
  const stateLabel = currentLanguage === 'ru'
    ? `Крупнее текст: ${isLarge ? 'включено' : 'выключено'}`
    : `Larger text: ${isLarge ? 'on' : 'off'}`

  document.querySelectorAll<HTMLButtonElement>('[data-text-size-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(isLarge))
    button.setAttribute('aria-label', stateLabel)
    button.querySelectorAll<HTMLElement>('.text-size-state span').forEach((option, index) => {
      option.classList.toggle('active', isLarge ? index === 1 : index === 0)
    })
  })
}

const setTextSize = (textSize: TextSize): void => {
  currentTextSize = textSize
  document.documentElement.dataset.textSize = textSize
  try {
    window.localStorage.setItem(textSizeStorageKey, textSize)
  } catch {
    // The visual setting still works when storage is unavailable.
  }
  updateTextSizeControls()
}

const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    }
    return entities[character]
  })

const demoButton = (project: Project): string => {
  const label = currentLanguage === 'ru' ? 'Смотреть демо' : 'Watch demo'
  return `<button class="button button-quiet demo-button" type="button" data-demo="${project.id}" aria-haspopup="dialog" aria-controls="demo-dialog" aria-label="${label} — ${escapeHtml(project.name)}"><span aria-hidden="true">▷</span>${label}</button>`
}

const featuredCase = (project: Project, index: number): string => {
  const feature = project.feature!
  const roleLabel = currentLanguage === 'ru' ? 'Моя роль' : 'My role'
  const resultLabel = currentLanguage === 'ru' ? 'Результат' : 'Result'
  const credit = feature.credit
    ? `<p class="featured-credit">${escapeHtml(feature.credit.prefix[currentLanguage])}<a href="${escapeHtml(feature.credit.url)}" target="_blank" rel="noreferrer">${escapeHtml(feature.credit.linkLabel[currentLanguage])}</a>${escapeHtml(feature.credit.suffix[currentLanguage])}</p>`
    : ''
  return `
    <article class="featured-case ${index === 1 ? 'featured-case-reverse' : ''} featured-case-${project.id}" id="${project.id}">
      <div class="featured-intro">
        <p class="featured-index"><span>0${index + 1} / 03</span>${escapeHtml(project.name)}</p>
        <h4>${escapeHtml(feature.heading[currentLanguage])}</h4>
        <p class="featured-description">${escapeHtml(project.description?.[currentLanguage] ?? '')}</p>
      </div>
      <figure class="featured-visual">
        <div class="featured-main-frame">
          <img src="${escapeHtml(feature.mainImage)}" alt="${escapeHtml(feature.mainLabel[currentLanguage])}" loading="lazy" decoding="async" width="${project.id === 'autoprofi' ? 570 : 1280}" height="${project.id === 'autoprofi' ? 860 : 720}" />
          <span class="featured-frame-label" aria-hidden="true">${escapeHtml(feature.mainLabel[currentLanguage])}</span>
        </div>
        <div class="featured-result-frame">
          <img src="${escapeHtml(feature.resultImage)}" alt="${escapeHtml(feature.resultLabel[currentLanguage])}" loading="lazy" decoding="async" width="${project.id === 'autoprofi' ? 530 : project.id === 'quote' ? 1000 : 960}" height="${project.id === 'autoprofi' ? 245 : project.id === 'quote' ? 588 : 650}" />
          <span class="featured-frame-label" aria-hidden="true">${escapeHtml(feature.resultLabel[currentLanguage])}</span>
        </div>
      </figure>
      <div class="featured-detail">
        <dl class="featured-facts">
          <div><dt>${roleLabel}</dt><dd>${escapeHtml(feature.role[currentLanguage])}</dd></div>
          <div><dt>${resultLabel}</dt><dd>${escapeHtml(feature.result[currentLanguage])}</dd></div>
        </dl>
        <div class="featured-meta">
          <span>${escapeHtml(feature.status[currentLanguage])}</span>
          <span>${escapeHtml(feature.meta[currentLanguage])}</span>
        </div>
        ${credit}
        <div class="featured-action">${demoButton(project)}<span class="demo-duration" aria-label="${currentLanguage === 'ru' ? 'Длительность видео' : 'Video duration'}">${project.duration}</span></div>
      </div>
    </article>`
}

const secondaryProject = (project: Project): string => `
  <article class="secondary-project" id="${project.id}">
    <img src="${escapeHtml(project.cover ?? '')}" alt="" loading="lazy" decoding="async" width="960" height="540" />
    <div class="secondary-project-copy">
      <h4>${escapeHtml(project.name)}</h4>
      <p>${escapeHtml(project.summary?.[currentLanguage] ?? '')}</p>
      ${demoButton(project)}
    </div>
  </article>`

const creativeProject = (project: Project): string => {
  const liveLabel = currentLanguage === 'ru' ? 'Открыть игру' : 'Open game'
  const action = project.liveUrl
    ? `<a class="button button-primary" href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`${liveLabel} — ${project.name}`)}">${liveLabel}</a>`
    : ''

  return `
    <article class="creative-project" id="${project.id}">
      <img src="${escapeHtml(project.cover ?? '')}" alt="" loading="lazy" decoding="async" width="1200" height="600" />
      <div>
        <p class="project-number">${escapeHtml(project.type[currentLanguage])}</p>
        <h4>${escapeHtml(project.name)}</h4>
        <p class="creative-description">${escapeHtml(project.description?.[currentLanguage] ?? '')}</p>
        <div class="creative-actions">${action}</div>
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
  const ordered = (ids: string[]): Project[] => ids.flatMap((id) => aiProjects.filter((project) => project.id === id))
  const featured = document.getElementById('featured-projects')
  const secondary = document.getElementById('secondary-projects')
  const creative = document.getElementById('creative-projects')
  if (featured) featured.innerHTML = ordered(['autoprofi', 'quote', 'roadmap']).map(featuredCase).join('')
  if (secondary) secondary.innerHTML = ordered(['yandex-mail', 'page', 'sorter']).map(secondaryProject).join('')
  if (creative) creative.innerHTML = creativeProjects.map(creativeProject).join('')
  applyRussianTypography()
}

const updateLanguage = (language: Language): void => {
  stopHeroEntrance()
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

  updateTextSizeControls()

  document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'ru' ? 'Radmila G. — AI-агенты, автоматизация и веб-решения. Работающие проекты и видеодемонстрации.' : 'Radmila G. — AI agents, automation and web tools. Working projects and video demos.')
  renderProjects()
  updateMenuLabel()
  activateRevealObserver()
}

const languageSwitch = document.querySelector<HTMLButtonElement>('[data-language-switch]')
languageSwitch?.addEventListener('click', () => {
  updateLanguage(currentLanguage === 'ru' ? 'en' : 'ru')
})

document.querySelectorAll<HTMLButtonElement>('[data-text-size-toggle]').forEach((button) => {
  button.addEventListener('click', () => {
    setTextSize(currentTextSize === 'large' ? 'normal' : 'large')
  })
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

const contactSection = document.getElementById('contact')
document.querySelectorAll<HTMLAnchorElement>('a[href="#contact"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (!contactSection) return
    event.preventDefault()
    contactSection.scrollIntoView({
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
      block: 'start',
    })
    if (window.location.hash !== '#contact') window.history.pushState(null, '', '#contact')
  })
})

// Run only at boot. The real heading text stays in place and readable throughout.
const startHeroEntrance = (): void => {
  if (reducedMotion.matches) return
  const copy = document.querySelector<HTMLElement>('.hero-copy')
  if (!copy) return
  const features = copy.querySelector<HTMLElement>('.hero-features')
  let fallback = 0

  const finish = (): void => {
    window.clearTimeout(fallback)
    copy.classList.remove('hero-entering')
    features?.removeEventListener('animationend', finish)
    reducedMotion.removeEventListener('change', finish)
    stopHeroEntrance = () => {}
  }
  stopHeroEntrance = finish
  fallback = window.setTimeout(finish, 1350)
  features?.addEventListener('animationend', finish, { once: true })
  reducedMotion.addEventListener('change', finish, { once: true })
  copy.classList.add('hero-entering')
}

// The scene never gates the hero text, so it starts once the page is idle.
const heroCanvas = document.querySelector<HTMLCanvasElement>('[data-hero-scene]')
if (heroCanvas) {
  const startScene = (): void => {
    void import('./hero-scene').then(({ initHeroScene }) => initHeroScene(heroCanvas))
  }
  const idle = window.requestIdleCallback
  if (typeof idle === 'function') idle(startScene, { timeout: 1200 })
  else window.setTimeout(startScene, 200)
}

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
startHeroEntrance()
updateHeader()
