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
          '<div class="contenteditable" contenteditable="true"></div>' +
        '</div>';

      $item.html(html);
      
      var $nav = $item.find('ul.nav');
      
      $nav.delegate('a', 'click', function(evt) {
        $this = $(this);
        $this.parent().toggleClass('active');
      });
    });
    
  };

	// Public function definitions.
	//$.fn.contentEditable.functionName = function(foo) {
	//	return this;
	//};

	// Private function definitions.
	//var foobar = function() {};

})(jQuery);