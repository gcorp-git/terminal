;(function(){
	'use strict';

	window.TerminalScreen = function( env ) {
		env.$canvas = undefined;
		env.ctx = undefined;
		env.bg = '#111';
		env.color = '#eee';
		env.width = 0;
		env.height = 0;
		env.offset = {
			sx: 0,
			sy: 0,
		};
		env.real = [];
		env.changed = false;

		return {
			enable: () => _enable( env ),
			disable: () => _disable( env ),
			resize: () => _resize( env ),
			frame: () => _frame( env ),
			reset: () => _reset( env ),
			mark_for_refresh: () => _mark_for_refresh( env ),
			get_canvas: () => _get_canvas( env ),
			get_width: () => _get_width( env ),
			get_height: () => _get_height( env ),
			get_offset_sx: ( dx ) => _get_offset_sx( env, dx ),
			get_offset_sy: ( dy ) => _get_offset_sy( env, dy ),
			set_offset_sx: ( ox ) => _set_offset_sx( env, ox ),
			set_offset_sy: ( oy ) => _set_offset_sy( env, oy ),
			has_real_coords_row: ( sy ) => _has_real_coords_row( env, sy ),
			get_real_coords: ( sx, sy ) => _get_real_coords( env, sx, sy ),
		};
	};

	function _enable( env ) {
		env.$canvas = document.querySelector( env.state.selector );

		env.$canvas.setAttribute( 'style', `
			display: block;
			width: 100%;
			height: 100%;
			background-color: ${env.bg};
			position: relative;
			cursor: text;
		`);

		env.ctx = env.$canvas.getContext( '2d' );

		_resize( env );
	}

	function _disable( env ) {
		env.$canvas.removeAttribute( 'style' );
	}

	function _resize( env ) {
		const style = getComputedStyle( env.$canvas );
		const canvasWidth = parseInt( style.width );
		const canvasHeight = parseInt( style.height );

		if ( canvasWidth !== env.$canvas.width || canvasHeight !== env.$canvas.height ) {
			env.$canvas.width = canvasWidth;
			env.$canvas.height = canvasHeight;

			env.changed = true;
		}

		const sw = Math.floor( canvasWidth / env.workers.config.get('caret').width );
		const sh = Math.floor( canvasHeight / env.workers.config.get('caret').height );

		if ( sw !== env.width || sh !== env.height ) {
			env.width = sw;
			env.height = sh;
		}

		_update_real_coords( env );
	}

	function _frame( env ) {
		if ( !env.changed ) return;

		_resize( env );

		env.workers.select.frame();

		env.ctx.clearRect( 0, 0, env.$canvas.width, env.$canvas.height );

		const sw = env.width;
		const sh = env.height;

		for ( let sy = 0; sy < sh; sy++ ) {
			if ( !_has_real_coords_row( env, sy ) ) continue;

			for ( let sx = 0; sx < sw; sx++ ) {
				const { rx, ry } = _get_real_coords( env, sx, sy );

				_draw_symbol( env, rx, ry, sx, sy );
			}
		}

		env.changed = false;
	}

	function _update_real_coords( env ) {
		if ( !env.changed ) return;

		const buffer = env.workers.io.get_buffer();

		let current = 0;

		env.real = [];

		for ( let i = 0, len = buffer.length; i < len; i++ ) {
			const rowLength = buffer[ i ] ? buffer[ i ].length : 0;

			env.real[ current ] = [ 0, i ];

			current += 1;

			if ( env.workers.config.get('wrap') ) {
				for ( let j = env.width; j <= rowLength; j += env.width ) {
					env.real[ current ] = [ j, i ];
					current += 1;
				}
			}
		}
	}

	function _draw_symbol( env, rx, ry, sx, sy ) {
		const buffer = env.workers.io.get_buffer();

		let symbol = buffer[ ry ] ? buffer[ ry ][ rx ] : undefined;
		
		const cw = env.workers.config.get('caret').width;
		const ch = env.workers.config.get('caret').height;

		const gx = sx * cw;
		const gy = sy * ch;

		const selected = _is_selected_symbol( env, rx, ry );

		const bg = !selected
			? ( symbol?.bg ?? env.bg )
			: env.workers.config.get('select').bg;

		env.ctx.fillStyle = bg;
		env.ctx.fillRect( gx, gy, cw, ch );
		
		if ( symbol ) {
			const color = !selected
				? ( symbol?.color ?? env.color )
				: env.workers.config.get('select').color;

			const fw = env.workers.config.get('font').weight;
			const fs = env.workers.config.get('font').size;

			env.ctx.font = `normal ${fw} ${fs}px/1 monospace`;
			env.ctx.textBaseline = 'bottom';
			env.ctx.fillStyle = color;
			env.ctx.fillText( symbol.char, gx, gy + ch );
		}
	}

	function _is_selected_symbol( env, rx, ry ) {
		const normalized_select = env.workers.select.get_normalized();

		if ( !normalized_select ) return false;

		if ( normalized_select.from.ry === normalized_select.to.ry ) {
			return ry === normalized_select.from.ry
				&& rx >= normalized_select.from.rx
				&& rx <= normalized_select.to.rx;
		}

		return ( ry > normalized_select.from.ry && ry < normalized_select.to.ry )
			|| ( ry === normalized_select.from.ry && rx >= normalized_select.from.rx )
			|| ( ry === normalized_select.to.ry && rx <= normalized_select.to.rx );
	}

	function _reset( env ) {
		env.offset.sx = 0;
		env.offset.sy = 0;
	}

	function _mark_for_refresh( env ) {
		env.changed = true;
	}

	function _get_canvas( env ) {
		return env.$canvas;
	}

	function _get_width( env ) {
		return env.width;
	}

	function _get_height( env ) {
		return env.height;
	}

	function _get_offset_sx( env, dx ) {
		return !env.workers.config.get('wrap') ? env.offset.sx + ( dx ?? 0 ) : ( dx ?? 0 );
	}

	function _get_offset_sy( env, dy ) {
		return env.offset.sy + ( dy ?? 0 );
	}

	function _set_offset_sx( env, ox ) {
		env.offset.sx = ox >= 0 ? ox : 0;
	}

	function _set_offset_sy( env, oy ) {
		env.offset.sy = oy >= 0 ? oy : 0;
	}

	function _has_real_coords_row( env, sy ) {
		return !!env.real[ _get_offset_sy( env, sy ) ];
	}

	function _get_real_coords( env, sx, sy ) {
		const osx = _get_offset_sx( env, sx );
		const osy = _get_offset_sy( env, sy );

		const real = env.real[ osy ];

		const rx = real ? real[ 0 ] + osx : ( sx > 0 ? Infinity : -Infinity );
		const ry = real ? real[ 1 ] : ( sy > 0 ? Infinity : -Infinity );

		return { rx, ry };
	}

})();