// pages/_app.js
import '../styles/globals.css'; // ✅ must match your actual folder name

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
