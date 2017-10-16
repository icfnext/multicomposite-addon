/* global jQuery, CUI, Class */
(function ($, CUI, Class) {
    'use strict';

    var addButton
            = '<button type="button" class="js-coral-Multicompositefield-add coral-Multicompositefield-add coral-MinimalButton">'
            + '<i class="coral-Icon coral-Icon--sizeM coral-Icon--addCircle coral-MinimalButton-icon"></i>'
            + '</button>',

        removeButton
            = '<button type="button" '
            + 'class="js-coral-Multicompositefield-remove coral-Multicompositefield-remove coral-MinimalButton">'
            + '<i class="coral-Icon coral-Icon--sizeM coral-Icon--minusCircle coral-MinimalButton-icon"></i>'
            + '</button>',

        moveButton
            = '<button type="button" class="js-coral-Multicompositefield-move coral-Multicompositefield-move coral-MinimalButton">'
            + '<i class="coral-Icon coral-Icon--sizeM coral-Icon--navigation coral-MinimalButton-icon"></i>'
            + '</button>',

        listTemplate
            = '<ol class="js-coral-Multicompositefield-list coral-Multicompositefield-list"></ol>',

        fieldTemplate
            = '<li class="js-coral-Multicompositefield-input coral-Multicompositefield-input">'
            + '<div class="js-coral-Multicompositefield-placeholder"></div>'
            + removeButton
            + moveButton
            + '</li>',

        fieldTemplateNoMove
            = '<li class="js-coral-Multicompositefield-input coral-Multicompositefield-input">'
            + '<div class="js-coral-Multicompositefield-placeholder"></div>'
            + removeButton
            + '</li>',

        fieldErrorEl = '<span class="coral-Form-fielderror coral-Icon coral-Icon--alert coral-Icon--sizeS" ' +
            'data-init="quicktip" data-quicktip-type="error" data-quicktip-arrow="left"/>',

        /*
         * This is a temporary fix for missing ES6 functionality (String.endsWith).
         * This is an adjusted version of the polyfill from
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
         * If we find that we are using this regularly we should add it as a true polyfill as indicated on that page.
         */
        endsWith = function (subjectString, searchString, position) {
            var lastIndex;

            if (position === undefined || position > subjectString.length) { // eslint-disable-line
                position = subjectString.length;
            }

            position -= searchString.length;
            lastIndex = subjectString.indexOf(searchString, position);

            return lastIndex !== -1 && lastIndex === position;
        },

        startsWith = function (str, prefix) {
            return str.indexOf(prefix) === 0;
        };


    CUI.Multicompositefield = new Class({
        toString: 'Multicompositefield',
        extend: CUI.Widget,

        construct: function () {
            this.script = this.$element.find('.js-coral-Multicompositefield-input-template').last();
            this.ol = this.$element.children('.js-coral-Multicompositefield-list');

            this.allowReorder = this.$element.data("allow-reorder");
            this.limit = this.$element.data("limit");

            if (this.ol.length === 0) {
                this.ol = $(listTemplate).prependTo(this.$element);
            }

            this.adjustMarkup();
            this.renumber(false);
            this.addListeners();

            var self = this;
        },

        adjustMarkup: function () {
            this.$element.parent().addClass('multi-composite-field');
            this.$element.addClass('coral-Multicompositefield');
            this.ol.children('.js-coral-Multicompositefield-input').append(removeButton);
            if (this.allowReorder) {
                this.ol.children('.js-coral-Multicompositefield-input').append(moveButton);
            }
            this.$addElement = $(addButton);
            this.ol.after(this.$addElement);
            this.$element.next().insertBefore(this.$element);
        },

        validate: function (decrementItemsCount) {
            var count = this.$element.find("ol").first().children().length;

            if (decrementItemsCount) {
                count--;
            }

            var valid = count < this.limit;

            if (valid) {
                this.clearLimitError();
            } else {
                this.showLimitError();
            }

            return valid;
        },

        showLimitError: function () {
            var $addButton = this.$element.children(".js-coral-Multicompositefield-add"),
                message = "A maximum of " + this.limit + " items are allowed for this field.";

            $addButton.attr('disabled', 'disabled');

            $(fieldErrorEl).clone()
                .attr("data-quicktip-content", message)
                .insertAfter($addButton);
        },

        clearLimitError: function () {
            this.$element.children(".js-coral-Multicompositefield-add").removeAttr('disabled');
            this.$element.children(".coral-Form-fielderror").tooltip("hide").remove();
        },

        addListeners: function () {
            var self = this;

            this.$addElement.on('click', function (e) {
                var valid = true;

                if (self.limit && self.limit > 0) {
                    valid = self.validate(false);
                }

                if (valid) {
                    var item = self.allowReorder ? $(fieldTemplate) : $(fieldTemplateNoMove);

                    var newItems = $.parseHTML(self.script.html().trim());
                    var count = self.$element.find("ol").first().children().length + 1;

                    self.setNumber(newItems, count, true);
                    item.find('.js-coral-Multicompositefield-placeholder').replaceWith(newItems);
                    item.appendTo(self.ol);
                    $(self.ol).trigger('cui-contentloaded');
                }
            });

            this.$element.on('click', '.js-coral-Multicompositefield-remove', function () {
                if (self.limit && self.limit > 0) {
                    self.validate(true);
                }
            });

            this.$element.on('click', '.js-coral-Multicompositefield-remove', function () {
                var item = $(this).closest(".js-coral-Multicompositefield-input");
                var form = self.$element.closest('form');

                item.find('.coral-Multicompositefield').each(function () {
                    var count = $(this).find("ol").first().children().length;
                    var name = $(this).data("multi-name");
                    var baseName = $(this).data('base-name');

                    for (var i = 0; i <= count; i++) {
                        var input = $("<input>").attr("type", "hidden").attr("name", name + "/" + baseName + i + "@Delete");
                        form.append(input);
                    }
                });

                item.remove();

                if (!self.$element.find("ol").first().children().length) {
                    var name = self.$element.data("name");
                    var input = $("<input>").attr("type", "hidden").attr("name", name + "@Delete");

                    form.append(input);
                }
            });

            this.$element
                .on('taphold mousedown', '.js-coral-Multicompositefield-move', function (e) {
                    var item;

                    e.preventDefault();

                    item = $(this).closest('.js-coral-Multicompositefield-input');

                    item.prevAll().addClass('coral-Multicompositefield-input--dragBefore');
                    item.nextAll().addClass('coral-Multicompositefield-input--dragAfter');

                    // Fix height of list element to avoid flickering of page
                    self.ol.css({height: self.ol.height() + $(e.item).height() + 'px'});
                    new CUI.DragAction(e, self.$element, item, [self.ol], 'vertical'); // eslint-disable-line
                })
                .on('dragenter', function (e) {
                    self.ol.addClass('drag-over');
                    self.reorderPreview(e);
                })
                .on('dragover', function (e) {
                    self.reorderPreview(e);
                })
                .on('dragleave', function () {
                    self.ol.removeClass('drag-over').children()
                        .removeClass('coral-Multicompositefield-input--dragBefore coral-Multicompositefield-input--dragAfter');
                })
                .on('drop', function (e) {
                    self.reorder($(e.item));
                    self.ol.children()
                        .removeClass('coral-Multicompositefield-input--dragBefore coral-Multicompositefield-input--dragAfter');
                })
                .on('dragend', function () {
                    self.ol.css({height: ''});
                });
            this.$element.closest('form').submit(function () {
                self.renumber(true);
                self.$element.children('[name$="@Delete"]').remove();
                var count = self.$element.find("ol").first().children().length;
                var originalCount = self.$element.data("original-count");
                if (count < originalCount) {
                    var name = self.$element.data("multi-name");
                    for (var i = count + 1; i <= originalCount; i++) {
                        var input = $("<input>").attr("type", "hidden").attr("name", name + "/item_" + i + "@Delete");
                        self.$element.append(input);
                    }
                }
            });
        },

        reorder: function (item) {
            var before = this.ol.children('.coral-Multicompositefield-input--dragAfter').first(),
                after = this.ol.children('.coral-Multicompositefield-input--dragBefore').last();

            if (before.length > 0) {
                item.insertBefore(before);
            }
            if (after.length > 0) {
                item.insertAfter(after);
            }

            this.renumber(true);
        },

        reorderPreview: function (e) {
            var pos = this.pagePosition(e);

            this.ol.children(':not(.is-dragging)').each(function () {
                var el = $(this),
                    isAfter = pos.y < el.offset().top + el.outerHeight() / 2;

                el.toggleClass('coral-Multicompositefield-input--dragAfter', isAfter);
                el.toggleClass('coral-Multicompositefield-input--dragBefore', !isAfter);
            });
        },

        renumber: function (includeDataElements) {
            var self = this;
            self.$element.find("ol").first().children().each(function (itemIndex) {
                self.setNumber($(this), itemIndex + 1, includeDataElements);
            });
        },

        setNumber: function (element, itemIndex, includeDataElements) {
            $('.multicompositefield-field', element).each(function () {
                var contentPath = $(this).data('content-path');
                var parentContentPath = $(this).data('parent-content-path');
                var contextPathCorrectNumber = contentPath.replace('#', itemIndex);
                $('input,select,textarea', this).each(function () {
                    var currentName = $(this).attr('name');
                    if (currentName) {
                        var slingHint = "";
                        if (currentName.lastIndexOf("@") > -1) {
                            slingHint = currentName.substring(currentName.lastIndexOf("@"));
                        }
                        if (parentContentPath) {
                            var currentNameSubString = currentName.substring(0, currentName.lastIndexOf("/"));
                            var parentContextPathSubString = parentContentPath.substring(0, parentContentPath.lastIndexOf("/"));
                            if (currentNameSubString.match(new RegExp("^" + parentContextPathSubString.replace('#', '[0-9]*' + "$"), 'g'))) {
                                var subContentPath = contentPath.split(new RegExp(parentContextPathSubString.replace('#', '[0-9]+')))[1];
                                subContentPath = subContentPath.replace('#', itemIndex);
                                $(this).attr('name', currentNameSubString + subContentPath + slingHint);
                            }
                        }
                        if (endsWith(contentPath, currentName) || currentName.match(new RegExp(contentPath.replace('#', '[0-9]*' + "$"), 'g'))) {
                            $(this).attr('name', contextPathCorrectNumber);
                        } else if (currentName.match(new RegExp(contentPath.substring(0, contentPath.lastIndexOf("/")).replace('#', '[0-9]*'), 'g'))) {
                            $(this).attr('name', $(this).attr("name").replace(new RegExp(contentPath.substring(0, contentPath.lastIndexOf("/"))
                                .replace('#', '[0-9]*'), 'g'), contextPathCorrectNumber.substring(0, contextPathCorrectNumber.lastIndexOf("/"))));
                        } else if (!startsWith(currentName, "./")) {
                            $(this).attr('name', contextPathCorrectNumber.substring(0, contextPathCorrectNumber.lastIndexOf("/") + 1) + currentName);
                        }
                        //hacks for fileupload
                        if (includeDataElements) {
                            if ($(this).data("filenameparameter") && !startsWith($(this).data("filenameparameter"), "./")) {
                                $(this).data("filenameparameter", contextPathCorrectNumber.substring(0, contextPathCorrectNumber.lastIndexOf("/") + 1) + $(this).data("filenameparameter"));
                            }
                            if ($(this).data("filereferenceparameter") && !startsWith($(this).data("filereferenceparameter"), "./")) {
                                $(this).data("filereferenceparameter", contextPathCorrectNumber.substring(0, contextPathCorrectNumber.lastIndexOf("/") + 1) + $(this).data("filereferenceparameter"));
                            }
                        }
                    }
                });
            });
        },

        pagePosition: function (e) {
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

    $(document).on('foundation-contentloaded', function (e) {
        CUI.Multicompositefield.init($('[data-init~=multicompositefield]', e.target));
    });
})(jQuery, CUI, Class);
