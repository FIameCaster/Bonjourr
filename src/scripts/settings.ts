import { Sync } from './types/sync'

import storage from './storage'
import clock from './features/clock'
import notes from './features/notes'
import quotes from './features/quotes'
import weather from './features/weather'
import searchbar from './features/searchbar'
import customFont from './features/fonts'
import quickLinks from './features/links'
import linksImport from './features/linksImport'
import hideElements from './features/hide'
import moveElements from './features/move'
import unsplashBackgrounds from './features/unsplash'
import localBackgrounds from './features/localbackgrounds'

import langList from './langs'
import throttle from './utils/throttle'
import debounce from './utils/debounce'
import filterImports from './utils/filterImports'
import stringifyOrder from './utils/stringifyOrder'
import { traduction, tradThis, toggleTraduction } from './utils/translations'

import {
	testOS,
	mobilecheck,
	syncDefaults,
	inputThrottle,
	closeEditLink,
	stringMaxSize,
	detectPlatform,
	turnRefreshButton,
	handleGeolOption,
} from './utils'

import {
	toggleWidgetsDisplay,
	backgroundFilter,
	customCss,
	darkmode,
	favicon,
	tabTitle,
	textShadow,
	pageControl,
} from './index'
import parse from './utils/JSONparse'

type Langs = keyof typeof langList

function initParams(data: Sync, settingsDom: HTMLElement) {
	//
	if (settingsDom == null) {
		return
	}

	const paramId = (str: string) => settingsDom.querySelector('#' + str) as HTMLInputElement
	const paramClasses = (str: string) => settingsDom.querySelectorAll('.' + str)!

	const initCheckbox = (id: string, cat: boolean) => {
		;(paramId(id) as HTMLInputElement).checked = cat
	}

	const initInput = (id: string, val: string | number) => {
		const input = paramId(id) as HTMLInputElement
		input.value = typeof val === 'string' ? val : val.toString()
	}

	const userQuotes = !data.quotes?.userlist?.[0] ? undefined : data.quotes?.userlist

	initInput('i_blur', data.background_blur ?? 15)
	initInput('i_bright', data.background_bright ?? 0.8)
	initInput('cssEditor', data.css || '')
	initInput('i_row', data.linksrow || 8)
	initInput('i_linkstyle', data.linkstyle || 'default')
	initInput('i_type', data.background_type || 'unsplash')
	initInput('i_freq', data.unsplash?.every)
	initInput('i_dark', data.dark || 'system')
	initInput('i_favicon', data.favicon ?? '')
	initInput('i_tabtitle', data.tabtitle ?? '')
	initInput('i_pagewidth', data.pagewidth || 1600)
	initInput('i_pagegap', data.pagegap ?? 1)
	initInput('i_greeting', data.greeting ?? '')
	initInput('i_textshadow', data.textShadow ?? 0.2)
	initInput('i_noteswidth', data.notes?.width || 50)
	initInput('i_notesopacity', data.notes?.opacity.toString() || 0.1)
	initInput('i_notesalign', data.notes?.align || 'left')
	initInput('i_sbengine', data.searchbar?.engine || 'google')
	initInput('i_sbplaceholder', data.searchbar?.placeholder || '')
	initInput('i_sbopacity', data.searchbar?.opacity ?? 0.1)
	initInput('i_sbrequest', data.searchbar?.request || '')
	initInput('i_qtfreq', data.quotes?.frequency || 'day')
	initInput('i_qttype', data.quotes?.type || 'classic')
	initInput('i_qtlist', JSON.stringify(userQuotes) ?? '')
	initInput('i_clockface', data.clock?.face || 'none')
	initInput('i_clockstyle', data.clock?.style || 'round')
	initInput('i_timezone', data.clock?.timezone || 'auto')
	initInput('i_collection', data.unsplash?.collection ?? '')
	initInput('i_ccode', data.weather?.ccode || 'US')
	initInput('i_forecast', data.weather?.forecast || 'auto')
	initInput('i_temp', data.weather?.temperature || 'actual')
	initInput('i_moreinfo', data.weather?.moreinfo || 'none')
	initInput('i_provider', data.weather?.provider ?? '')
	initInput('i_customfont', data.font?.family ?? '')
	initInput('i_weight', data.font?.weight || '300')
	initInput('i_size', data.font?.size || (mobilecheck() ? 11 : 14))

	initCheckbox('i_showall', data.showall)
	initCheckbox('i_settingshide', data.hide?.settingsicon ?? false)
	initCheckbox('i_quicklinks', data.quicklinks)
	initCheckbox('i_linknewtab', data.linknewtab)
	initCheckbox('i_time', data.time)
	initCheckbox('i_usdate', data.usdate)
	initCheckbox('i_main', data.main)
	initCheckbox('i_geol', typeof data.weather?.location !== 'boolean')
	initCheckbox('i_units', data.weather?.unit === 'imperial' ?? false)
	initCheckbox('i_greethide', !data.hide?.greetings ?? true)
	initCheckbox('i_notes', data.notes?.on ?? false)
	initCheckbox('i_sb', data.searchbar?.on ?? false)
	initCheckbox('i_quotes', data.quotes?.on ?? false)
	initCheckbox('i_ampm', data.clock?.ampm ?? false)
	initCheckbox('i_sbnewtab', data.searchbar?.newtab ?? false)
	initCheckbox('i_qtauthor', data.quotes?.author ?? false)
	initCheckbox('i_seconds', data.clock?.seconds ?? false)
	initCheckbox('i_analog', data.clock?.analog ?? false)

	// Input translation
	translatePlaceholders(settingsDom)

	// Change edit tips on mobile
	if (mobilecheck()) {
		settingsDom.querySelector('.tooltiptext .instructions')!.textContent = tradThis(
			`Edit your Quick Links by long-pressing the icon.`
		)
	}

	// inserts languages in select
	const i_lang = paramId('i_lang')
	Object.entries(langList).forEach(([code, title]) => {
		let option = document.createElement('option')
		option.value = code
		option.text = title
		i_lang.appendChild(option)
	})

	initInput('i_lang', data.lang || 'en') // must be init after children appening

	// Activate changelog
	if (localStorage.hasUpdated === 'true') {
		changelogControl(settingsDom)

		// to remove after 1.17.0 update
		const movemoveddom = settingsDom.querySelector<HTMLElement>('#move-option-moved')
		const movemovedbtn = settingsDom.querySelector<HTMLElement>('#move-option-moved button')

		movemoveddom?.setAttribute('style', 'display: block')
		movemovedbtn?.addEventListener('click', () => {
			movemoveddom?.setAttribute('style', 'display: none')
			localStorage.removeItem('hasUpdated')
		})
	}

	// No bookmarks import on safari || online
	if (detectPlatform() === 'safari' || detectPlatform() === 'online') {
		paramId('b_importbookmarks').setAttribute('style', 'display: none')
	}

	// Activate feature options
	paramId('time_options')?.classList.toggle('shown', data.time)
	paramId('main_options')?.classList.toggle('shown', data.main)
	paramId('weather_provider')?.classList.toggle('shown', data.weather?.moreinfo === 'custom')
	paramId('quicklinks_options')?.classList.toggle('shown', data.quicklinks)
	paramId('notes_options')?.classList.toggle('shown', data.notes?.on || false)
	paramId('searchbar_options')?.classList.toggle('shown', data.searchbar?.on)
	paramId('searchbar_request')?.classList.toggle('shown', data.searchbar?.engine === 'custom')
	paramId('quotes_options')?.classList.toggle('shown', data.quotes?.on)

	// Page layout
	settingsDom.querySelectorAll<HTMLButtonElement>('#grid-layout button').forEach((b) => {
		const selectedLayout = b.dataset.layout === (data.move?.selection || 'single')
		b?.classList.toggle('selected', selectedLayout)
	})

	// Disables double and triple layouts on mobile
	if (window.innerWidth < 600 && 'ontouchstart' in window) {
		settingsDom.querySelector('#grid-layout button[data-layout="double"]')?.setAttribute('disabled', '')
		settingsDom.querySelector('#grid-layout button[data-layout="triple"]')?.setAttribute('disabled', '')
	}

	// Time & main hide elems
	;(function initHideInputs() {
		const { clock, date, weatherdesc, weathericon } = data.hide || {}
		let time = !clock && !date ? 'all' : clock ? 'clock' : 'date'
		let weather = weatherdesc && weathericon ? 'disabled' : weatherdesc ? 'desc' : weathericon ? 'icon' : 'all'
		initInput('i_timehide', time)
		initInput('i_weatherhide', weather)
	})()

	// Custom Fonts
	customFont(data.font, { initsettings: settingsDom })

	// Backgrounds options init
	paramId('local_options')?.classList.toggle('shown', data.background_type === 'local')
	paramId('unsplash_options')?.classList.toggle('shown', data.background_type === 'unsplash')

	if (data.background_type === 'local') {
		localBackgrounds({ thumbnail: settingsDom })
	}

	// Update thumbnails grid max-height by watching changes
	const fileContainer = settingsDom.querySelector<HTMLElement>('#fileContainer')
	const optionsDom = settingsDom.querySelector<HTMLElement>('#local_options')

	if (fileContainer) {
		new MutationObserver(() => {
			const thumbsHeight = fileContainer?.offsetHeight ?? 0
			optionsDom?.style.setProperty('--thumbnails-grid-height', thumbsHeight + 'px')
		}).observe(fileContainer, { childList: true })
	}

	// weather settings
	handleGeolOption(data.weather, settingsDom)

	// CSS height control
	if (data.cssHeight) {
		paramId('cssEditor').setAttribute('style', 'height: ' + data.cssHeight + 'px')
	}

	// Quotes option display
	paramId('quotes_options')?.classList.toggle('shown', data.quotes?.on)
	paramId('quotes_userlist')?.classList.toggle('shown', data.quotes?.type === 'user')

	updateExportJSON(settingsDom)

	//
	//
	// Events
	//
	//

	// Pressing "Enter" removes focus from input to indicate change
	const enterBlurs = (elem: HTMLInputElement) => {
		elem.onkeyup = (e: KeyboardEvent) => {
			e.key === 'Enter' ? (e.target as HTMLElement).blur() : ''
		}
	}

	enterBlurs(paramId('i_favicon'))
	enterBlurs(paramId('i_tabtitle'))
	enterBlurs(paramId('i_greeting'))
	enterBlurs(paramId('i_sbplaceholder'))

	//general

	paramClasses('uploadContainer').forEach(function (uploadContainer: Element) {
		const toggleDrag = () => uploadContainer.classList.toggle('dragover')
		const input = uploadContainer.querySelector('input[type="file"')

		input?.addEventListener('dragenter', toggleDrag)
		input?.addEventListener('dragleave', toggleDrag)
		input?.addEventListener('drop', toggleDrag)
	})

	// Change edit tips on mobile
	if (mobilecheck()) {
		const instr = settingsDom.querySelector('.tooltiptext .instructions')
		if (instr) instr.textContent = tradThis(`Edit your Quick Links by long-pressing the icon.`)
	}

	settingsDom.querySelectorAll('.tooltip').forEach((elem: Element) => {
		elem.addEventListener('click', function () {
			const cl = [...elem.classList].filter((c) => c.startsWith('tt'))[0] // get tt class
			settingsDom.querySelector('.tooltiptext.' + cl)?.classList.toggle('shown') // toggle tt text
		})
	})

	// Reduces opacity to better see interface appearance changes
	if (mobilecheck()) {
		const touchHandler = (start: boolean) => (settingsDom.style.opacity = start ? '0.2' : '1')
		const rangeInputs = settingsDom.querySelectorAll("input[type='range'")

		rangeInputs.forEach((input: Element) => {
			input.addEventListener('touchstart', () => touchHandler(true), { passive: true })
			input.addEventListener('touchend', () => touchHandler(false), { passive: true })
		})
	}

	//
	// General

	paramId('i_showall').addEventListener('change', function () {
		showall(this.checked, true)
	})

	paramId('i_lang').addEventListener('change', function () {
		switchLangs(this.value as Langs)
	})

	paramId('i_favicon').addEventListener('input', function (this: HTMLInputElement) {
		favicon(this.value, true)
	})

	paramId('i_tabtitle').addEventListener('input', function () {
		tabTitle(this.value, true)
	})

	paramId('i_dark').addEventListener('change', function () {
		darkmode(this.value as 'auto' | 'system' | 'enable' | 'disable', true)
	})

	paramId('b_editmove').addEventListener('click', function () {
		moveElements(null, { toggle: true })
	})

	paramId('b_resetlayout').addEventListener('click', function () {
		moveElements(null, { reset: true })
	})

	paramId('grid-layout')
		.querySelectorAll<HTMLButtonElement>('button')
		.forEach((btn) => {
			btn.addEventListener('click', () => {
				moveElements(null, { layout: btn.dataset.layout || '' })
			})
		})

	paramId('i_settingshide').addEventListener('change', function () {
		hideElements({ settingsicon: this.checked }, { isEvent: true })
	})

	paramId('i_pagewidth').addEventListener('input', function () {
		pageControl({ width: parseInt(this.value) }, true)
	})

	paramId('i_pagegap').addEventListener('input', function () {
		pageControl({ gap: parseFloat(this.value) }, true)
	})

	paramId('i_pagewidth').addEventListener('touchstart', () => moveElements(null, { overlay: true }), { passive: true })
	paramId('i_pagewidth').addEventListener('mousedown', () => moveElements(null, { overlay: true }))
	paramId('i_pagewidth').addEventListener('touchend', () => moveElements(null, { overlay: false }))
	paramId('i_pagewidth').addEventListener('mouseup', () => moveElements(null, { overlay: false }))

	// TODO: To do or not to do ?
	// paramId('i_pagegap').addEventListener('touchstart', () => moveElements(null, { overlay: true }), { passive: true })
	// paramId('i_pagegap').addEventListener('mousedown', () => moveElements(null, { overlay: true }))
	// paramId('i_pagegap').addEventListener('touchend', () => moveElements(null, { overlay: false }))
	// paramId('i_pagegap').addEventListener('mouseup', () => moveElements(null, { overlay: false }))

	//
	// Quick links

	paramId('i_quicklinks').addEventListener('click', function (this: HTMLInputElement) {
		toggleWidgetsDisplay({ quicklinks: this.checked }, true)
	})

	const submitLinkFunc = throttle(() => quickLinks(null, { add: true }), 1200)

	paramId('i_title').onkeyup = (e: KeyboardEvent) => {
		if (e.code === 'Enter') {
			submitLinkFunc()
		}
	}

	paramId('i_url').onkeyup = (e: KeyboardEvent) => {
		if (e.code === 'Enter') {
			submitLinkFunc()
		}
	}

	paramId('submitlink').addEventListener('click', (e) => {
		submitLinkFunc()
		inputThrottle(e.target as HTMLInputElement, 1200)
	})

	paramId('i_linknewtab').onchange = (e) => {
		const input = e.currentTarget as HTMLInputElement
		quickLinks(null, { newtab: input.checked })
	}

	paramId('i_linkstyle').onchange = (e) => {
		const input = e.currentTarget as HTMLInputElement
		quickLinks(null, { style: input.value })
	}

	paramId('i_row').oninput = function (e: Event) {
		const input = e.currentTarget as HTMLInputElement
		quickLinks(null, { row: input.value })
	}

	paramId('b_importbookmarks').onclick = linksImport

	//
	// Backgrounds

	paramId('i_type').addEventListener('change', function (this: HTMLInputElement) {
		selectBackgroundType(this.value)
	})

	paramId('i_freq').addEventListener('change', function (this: HTMLInputElement) {
		const i_type = paramId('i_type') as HTMLInputElement
		const isLocalBg = i_type.value === 'local'

		if (isLocalBg) {
			localBackgrounds({ freq: this.value })
		} else {
			unsplashBackgrounds(null, { every: this.value })
		}
	})

	paramId('i_refresh').addEventListener('click', function (this: HTMLInputElement) {
		const i_type = paramId('i_type') as HTMLInputElement

		if (this.children[0]) {
			const arrow = this.children[0] as HTMLSpanElement
			const isLocalBg = i_type.value === 'local'

			if (isLocalBg) {
				localBackgrounds({ refresh: arrow })
			} else {
				unsplashBackgrounds(null, { refresh: arrow })
			}
		}

		inputThrottle(this)
	})

	paramId('i_collection').addEventListener('change', function (this: HTMLInputElement) {
		unsplashBackgrounds(null, { collection: stringMaxSize(this.value, 256) })
		this.blur()
	})

	//
	// Custom backgrounds

	paramId('i_bgfile').addEventListener('change', function (this: HTMLInputElement) {
		localBackgrounds({ newfile: this.files })
	})

	paramId('i_blur').addEventListener('input', function (this: HTMLInputElement) {
		backgroundFilter({ blur: parseFloat(this.value), isEvent: true })
	})

	paramId('i_bright').addEventListener('input', function (this: HTMLInputElement) {
		backgroundFilter({ brightness: parseFloat(this.value), isEvent: true })
	})

	//
	// Time and date

	paramId('i_time').addEventListener('change', function (this: HTMLInputElement) {
		toggleWidgetsDisplay({ time: this.checked }, true)
	})

	paramId('i_analog').addEventListener('change', function (this: HTMLInputElement) {
		clock(null, { analog: this.checked })
	})

	paramId('i_seconds').addEventListener('change', function (this: HTMLInputElement) {
		clock(null, { seconds: this.checked })
	})

	paramId('i_clockface').addEventListener('change', function (this: HTMLInputElement) {
		clock(null, { face: this.value })
	})

	paramId('i_clockstyle').addEventListener('change', function (this: HTMLInputElement) {
		clock(null, { style: this.value })
	})

	paramId('i_ampm').addEventListener('change', function (this: HTMLInputElement) {
		clock(null, { ampm: this.checked })
	})

	paramId('i_timezone').addEventListener('change', function (this: HTMLInputElement) {
		clock(null, { timezone: this.value })
	})

	paramId('i_usdate').addEventListener('change', function (this: HTMLInputElement) {
		clock(null, { usdate: this.checked })
	})

	paramId('i_timehide').addEventListener('change', function (this: HTMLInputElement) {
		hideElements({ clock: this.value === 'clock', date: this.value === 'date' }, { isEvent: true })
	})

	//
	// Weather
	paramId('i_main').addEventListener('change', function (this: HTMLInputElement) {
		toggleWidgetsDisplay({ main: this.checked }, true)
	})

	paramId('i_city').addEventListener('change', function (this: HTMLInputElement) {
		weather(null, { city: this.value })
	})

	paramId('i_geol').addEventListener('change', function (this: HTMLInputElement) {
		inputThrottle(this, 1200)
		weather(null, { geol: this.checked })
	})

	paramId('i_units').addEventListener('change', function (this: HTMLInputElement) {
		inputThrottle(this, 1200)
		weather(null, { units: this.checked })
	})

	paramId('i_forecast').addEventListener('change', function (this: HTMLInputElement) {
		weather(null, { forecast: this.value })
	})

	paramId('i_temp').addEventListener('change', function (this: HTMLInputElement) {
		weather(null, { temp: this.value })
	})

	paramId('i_moreinfo').addEventListener('change', function (this: HTMLInputElement) {
		weather(null, { moreinfo: this.value })
	})

	paramId('i_provider').addEventListener('change', function (this: HTMLInputElement) {
		weather(null, { provider: this.value })
		this.blur()
	})

	paramId('i_weatherhide').addEventListener('change', function (this: HTMLInputElement) {
		let weatherdesc = this.value === 'disabled' || this.value === 'desc'
		let weathericon = this.value === 'disabled' || this.value === 'icon'
		hideElements({ weatherdesc, weathericon }, { isEvent: true })
		weather(null, { unhide: true })
	})

	paramId('i_greethide').addEventListener('change', function () {
		hideElements({ greetings: !this.checked }, { isEvent: true })
	})

	paramId('i_greeting').addEventListener('keyup', function () {
		clock(null, { greeting: stringMaxSize(this.value, 32) })
	})

	//
	// Notes

	paramId('i_notes').addEventListener('click', function (this: HTMLInputElement) {
		toggleWidgetsDisplay({ notes: this.checked }, true)
	})

	paramId('i_notesalign').addEventListener('change', function (this: HTMLInputElement) {
		notes(null, { is: 'align', value: this.value })
	})

	paramId('i_noteswidth').addEventListener('input', function (this: HTMLInputElement) {
		notes(null, { is: 'width', value: this.value })
	})

	paramId('i_notesopacity').addEventListener('input', function (this: HTMLInputElement) {
		notes(null, { is: 'opacity', value: this.value })
	})

	//
	// Searchbar

	paramId('i_sb').addEventListener('click', function (this: HTMLInputElement) {
		toggleWidgetsDisplay({ searchbar: this.checked }, true)
	})

	paramId('i_sbengine').addEventListener('change', function (this: HTMLInputElement) {
		searchbar(null, { engine: this.value })
	})

	paramId('i_sbopacity').addEventListener('input', function (this: HTMLInputElement) {
		searchbar(null, { opacity: this.value })
	})

	paramId('i_sbrequest').addEventListener('change', function (this: HTMLInputElement) {
		searchbar(null, { request: this })
	})

	paramId('i_sbnewtab').addEventListener('change', function (this: HTMLInputElement) {
		searchbar(null, { newtab: this.checked })
	})

	paramId('i_sbplaceholder').addEventListener('keyup', function () {
		searchbar(null, { placeholder: this.value })
	})

	//
	// Quotes

	paramId('i_quotes').addEventListener('click', function (this: HTMLInputElement) {
		toggleWidgetsDisplay({ quotes: this.checked }, true)
	})

	paramId('i_qtfreq').addEventListener('change', function () {
		quotes(null, { frequency: this.value })
	})

	paramId('i_qttype').addEventListener('change', function () {
		quotes(null, { type: this.value })
	})

	paramId('i_qtrefresh').addEventListener('click', function () {
		inputThrottle(this)
		turnRefreshButton(this.children[0] as HTMLSpanElement, true)
		quotes(null, { refresh: true })
	})

	paramId('i_qtauthor').addEventListener('change', function () {
		quotes(null, { author: this.checked })
	})

	paramId('i_qtlist').addEventListener('change', function () {
		quotes(null, { userlist: this.value })
	})

	//
	// Custom fonts

	// Fetches font list only on focus (if font family is default)
	paramId('i_customfont').addEventListener('focus', function () {
		if (settingsDom.querySelector('#dl_fontfamily')?.childElementCount === 0) {
			customFont(null, { autocomplete: settingsDom })
		}
	})

	paramId('i_customfont').addEventListener('change', function () {
		customFont(null, { family: this.value })
	})

	paramId('i_weight').addEventListener('input', function () {
		customFont(null, { weight: this.value })
	})

	paramId('i_size').addEventListener('input', function () {
		customFont(null, { size: this.value })
	})

	paramId('i_textshadow').addEventListener('input', function () {
		textShadow(null, parseFloat(this.value))
	})

	//
	// Custom Style

	paramId('cssEditor').addEventListener('keyup', function (this: Element, ev: Event) {
		customCss(null, { is: 'styling', val: (ev.target as HTMLInputElement).value })
	})

	cssInputSize(paramId('cssEditor'))

	//
	// Settings managment

	const { exportAsFile, copyImportText, importAsText, importAsFile } = settingsMgmt()

	const toggleSettingsMgmt = (toggled: boolean) => {
		paramId('export')?.classList.toggle('shown', !toggled)
		paramId('import')?.classList.toggle('shown', toggled)
		paramClasses('tabs')[0]?.classList.toggle('toggled', toggled)
	}

	paramId('s_export').addEventListener('click', () => toggleSettingsMgmt(false))
	paramId('s_import').addEventListener('click', () => toggleSettingsMgmt(true))
	paramId('b_exportfile').addEventListener('click', () => exportAsFile())
	paramId('b_exportcopy').addEventListener('click', (e) => copyImportText(e.target as HTMLButtonElement))
	paramId('i_importfile').addEventListener('change', (e) => importAsFile(e.target as HTMLInputElement))
	paramId('i_importtext').addEventListener('keyup', (e) => importAsText((e.target as HTMLInputElement).value))
	paramId('b_resetconf').addEventListener('click', () => paramsReset('conf'))
	paramId('b_resetyes').addEventListener('click', () => paramsReset('yes'))
	paramId('b_resetno').addEventListener('click', () => paramsReset('no'))
	paramId('b_importtext').addEventListener('click', function () {
		paramsImport(parse((document.getElementById('i_importtext') as HTMLInputElement).value))
	})

	//
	// A11y tabbing inputs control
	// Expensive way to toggle all inputs tabindex on "params hiding actions" in settings
	function optionsTabIndex() {
		const isAllSettings = paramId('i_showall').checked

		const toggleTabindex = (parent: string, on: boolean) => {
			settingsDom?.querySelectorAll(`${parent} :is(input,  select,  button,  a, textarea)`).forEach((dom) => {
				on ? dom.removeAttribute('tabindex') : dom.setAttribute('tabindex', '-1')
			})
		}

		// If showall, start by enabling .as fields
		if (isAllSettings) {
			toggleTabindex('.as', true)
		}

		// Then control if widgets are on or off
		settingsDom.querySelectorAll('.dropdown').forEach((dom) => {
			toggleTabindex('#' + dom.id, dom?.classList.contains('shown'))
		})

		// Disable all "all" settings if off
		if (isAllSettings === false) {
			toggleTabindex('.as', false)
		}

		// Toggle tooltips
		settingsDom.querySelectorAll('.tooltiptext').forEach((dom) => {
			toggleTabindex('.' + dom.classList[1], dom?.classList.contains('shown'))
		})

		// Toggle in-widgets hidden options
		toggleTabindex('#searchbar_request', paramId('searchbar_request').classList.contains('shown'))
		toggleTabindex('#weather_provider', paramId('weather_provider').classList.contains('shown'))
		toggleTabindex('#quotes_userlist', paramId('quotes_userlist').classList.contains('shown'))
		toggleTabindex('#import', paramId('import').classList.contains('shown'))
		toggleTabindex('#export', paramId('export').classList.contains('shown'))
		toggleTabindex('#sett_city', paramId('i_geol').checked === false)

		// File export downloader is never tabbable
		paramId('downloadfile').setAttribute('tabindex', '-1')
	}

	// On startup
	optionsTabIndex()

	// Add event to specified inputs
	settingsDom.querySelectorAll('.opt-hider').forEach((dom) => {
		dom.addEventListener('input', () => setTimeout(() => optionsTabIndex(), 10))
	})
}

function settingsMgmt() {
	async function copyImportText(target: HTMLButtonElement) {
		try {
			const area = document.getElementById('area_export') as HTMLInputElement
			await navigator.clipboard.writeText(area.value)
			target.textContent = tradThis('Copied')
			setTimeout(() => {
				const domimport = document.getElementById('b_exportcopy')
				if (domimport) {
					domimport.textContent = tradThis('Copy text')
				}
			}, 1000)
		} catch (err) {
			console.error('Failed to copy: ', err)
		}
	}

	async function exportAsFile() {
		const a = document.getElementById('downloadfile')
		if (!a) return

		const data = ((await storage.get()) as Sync) ?? {}
		const zero = (n: number) => (n.toString().length === 1 ? '0' + n : n.toString())

		const bytes = new TextEncoder().encode(stringifyOrder(data))
		const blob = new Blob([bytes], { type: 'application/json;charset=utf-8' })
		const date = new Date()
		const YYYYMMDD = date.toISOString().slice(0, 10)
		const HHMMSS = `${zero(date.getHours())}_${zero(date.getMinutes())}_${zero(date.getSeconds())}`

		a.setAttribute('href', URL.createObjectURL(blob))
		a.setAttribute('download', `bonjourr-${data?.about?.version} ${YYYYMMDD} ${HHMMSS}.json`)
		a.click()
	}

	function importAsText(string: string) {
		const importtext = document.getElementById('b_importtext')

		try {
			parse(string)
			importtext?.removeAttribute('disabled')
		} catch (error) {
			importtext?.setAttribute('disabled', '')
		}
	}

	function importAsFile(target: HTMLInputElement) {
		function decodeExportFile(str: string) {
			let result = {}

			try {
				// Tries to decode base64 from previous versions
				result = parse(atob(str))
			} catch {
				try {
					// If base64 failed, parse raw string
					result = parse(str)
				} catch (error) {
					// If all failed, return empty object
					result = {}
				}
			}

			return result
		}

		if (!target.files || (target.files && target.files.length === 0)) {
			return
		}

		const file = target.files[0]
		const reader = new FileReader()

		reader.onload = () => {
			if (typeof reader.result !== 'string') return false

			const importData = decodeExportFile(reader.result)

			// data has at least one valid key from default sync storage => import
			if (Object.keys(syncDefaults).filter((key) => key in importData).length > 0) {
				paramsImport(importData as Sync)
			}
		}
		reader.readAsText(file)
	}

	return { exportAsFile, copyImportText, importAsText, importAsFile }
}

function cssInputSize(param: Element) {
	setTimeout(() => {
		const cssResize = new ResizeObserver((e) => {
			const rect = e[0].contentRect
			customCss(null, { is: 'resize', val: rect.height + rect.top * 2 })
		})
		cssResize.observe(param)
	}, 400)
}

function changelogControl(settingsDom: HTMLElement) {
	const domshowsettings = document.querySelector('#showSettings')
	const domchangelog = settingsDom.querySelector('#changelogContainer')

	if (!domchangelog) return

	domchangelog.classList.toggle('shown', true)
	domshowsettings?.classList.toggle('hasUpdated', true)

	const dismiss = () => {
		domshowsettings?.classList.toggle('hasUpdated', false)
		domchangelog.className = 'dismissed'
		localStorage.removeItem('hasUpdated')
	}

	const loglink = settingsDom.querySelector('#link') as HTMLAnchorElement
	const logdismiss = settingsDom.querySelector('#log_dismiss') as HTMLButtonElement

	loglink.onclick = () => dismiss()
	logdismiss.onclick = () => dismiss()
}

function translatePlaceholders(settingsDom: HTMLElement | null) {
	if (!settingsDom) {
		return
	}

	const cases = [
		['#i_title', 'Name'],
		['#i_greeting', 'Name'],
		['#i_tabtitle', 'New tab'],
		['#i_sbrequest', 'Search query: %s'],
		['#i_sbplaceholder', 'Search'],
		['#cssEditor', 'Type in your custom CSS'],
		['#i_importtext', 'or paste as text'],
	]

	for (const [id, text] of cases) {
		settingsDom.querySelector(id)?.setAttribute('placeholder', tradThis(text))
	}
}

async function switchLangs(nextLang: Langs) {
	await toggleTraduction(nextLang)

	sessionStorage.lang = nextLang // Session pour le weather
	storage.set({ lang: nextLang })
	document.documentElement.setAttribute('lang', nextLang)

	const data = ((await storage.get()) as Sync) ?? {}
	data.lang = nextLang
	weather(data)
	clock(data)
	quotes(data)
	tabTitle(data.tabtitle)
	notes(data.notes || null)
	translatePlaceholders(document.getElementById('settings'))
}

function showall(val: boolean, event: boolean, settingsDom?: HTMLElement) {
	;(settingsDom || document.getElementById('settings'))?.classList.toggle('all', val)

	if (event) {
		storage.set({ showall: val })
	}
}

async function selectBackgroundType(cat: string) {
	document.getElementById('local_options')?.classList.toggle('shown', cat === 'local')
	document.getElementById('unsplash_options')?.classList.toggle('shown', cat === 'unsplash')

	if (cat === 'local') {
		localBackgrounds({ thumbnail: document.getElementById('settings') as HTMLElement })
		setTimeout(() => localBackgrounds(), 100)
	}

	if (cat === 'unsplash') {
		const data = ((await storage.get()) as Sync) ?? {}
		if (!data.unsplash) return

		document.querySelector<HTMLSelectElement>('#i_freq')!.value = data.unsplash.every || 'hour'
		document.getElementById('creditContainer')?.classList.toggle('shown', true)
		setTimeout(() => unsplashBackgrounds(data.unsplash), 100)
	}

	storage.set({ background_type: cat })
}

function signature(dom: HTMLElement) {
	const spans = dom.querySelectorAll<HTMLSpanElement>('#rand span')
	const as = dom.querySelectorAll<HTMLAnchorElement>('#rand a')
	const us = [
		{ href: 'https://victr.me/', name: 'Victor Azevedo' },
		{ href: 'https://tahoe.be/', name: 'Tahoe Beetschen' },
	]

	if (Math.random() > 0.5) us.reverse()

	spans[0].textContent = `${tradThis('by')} `
	spans[1].textContent = ` & `

	as.forEach((a, i) => {
		a.href = us[i].href
		a.textContent = us[i].name
	})

	const version = dom.querySelector('.version a')
	if (version) version.textContent = syncDefaults.about.version

	// Remove donate text on safari because apple is evil
	if (testOS.ios || detectPlatform() === 'safari') dom.querySelector('#rdv_website')?.remove()
}

function fadeOut() {
	const dominterface = document.getElementById('interface')!
	dominterface.click()
	dominterface.style.transition = 'opacity .4s'
	setTimeout(() => (dominterface.style.opacity = '0'))
	setTimeout(() => location.reload(), 400)
}

async function paramsImport(toImport: Sync) {
	try {
		let data = ((await storage.get()) as Sync) ?? {}

		data = { ...filterImports(data, toImport) }

		storage.clear()
		storage.set(data, () => fadeOut())
	} catch (e) {
		console.log(e)
	}
}

function paramsReset(action: 'yes' | 'no' | 'conf') {
	if (action === 'yes') {
		storage.clear()
		localStorage.clear()
		fadeOut()
		return
	}

	document.getElementById('reset_first')?.classList.toggle('shown', action === 'no')
	document.getElementById('reset_conf')?.classList.toggle('shown', action === 'conf')
}

export async function updateExportJSON(settingsDom: HTMLElement) {
	const input = settingsDom.querySelector('#area_export') as HTMLInputElement

	settingsDom.querySelector('#importtext')?.setAttribute('disabled', '') // because cannot export same settings

	const data = ((await storage.get()) as Sync) ?? {}

	if (data?.weather?.lastCall) delete data.weather.lastCall
	data.about.browser = detectPlatform()

	input.value = stringifyOrder(data)
}

export async function settingsInit(data: Sync) {
	const html = await (await fetch('settings.html')).text()

	const domshowsettings = document.getElementById('showSettings')
	const dominterface = document.getElementById('interface')
	const domedit = document.getElementById('editlink')

	const parser = new DOMParser()
	const settingsDom = document.createElement('aside')
	const contentList = parser.parseFromString(html, 'text/html').body.childNodes

	settingsDom.id = 'settings'
	settingsDom.setAttribute('class', 'init')

	for (const elem of Object.values(contentList)) {
		settingsDom.appendChild(elem)
	}

	traduction(settingsDom, data.lang)
	signature(settingsDom)
	initParams(data, settingsDom)
	showall(data.showall, false, settingsDom)

	document.body.appendChild(settingsDom)

	//
	// Events
	//

	// On settings changes, update export code
	const isOnline = detectPlatform() === 'online'
	const storageUpdate = () => updateExportJSON(settingsDom)
	const unloadUpdate = () => chrome.storage.onChanged.removeListener(storageUpdate)

	if (isOnline) {
		window.addEventListener('storage', storageUpdate)
	} else {
		chrome.storage.onChanged.addListener(storageUpdate)
		window.addEventListener('beforeunload', unloadUpdate, { once: true })
	}

	function toggleDisplay(dom: HTMLElement) {
		const isClosed = !dom?.classList.contains('shown')

		dom?.classList.toggle('init', false)
		dom?.classList.toggle('shown', isClosed)
		domedit?.classList.toggle('pushed', isClosed)
		dominterface?.classList.toggle('pushed', isClosed)
		domshowsettings?.classList.toggle('shown', isClosed)

		settingsDom.style.removeProperty('transform')
		settingsDom.style.removeProperty('transition')
	}

	document.getElementById('skiptosettings')?.addEventListener('click', function () {
		toggleDisplay(settingsDom)
		settingsDom.scrollTo({ top: 0 })

		setTimeout(() => {
			const showall = settingsDom.querySelector('#i_showall') as HTMLButtonElement
			showall.focus()
		}, 10)
	})

	domshowsettings?.addEventListener('click', function () {
		toggleDisplay(settingsDom)
	})

	window.addEventListener('keydown', async function (e) {
		if (e.altKey && e.code === 'KeyS') {
			console.clear()
			console.log(localStorage)
			console.log(await storage.get())
		}

		if (e.code === 'Escape') {
			document.getElementById('editlink')?.classList.contains('shown') ? closeEditLink() : toggleDisplay(settingsDom)
			return
		}

		if (e.code === 'Tab') {
			document.body.classList.toggle('tabbing', true)
			return
		}
	})

	window.addEventListener('click', function (e) {
		const path = e.composedPath() ?? [document.body]
		const pathIds = e.composedPath().map((el) => (el as HTMLElement).id)

		const areSettingsShown = settingsDom?.classList.contains('shown')
		const isEditlinkOpen = document.getElementById('editlink')?.classList.contains('shown')

		const onBody = (path[0] as HTMLElement).tagName === 'BODY'
		const onInterface = pathIds.includes('interface')
		const onEdit = pathIds.includes('editlink')

		if (document.body.classList.contains('tabbing')) {
			document.body?.classList.toggle('tabbing', false)
		}

		if (!onEdit && isEditlinkOpen) {
			closeEditLink()
		}

		if ((onBody || onInterface) && areSettingsShown) {
			toggleDisplay(settingsDom)
		}
	})

	//
	// Mobile settings height control

	function responsiveSettingsHeightDrag() {
		let firstPos = 0
		let startTouchY = 0

		function dragStart(e: Event) {
			e.preventDefault()

			// Get mouse / touch y position
			if (e.type === 'mousedown') startTouchY = (e as MouseEvent).clientY
			if (e.type === 'touchstart') startTouchY = (e as TouchEvent).touches[0].clientY

			// First time dragging, sets maximum y pos at which to block
			if (firstPos === 0) firstPos = startTouchY

			// Scrollbar padding control on windows & android
			if (testOS.windows || testOS.android) {
				settingsDom.style.width = `calc(100% - 10px)`
				settingsDom.style.paddingRight = `10px`
			}

			// prevent scroll when dragging
			settingsDom.style.overflow = `clip`

			// Add mouse / touch moves events
			window.addEventListener('touchmove', dragMove)
			window.addEventListener('mousemove', dragMove)
		}

		function dragMove(e: Event) {
			let clientY: number = 0

			// Get mouse / touch y position
			if (e.type === 'mousemove') clientY = (e as MouseEvent).clientY
			if (e.type === 'touchmove') clientY = (e as TouchEvent).touches[0].clientY

			// element is below max height: move
			if (clientY > 60) {
				settingsDom.style.transform = `translateY(-${window.innerHeight + 30 - clientY}px)`
				settingsDom.style.transition = `transform .0s`
			}
		}

		function dragEnd(e: Event) {
			let clientY: number = 0

			// Get mouse / touch y position
			if (e.type === 'mouseup' || e.type === 'mouseleave') clientY = (e as MouseEvent).clientY
			if (e.type === 'touchend') clientY = (e as TouchEvent).changedTouches[0].clientY

			// Remove move events
			window.removeEventListener('touchmove', dragMove)
			window.removeEventListener('mousemove', dragMove)

			// reset mouse / touch pos
			startTouchY = 0

			settingsDom.style.removeProperty('padding')
			settingsDom.style.removeProperty('width')
			settingsDom.style.removeProperty('overflow')

			// Add bottom padding to see bottom of settings
			const signaturedom = document.querySelector('.signature') as HTMLDivElement
			signaturedom.style.paddingBottom = clientY + 60 + 'px'

			// small enough ? close settings
			if (clientY > window.innerHeight - 100) {
				toggleDisplay(settingsDom)
			}
		}

		const dragzone = settingsDom.querySelector('#mobile-drag-zone')
		dragzone?.addEventListener('touchstart', dragStart, { passive: false })
		dragzone?.addEventListener('mousedown', dragStart)
		dragzone?.addEventListener('touchend', dragEnd, { passive: false })
		dragzone?.addEventListener('mouseup', dragEnd)

		document.body?.addEventListener('mouseleave', (e) => {
			if (settingsDom?.classList.contains('shown') && window.innerWidth < 600) {
				dragEnd(e)
			}
		})
	}

	const DrawerDragDebounce = debounce(() => {
		;(document.querySelector('.signature') as HTMLDivElement).style.removeProperty('padding')
		responsiveSettingsHeightDrag()
	}, 600)

	window.addEventListener('resize', () => {
		DrawerDragDebounce()

		// removes transition to prevent weird movement when changing to mobile styling
		// /!\ this is dependent on toggleDisplay() to remove inline styling /!\
		if (!settingsDom.style.transition) {
			settingsDom.style.transition = 'none'
		}
	})

	responsiveSettingsHeightDrag()
}
