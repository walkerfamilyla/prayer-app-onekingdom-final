// components/PrayerApp.js
import { useState, useEffect } from "react";
import Image from "next/image";
import dataJson from "../data/prayerData.json";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoEqualEarth } from "d3-geo";
import { ref, set, onValue, remove } from "firebase/database";
import { db } from "../lib/firebase";

export default function PrayerApp() {
  const [data, setData] = useState([]);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [activeCountries, setActiveCountries] = useState({});

  // Unique ID per device/browser
  const sessionId =
    typeof window !== "undefined"
      ? localStorage.getItem("sessionId") ||
        (() => {
          const id = Math.random().toString(36).substring(2, 10);
          localStorage.setItem("sessionId", id);
          return id;
        })()
      : null;

  // Load and shuffle prayer data
  useEffect(() => {
    const shuffled = [...dataJson].sort(() => Math.random() - 0.5);
    setData(shuffled);
  }, []);

  const current = data[index];
  const geoUrl =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
  const projection = geoEqualEarth().scale(185).translate([440, 230]);

  // Listen to active countries from Firebase
  useEffect(() => {
    const activeRef = ref(db, "activeCountries");
    const unsubscribe = onValue(activeRef, (snapshot) => {
      const all = snapshot.val() || {};
      const now = Date.now();

      // Remove entries older than 5 minutes
      const filtered = Object.fromEntries(
        Object.entries(all).filter(([_, val]) => now - val.timestamp < 5 * 60 * 1000)
      );

      setActiveCountries(filtered);
    });

    return () => unsubscribe();
  }, []);

  // Update Firebase with current prayer country
  useEffect(() => {
    if (!current || !sessionId) return;
    const userRef = ref(db, `activeCountries/${sessionId}`);
    set(userRef, { country: current.country, timestamp: Date.now() });

    const handleUnload = () => remove(userRef);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      remove(userRef);
    };
  }, [current, sessionId]);

  const handleNext = () => {
    setFade(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % data.length);
      setFade(false);
    }, 300);
  };

  const handleRestart = () => setIndex(0);

  if (data.length === 0) return <p>Loading prayer data...</p>;

  const normalize = (str = "") =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z\s]/g, "")
      .trim();

  const getFillColor = (geoName, currentCountry) => {
    const normalizedGeo = normalize(geoName);
    const normalizedCurrent = normalize(currentCountry);

    const isCurrent =
      normalizedGeo === normalizedCurrent ||
      normalizedCurrent.includes(normalizedGeo) ||
      normalizedGeo.includes(normalizedCurrent);

    const isPrayedByOthers = Object.entries(activeCountries).some(([id, val]) => {
      if (id === sessionId) return false;
      const normalizedVal = normalize(val.country || "");
      return (
        normalizedVal === normalizedGeo ||
        normalizedVal.includes(normalizedGeo) ||
        normalizedGeo.includes(normalizedVal)
      );
    });

    if (isCurrent) return "#b11a1a"; // red (you)
    if (isPrayedByOthers) return "#007ee5"; // blue (others)
    return "#cfcfcf"; // gray
  };

  return (
    <main>
      {/* === HEADER === */}
      <header>
  <a
    href="https://onekingdom.org"
    target="_blank"
    rel="noopener noreferrer"
    style={{ display: 'inline-block' }}
  >
    <Image
      src="/logo.png"
      alt="One Kingdom Logo"
      width={340}
      height={95}
      priority
      style={{ objectFit: "contain", margin: "0 auto", display: "block" }}
    />
  </a>
</header>

      {/* === INTRO SECTION === */}
      <section
        style={{
          textAlign: "center",
          margin: "2rem auto 1rem",
          maxWidth: "720px",
          padding: "0 1rem",
        }}
      >
        <h1
          style={{
            color: "#b11a1a",
            fontSize: "2rem",
            marginBottom: "0.5rem",
            letterSpacing: "1px",
          }}
        >
          PARTNERING IN PRAYER
        </h1>

        <h2
          style={{
            fontSize: "1.25rem",
            color: "#222",
            marginBottom: "0.75rem",
            fontWeight: "600",
          }}
        >
          Join us as we pray for our One Kingdom partners worldwide.
        </h2>

        <p
          style={{
            fontSize: "0.95rem",
            color: "#444",
            lineHeight: "1.5",
            marginBottom: "1.5rem",
          }}
        >
          The country you are praying for will be highlighted in{" "}
          <strong style={{ color: "#b11a1a" }}>red</strong> so you can see it on
          the map. If you see a country in{" "}
          <strong style={{ color: "#007ee5" }}>blue</strong>, it means someone
          else is currently praying for that country.
        </p>
      </section>

      {/* === MAP === */}
      <div className="map-background-wrapper">
        <div className="map-bg">
          <ComposableMap projection={projection}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const fill = getFillColor(geo.properties.name, current?.country);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill,
                          opacity: fill !== "#cfcfcf" ? 0.9 : 0.35,
                          stroke: "#fff",
                          strokeWidth: 0.4,
                          transition: "fill 0.4s ease",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>

        {/* === PRAYER CARD === */}
        <section className={`prayer-overlay ${fade ? "fade" : ""}`}>
          <h2 className="partner">{current.partner}</h2>
          <h3 className="country">{current.country}</h3>

          <img
            src={`/partners/${(current.image || "")
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace(/[^a-z0-9_.-]/g, "")}`}
            alt={current.partner || "Partner"}
            className="partner-photo"
            onError={(e) => (e.currentTarget.src = "/worldmap.png")}
          />

          <p className="scripture">{current.scripture}</p>

          {/* Centered stacked buttons */}
          <div
            className="buttons"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              marginTop: "1.5rem",
            }}
          >
            <button
              className="next"
              onClick={handleNext}
              style={{
                backgroundColor: "#b11a1a",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "1rem",
                cursor: "pointer",
                width: "220px",
              }}
            >
              🙏 Pray & Next
            </button>

            <button
              className="restart"
              onClick={handleRestart}
              style={{
                backgroundColor: "#000",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "1rem",
                cursor: "pointer",
                width: "220px",
              }}
            >
              🔁 Start Over
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
