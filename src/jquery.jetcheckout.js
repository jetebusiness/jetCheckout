/**
 * JetCheckout Plugin
 * Author: Heitor Ramon Ribeiro
 * Email: heitor.ramon@gmail.com
 * WebSite: www.jet.com.br
 * Personal WEb: www.heitorramon.com
 */
;(function ($, window, document, undefined) {

    "use strict";
    const pluginName  = "JetCheckout",
          cleanString = (value) => value.replace(/[^\d]+/g, ""),
          defaults    = {
              debug:              false,
              exec:               "",
              params:             "",
              fieldSelector:      ".field",
              fieldGroupSelector: ".fields",
              activeClass:        "ativo",
              profile:            {
                  active:   "",
                  selector: {
                      pf: ".pessoa.fisica",
                      pj: ".pessoa.juridica"
                  }
              },
              disabled:           {
                  class: "disabled"
              },
              success:            {
                  class:   "success",
                  message: {
                      class: ""
                  }
              },
              warning:            {
                  class:   "warning",
                  message: {
                      class: ""
                  }
              },
              error:              {
                  class:   "error",
                  message: {
                      class: "ui basic red pointing prompt label",
                  }
              },
              validate:           {
                  default:    {
                      type:       "",
                      pattern:    "",
                      message:    "",
                      toValidate: function () {
                          return true;
                      }
                  },
                  date:       {
                      type:    "regex",
                      pattern: `/((([0][1-9]|[12][\d])|[3][01])[-/]([0][13578]|[1][02])[-/][1-9]\d\d\d)|((([0][1-9]|[12][\d])|[3][0])[-/]([0][13456789]|[1][012])[-/][1-9]\d\d\d)|(([0][1-9]|[12][\d])[-/][0][2][-/][1-9]\d([02468][048]|[13579][26]))|(([0][1-9]|[12][0-8])[-/][0][2][-/][1-9]\d\d\d)/u`,
                      message: "Data de Nascimento inválida."
                  },
                  creditcard: {
                      type:    "regex",
                      pattern: `/\d{4}-?\d{4}-?\d{4}-?\d{4}/u`,
                      message: "Cartão de crédito inválido."
                  },
                  cpfCnpj:    {
                      type:    "cpfcnpj",
                      message: "CPF/CNPJ inválido."
                  },
                  email:      {
                      type:    "regex",
                      pattern: `/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/u`,
                      message: "E-mail inválido. Ex: seuemail@provedor.com"
                  },
                  empty:      {
                      type:    "empty",
                      message: "Campo obrigatório."
                  },
                  name:       {
                      type:    "name",
                      pattern: `/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u`,
                      message: "Preencha com seu come completo. (Ex: João Silva ou Maria Silva)"
                  },
                  number:     {
                      type:    "regex",
                      pattern: `/^\d+$/u`,
                      message: "Somente números."
                  },
                  phone:      {
                      type:    "regex",
                      pattern: `/(^|\()?\s*(\d{2})\s*(\s|\))*(9?\d{4})(\s|-)?(\d{4})($|\n)/u`,
                      message: "Telefone inválido. (Ex: (16) 3645-9857 ou (16) 98764-5316)"
                  },
                  select:     {
                      type:    "select",
                      message: "Escolha uma opção."
                  },
                  zipcode:    {
                      type:                    "zipcode",
                      message:                 "CEP inválido.",
                      onValidateInputComplete: function () {
                      }
                  }
              }
          };

    function JetCheckout(element, options) {
        this.element   = element;
        this.settings  = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name     = pluginName;
        this.init();
    }

    $.extend(JetCheckout.prototype, {
        init:                     function () {
            let $element = $(this.element),
                jet      = this;

            $element.find(`${this.settings.fieldGroupSelector}:not([data-jet-active="true"]), ${this.settings.fieldSelector}:not([data-jet-active="true"]), [data-jet-active="false"]`)
                .hide()
                .find("input")
                .each(function () {
                    $(this).attr("disabled", true);
                });

            $element.show();

            $element.find(this.settings.fieldGroupSelector).each(function () {
                $(this).attr('data-jet-field-group', true);
                $.fn[pluginName].setId($(this));
            });

            $element.find(this.settings.fieldSelector).each(function () {
                $.fn[pluginName].setId($(this));

                $(this).attr("data-jet-field", true);
                let $this         = $(this),
                    $input        = $(this).find("input:first"),
                    keypressDelay = (function () {
                        let timer = 0;
                        return function (callback, ms) {
                            clearTimeout(timer);
                            timer = setTimeout(callback, ms);
                        };
                    })();

                $input.keypress(() => {
                    keypressDelay(function () {
                        if (jet.validateField($this)) {
                            jet.settings.onNext.call($this);
                            jet.showNextField($this);
                        }
                        else {

                        }
                    }, 500);
                });
                $input.blur((event) => {
                    jet.settings.onInputComplete.call($this);
                    if (jet.validateField($this)) {
                        jet.settings.onNext.call($this);
                        jet.showNextField($this);
                        if ($(this).attr("data-jet-valid")) {
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
        validateField:            function ($field) {
            $field      = $($field);
            let jet     = this,
                regex   = false,
                isValid = false,
                id      = $field.attr("data-jet-checkout-id"),
                $input  = $field.find("input:first"),
                type    = $input.attr("data-jet-validate"),
                value   = $input.val(),
                message = "";

            if (type === undefined) {
                return true;
            }

            else {
                for (let key in jet.settings.validate) {
                    if (key === type) {
                        let validateOptions = jet.settings.validate[key];
                        message             = validateOptions.message;
                        if (validateOptions.type === "cpfcnpj") {
                            if (cleanString(value).length === 11) {
                                jet.changeProfile("pf");
                                regex = $.fn[pluginName].validateCPF(value);
                                0
                            }
                            else if (cleanString(value).length === 14) {
                                jet.changeProfile("pj");
                                regex = $.fn[pluginName].validateCNPJ(value);
                            }
                        }
                        else if (validateOptions.type === "empty") {
                            if (value !== "") {
                                regex = true;
                            }
                        }
                        else if (validateOptions.type === "function") {
                            regex = validateOptions.toValidate();
                        }
                        else if (validateOptions.type === "name") {
                            if (/[^-\s]\s/g.test(value)) {
                                regex = validateOptions.pattern.test(value);
                            }
                        }
                        else if (validateOptions.type === "regex") {
                            regex = validateOptions.pattern.test(value);
                        }
                        else if (validateOptions.type === "select") {
                            $input = $field.find("select:first");
                            type   = $input.attr("data-jet-validate");
                            value  = $input.val();
                            if (!!value) {
                                jet.fieldIsInvalid($field, id);
                                return false;
                            }
                            else {
                                jet.fieldIsValid($field, id);
                                return true;
                            }
                        }
                        else if (validateOptions.type === "zipcode") {
                            let validacep = /^[0-9]{8}$/;
                            value         = cleanString(value);
                            if (value.length >= 1 && !validacep.test(value)) {
                                regex = false;
                            }
                            else if (validacep.test(value)) {
                                regex = true;
                                validateOptions.onValidateInputComplete();
                            }
                            else {
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
            }
            else {
                jet.fieldIsInvalid($field, id, message);
                return false;
            }
        },
        /**
         * change the field to a valid state
         * @param $field
         * @param id
         */
        fieldIsValid:             function ($field, id) {
            $field  = $($field);
            let jet = this;

            $field.attr("data-jet-valid", true).removeClass(jet.settings.error.class).addClass(jet.settings.success.class);
            $.fn[pluginName].showErrorMsg({remove: true, id: id});
            jet.settings.onValidateSucess.call($field);
        },
        /**
         * Change the field to a invalid state
         * @param $field
         * @param id
         * @param message
         */
        fieldIsInvalid:           function ($field, id, message) {
            $field  = $($field);
            let jet = this;
            $field.attr("data-jet-valid", false).removeClass(jet.settings.success.class).addClass(jet.settings.error.class);
            $.fn[pluginName].showErrorMsg({message: message, id: id, class: jet.settings.error.message.class});

            jet.settings.onValidateFail.call($field);
        },
        /**
         * Change the current active profile.
         * Set by the key of the profiles.selector rules
         *
         * @param profile
         */
        changeProfile:            function (profile) {
            let jet = this;
            for (let key in jet.settings.profile.selector) {
                if (key === profile) {
                    jet.settings.profile.active = jet.settings.profile.selector[key];
                    $(`${jet.settings.profile.selector[key]} > input`).val("").attr("disabled", false);
                }
                $(`${jet.settings.profile.selector[key]}:not(${jet.settings.profile.active}) > input`).hide().val("").attr("disabled", true);
            }
        },
        /**
         * Check if the field belongs to a valid profile selector.
         * @param (field)
         * @returns {boolean}
         */
        belongsToProfileSelector: function ($field) {
            $field  = $($field);
            let jet = this;
            for (let key in jet.settings.profile.selector) {
                if ($field.is(jet.settings.profile.selector[key])) return true;
            }
            return false;
        },
        /**
         * Show the field and add focus to it if is needed.
         * @param (field)
         */
        showElement:              function ($fieldObject, revel = false) {
            $fieldObject = $($fieldObject);
            let jet      = this;
            $fieldObject
                .attr("data-jet-active", true)
                .show()
                .find("input")
                .each(function () {
                    $(this).attr("disabled", false);
                });
            jet.settings.onshowNextField();
            console.log(!!$fieldObject.attr("data-jet-revel"));
            if ($fieldObject.find('select').length >= 1 || revel || !$fieldObject.attr("data-jet-revel")) {
                return;
            }

            $fieldObject
                .find('input:first')
                .focus();

        },
        /**
         * Show the next element of the field.
         * @param (field)
         * @param isGroup {boolean}
         * @returns {boolean}
         */
        showNextField:            function ($currentElement, isGroup = false) {
            $currentElement  = $($currentElement);
            let jet          = this,
                $nextElement = $currentElement.next();

            if (!$currentElement.length) {
                return false;
            }
            if (isGroup) {
                jet.validateShowField($currentElement);
                return false;
            }
            else if (!$nextElement.length) {
                jet.validateShowField($currentElement.parent().next());
                return false;
            }
            else {
                jet.validateShowField($nextElement);
                return false;
            }
        },
        /**
         * Internal Funcion to check the field.
         * @param $currentElement
         * @returns {boolean}
         */
        validateShowField:        function ($currentElement) {
            $currentElement = $($currentElement);
            let jet         = this;

            if ($currentElement.is("form")) {
                return false;
            }
            else if (!!$currentElement.attr("data-jet-revel") && $currentElement.is(jet.settings.fieldSelector)) {
                jet.showElement($currentElement, true);
                jet.showNextField($currentElement);
                return false;
            }
            else if (!(!!$currentElement.attr("data-jet-checkout-id"))) {
                jet.showElement($currentElement);
                jet.showNextField($currentElement);
                return false;
            }

            else if (this.belongsToProfileSelector($currentElement)) {
                if ($currentElement.is(jet.settings.profile.active)) {
                    if (!!$currentElement.attr("data-jet-field-group")) {
                        jet.showElement($currentElement);
                        jet.showNextField($currentElement[0].firstElementChild, true);
                        return false;
                    }
                    else {
                        jet.showElement($currentElement);
                        return false;
                    }
                }
                else {
                    jet.showNextField($currentElement);
                    return false;
                }
            }

            else if (!!$currentElement.attr("data-jet-field-group")) {
                jet.showElement($currentElement);
                jet.showNextField($currentElement[0].firstElementChild, true);
                return false;
            }

            else {
                jet.showElement($currentElement);
                return false;
            }

        },
        /**
         * Return all the current active fields.
         */
        getActiveFields:          function () {
            let jet = this;
            return jet.settings.element.find("[data-jet-active='true']");
        },
        /**
         * Return all the current valid fields.
         */
        getValidFields:           function () {
            let jet = this;
            return jet.settings.element.find(`.${jet.settings.success.class}`);
        },
        /**
         * Return all the current inactive fields.
         */
        getInactiveFields:        function () {
            let jet = this;
            return jet.settings.element.find("[data-jet-active='false']");
        },
        /**
         * Return al the current invalid fields.
         */
        getInvalidFields:         function () {
            let jet = this;
            return jet.settings.element.find(`.${jet.settings.error.class}`);
        }
    });

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" +
                    pluginName, new JetCheckout(this, options));
            }
        });
    };
    /**
     * Make an ID
     * @returns {string}
     */
    $.fn[pluginName].makeId = function () {
        let S4 = () => {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    };
    /**
     * Set an ID to a field.
     * @param (field)
     * @param id
     * @returns {*}
     */
    $.fn[pluginName].setId = function ($field, id = "") {
        $field = $($field);

        if (id === "") {
            id = $.fn[pluginName].makeId();
            $field.attr("data-jet-checkout-id", id);
            return id;
        }
        else {
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
        cnpj = cleanString(cnpj);
        if (cnpj === "") {
            return false;
        }
        if (cnpj.length !== 14) {
            return false;
        }
        if (cnpj === "00000000000000" ||
            cnpj === "11111111111111" ||
            cnpj === "22222222222222" ||
            cnpj === "33333333333333" ||
            cnpj === "44444444444444" ||
            cnpj === "55555555555555" ||
            cnpj === "66666666666666" ||
            cnpj === "77777777777777" ||
            cnpj === "88888888888888" ||
            cnpj === "99999999999999") {
            return false;
        }

        let tamanho = cnpj.length - 2,
            numeros = cnpj.substring(0, tamanho),
            digitos = cnpj.substring(tamanho),
            soma    = 0,
            pos     = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) {
                pos = 9;
            }
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== digitos.charAt(0)) {
            return false;
        }

        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma    = 0;
        pos     = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) {
                pos = 9;
            }
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== digitos.charAt(1)) {
            return false;
        }
        return true;
    };
    /**
     * validate brazilian cpf
     * @param cpf
     * @returns {boolean}
     */
    $.fn[pluginName].validateCPF = function (cpf) {
        cpf = cleanString(cpf);
        if (cpf === "") {
            return false;
        }
        if (cpf.length !== 11 ||
            cpf === "00000000000" ||
            cpf === "11111111111" ||
            cpf === "22222222222" ||
            cpf === "33333333333" ||
            cpf === "44444444444" ||
            cpf === "55555555555" ||
            cpf === "66666666666" ||
            cpf === "77777777777" ||
            cpf === "88888888888" ||
            cpf === "99999999999") {
            return false;
        }
        let add = 0;
        for (let i = 0; i < 9; i++) {
            add += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) {
            rev = 0;
        }
        if (rev !== parseInt(cpf.charAt(9))) {
            return false;
        }
        add = 0;
        for (let i = 0; i < 10; i++) {
            add += parseInt(cpf.charAt(i)) * (11 - i);
        }
        rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) {
            rev = 0;
        }
        if (rev !== parseInt(cpf.charAt(10))) {
            return false;
        }
        return true;
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
        let $field = $(`[data-jet-checkout-id="${params.id}"]`);
        let html   = `<div class="${params.class}" data-error-for="${params.id}">${params.message}</div>`;

        if (params.remove === true) {
            $(`div[data-error-for="${params.id}"]`).remove();
        }
        else {
            if ($field.find(`div[data-error-for="${params.id}"]`).length <= 0) {
                $field.append(html);
            }
        }
    };

})(jQuery, window, document);
