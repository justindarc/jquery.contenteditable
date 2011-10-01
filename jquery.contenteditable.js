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
          '<div class="contenteditable"' + ((isContentEditableSupported) ? ' contenteditable="true"' : '') + '>' +
          ((isContentEditableSupported) ? '' : '<span class="cursor"/>') + 
          '</div>' +
          ((isContentEditableSupported) ? '' : '<textarea/>') + 
        '</div>';

      $item.html(html);
      
      var $nav = $item.find('ul.nav');
      
      $nav.delegate('a', 'click', function(evt) {
        var $this = $(this);
        $this.parent().toggleClass('active');
      });
      
      var $contenteditable = $item.find('div.contenteditable');
      
      if (!isContentEditableSupported) {
        var $textarea = $item.find('textarea');
      
        $textarea.css({
          width: $contenteditable.outerWidth() + 'px',
          height: $contenteditable.outerHeight() + 'px',
          position: 'relative',
          top: (0 - $contenteditable.outerHeight()) + 'px'
        });
      
        $textarea.fadeTo(0, 0);
      
        $textarea.bind('keyup', function(evt) {
          var $this = $(this);
        
          $contenteditable.text($contenteditable.text() + $this.val());
          $this.val('');
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
	}

})(jQuery);