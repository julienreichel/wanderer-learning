import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useQuasar, uid } from "quasar";
import { inject } from "vue";
import { convert } from "html-to-text";

export function useIris() {
  const router = useRouter();
  const { t, locale } = useI18n({ useScope: "global" });
  const $q = useQuasar();

  const userAttributes = inject("userAttributes");
  const { userId, isAdmin } = userAttributes.value;

  const canEdit = (item) => {
    return isAdmin || item?.owner === userId;
  };
  const getIconFromType = (type) =>
    ({
      shorttext: "short_text",
      radio: "radio_button_checked",
      checkbox: "check_box",
      feedback: "rate_review",
    })[type] || type;

  return { router, t, locale, $q, uid, canEdit, getIconFromType };
}

export function useFormatter() {
  const defaultOptions = {
    wordwrap: 100,
    formatters: {
      headingFormatter: function (elem, walk, builder, formatOptions) {
        const level = Math.max(1, parseInt(elem.tagName[1], 10) - 0); // Get the heading level (e.g., 1 for <h1>, 2 for <h2>)
        const hashes = "#".repeat(level); // Create the appropriate number of hashes
        builder.openBlock(elem);
        builder.addInline(`\n\n${hashes} `);
        walk(elem.children, builder);
        builder.addInline("\n");
        builder.closeBlock(elem);
      },
    },
    selectors: [
      { selector: "h1", format: "headingFormatter" },
      { selector: "h2", format: "headingFormatter" },
      { selector: "h3", format: "headingFormatter" },
      { selector: "h4", format: "headingFormatter" },
      { selector: "h5", format: "headingFormatter" },
      { selector: "h6", format: "headingFormatter" },
    ],
  };

  const formatService = {
    htmlToMarkdown: (htmlContent, options = defaultOptions) =>
      convert(htmlContent, options).replace(/\n\n/g, "\n"),
    setDefaultOptions: (options) => {
      Object.assign(defaultOptions, options);
    },
    getDefaultOptions: () => defaultOptions,
  };

  return formatService;
}
