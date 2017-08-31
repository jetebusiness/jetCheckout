"use strict";

/**
 * JetCheckout Plugin
 * Author: Heitor Ramon Ribeiro
 * Email: heitor.ramon@gmail.com
 * Website: www.heitorramon.com
 * Repo: https://github.com/bloodf/jetcheckout
 */
;(function ($, window, document, undefined) {

    "use strict";

    var pluginName = "jetCheckout",
        cleanString = function cleanString(value) {
        return value.replace(/[^\d]+/g, "");
    },
        defaults = {
        debug: false,
        fieldSelector: ".field",
        requiredSelector: ".required",
        fieldGroupSelector: ".fields",
        activeClass: "ativo",
        profile: {
            active: "",
            selector: {
                pf: ".pessoa.fisica",
                pj: ".pessoa.juridica"
            }
        },
        disabled: {
            class: "disabled"
        },
        success: {
            class: "success",
            message: {
                class: ""
            }
        },
        warning: {
            class: "warning",
            message: {
                class: ""
            }
        },
        error: {
            class: "error",
            message: {
                class: "ui basic red pointing prompt label"
            }
        },
        validate: {
            default: {
                type: "",
                pattern: "",
                message: "",
                toValidate: function toValidate() {
                    return true;
                }
            },
            date: {
                type: "regex",
                pattern: /(((0[1-9]|[12][0-9])|3[01])[\-/](0[13578]|1[02])[\-/][1-9][0-9][0-9][0-9])|(((0[1-9]|[12][0-9])|30)[\-/](0[13-9]|1[0-2])[\-/][1-9][0-9][0-9][0-9])|((0[1-9]|[12][0-9])[\-/]02[\-/][1-9][0-9]([02468][048]|[13579][26]))|((0[1-9]|[12][0-8])[\-/]02[\-/][1-9][0-9][0-9][0-9])/,
                message: "Data de Nascimento inválida."
            },
            creditcard: {
                type: "regex",
                pattern: /[0-9]{4}\-?[0-9]{4}\-?[0-9]{4}\-?[0-9]{4}/,
                message: "Cartão de crédito inválido."
            },
            cpfCnpj: {
                type: "cpfcnpj",
                message: "CPF/CNPJ inválido."
            },
            email: {
                type: "regex",
                pattern: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g,
                message: "E-mail inválido. Ex: seuemail@provedor.com"
            },
            empty: {
                type: "empty",
                message: "Campo obrigatório."
            },
            name: {
                type: "name",
                pattern: /^[ ',-\.A-Za-z\xC0-\xCF\xD1-\xD6\xD8-\xDD\xDF-\xE5\xE7-\xF6\xF8-\xFD\xFF\u0104-\u0107\u010C\u010D\u0116-\u0119\u012E\u012F\u0141-\u0144\u0152\u0160\u0161\u016A\u016B\u0172\u0173\u0178-\u017E\u2202]+$/,
                message: "Preencha com seu nome completo. (Ex: João Silva ou Maria Silva)"
            },
            number: {
                type: "regex",
                pattern: /^[0-9]+$/,
                message: "Somente números."
            },
            phone: {
                type: "regex",
                pattern: /(^|\()?[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*([0-9]{2})[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*([\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]|\))*(9?[0-9]{4})([\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]|\-)?([0-9]{4})($|\n)/,
                message: "Telefone inválido. (Ex: (16) 3645-9857 ou (16) 98764-5316)"
            },
            select: {
                type: "select",
                message: "Escolha uma opção."
            },
            zipcode: {
                type: "zipcode",
                message: "CEP inválido.",
                onValidateInputComplete: function onValidateInputComplete() {}
            }
        },
        onValidateClear: function onValidateClear() {},
        onValidateFail: function onValidateFail() {},
        onValidateSucess: function onValidateSucess() {},
        onInputComplete: function onInputComplete() {},
        onNext: function onNext() {},
        onshowNextField: function onshowNextField() {},
        disableEvent: function disableEvent() {},
        onFinishedForm: function onFinishedForm(form, fields) {},
        onUnFinishedForm: function onUnFinishedForm(form, field) {}
    };

    function JetCheckout(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    $.extend(JetCheckout.prototype, {
        init: function init() {
            var $element = $(this.element),
                jet = this,
                groupSelector = this.settings.fieldGroupSelector,
                fieldSelector = this.settings.fieldSelector;

            this.tabIndex = 0;

            $element.find(groupSelector + ":not([data-jet-active=\"true\"]), " + fieldSelector + ":not([data-jet-active=\"true\"]), [data-jet-active=\"false\"]").hide().find("input").each(function () {
                $(this).attr("disabled", true);
            });

            $element.show();

            $element.find(groupSelector).each(function () {
                $(this).attr('data-jet-field-group', true);
                $.fn[pluginName].setId($(this));
            });

            $element.find(fieldSelector).each(function () {
                var _this = this;

                $.fn[pluginName].setId($(this));

                $(this).attr("data-jet-field", true);
                var $this = $(this),
                    $input = $(this).find("input:first"),
                    keypressDelay = function () {
                    var timer = 0;
                    return function (callback, ms) {
                        clearTimeout(timer);
                        timer = setTimeout(callback, ms);
                    };
                }();

                $input.keypress(function (e) {
                    var keyCode = e.keyCode || e.which;
                    if (keyCode === 9) {
                        if (!jet.validateField($this)) {
                            e.preventDefault();
                            $input.focus();
                        }
                    }
                    keypressDelay(function () {
                        if (jet.validateField($this)) {
                            jet.settings.onNext.call($this);
                            jet.showNextField($this);
                        }
                    }, 500);
                });
                $input.on("blur change", function () {
                    jet.settings.onInputComplete.call($this);
                    if (jet.validateField($this)) {
                        jet.settings.onNext.call($this);
                        jet.showNextField($this);
                        if ($(_this).attr("data-jet-valid")) {
                            jet.settings.disableEvent($this);
                        }
                    }
                });
            });

            return this;
        },
        /**
         * Validate a field based on the fieldSelector and the validate rules.
         * Returns if the field is valid or not.
         * @param (Field)
         * @returns {boolean}
         */
        validateField: function validateField($field) {
            $field = $($field);
            var jet = this,
                regex = false,
                isValid = false,
                id = $field.attr("data-jet-checkout-id"),
                $input = $field.find("input:first"),
                type = $input.attr("data-jet-validate"),
                fieldBehaviour = $input.attr("data-jet-type"),
                value = $input.val(),
                message = "";
            jet.endOfForm();
            if (type === undefined) {
                return true;
            } else {
                for (var key in jet.settings.validate) {
                    if (key === type) {
                        var validateOptions = jet.settings.validate[key];
                        message = validateOptions.message;
                        if (validateOptions.type === "cpfcnpj") {
                            if (fieldBehaviour === "profileChanger" && cleanString(value).length === 0) {
                                jet.changeProfile("clear");
                                jet.fieldClear($field, id);
                                return false;
                            }
                            if (cleanString(value).length === 11) {
                                jet.changeProfile("pf");
                                regex = $.fn[pluginName].validateCPF(value);
                            } else if (cleanString(value).length === 14) {
                                jet.changeProfile("pj");
                                regex = $.fn[pluginName].validateCNPJ(value);
                            }
                        } else if (validateOptions.type === "empty") {
                            if (value !== "") {
                                regex = true;
                            }
                        } else if (validateOptions.type === "function") {
                            regex = validateOptions.toValidate();
                        } else if (validateOptions.type === "name") {
                            if (/[^-\s]\s/g.test(value)) {
                                regex = validateOptions.pattern.test(value);
                            }
                        } else if (validateOptions.type === "regex") {
                            regex = validateOptions.pattern.test(value);
                        } else if (validateOptions.type === "select") {
                            $input = $field.find("select:first");
                            type = $input.attr("data-jet-validate");
                            value = $input.val();
                            if (!!value) {
                                jet.fieldIsInvalid($field, id);
                                return false;
                            } else {
                                jet.fieldIsValid($field, id);
                                return true;
                            }
                        } else if (validateOptions.type === "zipcode") {
                            var validacep = /^[0-9]{8}$/;
                            value = cleanString(value);
                            if (value === "" || value.length >= 1 && !validacep.test(value)) {
                                regex = false;
                            } else if (validacep.test(value)) {
                                regex = true;
                                validateOptions.onValidateInputComplete();
                            } else {
                                return false;
                            }
                        }

                        if (regex) {
                            isValid = true;
                            break;
                        }
                    }
                }
            }
            if (isValid) {
                jet.fieldIsValid($field, id);
                return true;
            } else {
                jet.fieldIsInvalid($field, id, message);
                return false;
            }
        },
        /**
         * change the field to a valid state
         * @param $field
         * @param id
         */
        fieldClear: function fieldClear($field, id) {
            $field = $($field);
            var jet = this;
            $field.attr("data-jet-valid", true).removeClass(jet.settings.error.class).removeClass(jet.settings.success.class);
            $.fn[pluginName].showErrorMsg({ remove: true, id: id });
            jet.settings.onValidateClear.call($field);
        },
        /**
         * change the field to a valid state
         * @param $field
         * @param id
         */
        fieldIsValid: function fieldIsValid($field, id) {
            $field = $($field);
            var jet = this;

            $field.attr("data-jet-valid", true).removeClass(jet.settings.error.class).addClass(jet.settings.success.class);
            $.fn[pluginName].showErrorMsg({ remove: true, id: id });
            jet.settings.onValidateSucess.call($field);
        },
        /**
         * Change the field to a invalid state
         * @param $field
         * @param id
         * @param message
         */
        fieldIsInvalid: function fieldIsInvalid($field, id, message) {
            $field = $($field);
            var jet = this;
            $field.attr("data-jet-valid", false).removeClass(jet.settings.success.class).addClass(jet.settings.error.class);
            $.fn[pluginName].showErrorMsg({ message: message, id: id, class: jet.settings.error.message.class });

            jet.settings.onValidateFail.call($field);
        },
        /**
         * Change the current active profile.
         * Set by the key of the profiles.selector rules
         *
         * @param profile
         */
        changeProfile: function changeProfile(profile) {
            var jet = this;
            if (profile === "clear") {
                for (var key in jet.settings.profile.selector) {
                    $("" + jet.settings.profile.selector[key]).hide().find("input:first").val("").attr("disabled", true);
                }
                return false;
            }

            for (var _key in jet.settings.profile.selector) {
                if (profile === "clear") {
                    $("" + jet.settings.profile.selector[_key]).hide().find("input:first").val("").attr("disabled", true);
                }
                if (_key === profile) {
                    jet.settings.profile.active = jet.settings.profile.selector[_key];
                    $("" + jet.settings.profile.active).find("input:first").val("").attr("disabled", false);
                }
                $(jet.settings.profile.selector[_key] + ":not(" + jet.settings.profile.active + ")").hide().find("input:first").val("").attr("disabled", true);
            }
        },
        /**
         * Check if the field belongs to a valid profile selector.
         * @param (field)
         * @returns {boolean}
         */
        belongsToProfileSelector: function belongsToProfileSelector($field) {
            $field = $($field);
            var jet = this;
            for (var key in jet.settings.profile.selector) {
                if ($field.is(jet.settings.profile.selector[key])) return true;
            }
            return false;
        },
        /**
         * Show the field and add focus to it if is needed.
         * @param (field)
         */
        showElement: function showElement($fieldObject) {
            var revel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            $fieldObject = $($fieldObject);
            var jet = this;

            $fieldObject.attr("data-jet-active", true).fadeIn().focus().find("input").each(function () {
                $(this).attr("disabled", false);
            });
            if ($fieldObject.is(jet.settings.fieldSelector) && $fieldObject.is("visible")) {
                var index = jet.tabIndex = jet.tabIndex + 1;
                $fieldObject.attr("tabindex", index);
            }
            jet.settings.onshowNextField($fieldObject);
        },
        formStatus: function formStatus() {
            var jet = this,
                required = "" + jet.settings.fieldSelector + jet.settings.requiredSelector,
                error = "" + jet.settings.error.class,
                success = "" + jet.settings.success.class,
                $error = $(required + "." + error + ":visible:not(." + success + ")"),
                $sucess = $(required + "." + success + ":visible:not(." + error + ")"),
                $incomplete = $(required + ":visible:not(." + success + "):not(." + error + ")"),
                $notError = $(required + ":not(." + error + "):visible"),
                $notSucess = $(required + ":visible:not(." + success + ")");

            return {
                complete: !!jet.isTheEnd && !$incomplete.length && !$notSucess.hasClass(error) && $notError.hasClass(success),
                error: $error.hasClass(error),
                success: $notError.hasClass(success) && !$incomplete.length && !$notSucess.hasClass(error),
                fields: {
                    error: $error,
                    success: $sucess,
                    incomplete: $incomplete
                }
            };
        },
        endOfForm: function endOfForm() {
            var jet = this,
                status = jet.formStatus();
            if (jet.executed) {
                if (status.error) {
                    jet.settings.onUnFinishedForm(jet.element, status.fields);
                }
                if (status.success && status.complete) {
                    jet.settings.onFinishedForm(jet.element, status.fields);
                }
            }
        },
        /**
         * Show the next element of the field.
         * @param (field)
         * @param isGroup {boolean}
         * @returns {boolean}
         */
        showNextField: function showNextField($currentElement) {
            var isGroup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            $currentElement = $($currentElement);
            var jet = this,
                $nextElement = $currentElement.next();

            if (!$currentElement.length) {
                return false;
            }
            if (isGroup) {
                jet.validateShowField($currentElement);
                return false;
            } else if (!$nextElement.length) {
                if (!$currentElement.parent().next().length) {
                    if (this.isTheEnd === undefined) {
                        this.isTheEnd = true;
                        jet.executed = true;
                    }
                    this.endOfForm();
                    return true;
                }
                jet.validateShowField($currentElement.parent().next());
                return false;
            } else {
                jet.validateShowField($nextElement);
                return false;
            }
        },
        /**
         * Internal Funcion to check the field.
         * @param $currentElement
         * @returns {boolean}
         */
        validateShowField: function validateShowField($currentElement) {
            $currentElement = $($currentElement);
            var jet = this;

            if ($currentElement.is("form")) {
                return false;
            } else if (!!$currentElement.attr("data-jet-revel") && $currentElement.is(jet.settings.fieldSelector)) {
                jet.showElement($currentElement, true);
                jet.showNextField($currentElement);
                return false;
            } else if (!!!$currentElement.attr("data-jet-checkout-id")) {
                jet.showElement($currentElement);
                jet.showNextField($currentElement);
                return false;
            } else if (this.belongsToProfileSelector($currentElement)) {
                if ($currentElement.is(jet.settings.profile.active)) {
                    if (!!$currentElement.attr("data-jet-field-group")) {
                        jet.showElement($currentElement);
                        jet.showNextField($currentElement[0].firstElementChild, true);
                        return false;
                    } else {
                        jet.showElement($currentElement);
                        return false;
                    }
                } else {
                    jet.showNextField($currentElement);
                    return false;
                }
            } else if (!!$currentElement.attr("data-jet-field-group")) {
                jet.showElement($currentElement);
                jet.showNextField($currentElement[0].firstElementChild, true);
                return false;
            } else {
                jet.showElement($currentElement);
                return false;
            }
        }
    });

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "data-" + pluginName)) {
                $.data(this, "data-" + pluginName, new JetCheckout(this, options));
            }
        });
    };
    /**
     * Make an ID
     * @returns {string}
     */
    $.fn[pluginName].makeId = function () {
        var S4 = function S4() {
            return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
        };
        return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
    };
    /**
     * Set an ID to a field.
     * @param (field)
     * @param id
     * @returns {*}
     */
    $.fn[pluginName].setId = function ($field) {
        var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

        $field = $($field);

        if (id === "") {
            id = $.fn[pluginName].makeId();
            $field.attr("data-jet-checkout-id", id);
            return id;
        } else {
            $field.attr("data-jet-checkout-id", id);
            return null;
        }
    };
    /**
     * validante brazilian cnpj
     * @param cnpj
     * @returns {boolean}
     */
    $.fn[pluginName].validateCNPJ = function (cnpj) {
        var BLACKLIST = ["00000000000000", "11111111111111", "22222222222222", "33333333333333", "44444444444444", "55555555555555", "66666666666666", "77777777777777", "88888888888888", "99999999999999"],
            STRICT_STRIP_REGEX = /[-\/.]/g,
            LOOSE_STRIP_REGEX = /[^\d]/g,
            CNPJ = {};

        var verifierDigit = function verifierDigit(numbers) {
            var index = 2;
            var reverse = numbers.split("").reduce(function (buffer, number) {
                return [parseInt(number, 10)].concat(buffer);
            }, []);

            var sum = reverse.reduce(function (buffer, number) {
                buffer += number * index;
                index = index === 9 ? 2 : index + 1;
                return buffer;
            }, 0);

            var mod = sum % 11;
            return mod < 2 ? 0 : 11 - mod;
        };
        CNPJ.format = function (number) {
            return this.strip(number).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
        };
        CNPJ.strip = function (number, strict) {
            var regex = strict ? STRICT_STRIP_REGEX : LOOSE_STRIP_REGEX;
            return (number || "").toString().replace(regex, "");
        };
        CNPJ.isValid = function (number, strict) {
            var stripped = this.strip(number, strict);
            if (!stripped) {
                return false;
            }
            if (stripped.length !== 14) {
                return false;
            }
            if (BLACKLIST.indexOf(stripped) >= 0) {
                return false;
            }

            var numbers = stripped.substr(0, 12);
            numbers += verifierDigit(numbers);
            numbers += verifierDigit(numbers);

            return numbers.substr(-2) === stripped.substr(-2);
        };
        return CNPJ.isValid(cnpj);
    };
    /**
     * validate brazilian cpf
     * @param cpf
     * @returns {boolean}
     */
    $.fn[pluginName].validateCPF = function (cpf) {
        // Blacklist common values.
        var BLACKLIST = ["00000000000", "11111111111", "22222222222", "33333333333", "44444444444", "55555555555", "66666666666", "77777777777", "88888888888", "99999999999", "12345678909"],
            STRICT_STRIP_REGEX = /[.-]/g,
            LOOSE_STRIP_REGEX = /[^\d]/g,
            CPF = {};

        var verifierDigit = function verifierDigit(numbers) {
            numbers = numbers.split("").map(function (number) {
                return parseInt(number, 10);
            });

            var modulus = numbers.length + 1;

            var multiplied = numbers.map(function (number, index) {
                return number * (modulus - index);
            });

            var mod = multiplied.reduce(function (buffer, number) {
                return buffer + number;
            }) % 11;

            return mod < 2 ? 0 : 11 - mod;
        };
        CPF.strip = function (number, strict) {
            var regex = strict ? STRICT_STRIP_REGEX : LOOSE_STRIP_REGEX;
            return (number || "").toString().replace(regex, "");
        };
        CPF.isValid = function (number, strict) {
            var stripped = this.strip(number, strict);
            if (!stripped) {
                return false;
            }
            if (stripped.length !== 11) {
                return false;
            }
            if (BLACKLIST.indexOf(stripped) >= 0) {
                return false;
            }

            var numbers = stripped.substr(0, 9);
            numbers += verifierDigit(numbers);
            numbers += verifierDigit(numbers);

            return numbers.substr(-2) === stripped.substr(-2);
        };

        return CPF.isValid(cpf);
    };
    /**
     * Show the error message based on the config.
     *
     * @param params{
         * id: (data-jet-checkout-id of the element it will be appended the message)
         * class: class of the message that will be added
         * message: string of the message,
         * remove: {boolean} true: remove the message
         * }
     */
    $.fn[pluginName].showErrorMsg = function (params) {
        var $field = $("[data-jet-checkout-id=\"" + params.id + "\"]");
        var html = "<div class=\"" + params.class + "\" data-error-for=\"" + params.id + "\">" + params.message + "</div>";

        if (params.remove === true) {
            $("div[data-error-for=\"" + params.id + "\"]").remove();
        } else {
            if ($field.find("div[data-error-for=\"" + params.id + "\"]").length <= 0) {
                $field.append(html);
            }
        }
    };
})(jQuery, window, document);