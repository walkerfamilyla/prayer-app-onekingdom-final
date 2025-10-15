// components/PrayerApp.js
import { useState, useEffect } from "react";
import Image from "next/image";
import dataJson from "../data/prayerData.json";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoEqualEarth } from "d3-geo";

export default function PrayerApp() {
  const [data, setData] = useState([]);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);

  // Load prayer data from JSON (shuffled each session)
  useEffect(() => {
    const shuffled = [...dataJson].sort(() => Math.random() - 0.5);
    setData(shuffled);
  }, []);

  if (data.length === 0) {
    return <p>Loading prayer data...</p>;
  }

  const current = data[index];
  const geoUrl =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
  const projection = geoEqualEarth().scale(150).translate([450, 270]);

  // Go to next country
  const handleNext = () => {
    setFade(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % data.length);
      setFade(false);
    }, 300);
  };

  // Restart sequence
  const handleRestart = () => {
    setIndex(0);
  };

  return (
    <main>
      {/* === Header === */}
      <header>
        <Image
          src="/logo.png"
          alt="One Kingdom Logo"
          width={340}
          height={95}
          priority
          style={{ objectFit: "contain", margin: "0 auto" }}
        />
        <p className="tagline">Share Jesus. Speak Jesus. Show Jesus.</p>
      </header>

      {/* === Background map with overlayed content === */}
      <div className="map-background-wrapper">
        <div className="map-bg">
          <ComposableMap projection={projection}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const normalize = (s = "") =>
                    s
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[\u2019']/g, "")
                      .replace(/[^a-z\s]/g, " ")
                      .replace(/\s+/g, " ")
                      .trim();

                  const ALIASES = {
                    usa: "united states of america",
                    us: "united states of america",
                    "ivory coast": "cote divoire",
                    "dominican republic caribbean": "dominican republic",
                    "brazil south america": "brazil",
                    "benin west africa": "benin",
                    "burundi east africa": "burundi",
                    "cambodia asia": "cambodia",
                    "cameroon central africa": "cameroon",
                    "central african republic central africa":
                      "central african republic",
                    "chad central africa": "chad",
                    "columbia south america": "colombia",
                    "cuba caribbean": "cuba",
                    "democratic republic of the congo central africa":
                      "democratic republic of the congo",
                    "egypt africa": "egypt",
                    "germany europe": "germany",
                    "ghana west africa": "ghana",
                    greece: "greece",
                    "guatemala central america": "guatemala",
                    "haiti caribbean": "haiti",
                    "honduras central america": "honduras",
                    "india southeast asia": "india",
                    "indonesia asia": "indonesia",
                    "israel middle east": "israel",
                    "kenya east africa": "kenya",
                    "liberia west africa": "liberia",
                    "malawi east africa": "malawi",
                    "mexico north america": "mexico",
                    "nepal south asia": "nepal",
                    "netherlands europe": "netherlands",
                    "nicaragua central america": "nicaragua",
                    "nigeria west africa": "nigeria",
                    "peru south america": "peru",
                    "philippines asia": "philippines",
                    "romania europe": "romania",
                    "senegal west africa": "senegal",
                    "sierra leone west africa": "sierra leone",
                    "the gambia west africa": "gambia",
                    "togo west africa": "togo",
                    "trinidad tobago caribbean": "trinidad and tobago",
                    "turkey middle east": "turkey",
                    "uganda east africa": "uganda",
                    "zambia east africa": "zambia",
                  };

                  const canon = (n = "") => {
                    const normalized = normalize(n);
                    return ALIASES[normalized] || normalized;
                  };

                  const currentCanon = canon(current?.country || "");
                  const geoCanon = canon(geo.properties.name);

                  const isCurrent =
                    currentCanon &&
                    (geoCanon === currentCanon ||
                      geoCanon.includes(currentCanon) ||
                      currentCanon.includes(geoCanon));

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      className={isCurrent ? "geography-active" : ""}
                      style={{
                        default: {
                          fill: isCurrent ? "#b11a1a" : "#cfcfcf",
                          opacity: isCurrent ? 0.9 : 0.35,
                          stroke: "#ffffff",
                          strokeWidth: 0.4,
                          transition: "fill 0.6s ease, opacity 0.6s ease",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>

        {/* === PRAYER OVERLAY === */}
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

          <div className="buttons">
            <button className="next" onClick={handleNext}>
              🙏 Pray & Next
            </button>
            <button className="restart" onClick={handleRestart}>
              🔁 Start Over
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
