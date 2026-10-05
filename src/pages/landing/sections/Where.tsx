import { Ransom } from '../../../components/Ransom';
import { useLocale } from '../../../state/locale';

function MapSvg() {
  return (
    <svg viewBox="0 0 600 440" role="img" aria-labelledby="mapT">
      <title id="mapT">Mapa ilustrativo de Monterrey con el Tec como base y avenidas de alto flujo</title>
      <defs><pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.4" fill="#141214" opacity=".35" /></pattern></defs>
      <ellipse cx="318" cy="128" rx="70" ry="44" fill="url(#dots)" />
      <ellipse cx="225" cy="318" rx="62" ry="38" fill="url(#dots)" />
      <ellipse cx="455" cy="118" rx="44" ry="30" fill="url(#dots)" />
      <path d="M0 214 C80 200 150 226 230 212 S380 196 450 214 S560 226 600 210" fill="none" stroke="#6f8fa8" strokeWidth="16" opacity=".55" />
      <g fill="none" stroke="#141214" strokeLinecap="round">
        <path d="M0 196 C90 184 160 206 240 194 S390 178 460 196 S570 206 600 192" strokeWidth="5" />
        <path d="M0 232 C90 220 160 244 240 232 S390 214 460 232 S570 244 600 228" strokeWidth="3.5" />
        <path d="M196 20 L206 120 L212 196" strokeWidth="4" />
        <path d="M352 232 C362 280 372 320 380 420" strokeWidth="5" />
        <path d="M470 232 C480 290 500 350 520 420" strokeWidth="3.5" />
        <path d="M0 300 C80 300 140 312 225 318 S330 328 380 330" strokeWidth="2.5" strokeDasharray="2 6" />
      </g>
      <path d="M470 330 L500 282 L515 298 L532 262 L572 330 Z" fill="#141214" opacity=".18" />
      <text x="522" y="252" fontFamily="Special Elite, monospace" fontSize="12" fill="#141214" textAnchor="middle">Cerro de la Silla</text>
      <path className="route" d="M380 330 C360 280 340 230 330 160 C330 120 420 100 455 118 C470 160 470 200 452 212 C400 230 300 230 240 200 C220 180 210 140 206 110 C150 160 160 260 225 318 C280 336 340 340 380 330" fill="none" stroke="#e2252e" strokeWidth="3.5" />
      <g fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#141214" fontWeight="700">
        <text x="8" y="182">AV. CONSTITUCIÓN</text>
        <text x="8" y="252">AV. MORONES PRIETO</text>
        <text x="216" y="40">AV. GONZALITOS</text>
        <text x="0" y="0" transform="translate(338 404) rotate(-82)">AV. GARZA SADA</text>
        <text x="0" y="0" transform="translate(498 412) rotate(-70)">AV. REVOLUCIÓN</text>
      </g>
      <g fontFamily="Bowlby One, Impact, sans-serif" fontSize="15" fill="#141214">
        <text x="318" y="122" textAnchor="middle">CENTRO</text>
        <text x="318" y="138" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10">Macroplaza</text>
        <text x="455" y="114" textAnchor="middle">FUNDIDORA</text>
        <text x="225" y="314" textAnchor="middle">VALLE ORIENTE</text>
        <text x="225" y="330" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10">San Pedro</text>
      </g>
      <circle className="pulse" cx="380" cy="330" r="40" fill="#e2252e" opacity=".4" />
      <circle cx="380" cy="330" r="12" fill="#e2252e" stroke="#141214" strokeWidth="3" />
      <rect x="398" y="350" width="150" height="40" fill="#141214" />
      <text x="406" y="367" fontFamily="Bowlby One, Impact, sans-serif" fontSize="13" fill="#f1c232">BASE: TEC DE MTY</text>
      <text x="406" y="382" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#ece6d6">Campus Monterrey</text>
      <g transform="translate(560 40)"><path d="M0 -18 L8 8 L0 2 L-8 8 Z" fill="#141214" /><text y="24" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill="#141214">N</text></g>
    </svg>
  );
}

const SPOTS = [
  { n: 1, cls: 'spot base paper', tape: true },
  { n: 2, cls: 'spot paper' },
  { n: 3, cls: 'spot paper' },
  { n: 4, cls: 'spot web paper' },
] as const;

export function Where() {
  const { t } = useLocale();
  return (
    <section id="donde">
      <div className="sec-head">
        <Ransom as="h2" es="¿DÓNDE LO VAS A VER?" en="WHERE WILL YOU SEE IT?" seed={21} bold />
        <p>{t('donde.p')}</p>
      </div>
      <div className="where">
        <figure className="map paper">
          <span className="tape" aria-hidden="true" />
          <MapSvg />
          <figcaption><span>{t('map.c1')}</span><span>{t('map.c2')}</span></figcaption>
        </figure>
        <div className="spots">
          {SPOTS.map(s => (
            <div className={s.cls} key={s.n}>
              {'tape' in s && <span className="tape" aria-hidden="true" />}
              <div className="tag">{t(`sp.t${s.n}`)}</div><h3>{t(`sp.h${s.n}`)}</h3><p>{t(`sp.p${s.n}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
