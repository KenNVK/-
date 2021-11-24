function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  let selectorRules = {};

  // validate
  function validate(inputElement, rule) {
    let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(
      options.errorSelector
    );
    let errorMessage;

    //  rules selector
    let rules = selectorRules[rule.selector];

    for (let i = 0; i < rules.length; ++i) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          errorMessage = rules[i](formElement.querySelector(rule.selector + ":checked"));
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add("invalid");
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
    }

    return !errorMessage;
  }

  let formElement = document.querySelector(options.form);
  if (formElement) {
    // when submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      let isFormValid = true;

      options.rules.forEach(function (rule) {
        let inputElement = formElement.querySelector(rule.selector);
        let isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // submit with javascript
        if (typeof options.onSubmit === "function") {
          let enableInputs = formElement.querySelectorAll("[name]");
          let formValues = Array.from(enableInputs).reduce(function (values, input) {
            switch (input.type) {
              case "radio":
                values[input.name] = formElement.querySelector(
                  'input[name="' + input.name + '"]:checked'
                ).value;
                break;
              case "checkbox":
                if (!input.matches(":checked")) {
                  values[input.name] = "";
                  return values;
                }
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = [];
                }
                values[input.name].push(input.value);
                break;
              case "file":
                values[input.name] = input.files;
                break;
              default:
                values[input.name] = input.value;
            }
            return values;
          }, {});
          options.onSubmit(formValues);
        }
        // default submit
        else {
          formElement.submit();
        }
      }
    };

    options.rules.forEach(function (rule) {
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      let inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach(function (inputElement) {
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };

        inputElement.oninput = function () {
          let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(
            options.errorSelector
          );
          errorElement.innerText = "";
          getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
        };
      });
    });
  }
}

//add rules
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || "必須です、入力してください";
    },
  };
};

Validator.isId = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      let regex = /^[0-9]{1,4}$/;
      return regex.test(value) ? undefined : message || "社員番号は４桁まで";
    },
  };
};

Validator.isPhoneNumber = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      let regex1 = /^0[0-9]{9}$/;
      let regex2 = /^(090|080|070|050)[0-9]{8}$/;
      return regex1.test(value) || regex2.test(value)
        ? undefined
        : message || "電話番号を入力してください";
    },
  };
};

Validator.isHangaku = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      let regex = /^[ｦ-ﾟ]*$/;
      return regex.test(value) ? undefined : message || "ハンガクを入力してください";
    },
  };
};
