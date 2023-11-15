import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="robots"
          content={process.env.NEXT_PUBLIC_BUILD_TARGET == "alpha" ? "noindex" : "all"}
        />
        <link href="https://fonts.googleapis.com/css?family=Space Grotesk" rel="stylesheet" />
        <link
          rel="stylesheet"
          media="screen"
          href="https://fontlibrary.org//face/segment7"
          type="text/css"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.cdnfonts.com/css/cascadia-code" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
