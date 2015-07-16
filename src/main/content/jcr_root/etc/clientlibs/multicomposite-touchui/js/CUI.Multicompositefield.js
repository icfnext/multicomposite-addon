/* global jQuery, CUI, Class */
(function($, CUI, Class) {
    'use strict';

    var addButton
        = '<button type="button" class="js-coral-Multicompositefield-add coral-Multifield-add coral-MinimalButton">'
            + '<i class="coral-Icon coral-Icon--sizeM coral-Icon--addCircle coral-MinimalButton-icon"></i>'
            + '</button>',

        removeButton
        = '<button type="button" '
            + 'class="js-coral-Multicompositefield-remove coral-Multifield-remove coral-MinimalButton">'
            + '<i class="coral-Icon coral-Icon--sizeM coral-Icon--minusCircle coral-MinimalButton-icon"></i>'
            + '</button>',

        moveButton
        = '<button type="button" class="js-coral-Multicompositefield-move coral-Multifield-move coral-MinimalButton">'
            + '<i class="coral-Icon coral-Icon--sizeM coral-Icon--navigation coral-MinimalButton-icon"></i>'
            + '</button>',

        listTemplate
        = '<ol class="js-coral-Multicompositefield-list coral-Multifield-list"></ol>',

        fieldTemplate
        = '<li class="js-coral-Multicompositefield-input coral-Multifield-input">'
            + '<div class="js-coral-Multicompositefield-placeholder"></div>'
            + removeButton
            + moveButton
            + '</li>',

    /*
     * This is a temporary fix for missing ES6 functionality (String.endsWith).
     * This is an adjusted version of the polyfill from
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
     * If we find that we are using this regularly we should add it as a true polyfill as indicated on that page.
     */
    endsWith = function(subjectString, searchString, position) {
        var lastIndex;

        if (position === undefined || position > subjectString.length) { // eslint-disable-line
            position = subjectString.length;
        }
        position -= searchString.length;
        lastIndex = subjectString.indexOf(searchString, position);

        return lastIndex !== -1 && lastIndex === position;
    },

    startsWith =function(str, prefix) {
        return str.indexOf(prefix) === 0;
    };
    

    CUI.Multicompositefield = new Class({
        toString: 'Multicompositefield',
        extend: CUI.Widget,

        construct: function() {
            this.script = this.$element.find('.js-coral-Multicompositefield-input-template');
            this.ol = this.$element.children('.js-coral-Multicompositefield-list');

            if (this.ol.length === 0) {
                this.ol = $(listTemplate).prependTo(this.$element);
            }

            this.adjustMarkup();
            this.renumber(false);
            this.addListeners();
            
            var self=this;
            if (CUI.options.dataAPI) {
                $(document).on('cui-contentloaded.data-api', function(e) {
                  self.renumber(true);
                });
            }
        },

        adjustMarkup: function() {
            this.$element.addClass('coral-Multifield');
            this.ol.children('.js-coral-Multicompositefield-input').append(removeButton, moveButton);
            this.ol.after(addButton);
        },

        addListeners: function() {
            var self = this;

            this.$element.on('click', '.js-coral-Multicompositefield-add', function() {
                var item = $(fieldTemplate);
                
                var newItems=$.parseHTML(self.script.html().trim());
                var count=self.$element.find(".multicompositefield-item").length+1;
                self.setNumber(newItems,count,true);
                item.find('.js-coral-Multicompositefield-placeholder').replaceWith(newItems);
                item.appendTo(self.ol);
                $(self.ol).trigger('cui-contentloaded');
            });

            this.$element.on('click', '.js-coral-Multicompositefield-remove', function() {
                $(this).closest('.js-coral-Multicompositefield-input').remove();
                self.renumber(true);
            });

            this.$element
                    .on('taphold mousedown', '.js-coral-Multicompositefield-move', function(e) {
                        var item;

                        e.preventDefault();

                        item = $(this).closest('.js-coral-Multicompositefield-input');

                        item.prevAll().addClass('coral-Multifield-input--dragBefore');
                        item.nextAll().addClass('coral-Multifield-input--dragAfter');

                        // Fix height of list element to avoid flickering of page
                        self.ol.css({height: self.ol.height() + $(e.item).height() + 'px'});
                        new CUI.DragAction(e, self.$element, item, [self.ol], 'vertical'); // eslint-disable-line
                    })
                    .on('dragenter', function(e) {
                        self.ol.addClass('drag-over');
                        self.reorderPreview(e);
                    })
                    .on('dragover', function(e) {
                        self.reorderPreview(e);
                    })
                    .on('dragleave', function() {
                        self.ol.removeClass('drag-over').children()
                            .removeClass('coral-Multifield-input--dragBefore coral-Multifield-input--dragAfter');
                    })
                    .on('drop', function(e) {
                        self.reorder($(e.item));
                        self.ol.children()
                            .removeClass('coral-Multifield-input--dragBefore coral-Multifield-input--dragAfter');
                    })
                    .on('dragend', function() {
                        self.ol.css({height: ''});
                    });
            this.$element.closest('form').submit(function(){
            	self.$element.find('[name$="@Delete"]').remove();
            	var count=self.$element.find(".multicompositefield-item").length;
            	var originalCount=self.$element.data("original-count");
            	if(count < originalCount){
            		var name=self.$element.data("name");
            		for(var i=count+1;i<=originalCount;i++){
            			var input = $("<input>").attr("type", "hidden").attr("name", name+"/item_"+i+"@Delete");
            			self.$element.append(input);
            		}
            	}
            });
        },

        reorder: function(item) {
            var before = this.ol.children('.coral-Multifield-input--dragAfter').first(),
                    after = this.ol.children('.coral-Multifield-input--dragBefore').last();

            if (before.length > 0) {
                item.insertBefore(before);
            }
            if (after.length > 0) {
                item.insertAfter(after);
            }

            this.renumber(true);
        },

        reorderPreview: function(e) {
            var pos = this.pagePosition(e);

            this.ol.children(':not(.is-dragging)').each(function() {
                var el = $(this),
                        isAfter = pos.y < el.offset().top + el.outerHeight() / 2;

                el.toggleClass('coral-Multifield-input--dragAfter', isAfter);
                el.toggleClass('coral-Multifield-input--dragBefore', !isAfter);
            });
        },

        renumber: function(includeDataElements) {
        	var self = this;
            $('.multicompositefield-list').each(function() {
                $('.multicompositefield-item', this).each(function(itemIndex) {
                	self.setNumber($(this),itemIndex+1,includeDataElements);
                });
            });
        },
        
        setNumber: function(element,itemIndex,includeDataElements){
        	$('.multicompositefield-field', element).each(function() {
                var contentPath = $(this).data('content-path');
                var contextPathCorrectNumber = contentPath.replace('#', itemIndex);
	            $('input,select,textarea', this).each(function() {
	            	var currentName=$(this).attr('name');
	                if (endsWith(contentPath, currentName) || currentName.match(new RegExp(contentPath.replace('#', '[0-9]*'), 'g'))) {
	                    $(this).attr('name', contextPathCorrectNumber);
	                }else if(currentName.match(new RegExp(contentPath.substring(0,contentPath.lastIndexOf("/")).replace('#', '[0-9]*'), 'g'))){
	                	$(this).attr('name',$(this).attr("name").replace(new RegExp(contentPath.substring(0,contentPath.lastIndexOf("/"))
	                			.replace('#', '[0-9]*'), 'g'),contextPathCorrectNumber.substring(0,contextPathCorrectNumber.lastIndexOf("/"))));
	                }else if(!startsWith(currentName,"./")){
	                	$(this).attr('name', contextPathCorrectNumber.substring(0,contextPathCorrectNumber.lastIndexOf("/")+1) + currentName);
	                }
	                //hacks for fileupload
	                if(includeDataElements){
		                if($(this).data("filenameparameter") && !startsWith($(this).data("filenameparameter"),"./")){
		                	$(this).data("filenameparameter",contextPathCorrectNumber.substring(0,contextPathCorrectNumber.lastIndexOf("/")+1) + $(this).data("filenameparameter"));
		                }
		                if($(this).data("filereferenceparameter") && !startsWith($(this).data("filereferenceparameter"),"./")){
		                	$(this).data("filereferenceparameter",contextPathCorrectNumber.substring(0,contextPathCorrectNumber.lastIndexOf("/")+1) + $(this).data("filereferenceparameter"));
		                }
	                }
	            });
        	});
        },

        pagePosition: function(e) {
            var touch = {},
                    originalEvent;

            if (e.originalEvent) {
                originalEvent = e.originalEvent;

                if (originalEvent.changedTouches && originalEvent.changedTouches.length > 0) {
                    touch = originalEvent.changedTouches[0];
                }
                if (originalEvent.touches && originalEvent.touches.length > 0) {
                    touch = originalEvent.touches[0];
                }
            }

            return {
                x: touch.pageX || e.pageX,
                y: touch.pageY || e.pageY
            };
        }
    });

    CUI.Widget.registry.register('multicompositefield', CUI.Multicompositefield);

        $(document).on('foundation-contentloaded', function(e) {
            CUI.Multicompositefield.init($('[data-init~=multicompositefield]', e.target));
        });
})(jQuery, CUI, Class);
