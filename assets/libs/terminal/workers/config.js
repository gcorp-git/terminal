;(function(){
	'use strict';

	window.TerminalConfig = Worker(({ state, workers }) => ({
		state: {
			options: {
				wrap: false,
				select: {
					enabled: false,
					bg: '#eee',
					color: '#111',
				},
				font: {
					weight: 400,
					size: 16,
				},
				caret: {
					width: 9,
					height: 17,
				},
			},
		},
		service: ({ state, workers }) => ({
			get wrap() {
				return state.options.wrap;
			},
			get select() {
				return { ...state.options.select };
			},
			get font() {
				return { ...state.options.font };
			},
			get caret() {
				return { ...state.options.caret };
			},
			edit( options ) {
				if ( !( options instanceof Object ) ) return;

				if ( options?.wrap !== undefined ) {
					state.options.wrap = !!options.wrap;
					workers.screen.reset();
				}

				if ( options?.select instanceof Object ) {
					state.options.select.enabled = !!options.select.enabled;
					state.options.select.bg = options.select.bg ?? state.options.select.bg;
					state.options.select.color = options.select.color ?? state.options.select.color;
				}

				if ( options?.font instanceof Object ) {
					const size = options.font.size ?? state.options.font.size;
					const weight = options.font.weight ?? state.options.font.weight;

					state.options.font.size = size;
					state.options.font.weight = weight;

					state.options.caret.width = Math.floor( 0.5 * state.options.font.size ) + 1;
					state.options.caret.height = state.options.font.size;
				}

				workers.screen.mark_for_refresh();
			},
		}),
	}));

})();