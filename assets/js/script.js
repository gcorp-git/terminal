;(function(){
	'use strict';

	// todo: each worker can have it's own workers added to env
	// because each one of them has it's own copy of env

	// todo: pass custom tools and subscribe to actions
	
	// todo: create shell with fs and text editor

	// todo: create optional caret to get the user input

	window.terminal = new Terminal( '#terminal' );

	terminal.enable({
		wrap: true,
		select: { enabled: true },
		font: { size: 16 },
	});
	
	terminal.print( 0, 0, '# 0testaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbccccccccccccccccccccddddddddddddddddddddddeeeeeeeeeeeeeeeeeeeee', true );
	terminal.print( 0, 1, '# 1testaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbccccccccccccccccccccddddddddddddddddddddddeeeeeeeeeeeeeeeeeeeee', true );
	terminal.print( 0, 2, '# 2testaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbccccccccccccccccccccddddddddddddddddddddddeeeeeeeeeeeeeeeeeeeee', true );
	terminal.print( 0, 3, '# 3testaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbccccccccccccccccccccddddddddddddddddddddddeeeeeeeeeeeeeeeeeeeee', true );
	terminal.print( 0, 4, '# 4testaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbccccccccccccccccccccddddddddddddddddddddddeeeeeeeeeeeeeeeeeeeee', true );
	terminal.print( 0, 5, '# 5testaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbccccccccccccccccccccddddddddddddddddddddddeeeeeeeeeeeeeeeeeeeee', true );
	terminal.print( 0, 6, '# 6testaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbccccccccccccccccccccddddddddddddddddddddddeeeeeeeeeeeeeeeeeeeee', true );

})();