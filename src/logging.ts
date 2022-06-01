type CssColorPropertySnippet = `color: ${string}`;

const greenText: CssColorPropertySnippet = 'color: lightseagreen';
const yellowText: CssColorPropertySnippet = 'color: gold';
const redText: CssColorPropertySnippet = 'color: red';

// REF: https://www.samanthaming.com/tidbits/40-colorful-console-message/
export function logInColor(
  textColor: CssColorPropertySnippet,
  ...data: unknown[]
): void {
  data
    .map((datum) =>
      typeof datum === 'string' ? [`%c${datum}`, textColor] : [datum]
    )
    .forEach((coloredData) => {
      console.info(...coloredData);
    });
}

export function log(...data: unknown[]): void {
  logInColor(greenText, ...data);
}

export function info(...data: unknown[]): void {
  logInColor(yellowText, ...data);
}

export function debug(...data: unknown[]): void {
  logInColor(redText, ...data);
  // eslint-disable-next-line no-debugger
  debugger;
}

export function error(...data: unknown[]): void {
  logInColor(redText, ...data);
  // eslint-disable-next-line no-debugger
  debugger;
}
