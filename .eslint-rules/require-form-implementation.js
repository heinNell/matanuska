export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Ensure components that initialize forms have proper form implementation for Matanuska transport platform",
      category: "Best Practices",
      recommended: true
    },
    messages: {
      missingFormElement:
        "Component initializes a form ({{hookName}}) but does not render a form element. Add <form>, <Form>, or Card with form content.",
      missingFormSubmit:
        "Form element found but no submit handler detected. Add onSubmit, handleSubmit, or form action.",
      missingFormValidation:
        "Form hook ({{hookName}}) detected but no validation schema found. Consider adding Zod schema or validation rules.",
      inefficientFormState:
        "Manual form state management detected. Consider using useForm or Form.useForm for better performance and validation."
    },
    schema: [
      {
        type: "object",
        properties: {
          allowedFormComponents: {
            type: "array",
            items: { type: "string" },
            default: ["form", "Form", "Card"]
          },
          customFormHooks: {
            type: "array",
            items: { type: "string" },
            default: ["useFormSubmit", "useInitForm", "useFormState"]
          },
          requiredValidation: {
            type: "boolean",
            default: true
          },
          checkManualFormState: {
            type: "boolean",
            default: true
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const options = context.options[0] || {};
    const allowedFormComponents = options.allowedFormComponents || ["form", "Form", "Card"];
    const customFormHooks = options.customFormHooks || [
      "useFormSubmit",
      "useInitForm",
      "useFormState"
    ];
    const requiredValidation = options.requiredValidation !== false;
    const checkManualFormState = options.checkManualFormState !== false;

    let formHooks = [];
    let hasFormElement = false;
    let hasFormSubmit = false;
    let hasValidation = false;
    let hasManualFormState = false;
    let componentName = "";

    // Enhanced form patterns for Matanuska project
    const FORM_HOOKS = [
      "useForm",
      "useInitForm",
      "useFormState",
      "useFormik",
      "useFormContext",
      "useReactHookForm",
      ...customFormHooks
    ];

    const SUBMIT_PATTERNS = [
      "onSubmit",
      "handleSubmit",
      "submit",
      "onSave",
      "handleSave",
      "action",
      "onFinish"
    ];

    const VALIDATION_PATTERNS = [
      "schema",
      "validationSchema",
      "validate",
      "rules",
      "zodSchema",
      "yupSchema",
      "resolver"
    ];

    const MANUAL_FORM_STATE_PATTERNS = ["formData", "setFormData"];

    return {
      // Detect component name
      "FunctionDeclaration, ArrowFunctionExpression, FunctionExpression"(node) {
        if (node.id?.name) {
          componentName = node.id.name;
        } else if (node.parent?.type === "VariableDeclarator" && node.parent.id?.name) {
          componentName = node.parent.id.name;
        }
      },

      // Detect form hook usage
      CallExpression(node) {
        if (node.callee?.type === "Identifier" && FORM_HOOKS.includes(node.callee.name)) {
          formHooks.push({
            name: node.callee.name,
            node: node
          });

          // Check for validation in arguments
          if (requiredValidation && node.arguments?.length > 0) {
            const firstArg = node.arguments[0];
            if (firstArg.type === "ObjectExpression") {
              const hasValidationProp = firstArg.properties?.some(
                (prop) =>
                  prop.key?.name &&
                  VALIDATION_PATTERNS.some((pattern) => prop.key.name.includes(pattern))
              );
              if (hasValidationProp) {
                hasValidation = true;
              }
            }
          }
        }

        // Detect Ant Design Form.useForm()
        if (
          node.callee?.type === "MemberExpression" &&
          node.callee.object?.name === "Form" &&
          node.callee.property?.name === "useForm"
        ) {
          formHooks.push({
            name: "Form.useForm",
            node: node
          });
        }
      },

      // Detect form elements
      JSXElement(node) {
        const elementName = node.openingElement.name.name;
        if (allowedFormComponents.includes(elementName)) {
          hasFormElement = true;

          // Check for submit handler
          const hasSubmitHandler = node.openingElement.attributes?.some((attr) => {
            return (
              attr.name?.name &&
              SUBMIT_PATTERNS.some((pattern) =>
                attr.name.name.toLowerCase().includes(pattern.toLowerCase())
              )
            );
          });

          if (hasSubmitHandler) {
            hasFormSubmit = true;
          }
        }
      },

      // Check for form props being passed down
      JSXAttribute(node) {
        if (
          node.name?.name &&
          SUBMIT_PATTERNS.some((pattern) =>
            node.name.name.toLowerCase().includes(pattern.toLowerCase())
          )
        ) {
          hasFormSubmit = true;
        }
      },

      // Detect manual form state management
      VariableDeclarator(node) {
        if (
          checkManualFormState &&
          node.id?.name &&
          MANUAL_FORM_STATE_PATTERNS.some((pattern) => node.id.name.includes(pattern))
        ) {
          hasManualFormState = true;
        }
      },

      // Validate at end of component
      "FunctionDeclaration:exit, ArrowFunctionExpression:exit, FunctionExpression:exit"() {
        // Only check if this looks like a React component
        if (!componentName || !componentName.match(/^[A-Z]/)) {
          resetComponentState();
          return;
        }

        // Check form implementation
        if (formHooks.length > 0) {
          // Rule 1: Form hook requires form element
          if (!hasFormElement && !hasFormSubmit) {
            formHooks.forEach((hook) => {
              context.report({
                node: hook.node,
                messageId: "missingFormElement",
                data: { hookName: hook.name }
              });
            });
          }
          // Rule 2: Form element requires submit handler
          else if (hasFormElement && !hasFormSubmit) {
            context.report({
              node: formHooks[0].node,
              messageId: "missingFormSubmit"
            });
          }

          // Rule 3: Form validation recommended
          if (requiredValidation && !hasValidation) {
            context.report({
              node: formHooks[0].node,
              messageId: "missingFormValidation",
              data: { hookName: formHooks[0].name }
            });
          }
        }

        // Rule 4: Suggest form libraries for manual state management
        if (hasManualFormState && formHooks.length === 0) {
          context.report({
            node: context.getSourceCode().ast,
            messageId: "inefficientFormState"
          });
        }

        resetComponentState();
      }
    };

    function resetComponentState() {
      formHooks = [];
      hasFormElement = false;
      hasFormSubmit = false;
      hasValidation = false;
      hasManualFormState = false;
      componentName = "";
    }
  }
};
