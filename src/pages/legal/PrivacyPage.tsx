import { Link } from 'react-router';
import { LEGAL } from '../../data/legal';
import { LegalLayout, V } from './LegalLayout';

/* Aviso de Privacidad Integral (LFPDPPP, DOF 20/03/2025). Base para que la revise un abogado. */
export default function PrivacyPage() {
  const L = LEGAL;
  return (
    <LegalLayout title="AVISO DE PRIVACIDAD" titleEn="PRIVACY NOTICE" seed={41} stamp="DATOS PROTEGIDOS">
      <p>
        <strong><V v={L.responsable} /></strong>, persona física con RFC <V v={L.rfc} />, que opera el proyecto “Proyect Car” en el
        sitio {L.sitio} (en adelante, “Proyect Car” o “nosotros”), con domicilio en <V v={L.domicilio} />, es responsable del
        tratamiento de los datos personales que nos proporciones, conforme a la Ley Federal de Protección de Datos Personales
        en Posesión de los Particulares (la “Ley”).
      </p>

      <h2><span className="n">1.</span>Qué datos recabamos</h2>
      <p>Cuando compras una pieza o nos escribes, recabamos:</p>
      <ul>
        <li><strong>Identificación y contacto:</strong> nombre de tu marca, correo electrónico y, si lo das, tu Instagram o sitio web.</li>
        <li><strong>Contenido de tu marca:</strong> el logo y el color que subes para rotular la pieza.</li>
        <li><strong>Fiscales (solo si pides factura):</strong> RFC, nombre o razón social, régimen fiscal, código postal fiscal y uso del CFDI.</li>
        <li><strong>De la operación:</strong> pieza comprada, monto, fecha y folio del pago.</li>
      </ul>
      <p>
        <strong>No recabamos datos de tu tarjeta ni de tu cuenta bancaria:</strong> el pago lo procesan directamente Mercado Pago o
        Stripe, bajo sus propios avisos de privacidad. <strong>No tratamos datos personales sensibles.</strong>
      </p>

      <h2><span className="n">2.</span>Para qué los usamos</h2>
      <p><strong>Finalidades necesarias</strong> (sin ellas no podemos darte el servicio):</p>
      <ol>
        <li>Registrar tu compra y confirmar el pago.</li>
        <li>Diseñar, imprimir, instalar y, al terminar la vigencia, retirar el vinil con tu marca.</li>
        <li>Publicar tu marca y tu logo en el carro, en los videos del canal, en el sitio y en redes sociales, como parte del servicio que contratas.</li>
        <li>Contactarte sobre tu pieza (aprobación del diseño, fechas de instalación, cambios).</li>
        <li>Emitir tu factura (CFDI) y cumplir obligaciones fiscales.</li>
        <li>Atender aclaraciones, cancelaciones, reembolsos y solicitudes de derechos ARCO.</li>
      </ol>
      <p><strong>Finalidades adicionales</strong> (puedes negarte y aun así comprar):</p>
      <ol>
        <li>Enviarte noticias del proyecto y avisos de nuevas piezas o temporadas.</li>
        <li>Mencionarte como patrocinador en publicaciones distintas a las del servicio (por ejemplo, un video de agradecimiento).</li>
      </ol>
      <p>
        Para negarte a las finalidades adicionales, marca la casilla correspondiente al comprar o escríbenos a <V v={L.email} />.
        Negarte no afecta tu compra.
      </p>

      <h2><span className="n">3.</span>Con quién los compartimos</h2>
      <table>
        <thead><tr><th>Quién</th><th>Para qué</th><th>¿Requiere tu consentimiento?</th></tr></thead>
        <tbody>
          <tr><td>Servicio de Administración Tributaria (SAT) y proveedor de facturación</td><td>Emitir tu factura y cumplir obligaciones fiscales</td><td>No (obligación legal)</td></tr>
          <tr><td>Autoridades competentes</td><td>Cuando la ley o un mandato de autoridad lo exija</td><td>No</td></tr>
          <tr><td>Taller de rotulado</td><td>Imprimir e instalar tu vinil (solo recibe tu logo, color y la pieza)</td><td>No (es necesario para el servicio)</td></tr>
        </tbody>
      </table>
      <p>
        Además usamos proveedores que tratan datos por nuestra cuenta y bajo nuestras instrucciones (hosting del sitio, correo,
        pasarelas de pago). No vendemos ni rentamos tus datos.
      </p>

      <h2><span className="n">4.</span>Tus derechos ARCO</h2>
      <p>
        Tienes derecho a <strong>Acceder</strong> a tus datos, <strong>Rectificarlos</strong>, <strong>Cancelarlos</strong> u
        <strong> Oponerte</strong> a su uso. Para ejercerlos, envía un correo a <V v={L.email} /> con: tu nombre o el de tu marca, un
        medio para responderte, una copia de tu identificación (o la de tu representante y el documento que lo acredite), los datos
        sobre los que quieres ejercer el derecho y qué pides. Te responderemos en un máximo de 20 días hábiles y, si procede, lo
        haremos efectivo dentro de los 15 días hábiles siguientes.
      </p>
      <p>
        Ten en cuenta que no podremos borrar tu logo de videos ya publicados mientras dure la vigencia contratada, ni datos que la ley
        nos obligue a conservar (por ejemplo, los de tus facturas, durante el plazo que marcan las leyes fiscales).
      </p>

      <h2><span className="n">5.</span>Revocar tu consentimiento y limitar el uso</h2>
      <p>
        Puedes revocar tu consentimiento o pedirnos que limitemos el uso de tus datos por el mismo medio ({' '}<V v={L.email} />). Si
        la revocación afecta una finalidad necesaria, es posible que no podamos seguir prestándote el servicio.
      </p>

      <h2><span className="n">6.</span>Cookies y tecnologías de rastreo</h2>
      <p>
        El sitio <strong>no usa cookies de rastreo ni publicidad</strong>. Solo guarda en tu navegador (almacenamiento local) el idioma
        y la moneda que elegiste, para recordarlos. Puedes borrarlos desde la configuración de tu navegador.
      </p>

      <h2><span className="n">7.</span>Seguridad</h2>
      <p>
        Aplicamos medidas administrativas, técnicas y físicas razonables para proteger tus datos. Si ocurriera una vulneración que
        afecte de forma significativa tus derechos, te avisaremos para que puedas tomar medidas.
      </p>

      <h2><span className="n">8.</span>Cambios a este aviso</h2>
      <p>
        Cualquier cambio se publicará en esta misma página ({L.sitio}/aviso-de-privacidad) con su fecha de actualización.
      </p>

      <h2><span className="n">9.</span>Autoridad</h2>
      <p>
        Si consideras que tu derecho a la protección de datos fue vulnerado, puedes acudir ante la autoridad garante en la materia
        (actualmente, la Secretaría Anticorrupción y Buen Gobierno).
      </p>
      <p>Ver también los <Link to="/terminos">Términos y Condiciones</Link>.</p>
    </LegalLayout>
  );
}
