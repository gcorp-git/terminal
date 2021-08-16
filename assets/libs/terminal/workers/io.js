;(function(){
	'use strict';

	const TAB_LENGTH = 4;

	window.TerminalIO = function( env ) {
		env.buffer = [];

		return {
			print: ( sx, sy, text ) => _print( env, sx, sy, text ),
			get: ( sx, sy ) => _get( env, sx, sy ),
			set: ( sx, sy, symbol ) => _set( env, sx, sy, symbol ),
			remove: ( sx, sy ) => _remove( env, sx, sy ),
			get_buffer: () => _get_buffer( env ),
		};
	};

	function _print( env, sx, sy, text ) {
		if ( typeof text === 'string' ) text = { text };

		if ( !( text instanceof Object ) ) return;
		
		for ( let i = 0, len = text.text.length; i < len; i++ ) {
			const char = text.text.charAt( i );

			switch ( char ) {
				case '\b':
					if ( sx > 0 ) sx -= 1;
					break;
				case '\r':
					sx = 0;
					break;
				case '\n':
					sx = 0;
					sy += 1;
					break;
				case '\t':
					for ( let j = 0; j < TAB_LENGTH; j++ ) {
						_remove( env, sx + j, sy );
					}

					sx += TAB_LENGTH;
					break;
				default:
					const symbol = {};

					symbol.char = char;

					if ( text.bg ) symbol.bg = text.bg;
					if ( text.color ) symbol.color = text.color;

					_set( env, sx, sy, symbol );

					sx += 1;
					break;
			}
		}
	}

	function _get( env, sx, sy ) {
		return env.buffer[ sy ] ? env.buffer[ sy ][ sx ] : undefined;
	}

	function _set( env, sx, sy, symbol ) {
		if ( !symbol ) return _remove( env, sx, sy );
		if ( !env.buffer[ sy ] ) env.buffer[ sy ] = [];

		if ( typeof symbol === 'string' ) {
			symbol = { char: symbol };
		}

		if ( !( symbol instanceof Object ) ) return;

		env.buffer[ sy ][ sx ] = symbol;

		env.workers.screen.mark_for_refresh();
	}

	function _remove( env, sx, sy ) {
		if ( sx !== undefined && sy !== undefined ) {
			if ( env.buffer[ sy ] && env.buffer[ sy ][ sx ] ) {
				delete env.buffer[ sy ] && env.buffer[ sy ][ sx ];
			}
		} else {
			env.buffer = [];
		}

		env.workers.screen.mark_for_refresh();
	}

	function _get_buffer( env ) {
		return env.buffer;
	}

})();