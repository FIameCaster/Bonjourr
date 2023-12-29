const ENGINES = <const>['google', 'ddg', 'startpage', 'qwant', 'yahoo', 'bing', 'brave', 'ecosia', 'lilo', 'baidu', 'custom']

declare namespace Sync {
	interface Storage {
		usdate: boolean
		showall: boolean
		quicklinks: boolean
		syncbookmarks?: number
		time: boolean
		main: boolean
		pagegap: number
		pagewidth: number
		linksrow: number
		linkstyle: 'large' | 'medium' | 'small' | 'inline' | 'text'
		linknewtab: boolean
		linktabs?: number
		textShadow: number
		cssHeight: number
		reviewPopup: number
		background_blur: number
		background_bright: number
		css: string
		lang: string
		favicon: string
		tabtitle: string
		greeting: string
		notes?: Notes
		hide?: Hide
		dark: 'auto' | 'system' | 'enable' | 'disable'
		background_type: 'local' | 'unsplash'
		clock: Clock
		unsplash: Unsplash.Sync
		weather: Weather.Sync
		searchbar: Searchbar
		quotes: Quotes.Sync
		font: Font
		tabslist: Links.TabList
		move: {
			selection: Move.Selection
			layouts: {
				single: Move.Layout
				double: Move.Layout
				triple: Move.Layout
			}
		}
		about: {
			browser: string
			version: string
		}
		[key: string]: (Links.Elem | Links.Folder) | unknown
	}

	type HideOld = [[number, number], [number, number, number], [number], [number]]

	type Hide = {
		clock?: boolean
		date?: boolean
		greetings?: boolean
		weatherdesc?: boolean
		weathericon?: boolean
		settingsicon?: boolean
	}

	type Clock = {
		ampm: boolean
		analog: boolean
		seconds: boolean
		timezone: string
		size: number
		style: 'round' | 'square' | 'transparent'
		face: 'none' | 'number' | 'roman' | 'marks'
	}

	type Searchbar = {
		on: boolean
		opacity: number
		newtab: boolean
		engine: (typeof ENGINES)[number]
		request: string
		suggestions: boolean
		placeholder: string
	}

	type Font = {
		family: string
		size: string
		weight: string
		weightlist: string[]
		system?: boolean
		// <1.19
		url?: string
		availWeights?: string[]
	}

	type Notes = {
		on: boolean
		text?: string
		width?: number
		opacity: number
		align: 'left' | 'center' | 'right'
	}

	namespace Move {
		interface Layout {
			selected?: boolean
			grid: string[][]
			items: { [key in Key]?: Item }
		}

		interface Item {
			box: string
			text: string
		}

		type Selection = 'single' | 'double' | 'triple'

		type Key = 'time' | 'main' | 'notes' | 'searchbar' | 'quicklinks' | 'quotes'
	}
}
