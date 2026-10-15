import { useEffect, useState, type FormEvent } from 'react';
import { API_BASE } from '../../data/config';
import '../../styles/admin.css';

interface PartOrder {
  part_id: string;
  brand: string;
  color: string;
  logo_url: string | null;
  email: string;
  link: string | null;
  folio: string | null;
  price: number;
  currency: string;
  status: 'available' | 'reserved' | 'sold';
  reserved_until: number | null;
  created_at: number;
  isExpired?: boolean;
}

interface MessageOrder {
  id: string;
  part_id: string;
  text: string;
  name: string | null;
  email: string;
  folio: string | null;
  price: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: number;
}

interface Metrics {
  totalRaised: number;
  soldParts: number;
  pendingParts: number;
  pendingMessages: number;
}

export default function AdminPage() {
  const [secret, setSecret] = useState<string>(() => sessionStorage.getItem('pc_admin_secret') || '');
  const [inputKey, setInputKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'sold' | 'messages'>('pending');

  const [parts, setParts] = useState<PartOrder[]>([]);
  const [messages, setMessages] = useState<MessageOrder[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalRaised: 0,
    soldParts: 0,
    pendingParts: 0,
    pendingMessages: 0,
  });

  const isLoggedIn = Boolean(secret);

  const fetchOrders = async (token = secret) => {
    if (!token) return;
    setLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        sessionStorage.removeItem('pc_admin_secret');
        setSecret('');
        throw new Error('Contraseña incorrecta o sesión expirada');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al obtener órdenes');

      setParts(data.parts || []);
      setMessages(data.messages || []);
      setMetrics(data.metrics || { totalRaised: 0, soldParts: 0, pendingParts: 0, pendingMessages: 0 });
    } catch (err: any) {
      setAuthError(err.message || 'Error al conectar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (secret) {
      fetchOrders(secret);
    }
  }, [secret]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    const token = inputKey.trim();
    setLoading(true);
    setAuthError('');

    try {
      const res = await fetch(`${API_BASE}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Clave de administración incorrecta');
      }

      const data = await res.json();
      sessionStorage.setItem('pc_admin_secret', token);
      setSecret(token);
      setParts(data.parts || []);
      setMessages(data.messages || []);
      setMetrics(data.metrics || { totalRaised: 0, soldParts: 0, pendingParts: 0, pendingMessages: 0 });
    } catch (err: any) {
      setAuthError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('pc_admin_secret');
    setSecret('');
    setParts([]);
    setMessages([]);
  };

  const handleAction = async (payload: {
    action: 'approve_part' | 'reject_part' | 'approve_message' | 'reject_message';
    partId?: string;
    messageId?: string;
  }) => {
    const id = payload.partId || payload.messageId || '';
    setActionLoading(id);

    try {
      const res = await fetch(`${API_BASE}/api/admin/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al ejecutar acción');

      await fetchOrders(secret);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatMinutesLeft = (until: number | null) => {
    if (!until) return null;
    const diff = until - Date.now();
    if (diff <= 0) return 'Expirado';
    const mins = Math.ceil(diff / 60000);
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return hours > 0 ? `${hours}h ${remMins}m` : `${remMins}m`;
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-layout">
        <div className="admin-login-card">
          <h2>Panel de Administración</h2>
          <p>Ingresa la contraseña maestra para verificar cobros de PayPal y gestionar ventas.</p>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Contraseña ADMIN_SECRET_KEY"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              required
            />
            {authError && <p className="err">{authError}</p>}
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Verificando...' : 'Acceder al Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendingParts = parts.filter((p) => p.status === 'reserved');
  const soldParts = parts.filter((p) => p.status === 'sold');
  const pendingMessages = messages.filter((m) => m.status === 'pending');
  const totalPending = pendingParts.length + pendingMessages.length;

  return (
    <div className="admin-layout">
      <div className="admin-container">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-title-group">
            <h1>Proyect Car · Panel de Control</h1>
            <p>Validación de pagos PayPal.Me y gestión del inventario D1</p>
          </div>
          <div className="admin-header-actions">
            <button
              className="btn-approve"
              onClick={() => fetchOrders()}
              disabled={loading}
              title="Recargar órdenes"
            >
              {loading ? 'Actualizando...' : '↻ Refrescar'}
            </button>
            <button className="linkbtn" onClick={handleLogout}>
              Cerrar sesión
            </button>
            <a href="/" className="linkbtn" target="_blank" rel="noopener noreferrer">
              Ver Sitio ↗
            </a>
          </div>
        </header>

        {/* Metrics Grid */}
        <div className="admin-metrics-grid">
          <div className="admin-metric-card highlight">
            <div className="label">Total Recaudado</div>
            <div className="val">${metrics.totalRaised.toLocaleString()} MXN</div>
          </div>
          <div className="admin-metric-card">
            <div className="label">Piezas Vendidas</div>
            <div className="val">{metrics.soldParts} / 12</div>
          </div>
          <div className="admin-metric-card">
            <div className="label">Órdenes Pendientes</div>
            <div className="val" style={{ color: totalPending > 0 ? '#d97706' : '#28a745' }}>
              {totalPending}
            </div>
          </div>
          <div className="admin-metric-card">
            <div className="label">Mensajes Aprobados</div>
            <div className="val">
              {messages.filter((m) => m.status === 'approved').length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <span>Órdenes Pendientes</span>
            {totalPending > 0 && <span className="admin-badge">{totalPending}</span>}
          </button>
          <button
            className={`admin-tab ${activeTab === 'sold' ? 'active' : ''}`}
            onClick={() => setActiveTab('sold')}
          >
            <span>Piezas Vendidas ({soldParts.length})</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <span>Todos los Mensajes ({messages.length})</span>
          </button>
        </div>

        {/* Tab 1: Pendientes */}
        {activeTab === 'pending' && (
          <div className="admin-card">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Tipo</th>
                    <th>Concepto / Marca</th>
                    <th>Logo</th>
                    <th>Comprador</th>
                    <th>Monto</th>
                    <th>Tiempo Restante</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingParts.length === 0 && pendingMessages.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
                        🎉 No hay órdenes pendientes por validar en este momento.
                      </td>
                    </tr>
                  ) : null}

                  {/* Piezas pendientes */}
                  {pendingParts.map((p) => {
                    const timeLeft = formatMinutesLeft(p.reserved_until);
                    const isExp = p.isExpired;
                    return (
                      <tr key={p.part_id} className={isExp ? 'expired' : ''}>
                        <td>
                          <b style={{ fontFamily: 'var(--f-mono)', color: '#003087' }}>
                            {p.folio || 'S/F'}
                          </b>
                        </td>
                        <td>
                          <span className="status-tag reserved">Pieza</span>
                        </td>
                        <td>
                          <b>{p.part_id}</b> · {p.brand}
                          {p.link && (
                            <div style={{ fontSize: '12px' }}>
                              <a href={p.link} target="_blank" rel="noopener noreferrer">
                                {p.link}
                              </a>
                            </div>
                          )}
                        </td>
                        <td>
                          {p.logo_url ? (
                            <a href={p.logo_url} target="_blank" rel="noopener noreferrer">
                              <img src={p.logo_url} alt="Logo" className="mini-logo" />
                            </a>
                          ) : (
                            <span style={{ color: '#999', fontSize: '11px' }}>Texto</span>
                          )}
                        </td>
                        <td>
                          <a href={`mailto:${p.email}`}>{p.email}</a>
                        </td>
                        <td>
                          <b>${p.price.toLocaleString()} {p.currency}</b>
                        </td>
                        <td>
                          <span
                            style={{
                              fontFamily: 'var(--f-mono)',
                              fontSize: '12px',
                              color: isExp ? '#d62828' : '#854d0e',
                              fontWeight: 600,
                            }}
                          >
                            ⏳ {timeLeft}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-approve"
                            disabled={actionLoading === p.part_id}
                            onClick={() =>
                              handleAction({ action: 'approve_part', partId: p.part_id })
                            }
                          >
                            ✓ Aprobar
                          </button>
                          <button
                            className="btn-reject"
                            disabled={actionLoading === p.part_id}
                            onClick={() => {
                              if (confirm(`¿Liberar la pieza ${p.part_id} y cancelar el folio ${p.folio}?`)) {
                                handleAction({ action: 'reject_part', partId: p.part_id });
                              }
                            }}
                          >
                            ✕ Liberar
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Mensajes pendientes */}
                  {pendingMessages.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <b style={{ fontFamily: 'var(--f-mono)', color: '#003087' }}>
                          {m.folio || 'S/F'}
                        </b>
                      </td>
                      <td>
                        <span className="status-tag pending">Mensaje</span>
                      </td>
                      <td>
                        "{m.text}"
                        {m.name && (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Techo: <b>{m.name}</b>
                          </div>
                        )}
                      </td>
                      <td>—</td>
                      <td>
                        <a href={`mailto:${m.email}`}>{m.email}</a>
                      </td>
                      <td>
                        <b>${m.price.toLocaleString()} {m.currency}</b>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#666' }}>Salpicadera</span>
                      </td>
                      <td>
                        <button
                          className="btn-approve"
                          disabled={actionLoading === m.id}
                          onClick={() =>
                            handleAction({ action: 'approve_message', messageId: m.id })
                          }
                        >
                          ✓ Aprobar
                        </button>
                        <button
                          className="btn-reject"
                          disabled={actionLoading === m.id}
                          onClick={() => {
                            if (confirm(`¿Rechazar mensaje con folio ${m.folio}?`)) {
                              handleAction({ action: 'reject_message', messageId: m.id });
                            }
                          }}
                        >
                          ✕ Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Vendidas */}
        {activeTab === 'sold' && (
          <div className="admin-card">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pieza</th>
                    <th>Marca</th>
                    <th>Color</th>
                    <th>Logo</th>
                    <th>Folio</th>
                    <th>Comprador</th>
                    <th>Precio</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {soldParts.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
                        Aún no hay piezas marcadas como vendidas.
                      </td>
                    </tr>
                  ) : null}
                  {soldParts.map((p) => (
                    <tr key={p.part_id}>
                      <td><b>{p.part_id}</b></td>
                      <td>{p.brand}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '16px',
                            height: '16px',
                            backgroundColor: p.color,
                            border: '1px solid #000',
                            verticalAlign: 'middle',
                            marginRight: '6px',
                          }}
                        />
                        {p.color}
                      </td>
                      <td>
                        {p.logo_url ? (
                          <a href={p.logo_url} target="_blank" rel="noopener noreferrer">
                            <img src={p.logo_url} alt="Logo" className="mini-logo" />
                          </a>
                        ) : 'Texto'}
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--f-mono)' }}>{p.folio || '—'}</span>
                      </td>
                      <td>{p.email}</td>
                      <td><b>${p.price.toLocaleString()} {p.currency}</b></td>
                      <td>
                        <span className="status-tag sold">Vendida ✓</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Todos los Mensajes */}
        {activeTab === 'messages' && (
          <div className="admin-card">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Salpicadera</th>
                    <th>Mensaje</th>
                    <th>Nombre para el Techo</th>
                    <th>Comprador</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
                        No hay mensajes registrados.
                      </td>
                    </tr>
                  ) : null}
                  {messages.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <span style={{ fontFamily: 'var(--f-mono)' }}>{m.folio || '—'}</span>
                      </td>
                      <td>{m.part_id}</td>
                      <td>"{m.text}"</td>
                      <td>{m.name || '—'}</td>
                      <td>{m.email}</td>
                      <td>
                        <span className={`status-tag ${m.status}`}>
                          {m.status === 'approved'
                            ? 'Aprobado ✓'
                            : m.status === 'pending'
                            ? 'Pendiente'
                            : 'Rechazado'}
                        </span>
                      </td>
                      <td>
                        {m.status === 'pending' ? (
                          <button
                            className="btn-approve"
                            disabled={actionLoading === m.id}
                            onClick={() =>
                              handleAction({ action: 'approve_message', messageId: m.id })
                            }
                          >
                            ✓ Aprobar
                          </button>
                        ) : (
                          <button
                            className="btn-reject"
                            disabled={actionLoading === m.id}
                            onClick={() => {
                              if (confirm(`¿Rechazar mensaje con folio ${m.folio}?`)) {
                                handleAction({ action: 'reject_message', messageId: m.id });
                              }
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
