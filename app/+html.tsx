import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Inject Archivo font directly into the HTML head for reliable web loading.
// The font files are bundled at the known hashed paths below.
const FONT_CSS = `
  @font-face {
    font-family: 'Archivo_400Regular';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url('/assets/node_modules/@expo-google-fonts/archivo/400Regular/Archivo_400Regular.2a090e6093b26aa1cc35e899393ca6ad.ttf') format('truetype');
  }
  @font-face {
    font-family: 'Archivo_500Medium';
    font-style: normal;
    font-weight: 500;
    font-display: swap;
    src: url('/assets/node_modules/@expo-google-fonts/archivo/500Medium/Archivo_500Medium.3bd73ab34a70fb017c3e139e1c4057ae.ttf') format('truetype');
  }
  @font-face {
    font-family: 'Archivo_600SemiBold';
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url('/assets/node_modules/@expo-google-fonts/archivo/600SemiBold/Archivo_600SemiBold.68850ad2114e2b7fb5edc12aa4bdda68.ttf') format('truetype');
  }
  @font-face {
    font-family: 'Archivo_700Bold';
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url('/assets/node_modules/@expo-google-fonts/archivo/700Bold/Archivo_700Bold.05670a2716518402b517d63a9e8d3413.ttf') format('truetype');
  }
  @font-face {
    font-family: 'Archivo_800ExtraBold';
    font-style: normal;
    font-weight: 800;
    font-display: swap;
    src: url('/assets/node_modules/@expo-google-fonts/archivo/800ExtraBold/Archivo_800ExtraBold.2a3f365320f15aeaa2b006ad720e5a40.ttf') format('truetype');
  }
  @font-face {
    font-family: 'Archivo_900Black';
    font-style: normal;
    font-weight: 900;
    font-display: swap;
    src: url('/assets/node_modules/@expo-google-fonts/archivo/900Black/Archivo_900Black.0631e43c32c2930ef466fbf6a053844d.ttf') format('truetype');
  }
  @font-face {
    font-family: 'Archivo_900Black_Italic';
    font-style: italic;
    font-weight: 900;
    font-display: swap;
    src: url('/assets/node_modules/@expo-google-fonts/archivo/900Black_Italic/Archivo_900Black_Italic.88122409da770918a28e7da8b751f699.ttf') format('truetype');
  }
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>BETina</title>
        <ScrollViewStyleReset />
        {/* Inline font faces so Archivo loads before first paint */}
        <style dangerouslySetInnerHTML={{ __html: FONT_CSS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
