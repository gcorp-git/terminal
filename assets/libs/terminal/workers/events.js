;(function(){
	'use strict';

	window.TerminalEvents = function( env ) {
		env.listeners = [];
		env.kb = {
			ctrl: false,
			shift: false,
			alt: false,
		};
		env.mouse = {
			left: false,
			right: false,
		};

		return {
			enable: () => _enable( env ),
			disable: () => _disable( env ),
		};
	};

	function _enable( env ) {
		const $canvas = env.workers.screen.get_canvas();

		window.onresize = () => env.workers.screen.mark_for_refresh();;

		_on( env, $canvas, 'mousedown', e => {
			const sx = Math.floor( e.offsetX / env.workers.config.get('caret').width );
			const sy = Math.floor( e.offsetY / env.workers.config.get('caret').height );

			if ( e.which === 1 && env.workers.config.get('select').enabled ) {
				env.mouse.left = true;
				env.workers.select.set({ from: env.workers.screen.get_real_coords( sx, sy ) });
				env.workers.screen.mark_for_refresh();
			}
		});

		_on( env, document, 'mousemove', e => {
			const sx = Math.floor( e.offsetX / env.workers.config.get('caret').width );
			const sy = Math.floor( e.offsetY / env.workers.config.get('caret').height );

			if ( e.which === 1 && env.mouse.left ) {
				env.workers.select.edit({ to: env.workers.screen.get_real_coords( sx, sy ) });
				env.workers.screen.mark_for_refresh();
			}
		});

		_on( env, document, 'mouseup', e => {
			const sx = Math.floor( e.offsetX / env.workers.config.get('caret').width );
			const sy = Math.floor( e.offsetY / env.workers.config.get('caret').height );

			if ( e.which === 1 && env.mouse.left ) {
				env.mouse.left = false;

				env.workers.select.edit({ to: env.workers.screen.get_real_coords( sx, sy ) });

				const select = env.workers.select.get();

				if ( select.from.rx === select.to.rx ) {
					if ( select.from.ry === select.to.ry ) {
						env.workers.select.remove();
					}
				}

				env.workers.screen.mark_for_refresh();
			}
		});

		_on( env, $canvas, 'wheel', e => {
			e.preventDefault();

			let delta = Math.floor( e.deltaY / 100 );

			if ( env.kb.shift ) {
				env.workers.screen.set_offset_sx( env.workers.screen.get_offset_sx( delta ) );
			} else {
				env.workers.screen.set_offset_sy( env.workers.screen.get_offset_sy( delta ) );
			}

			env.workers.screen.mark_for_refresh();
		});

		_on( env, document, 'keydown', e => {
			switch ( e.key ) {
				case 'Control': env.kb.ctrl = true; break;
				case 'Shift': env.kb.shift = true; break;
				case 'Alt': env.kb.alt = true; break;
			}

			const select = env.workers.select.get();

			if ( select?.to ) {
				if ( e.code === 'KeyC' && e.ctrlKey ) {
					const normalized_select = env.workers.select.get_normalized();
					const buffer = env.workers.io.get_buffer();
					const result = [];

					let fragment = [];

					if ( normalized_select.from.ry === normalized_select.to.ry ) {
						fragment = [];

						const row = buffer[ normalized_select.from.ry ];

						for ( let ix = normalized_select.from.rx; ix <= normalized_select.to.rx; ix++ ) {
							fragment.push( row[ ix ] ? row[ ix ].char : ' ' );
						}

						result.push( fragment.join('') );
					} else {
						for ( let iy = normalized_select.from.ry; iy <= normalized_select.to.ry; iy++ ) {
							fragment = [];

							const row = buffer[ iy ];

							if ( !row ) continue;

							if ( iy === normalized_select.from.ry ) {
								for ( let ix = normalized_select.from.rx; ix < row.length; ix++ ) {
									fragment.push( row[ ix ] ? row[ ix ].char : ' ' );
								}

								result.push( fragment.join('') );
								continue;
							}

							if ( iy === normalized_select.to.ry ) {
								for ( let ix = 0; ix <= normalized_select.to.rx && ix < row.length; ix++ ) {
									fragment.push( row[ ix ] ? row[ ix ].char : ' ' );
								}

								result.push( fragment.join('') );
								continue;
							}

							for ( let ix = 0; ix < row.length; ix++ ) {
								fragment.push( row[ ix ] ? row[ ix ].char : ' ' );
							}

							result.push( fragment.join('') );
						}
					}

					// todo: copy to inner clipboard

					console.log( result.join( '\n' ) );
				}
			}
		});

		_on( env, document, 'keyup', e => {
			switch ( e.key ) {
				case 'Control': env.kb.ctrl = false; break;
				case 'Shift': env.kb.shift = false; break;
				case 'Alt': env.kb.alt = false; break;
			}
		});
	}

	function _disable( env ) {
		env.listeners.forEach(({ $node, event, handler }) => {
			$node.removeEventListener( event, handler );
		});

		env.listeners = [];
	}

	function _on( env, $node, event, handler ) {
		$node.addEventListener( event, handler );

		const found = env.listeners.find( listener => (
			   listener.$node === $node
			&& listener.event === event
			&& listener.handler === handler
		));

		if ( found ) return;

		env.listeners.push({ $node, event, handler });
	}

})();