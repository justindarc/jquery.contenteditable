/* 
 * jQuery Plugin for a contenteditable-based WYSIWYG Editor
 * Adds WYSIWYG editor functionality using the HTML5 contenteditable attribute
 * to selected DOM elements.
 * 
 * Author: Justin D'Arcangelo (http://twitter.com/justindarc)
 * GitHub: https://github.com/justindarc
 * 
 * License:
 *    The MIT License
 * 
 * Revisions:
 *		0.1		- Initial commit
 * 
 * Usage:
 *		$('#editor').contentEditable();
 */
(function($) {

  $.fn.contentEditable = function(options) {

    // Default plugin options.
    var defaults = {};

    // Extend default plugin options with provided options.
    if (options) {
      $.extend(defaults, options);
    }

    // Iterate over matched elements.
    return this.each(function(index, item) {
      var $item = $(item);
      
      var isContentEditableSupported = _isContentEditableSupported();
      
      var html = '' +
        '<div class="content">' +
          '<div class="topbar">' +
            '<div class="topbar-inner">' +
              '<div class="container">' +
                '<ul class="nav">' +
                  '<li><a href="#bold"><strong>B</strong></a></li>' +
                  '<li><a href="#italic"><em>I</em></a></li>' +
                  '<li><a href="#underline"><u>U</u></a></li>' +
                  '<li><a href="#strikethrough"><strike>S</strike></a></li>' +
                '</ul>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="contenteditable"' + ((isContentEditableSupported) ? ' contenteditable="true"' : '') + '/>' +
          ((isContentEditableSupported) ? '' : '<input type="text" class="cursor" autocapitalize="off"/>') +
          ((isContentEditableSupported) ? '' : '' +
            '<div class="context-menu">' +
              '<div class="arrow"/>' +
              '<div class="inner"><a href="#">Select</a><a href="#">Paste</a></div>' +
            '</div>'
            ) +
        '</div>' +
        ((isContentEditableSupported) ? '' : '' +
          '<style type="text/css">' +
            '.contenteditable div {' +
              'display: inline-block;' +
              'float: left;' +
              'clear: left;' +
            '}' +
            '.contenteditable span.selected {' +
              'background: rgba(0, 112, 255, 0.3)' +
            '}' +
          '</style>');

      $item.html(html);
      
      var $nav = $item.find('ul.nav');
      
      $nav.delegate('a', 'click', function(evt) {
        var $this = $(this);
        
        $this.parent().toggleClass('active');

        if (!isContentEditableSupported) {
          $cursor.focus();
        }
        
        evt.preventDefault();
      });
      
      if (_is_iOS()) {
        $nav.addClass('touch');
      }
      
      var $contenteditable = $item.find('div.contenteditable');
      
      if (!isContentEditableSupported) {
        var $cursor = $item.find('input.cursor');
        var $contextMenu = $item.find('div.context-menu');
        var $active = $('<div/>');
        
        var activeIndex = 0;
        var didMoveTouch = false;
        var isContextMenuVisible = false;
        var isFocused = false;
        var touch;
        
        $contenteditable.append($active);
        
        $cursor.css({
          left: $active.offset().left + 'px',
          top: $active.offset().top + 'px'
        });
        
        $contextMenu.css({
          left: ($active.offset().left - ($contextMenu.outerWidth() / 2)) + 'px',
          top: ($active.offset().top - $contextMenu.outerHeight()) + 'px'
        })
        
        $(document.body).bind('mousedown touchstart', function(evt) {
          if (!$.contains(item, evt.target)) {
            $cursor.blur();
            isFocused = false;
          }
        });
        
        $contenteditable.bind('mousedown touchstart', function(evt) {
          this.isMouseDown = true;
          
          if (evt.type === 'touchstart') {            
            if (evt.originalEvent && evt.originalEvent.touches) {
              didMoveTouch = false;
              
              touch = {
                x: evt.originalEvent.touches[0].clientX,
                y: evt.originalEvent.touches[0].clientY
              };
            }
          } else {
            $cursor.blur();
          }
        });
        
        $contenteditable.bind('mousemove touchmove', function(evt) {
          if (!this.isMouseDown) return false;
          
          if (evt.type === 'touchmove') {
            if (evt.originalEvent.touches) {
              didMoveTouch = true;
              
              touch = {
                x: evt.originalEvent.touches[0].clientX,
                y: evt.originalEvent.touches[0].clientY
              };
              
              $cursor.css({
                left: touch.x + 'px',
                top: touch.y + 'px'
              });
              
              // TODO: Conditionally prevent the default behavior depending on cursor position.
              evt.preventDefault();
            }
          } else {
            
          }
        });
        
        $contenteditable.bind('mouseup touchend', function(evt) {
          this.isMouseDown = false;
          
          if (evt.type === 'touchend') {
            $cursor.trigger('click');

            var elements = $contenteditable.find('div');
            
            if (didMoveTouch) {
              $contextMenu.hide();
              isContextMenuVisible = false;
              
              for (var i = 0; i < elements.length; i++) {
                if (i === elements.length - 1 || _isTouchInElementLine(touch, elements[i])) {
                  var $element = $(elements[i]);
                  var characters = $element.text().split('');
                  var html = $element.html();
                
                  if (characters.length > 0) {
                    $element.html('<span>' + characters.join('</span><span>') + '</span>');
                  }

                  var offset;
                  var spans = $element.children('span');
                
                  // Locate character position using <span/> tags.
                  for (var j = 0; j < spans.length; j++) {
                    if (_isTouchInElement(touch, spans[j])) {
                      var $span = $(spans[j]);
                    
                      activeIndex = j;
                      offset = $span.offset();
                    
                      break;
                    }
                  }
                
                  if (!offset) {
                    activeIndex = characters.length;
                    offset = $element.offset();
                    offset.left += $element.width();
                  }
                  
                  $element.html(html);
                  $active = $element;
                
                  $cursor.css({
                    left: offset.left + 'px',
                    top: offset.top + 'px'
                  });
                
                  break;
                }
              }
            } else if (isFocused) {
              if (isContextMenuVisible) {
                $contextMenu.fadeOut(200);
              } else {
                var contextMenuOffset = $cursor.offset();
                
                contextMenuOffset.left -= ($contextMenu.outerWidth() / 2) - $cursor.width();
                contextMenuOffset.top -= $contextMenu.outerHeight();
                
                $contextMenu.css({
                  left: contextMenuOffset.left + 'px',
                  top: contextMenuOffset.top + 'px'
                });
                
                $contextMenu.fadeIn(200);
              }
              
              isContextMenuVisible = !isContextMenuVisible;
            }
          } else {
            $cursor.focus();
            isFocused = true;
          }
        });
        
        $cursor.bind('keydown', function(evt) {
          var $this = $(this);
          
          var keyCode = evt.which;
          var text = ($active) ? $active.text() : '';
          
          $contextMenu.fadeOut(200);
          isContextMenuVisible = false;
          
          if (keyCode === 8) {
            if ($active) {
              var offset;
              
              if ($active.is(':empty') || $active.children('br').size() === 1) {
                if ($contenteditable.children().size() > 1) {
                  var $previousActive = $active;
                
                  $active = $active.prev();
                  $previousActive.remove();
                  
                  offset = $active.offset();
                  offset.left += $active.width();
                  
                  activeIndex = $active.text().length;
                }
              } else {
                var value = text.substring(0, activeIndex - 1);
                
                $active.html(value);
                
                offset = $active.offset();
                offset.left += $active.width();
                
                $active.html(value + text.substring(activeIndex, text.length));
                
                activeIndex -= (activeIndex > 0) ? 1 : 0;
              }

              if (offset) {
                $cursor.css({
                  left: offset.left + 'px',
                  top: offset.top + 'px'
                });
              }
            }
          }
        });
        
        $cursor.bind('keypress', function(evt) {
          var $this = $(this);
          
          var keyCode = evt.which;
          
          if (keyCode === 13) {
            var $newLine = $('<div/>');
            
            if ($active.is(':empty')) {
              $active.html('<br/>');
            }
            
            $active.after($newLine);
            $active = $newLine;
            
            var offset = $active.offset();
            
            offset.left += $active.width();
        
            $cursor.css({
              left: offset.left + 'px',
              top: offset.top + 'px'
            });
          }
        });
        
        $cursor.bind('keyup', function(evt) {
          var $this = $(this);
          
          var value = $this.val();
          
          if (value) {
            if (value === ' ') {
              value = '&nbsp;';
            }
            
            var offset;
            
            if ($active.is(':empty') || $active.children('br').size() === 1) {
              $active.html(value);
              
              activeIndex = value.length;
              offset = $active.offset();
              offset.left += $active.width();
            } else {
              var text = $active.text();
              var previousIndex = activeIndex;
              
              value = text.substring(0, activeIndex) + value;
              activeIndex = value.replace(/&nbsp;/g, ' ').length;
              
              $active.html(value);
              
              offset = $active.offset();
              offset.left += $active.width();
              
              $active.html(value + text.substring(previousIndex));
            }
          
            $this.val('');
        
            $cursor.css({
              left: offset.left + 'px',
              top: offset.top + 'px'
            });
          }
        });

      }
    });
    
  };

	// Public function definitions.
	//$.fn.contentEditable.functionName = function(foo) {
	//	return this;
	//};

	// Private function definitions.
	var _isContentEditableSupported = function() {
	  if (_is_iOS()) {
	    var iOSVersion = _iOSVersion();
	    var majorVersion = (iOSVersion && iOSVersion.split('.').length > 0) ? parseInt(iOSVersion.split('.')[0], 10) : 0;
	    
	    if (majorVersion < 5) {
	      return false;
	    }
	  }
	  
	  return true;
	};
	
	var _is_iOS = function() {
	  return (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i));
	};
	
	var _iOSVersion = function() {
	  var regex = /OS (([0-9]+)_)+([0-9]+){1} like/;
	  var matches = regex.exec(navigator.userAgent);
	  
	  matches = (matches && matches.length > 0) ? matches[0].split(' ') : null;
	  
	  if (matches && matches.length === 3) {
	    return matches[1].replace(/_/g, '.');
	  }
	  
	  return undefined;
	};
	
	var _isTouchInElement = function(touch, element) {
	  var $element = $(element);
	  var offset = $element.offset();
	  var x1 = offset.left;
	  var x2 = offset.left + $element.width();
	  var y1 = offset.top;
	  var y2 = offset.top + $element.height();
	  
	  return (x1 <= touch.x && touch.x <= x2 && y1 <= touch.y && touch.y <= y2);
	};
	
	var _isTouchInElementLine = function(touch, element) {
	  var $element = $(element);
	  var offset = $element.offset();
	  var y1 = offset.top;
	  var y2 = offset.top + $element.height();
	  
	  return (y1 <= touch.y && touch.y <= y2);
	};

})(jQuery);