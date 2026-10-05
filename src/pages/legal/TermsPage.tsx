import { Link } from 'react-router';
import { LEGAL, RESTRICTED } from '../../data/legal';
import { LegalLayout, V } from './LegalLayout';

/* Términos y Condiciones de contratación de espacio publicitario.
   Escritos con base en contratos de publicidad en vehículos y de patrocinio que ya se usan en el mercado,
   ajustados a la ley mexicana. Base para que la revise un abogado antes de cobrar. */
export default function TermsPage() {
  const L = LEGAL;
  let n = 0; const H = ({ children }: { children: string }) => <h2><span className="n">{++n}.</span>{children}</h2>;
  return (
    <LegalLayout title="TERMINOS Y CONDICIONES" titleEn="TERMS AND CONDITIONS" seed={43} stamp="LÉASE CON CALMA">
      <p>
        Estos Términos y Condiciones (los “Términos”) regulan la contratación de espacios publicitarios en el sitio {L.sitio}, que
        ofrece <strong><V v={L.responsable} /></strong>, con domicilio para recibir notificaciones en <V v={L.domicilio} /> (“Proyect
        Car” o “nosotros”), a la persona o empresa que compra una pieza (el “Cliente” o “tú”).
      </p>
      <p>
        Al marcar las casillas de aceptación y pagar, das tu consentimiento expreso por medios electrónicos, con la misma validez que una
        firma, y declaras haber leído y entendido estos Términos, el <Link to="/aviso-de-privacidad">Aviso de Privacidad</Link> y la
        política de ventas finales de la cláusula 7. Guardamos la fecha y hora de tu aceptación como evidencia. Si no estás de acuerdo,
        no compres.
      </p>

      <H>Definiciones</H>
      <ul>
        <li><strong>Vehículo:</strong> el Fiat Palio 2013 del proyecto, propiedad de Proyect Car.</li>
        <li><strong>Pieza:</strong> la parte del Vehículo que eliges (cofre, puerta, ventana, etc.) y su área aproximada indicada en el sitio.</li>
        <li><strong>Servicio:</strong> apartar la Pieza para tu marca, diseñar el arte sobre ella, imprimir e instalar el vinil, mostrarlo durante la Vigencia y retirarlo al final.</li>
        <li><strong>Vigencia:</strong> el tiempo que tu vinil se queda instalado (cláusula 8).</li>
        <li><strong>Contenido:</strong> los videos, fotos y publicaciones del proyecto en el sitio y en redes sociales.</li>
      </ul>

      <H>Qué compras y qué no</H>
      <p>
        Compras un <strong>servicio de publicidad</strong>. <strong>No compras la Pieza física, ni una parte del Vehículo, ni una
        participación en el project car.</strong> No es una inversión, un préstamo, una preventa de bienes ni una donación, y no da
        derecho a rendimientos, ganancias ni devoluciones de ningún tipo. No crea una sociedad, asociación ni relación laboral entre tú y
        nosotros.
      </p>
      <p>
        Cada Pieza se vende a una sola marca, pero <strong>no hay exclusividad de giro</strong>: otras Piezas pueden venderse a marcas
        de tu mismo ramo, incluso a tu competencia.
      </p>

      <H>Quién puede comprar</H>
      <p>
        Debes ser mayor de edad y tener capacidad para contratar. Si compras a nombre de una empresa o de otra persona, declaras que
        tienes facultades para obligarla, y ambos quedan obligados por estos Términos.
      </p>

      <H>Precio y pago</H>
      <ul>
        <li>Los precios están en pesos mexicanos y son <strong>precio final</strong>: incluyen diseño, impresión, instalación y retiro del vinil. No hay cargos adicionales de nuestra parte.</li>
        <li>Los precios en dólares son de referencia. El cobro en dólares lo hace Stripe con su tipo de cambio; las comisiones o diferencias cambiarias que cobre tu banco son tuyas.</li>
        <li>El pago es único, por adelantado, por Pieza, y se procesa por Mercado Pago o Stripe. No recibimos ni guardamos datos de tu tarjeta.</li>
        <li>Una Pieza se considera vendida solo cuando la pasarela confirma el pago. Si dos personas pagan la misma Pieza, se queda con ella la que pagó primero y a la otra se le devuelve íntegro su pago.</li>
      </ul>

      <H>Inicio del Servicio</H>
      <p>
        El Servicio <strong>empieza en el momento en que se confirma tu pago</strong>: tu Pieza se aparta, se retira de la venta y se
        agenda tu diseño. Al comprar, nos pides expresamente que empecemos de inmediato. La prueba de diseño se entrega dentro de los{' '}
        {L.diasDiseno} días hábiles siguientes a recibir tu logo, por lo que el Servicio se presta dentro de los diez días hábiles
        siguientes a tu compra.
      </p>

      <H>Diseño e instalación</H>
      <ol>
        <li>Nos mandas tu logo en buena calidad (PNG, SVG o PDF) al correo de contacto dentro de los {L.diasLogo} días hábiles siguientes al pago.</li>
        <li>Te enviamos una prueba del diseño sobre la Pieza. Tienes hasta 2 rondas de cambios sin costo. Si no respondes dentro de {L.diasAprobacion} días hábiles, el diseño se da por aprobado.</li>
        <li>Con el diseño aprobado, instalamos el vinil dentro de los {L.diasInstalacion} días hábiles siguientes, sujeto al clima y a la agenda del taller. Te avisamos y te mandamos fotos.</li>
        <li>Si en {L.diasSinLogo} días naturales desde el pago no nos mandas tu logo, rotulamos el nombre de tu marca en texto con el color que elegiste, y eso cuenta como Servicio prestado.</li>
        <li>Los retrasos causados por ti (logo tardío, cambios, falta de respuesta) no son incumplimiento nuestro y no mueven el fin de la Vigencia a tu favor.</li>
        <li>Nosotros decidimos el acomodo técnico del arte en la Pieza (márgenes, cortes, manijas, molduras, vidrios), procurando que tu marca se vea lo mejor posible. En vidrios se usa vinil microperforado y en el parabrisas solo una franja superior, por reglamento de tránsito.</li>
      </ol>

      <H>Todas las ventas son finales</H>
      <p>
        Como tu Pieza se aparta y el Servicio empieza al pagar, y el vinil se hace a la medida de tu marca, <strong>no hay devoluciones,
        cancelaciones ni reembolsos</strong>: ni por cambio de opinión, ni por resultados comerciales, vistas o alcance, ni por cierre o
        cambio de tu negocio, ni por el retiro anticipado de tu vinil por una causa atribuible a ti.
      </p>
      <p>Las únicas excepciones son:</p>
      <ol>
        <li><strong>Si no podemos prestar el Servicio</strong> por una causa atribuible solo a nosotros y no la corregimos dentro de los 30 días naturales siguientes a que nos lo reclames: te devolvemos lo pagado.</li>
        <li><strong>Cobros duplicados o por un monto equivocado:</strong> te devolvemos la diferencia.</li>
        <li><strong>Si no aceptamos tu marca</strong> (cláusula 9): puedes proponer otra dentro de 10 días hábiles. Si tampoco procede, te devolvemos lo pagado menos la comisión que cobró la pasarela de pago.</li>
      </ol>
      <p>
        <strong>Contracargos.</strong> Si inicias un contracargo o desconocimiento de cargo sin causa justificada, podemos suspender el
        Servicio y retirar tu vinil, y presentaremos a la pasarela la evidencia de tu compra y aceptación. Los costos que eso nos genere
        corren por tu cuenta.
      </p>

      <H>Vigencia, videos y resultados</H>
      <ul>
        <li>Tu vinil se queda <strong>{L.vigenciaMeses} meses</strong> contados desde su instalación. Al terminar lo retiramos sin costo para ti. Podemos dejarlo más tiempo sin cargo, pero no estamos obligados a hacerlo. Puedes renovar al precio vigente, si la Pieza sigue disponible.</li>
        <li>Durante la Vigencia tu Pieza aparece en al menos <strong>{L.videosMinimos} videos</strong> del canal. Una aparición es que tu Pieza se vea en el video, no que se hable de tu marca. El Contenido ya publicado puede seguir en línea después de la Vigencia.</li>
        <li>Nosotros decidimos libremente el Contenido: qué, cuándo, cómo y dónde se publica, y las rutas, horarios y uso del Vehículo.</li>
        <li><strong>No garantizamos</strong> número de vistas, seguidores, alcance, kilometraje, zonas, horarios ni ventas o resultados para tu marca.</li>
        <li>Los videos se marcan como promoción pagada o colaboración en cada plataforma, como lo exigen sus reglas.</li>
      </ul>

      <H>Marcas que no aceptamos y retiro de marcas</H>
      <p>Revisamos cada marca antes de imprimir y podemos rechazarla a nuestro criterio. No aceptamos:</p>
      <ul>{RESTRICTED.es.map(r => <li key={r}>{r}.</li>)}</ul>
      <p>
        Podemos retirar o cubrir tu vinil en cualquier momento, <strong>sin reembolso</strong>, si incumples estos Términos, si tu marca
        resulta involucrada en actividades ilegales, engañosas o en un escándalo público que pueda dañar la reputación del proyecto, o si
        una autoridad lo ordena.
      </p>

      <H>Tu marca y nuestro Contenido</H>
      <ul>
        <li>Declaras que eres titular de tu marca, logo y nombre, o que tienes autorización para usarlos, y que no infringen derechos de terceros ni ninguna ley.</li>
        <li>Nos das una licencia gratuita, no exclusiva y para todo el mundo para reproducir tu marca y logo en el vinil, el Contenido, el sitio y redes sociales durante la Vigencia, y para que el Contenido ya publicado permanezca después, incluyendo su uso como archivo o portafolio del proyecto.</li>
        <li>Los videos, fotos, el sitio y la marca “Proyect Car” son nuestros. Puedes compartir las publicaciones con su enlace original; para cualquier otro uso necesitas nuestro permiso por escrito.</li>
      </ul>

      <H>Responsabilidad sobre tu marca</H>
      <p>
        Te obligas a sacar en paz y a salvo a Proyect Car, y a indemnizarlo, frente a cualquier reclamación, demanda o sanción de
        terceros o autoridades que derive de tu marca, logo o contenido, o de tu incumplimiento de estos Términos, incluyendo gastos y
        honorarios razonables de abogados.
      </p>

      <H>El Vehículo y el vinil</H>
      <ul>
        <li>El Vehículo es y sigue siendo nuestro. Decidimos su uso, mantenimiento y reparaciones. Puede estar fuera de circulación temporalmente (taller, trámites, verificaciones) sin que eso cambie la Vigencia.</li>
        <li>El vinil es un material temporal y <strong>no tiene garantía de duración</strong>: el sol, la lluvia, los lavados y el uso normal lo desgastan. Si se daña por vandalismo o accidente, podemos repararlo o reponerlo a nuestro criterio, sin obligación.</li>
        <li>Si el Vehículo sufre un siniestro, robo o pérdida total, o deja de poder circular por causas ajenas a nosotros, a nuestra elección podemos rotular tu marca en otro vehículo del proyecto por el resto de la Vigencia, o seguir mostrándola en el Contenido por ese mismo tiempo. Esto no da lugar a reembolso.</li>
      </ul>

      <H>Caso fortuito, fuerza mayor y plataformas</H>
      <p>
        No somos responsables por retrasos o incumplimientos causados por hechos fuera de nuestro control, como clima, desastres
        naturales, contingencias sanitarias, disposiciones de autoridad, fallas de proveedores o de las pasarelas de pago, o decisiones
        de YouTube, TikTok, Instagram u otras plataformas (eliminar, restringir o desmonetizar videos, o suspender cuentas). En esos
        casos los plazos se recorren el tiempo que dure el impedimento.
      </p>

      <H>Límite de responsabilidad</H>
      <p>
        Nuestra responsabilidad total frente a ti por cualquier causa relacionada con el Servicio se limita al precio que pagaste por tu
        Pieza. No respondemos por daños indirectos, lucro cesante, pérdida de ventas, de clientes o de imagen, salvo dolo o mala fe, o
        lo que la ley no permita limitar.
      </p>

      <H>Cesión</H>
      <p>
        No puedes ceder, revender ni transferir tu Pieza ni estos Términos sin nuestro permiso por escrito. Nosotros podemos ceder
        nuestros derechos y obligaciones a una persona o empresa que continúe el proyecto, manteniendo tus condiciones.
      </p>

      <H>Comunicaciones</H>
      <p>
        Todas las comunicaciones se hacen por correo electrónico: las nuestras, al correo que diste al comprar, y las tuyas, a{' '}
        <V v={L.email} />. Es tu responsabilidad mantener tu correo vigente y revisar tu bandeja de correo no deseado.
      </p>

      <H>Datos personales</H>
      <p>Tus datos se tratan conforme al <Link to="/aviso-de-privacidad">Aviso de Privacidad</Link>.</p>

      <H>Cambios a estos Términos</H>
      <p>
        Podemos actualizar estos Términos y publicaremos la nueva versión con su fecha. Cada compra se rige por la versión vigente el día
        en que se pagó.
      </p>

      <H>Disposiciones generales</H>
      <ul>
        <li>Estos Términos, junto con el Aviso de Privacidad, son el acuerdo completo entre tú y nosotros sobre el Servicio, y sustituyen cualquier plática o promesa anterior.</li>
        <li>Si alguna cláusula resulta inválida, las demás siguen vigentes.</li>
        <li>Que no ejerzamos un derecho en algún momento no significa que renunciemos a él.</li>
        <li>Los títulos son solo de referencia. Si hay versiones en otro idioma, prevalece la versión en español.</li>
      </ul>

      <H>Ley aplicable, jurisdicción y quejas</H>
      <p>
        Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Para su interpretación y cumplimiento, las partes se
        someten a los tribunales competentes de Monterrey, Nuevo León, y renuncian a cualquier otro fuero que pudiera corresponderles.
        Si eres consumidor, conservas tu derecho de acudir a la Procuraduría Federal del Consumidor (PROFECO).
      </p>

      <H>Contacto</H>
      <p>Dudas, logos y aclaraciones: <V v={L.email} />.</p>
    </LegalLayout>
  );
}
