;(function(){
  'use strict';

  // todo: create [optional] caret to get the user input
  // todo: pass custom tools with ability to subscribe to actions
  // todo: create shell with fs and text editor

  window.terminal = Terminal( '#terminal' );

  terminal.on({
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