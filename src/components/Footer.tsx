import { Link } from 'react-router';
import { useLocale } from '../state/locale';

export function Footer() {
  const { t } = useLocale();
  return (
    <footer>
      <div className="wrap">
        <span>{t('foot.1')}</span>
        <span className="foot-links"><Link to="/terminos">{t('foot.terms')}</Link> · <Link to="/aviso-de-privacidad">{t('foot.privacy')}</Link></span>
        <span>{t('foot.tax')}</span>
        <span>{t('foot.2')}</span>
      </div>
    </footer>
  );
}
