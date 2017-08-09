# jetCheckout - The simple checkout for you e-commerce

> Transform your old e-commerce checkout registration form in a new one.

Transforming the old way of registration form in a new one.

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.githubusercontent.com/bloo_df/jetCheckout/master/dist/jquery.jetroute.min.js
[max]: https://raw.githubusercontent.com/bloo_df/jetCheckout/master/dist/jquery.jetroute.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/jetroute.min.js"></script>
<script>
$("[Selector]").jetCheckout({
    });
</script>
```

## Plugin Configuration and Usage
You need to pass the selector of the form field.

Default Configuration
```javascript
$("[Selector]").jetCheckout({
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
                      class: "ui basic red pointing prompt label",
                  }
              },
              validate: {
                  default: {
                      type: "",
                      pattern: "",
                      message: "",
                      toValidate: function () {
                          return true;
                      }
                  },
                  date: {
                      type: "regex",
                      pattern: /((([0][1-9]|[12][\d])|[3][01])[-/]([0][13578]|[1][02])[-/][1-9]\d\d\d)|((([0][1-9]|[12][\d])|[3][0])[-/]([0][13456789]|[1][012])[-/][1-9]\d\d\d)|(([0][1-9]|[12][\d])[-/][0][2][-/][1-9]\d([02468][048]|[13579][26]))|(([0][1-9]|[12][0-8])[-/][0][2][-/][1-9]\d\d\d)/u,
                      message: "Data de Nascimento inválida."
                  },
                  creditcard: {
                      type: "regex",
                      pattern: /\d{4}-?\d{4}-?\d{4}-?\d{4}/u,
                      message: "Cartão de crédito inválido."
                  },
                  cpfCnpj: {
                      type: "cpfcnpj",
                      message: "CPF/CNPJ inválido."
                  },
                  email: {
                      type: "regex",
                      pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/u,
                      message: "E-mail inválido. Ex: seuemail@provedor.com"
                  },
                  empty: {
                      type: "empty",
                      message: "Campo obrigatório."
                  },
                  name: {
                      type: "name",
                      pattern: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                      message: "Preencha com seu come completo. (Ex: João Silva ou Maria Silva)"
                  },
                  number: {
                      type: "regex",
                      pattern: /^\d+$/u,
                      message: "Somente números."
                  },
                  phone: {
                      type: "regex",
                      pattern: /(^|\()?\s*(\d{2})\s*(\s|\))*(9?\d{4})(\s|-)?(\d{4})($|\n)/u,
                      message: "Telefone inválido. (Ex: (16) 3645-9857 ou (16) 98764-5316)"
                  },
                  select: {
                      type: "select",
                      message: "Escolha uma opção."
                  },
                  zipcode: {
                      type: "zipcode",
                      message: "CEP inválido.",
                      onValidateInputComplete: function () {
                      }
                  }
              },
              onValidateClear: function () {
              },
              onValidateFail: function () {
              },
              onValidateSucess: function () {
              },
              onInputComplete: function () {
              },
              onNext: function () {
              },
              onshowNextField: function () {
              },
              disableEvent: function () {
              },
              onFinishedForm: function (form, fields) {
              },
              onUnFinishedForm: function (form, field) {
              }
});
```

## License

Apache 2.0 © Heitor Ramon Ribeiro
