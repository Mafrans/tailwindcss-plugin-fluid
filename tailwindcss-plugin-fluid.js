const plugin = require("tailwindcss/plugin");

const properties = {
  leading: { props: ["lineHeight"], values: "lineHeight", unit: "em" },
  tracking: { props: ["letterSpacing"], values: "letterSpacing", unit: "em" },
  m: { props: ["margin"], values: "spacing", unit: "rem" },
  ml: { props: ["margin-left"], values: "spacing", unit: "rem" },
  mr: { props: ["margin-right"], values: "spacing", unit: "rem" },
  mt: { props: ["margin-top"], values: "spacing", unit: "rem" },
  mb: { props: ["margin-bottom"], values: "spacing", unit: "rem" },
  mx: {
    props: ["margin-left", "margin-right"],
    values: "spacing",
    unit: "rem",
  },
  my: {
    props: ["margin-top", "margin-bottom"],
    values: "spacing",
    unit: "rem",
  },
  p: { props: ["padding"], values: "spacing", unit: "rem" },
  pl: { props: ["padding-left"], values: "spacing", unit: "rem" },
  pr: { props: ["padding-right"], values: "spacing", unit: "rem" },
  pt: { props: ["padding-top"], values: "spacing", unit: "rem" },
  pb: { props: ["padding-bottom"], values: "spacing", unit: "rem" },
  px: {
    props: ["padding-left", "padding-right"],
    values: "spacing",
    unit: "rem",
  },
  py: {
    props: ["padding-top", "padding-bottom"],
    values: "spacing",
    unit: "rem",
  },
  gap: { props: ["gap"], values: "spacing", unit: "rem" },
  ["gap-x"]: { props: ["column-gap"], values: "spacing", unit: "rem" },
  ["gap-y"]: { props: ["row-gap"], values: "spacing", unit: "rem" },
};

module.exports = plugin(({ matchUtilities, theme }) => {
  matchUtilities(makeFluidText(), {
    values: theme("fontSize"),
  });

  for (const [name, { props, values }] of Object.entries(properties)) {
    matchUtilities(makeFluid(name, props), { values: theme(values) });
  }
});

function parseInput(input) {
  if (Array.isArray(input)) {
    input = input[0];
  }

  const [result, value, unit] = /([0-9\-.]+)(px|rem|vw|vh|%|in|cm|ch|em)?/.exec(
    input
  );
  return { result, value, unit };
}

function convertUnit(input, to = "rem") {
  const { value, unit: from } = parseInput(input);

  if (!from) {
    return [value, to];
  }

  if (from === "rem" && to === "px") {
    return [value * 16, to];
  }

  if (from === "px" && to === "rem") {
    return [value / 16, to];
  }

  return [value, from];
}

function parseFont(input) {
  let fontSize = input;
  let lineHeight;
  let letterSpacing;

  if (Array.isArray(input)) {
    [fontSize, lineHeight] = input;

    if (typeof input[1] === "object") {
      lineHeight = input[1].lineHeight;
      letterSpacing = input[1].letterSpacing;
    }
  }

  return { fontSize, lineHeight, letterSpacing };
}

function makeFluidText() {
  return {
    "text-from": (input) => {
      const { fontSize, lineHeight, letterSpacing } = parseFont(input);
      let output = {};

      if (fontSize) {
        output = {
          ...output,
          ...makeFrom("fontSize", ...convertUnit(fontSize, "rem")),
        };
      }

      if (lineHeight) {
        output = {
          ...output,
          ...makeFrom(
            "lineHeight",
            ...convertUnit(lineHeight, properties.leading.unit)
          ),
        };
      }

      if (letterSpacing) {
        output = {
          ...output,
          ...makeFrom(
            "letterSpacing",
            ...convertUnit(letterSpacing, properties.tracking.unit)
          ),
        };
      }

      return output;
    },
    "text-to": (input) => {
      const { fontSize, lineHeight, letterSpacing } = parseFont(input);
      let output = {};

      if (fontSize) {
        output = {
          ...output,
          ...makeTo("fontSize", ...convertUnit(fontSize, "rem")),
        };
      }

      if (lineHeight) {
        output = {
          ...output,
          ...makeTo(
            "lineHeight",
            ...convertUnit(lineHeight, properties.leading.unit)
          ),
        };
      }

      if (letterSpacing) {
        output = {
          ...output,
          ...makeTo(
            "letterSpacing",
            ...convertUnit(letterSpacing, properties.tracking.unit)
          ),
        };
      }

      return output;
    },
  };
}

function makeFluid(name, props) {
  const unit = properties[name].unit;

  return {
    [`${name}-from`]: (i) =>
      props.reduce(
        (acc, prop) => ({ ...acc, ...makeFrom(prop, ...convertUnit(i, unit)) }),
        {}
      ),
    [`${name}-to`]: (i) =>
      props.reduce(
        (acc, prop) => ({ ...acc, ...makeTo(prop, ...convertUnit(i, unit)) }),
        {}
      ),
  };
}

function makeFrom(name, value, unit) {
  return {
    [`--tw-${name}-from`]: `${value}${unit}`.trim(),
    [`--tw-${name}-from-value`]: `${value}`.trim(),
  };
}

function makeTo(name, value, unit) {
  return {
    [`--tw-${name}-to`]: `${value}${unit}`.trim(),
    [`--tw-${name}-to-value`]: `${value}`.trim(),
    [name]: `
      min(
        max(
          min(var(--tw-${name}-from, 0), var(--tw-${name}-to, 0)),
          calc(
            1600vw * (
              var(--tw-${name}-to-value, 0) - var(--tw-${name}-from-value, 0)
            ) / (1920 - 375)
            +
            var(--tw-${name}-from, 0) - (
              var(--tw-${name}-to, 0) - var(--tw-${name}-from, 0)
            ) * (375 / (1920 - 375))
          )
        ),
        max(var(--tw-${name}-from, 0), var(--tw-${name}-to, 0))
      )
    `,
  };
}

