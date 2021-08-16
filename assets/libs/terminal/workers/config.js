;(function(){
	'use strict';

	window.TerminalConfig = function( env ) {
		env.options = {
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
		};

		return {
			get: ( key ) => _get( env, key ),
			edit: ( options ) => _edit( env, options ),
		};
	};

	function _get( env, key ) {
		return env.options[ key ];
	}

	function _edit( env, options ) {
		if ( !( options instanceof Object ) ) return;

		if ( options?.wrap !== undefined ) {
			env.options.wrap = !!options.wrap;
			env.workers.screen.reset();
		}

		if ( options?.select instanceof Object ) {
			env.options.select.enabled = !!options.select.enabled;
			env.options.select.bg = options.select.bg ?? env.options.select.bg;
			env.options.select.color = options.select.color ?? env.options.select.color;
		}

		if ( options?.font instanceof Object ) {
			const size = options.font.size ?? env.options.font.size;
			const weight = options.font.weight ?? env.options.font.weight;

			env.options.font.size = size;
			env.options.font.weight = weight;

			env.options.caret.width = Math.floor( 0.5 * env.options.font.size ) + 1;
			env.options.caret.height = env.options.font.size;
		}

		env.workers.screen.mark_for_refresh();
	}

})();