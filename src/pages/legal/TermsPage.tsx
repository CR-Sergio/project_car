import { Link } from 'react-router';
import { IVA } from '../../data/budget';
import { LEGAL, RESTRICTED } from '../../data/legal';
import { LegalLayout, V } from './LegalLayout';

/* Términos y Condiciones de contratación de espacio publicitario. Base para que la revise un abogado. */
export default function TermsPage() {
  const L = LEGAL, iva = Math.round(IVA * 100);
  return (
    <LegalLayout title="TERMINOS Y CONDICIONES" titleEn="TERMS AND CONDITIONS" seed={43} stamp="LÉASE CON CALMA">
      <p>
        Estos términos regulan la contratación de espacios publicitarios en el sitio {L.sitio}, que ofrece <strong><V v={L.responsable} /></strong>,
        persona física con RFC <V v={L.rfc} />, en el {L.regimen}, con domicilio en <V v={L.domicilio} /> (“Proyect Car” o “nosotros”).
        Al comprar una pieza aceptas estos términos y el <Link to="/aviso-de-privacidad">Aviso de Privacidad</Link>.
      </p>

      <h2><span className="n">1.</span>Qué compras</h2>
      <p>
        Compras un <strong>servicio de publicidad</strong>: rotulamos tu marca en vinil sobre una pieza de nuestro Fiat Palio 2013
        y la mostramos en la calle y en los videos del canal durante la vigencia. <strong>No compras la pieza física, ni una parte del
        carro, ni una participación en el project car</strong>; no es una inversión, un préstamo ni una donación, y no da derecho a
        rendimientos de ningún tipo. Cada pieza se vende a una sola marca.
      </p>

      <h2><span className="n">2.</span>Precios, IVA y factura</h2>
      <ul>
        <li>Los precios están en pesos mexicanos y son <strong>más IVA ({iva}%)</strong>. El total con IVA se muestra antes de pagar.</li>
        <li>Los precios en dólares son de referencia, también más IVA; el cobro en dólares lo hace Stripe con el tipo de cambio del día.</li>
        <li>El pago es único por pieza y se hace por Mercado Pago o Stripe. No recibimos ni guardamos datos de tu tarjeta.</li>
        <li>Si necesitas factura (CFDI 4.0), pídela al comprar o dentro del mismo mes del pago, con tus datos fiscales completos.</li>
      </ul>

      <h2><span className="n">3.</span>Cómo funciona después de pagar</h2>
      <ol>
        <li>Nos mandas tu logo en buena resolución (PNG, SVG o PDF) dentro de {L.diasLogo} días hábiles.</li>
        <li>Te enviamos una prueba del diseño sobre la pieza; tienes hasta 2 rondas de cambios.</li>
        <li>Con tu aprobación, imprimimos e instalamos el vinil en un máximo de {L.diasInstalacion} días hábiles.</li>
        <li>Te avisamos cuando la pieza esté lista y te mandamos fotos.</li>
      </ol>

      <h2><span className="n">4.</span>Vigencia y videos</h2>
      <ul>
        <li>Tu vinil se queda <strong>{L.vigenciaMeses} meses</strong> desde la instalación. Al terminar, lo retiramos sin costo para ti, salvo que renueves.</li>
        <li>Tu pieza aparece en al menos <strong>{L.videosMinimos} videos</strong> del canal durante la vigencia. Los videos ya publicados pueden seguir en línea después.</li>
        <li>No garantizamos un número de vistas, seguidores, rutas, horarios ni resultados comerciales.</li>
        <li>Los videos se marcan como <strong>promoción pagada</strong> en cada plataforma, como lo exigen sus reglas.</li>
      </ul>

      <h2><span className="n">5.</span>Si no se llega a la meta</h2>
      <p>
        El servicio <strong>no depende de la meta</strong>: tu pieza se rotula y sale en los videos aunque no se junte todo el
        dinero del project car. Si por causas nuestras no instalamos tu vinil en el plazo del punto 3, te devolvemos el 100% de lo pagado.
      </p>

      <h2><span className="n">6.</span>Cancelaciones y reembolsos</h2>
      <ul>
        <li>Puedes cancelar dentro de los <strong>{L.diasCancelacion} días hábiles</strong> siguientes al pago, siempre que tu vinil no se haya impreso: te devolvemos el 100%.</li>
        <li>Si no aprobamos tu marca (punto 7), te devolvemos el 100%.</li>
        <li>Una vez impreso o instalado el vinil, no hay reembolso, porque el material se hace a la medida de tu marca.</li>
        <li>Los reembolsos se hacen por el mismo medio de pago, en un máximo de 15 días hábiles.</li>
      </ul>

      <h2><span className="n">7.</span>Qué marcas aceptamos</h2>
      <p>Revisamos cada marca antes de rotularla y podemos rechazarla. No aceptamos:</p>
      <ul>{RESTRICTED.es.map(r => <li key={r}>{r}.</li>)}</ul>
      <p>
        Al comprar declaras que eres titular del logo y de la marca, o que tienes permiso para usarlos, y nos das licencia para
        reproducirlos en el vinil, los videos, el sitio y redes sociales durante la vigencia (y en los videos ya publicados después de ella).
        Si un tercero reclama derechos sobre tu logo, tú respondes frente a ese reclamo.
      </p>

      <h2><span className="n">8.</span>Daños al vinil y al carro</h2>
      <ul>
        <li>El carro sigue siendo nuestro y nosotros decidimos rutas, horarios y uso.</li>
        <li>Si tu vinil se daña por vandalismo o accidente, lo reponemos una vez sin costo. El desgaste normal por sol y lluvia no se repone.</li>
        <li>Si el carro queda fuera de circulación de forma permanente, te devolvemos la parte proporcional a los meses que falten.</li>
      </ul>

      <h2><span className="n">9.</span>Responsabilidad</h2>
      <p>
        Nuestra responsabilidad total frente a ti por este servicio se limita al monto que pagaste por tu pieza, salvo lo que la
        ley no permita limitar.
      </p>

      <h2><span className="n">10.</span>Cambios a estos términos</h2>
      <p>Podemos actualizar estos términos; las compras ya hechas se rigen por la versión vigente el día del pago.</p>

      <h2><span className="n">11.</span>Ley aplicable y quejas</h2>
      <p>
        Se aplican las leyes de México. Para cualquier controversia, las partes se someten a los tribunales de Monterrey, Nuevo León.
        Si eres consumidor, también puedes acudir a la Procuraduría Federal del Consumidor (PROFECO).
      </p>

      <h2><span className="n">12.</span>Contacto</h2>
      <p>Dudas, cancelaciones y facturas: <V v={L.email} />.</p>
    </LegalLayout>
  );
}
