import * as T from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import Modal from '../components/Modal.jsx';
import SalesPage from './SalesPage.jsx';
import CustomersPage from './CustomersPage.jsx';
import InventoryPage from './InventoryPage.jsx';
import MaterialsPage from './MaterialsPage.jsx';
import DrawingsPage from './DrawingsPage.jsx';
import FuncionarioTypeSidebar from '../components/funcionario/FuncionarioTypeSidebar.jsx';
import CustomerSearch from '../domains/customers/CustomerSearch.jsx';
import { getTokenUserId } from '../domains/auth/auth.utils.js';
import { createEmptyCustomerForm } from '../domains/customers/customers.forms.js';
import { createCustomer, fetchCustomers, fetchCustomerSales, updateCustomer } from '../domains/customers/customers.service.js';
import { createEmptyItemForm } from '../domains/inventory/inventory.forms.js';
import { MEASURE_OPTIONS, normalizeMeasure } from '../domains/inventory/inventory.constants.js';
import { createInventoryItem, fetchInventory, updateInventoryItem } from '../domains/inventory/inventory.service.js';
import { fetchMaterials } from '../domains/inventory/materials.service.js';
import { getAvailableTypes } from '../domains/permissions/permissions.js';
import { KANBAN_COLUMNS, PAYMENT_METHOD_LABELS, PAYMENT_METHODS, PAYMENT_STATUSES, PAYMENT_STATUS_LABELS, SALE_STATUSES, STATUS_BY_COLUMN, STATUS_LABELS } from '../domains/sales/sales.constants.js';
import { createEmptySaleForm } from '../domains/sales/sales.forms.js';
import { cancelSale, createSale, fetchKanban, fetchSaleDetails, fetchSales, updateSale, updateSaleStatus } from '../domains/sales/sales.service.js';
import { getSlaVariant, todayIsoDate } from '../domains/shared/dates.js';
import { formatCurrency, formatDate, formatDateTime } from '../domains/shared/formatters.js';
import { createEmptyPasswordForm } from '../domains/users/users.forms.js';
import { updateUserPassword } from '../domains/users/users.service.js';
import { fetchDashboardSummary, fetchMonthlyHistory } from '../domains/dashboard/dashboard.service.js';
const l = {
  jsx,
  jsxs,
  Fragment
};
const Xg = getAvailableTypes;
const Ug = fetchKanban;
const zn = fetchSales;
const sr = fetchCustomers;
const Zs = fetchInventory;
const Vo = fetchCustomerSales;
const jp = fetchSaleDetails;
const $o = updateSaleStatus;
const zg = cancelSale;
const wp = createSale;
const Sp = createCustomer;
const Np = updateCustomer;
const Ep = createInventoryItem;
const Zg = normalizeMeasure;
const Cp = updateInventoryItem;
const Fm = fetchMaterials;
const Fg = updateSale;
const kp = getTokenUserId;
const _p = updateUserPassword;
const fds = fetchDashboardSummary;
const fmh = fetchMonthlyHistory;
const Tc = getSlaVariant;
const rv = CustomerSearch;
const Dc = SALE_STATUSES;
const Tr = STATUS_LABELS;
const Ac = PAYMENT_STATUSES;
const Ms = PAYMENT_STATUS_LABELS;
const Oc = PAYMENT_METHODS;
const $a = PAYMENT_METHOD_LABELS;
const nv = STATUS_BY_COLUMN;
const tv = KANBAN_COLUMNS;
const ev = {
  'sla-red': 'Urgente',
  'sla-yellow': 'Atencao',
  'sla-green': 'No prazo'
};
const bc = createEmptySaleForm('RESINA');
const Ic = createEmptyCustomerForm();
const Mc = createEmptyItemForm('RESINA');
const Lc = MEASURE_OPTIONS;
const Va = createEmptyPasswordForm();
const qo = todayIsoDate;
const Fn = formatDate;
const mn = formatCurrency;
const Is = formatDateTime;
const Yf = Modal;
const SUMMARY_PERMISSION_BY_TYPE = {
  RESINA: "ver_resumo_resina",
  FDM: "ver_resumo_fdm"
};
const LEGACY_SUMMARY_PERMISSION = "ver_resumo";
function sv({
  permissions: e = [],
  username: t = "",
  onLogout: n
}) {
  const r = Xg(e),
    [s, a] = T.useState(r[0] || ""),
    [o, i] = T.useState(!1),
    c = T.useRef(null),
    [f, h] = T.useState([]),
    [x, w] = T.useState([]),
    [E, v] = T.useState([]),
    [N, R] = T.useState([]),
    [m, p] = T.useState(null),
    [y, _] = T.useState(null),
    [A, O] = T.useState(!1),
    [k, C] = T.useState(""),
    [K, $] = T.useState(""),
    [V, Ee] = T.useState(null),
    [Me, Ce] = T.useState(null),
    [he, W] = T.useState({
      ...bc,
      type: s
    }),
    [we, D] = T.useState(Ic),
    [M, F] = T.useState({
      ...Mc,
      type: s
    }),
    [b, U] = T.useState(null),
    [oe, Z] = T.useState(Va),
    [lt, ve] = T.useState(""),
    [q, gr] = T.useState(null),
    [ee, J] = T.useState(null),
    [at, Ot] = T.useState([]),
    [z, ie] = T.useState(null),
    [Fe, fn] = T.useState({
      status: "APPROVED",
      payment_status: "PENDING",
      payment_method: ""
    }),
    [G, X] = T.useState(null),
    [On, _e] = T.useState(""),
    [showDeleteConfirm, setShowDeleteConfirm] = T.useState(false),
    [pg, setPg] = T.useState(null),
    [activeSection, setActiveSection] = T.useState('production'),
    [drawingCreateSignal, setDrawingCreateSignal] = T.useState(0),
    [monthlySummary, setMonthlySummary] = T.useState(null),
    [showHistory, setShowHistory] = T.useState(false),
    [monthlyHistory, setMonthlyHistory] = T.useState([]),
    [historyLoading, setHistoryLoading] = T.useState(false),
    [saleMaterials, setSaleMaterials] = T.useState([]);
  const canViewResumoForType = type => !!type && (e.includes(LEGACY_SUMMARY_PERMISSION) || e.includes(SUMMARY_PERMISSION_BY_TYPE[type]));
  const hasVerResumo = canViewResumoForType(s);
  const canOpenDrawings = e.includes('projetista') || e.includes('producao');
  const isDrawingSection = activeSection === 'drawing';
  T.useEffect(() => {
    if (hasVerResumo && s) {
      fds(s).then(d => setMonthlySummary(d)).catch(() => {});
    } else {
      setMonthlySummary(null);
    }
  }, [hasVerResumo, s]);
  T.useEffect(() => {
    if (canOpenDrawings) return;
    if (activeSection === 'drawing') setActiveSection('production');
  }, [canOpenDrawings, activeSection]);
  async function openHistory() {
    if (!hasVerResumo || !s) return;
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const data = await fmh(s);
      setMonthlyHistory(data);
    } catch {
      setMonthlyHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }
  T.useEffect(() => {
    const d = j => {
      c.current && !c.current.contains(j.target) && i(!1);
    };
    return document.addEventListener("mousedown", d), () => document.removeEventListener("mousedown", d);
  }, []);
  T.useEffect(() => {
    Fm().then(d => setSaleMaterials(d)).catch(() => setSaleMaterials([]));
  }, []);
  const ht = async d => {
      try {
        const j = {};
        d && (j.type = d), h(await Ug(j));
      } catch {
        h([]);
      }
    },
    mt = async d => {
      const j = {};
      d && (j.type = d), w(await zn(j));
    },
    pn = async (d = "") => {
      v(await sr(d ? {
        q: d
      } : {}));
    },
    ke = async d => {
      const j = {};
      d && (j.type = d), R(await Zs(j));
    };
  T.useEffect(() => {
    r.length && (!s || !r.includes(s)) && a(r[0]);
  }, [r, s]), T.useEffect(() => {
    if (!s) {
      h([]);
      return;
    }
    ht(s);
  }, [s]);
  const ue = async d => {
      C(""), $(""), O(!0), p(d);
      try {
        d === "new-sale" && W({
          ...bc,
          type: s
        }), d === "customers" && (ve(""), await pn("")), d === "new-customer" && D(Ic), d === "inventory" && (await ke(s)), d === "new-item" && F({
          ...Mc,
          type: s
        }), d === "all-sales" && (await mt(s)), d === "change-password" && Z(Va);
      } catch {
        C("Erro ao carregar dados.");
      } finally {
        O(!1);
      }
    },
    Ye = () => {
      p(null), _(null), ie(null), X(null), gr(null), J(null), Ot([]), U(null), _e(""), setShowDeleteConfirm(false), C(""), $("");
    },
    Ve = async () => {
      if (!y) {
        Ye();
        return;
      }
      const d = y;
      _(null), await ue(d);
    },
    Xe = async (d, j = "customers") => {
      _(j), O(!0), C(""), p("customer-detail");
      try {
        gr(d), Ot(await Vo(d.id));
      } catch {
        Ot([]), C("Erro ao carregar pedidos do cliente.");
      } finally {
        O(!1);
      }
    },
    _t = () => {
      q && (J({
        type: q.type || "PF",
        name: q.name || "",
        phone: q.phone || "",
        document: q.document || "",
        email: q.email || "",
        notes: q.notes || ""
      }), _("customer-detail"), C(""), p("edit-customer"));
    },
    qt = async (d, j = null) => {
      const u = typeof d == "string" ? d : d.id;
      j && _(j), O(!0), C(""), p("sale-detail");
      try {
        const g = await jp(u);
        ie(g), fn({
          status: g.status,
          payment_status: g.payment_status,
          payment_method: g.payment_method || ""
        }), X({
          customer_id: g.customer_id || null,
          customer_name_snapshot: g.customer_name_snapshot || "",
          type: g.type || s || "RESINA",
          material_type: g.material_type || "",
          material_color: g.material_color || "",
          weight_grams: g.weight_grams != null ? String(g.weight_grams) : "",
          status: g.status || "BUDGET",
          payment_status: g.payment_status || "PENDING",
          payment_method: g.payment_method || "",
          sale_date: g.sale_date ? String(g.sale_date).slice(0, 10) : qo(),
          due_date: g.due_date ? String(g.due_date).slice(0, 10) : "",
          total: String(g.total || ""),
          notes: g.notes || ""
        }), _e("");
      } catch {
        ie(null), C("Erro ao carregar detalhes do pedido.");
      } finally {
        O(!1);
      }
    },
    Ln = () => {
      z && (X({
        customer_id: z.customer_id || null,
        customer_name_snapshot: z.customer_name_snapshot || "",
        type: z.type || s || "RESINA",
        material_type: z.material_type || "",
        material_color: z.material_color || "",
        weight_grams: z.weight_grams != null ? String(z.weight_grams) : "",
        status: z.status || "BUDGET",
        payment_status: z.payment_status || "PENDING",
        payment_method: z.payment_method || "",
        sale_date: z.sale_date ? String(z.sale_date).slice(0, 10) : qo(),
        due_date: z.due_date ? String(z.due_date).slice(0, 10) : "",
        total: String(z.total || ""),
        notes: z.notes || ""
      }), _("sale-detail"), C(""), p("edit-sale"));
    },
    Wl = (d, j) => {
      Ee(j), d.dataTransfer.effectAllowed = "move";
    },
    Ql = (d, j) => {
      d.preventDefault(), d.dataTransfer.dropEffect = "move", Ce(j);
    },
    Kl = async (d, j) => {
      if (d.preventDefault(), Ce(null), !V) return;
      const u = nv[j],
        g = f.find(L => L.id === V);
      if (!g || g.status === u) {
        Ee(null);
        return;
      }
      try {
        await $o(V, {
          status: u
        }), await ht(s);
      } catch {
        C("Nao foi possivel mover o pedido.");
      } finally {
        Ee(null);
      }
    },
    Jl = async u => {
      var d, j;
      u && typeof u.preventDefault == "function" && u.preventDefault();
      if (z) {
        C("");
        try {
          await zg(z.id, On), await ht(s), y === "all-sales" && (await mt(s)), y === "customer-detail" && q != null && q.id && Ot(await Vo(q.id)), _e(""), setShowDeleteConfirm(false), await Ve();
        } catch (u) {
          C(((j = (d = u == null ? void 0 : u.response) == null ? void 0 : d.data) == null ? void 0 : j.message) || "Senha invalida ou erro ao excluir pedido.");
        }
      }
    },
    Gl = async () => {
      var d, j;
      C("");
      try {
        const u = Number(he.total) || 0;
        await wp({
          ...he,
          subtotal: u,
          discount_total: 0,
          total: u,
          material_type: he.material_type || null,
          material_color: he.material_color || null,
          weight_grams: he.weight_grams !== "" ? Number(he.weight_grams) : null,
          due_date: he.due_date || null,
          payment_method: he.payment_method || null,
          customer_name_snapshot: he.customer_name_snapshot || "Venda generica"
        }), await ht(s), Ye();
      } catch (u) {
        C(((j = (d = u == null ? void 0 : u.response) == null ? void 0 : d.data) == null ? void 0 : j.message) || "Erro ao salvar venda.");
      }
    },
    Yl = async () => {
      var d, j;
      C("");
      try {
        await Sp(we), await ue("customers");
      } catch (u) {
        C(((j = (d = u == null ? void 0 : u.response) == null ? void 0 : d.data) == null ? void 0 : j.message) || "Erro ao salvar cliente.");
      }
    },
    Xl = async () => {
      var d, j;
      if (!(!q || !ee)) {
        C("");
        try {
          await Np(q.id, ee), gr(u => ({
            ...(u || {}),
            ...ee
          })), await Xe({
            ...q,
            ...ee
          }, "customers");
        } catch (u) {
          C(((j = (d = u == null ? void 0 : u.response) == null ? void 0 : d.data) == null ? void 0 : j.message) || "Erro ao atualizar cliente.");
        }
      }
    },
    De = async () => {
      var d, j;
      C("");
      try {
        await Ep({
          ...M,
          min_qty: Number(M.min_qty) || 0,
          current_qty: Number(M.current_qty) || 0
        }), await ue("inventory");
      } catch (u) {
        C(((j = (d = u == null ? void 0 : u.response) == null ? void 0 : d.data) == null ? void 0 : j.message) || "Erro ao salvar produto em estoque.");
      }
    },
    kt = d => {
      U({
        id: d.id,
        name: d.name,
        brand: d.brand || "",
        category: d.category,
        type: d.type || "RESINA",
        unit: Zg(d.unit),
        min_qty: String(d.min_qty),
        current_qty: String(d.current_qty)
      }), _("inventory"), C(""), p("edit-item");
    },
    Zl = async () => {
      var d, j;
      if (C(""), !!b) try {
        await Cp(b.id, {
          name: b.name,
          brand: b.brand,
          category: b.category,
          type: b.type,
          unit: b.unit,
          min_qty: Number(b.min_qty) || 0,
          current_qty: Number(b.current_qty) || 0
        }), await ue("inventory");
      } catch (u) {
        C(((j = (d = u == null ? void 0 : u.response) == null ? void 0 : d.data) == null ? void 0 : j.message) || "Erro ao atualizar produto.");
      }
    },
    ea = d => {
      ve(d), pn(d).catch(() => {
        C("Erro ao buscar clientes.");
      });
    },
    ta = async () => {
      var d, j;
      if (z) {
        C("");
        try {
          const payload = {};
          if (Fe.status !== z.status) payload.status = Fe.status;
          if (Fe.payment_status !== z.payment_status) payload.payment_status = Fe.payment_status;
          if ((Fe.payment_method || null) !== (z.payment_method || null)) payload.payment_method = Fe.payment_method || null;
          if (Object.keys(payload).length === 0) {
            await qt(z.id, y);
            return;
          }
          await $o(z.id, payload), await ht(s), await qt(z.id, y);
        } catch (u) {
          C(((j = (d = u == null ? void 0 : u.response) == null ? void 0 : d.data) == null ? void 0 : j.message) || "Erro ao atualizar pedido.");
        }
      }
    },
    na = async () => {
      var d, j;
      if (!(!z || !G)) {
        C("");
        try {
          const u = Number(G.total) || 0;
          await Fg(z.id, {
            customer_name_snapshot: G.customer_name_snapshot || z.customer_name_snapshot,
            type: G.type || z.type,
            material_type: G.material_type || null,
            material_color: G.material_color || null,
            weight_grams: G.weight_grams !== "" ? Number(G.weight_grams) : null,
            status: G.status || z.status,
            payment_status: G.payment_status || z.payment_status,
            payment_method: Object.prototype.hasOwnProperty.call(G, "payment_method") ? (G.payment_method || null) : (z.payment_method || null),
            sale_date: G.sale_date || z.sale_date,
            due_date: G.due_date || null,
            subtotal: u,
            discount_total: Number(z.discount_total) || 0,
            total: u,
            notes: G.notes || null
          }), await ht(s), y === "all-sales" && (await mt(s)), await qt(z.id, y || "sale-detail");
        } catch (u) {
          C(((j = (d = u == null ? void 0 : u.response) == null ? void 0 : d.data) == null ? void 0 : j.message) || "Erro ao alterar pedido.");
        }
      }
    },
    gs = async () => {
      var d, j;
      if (C(""), $(""), oe.nova_senha !== oe.confirma_senha) {
        C("As senhas nao coincidem.");
        return;
      }
      if (oe.nova_senha.length < 4) {
        C("A nova senha deve ter pelo menos 4 caracteres.");
        return;
      }
      try {
        const u = kp();
        await _p(u, {
          senha_atual: oe.senha_atual,
          nova_senha: oe.nova_senha
        }), $("Senha alterada com sucesso!"), Z(Va);
      } catch (u) {
        C(((j = (d = u == null ? void 0 : u.response) == null ? void 0 : d.data) == null ? void 0 : j.message) || "Erro ao alterar senha.");
      }
    },
    ra = d => f.filter(j => d.statuses.includes(j.status)),
    sa = f.filter(d => d.status !== "DELIVERED").length,
    vr = f.filter(d => Tc(d.due_date, d.status) === "sla-red").length,
    xr = () => A ? l.jsx("p", {
      className: "muted",
      children: "Carregando..."
    }) : m === "change-password" ? l.jsx("div", {
      className: "modal-section",
      children: l.jsxs("form", {
        className: "form-grid",
        onSubmit: d => {
          d.preventDefault(), gs();
        },
        children: [l.jsxs("label", {
          style: {
            gridColumn: "1 / -1"
          },
          children: ["Senha atual", l.jsx("input", {
            type: "password",
            value: oe.senha_atual,
            onChange: d => Z(j => ({
              ...j,
              senha_atual: d.target.value
            })),
            required: !0
          })]
        }), l.jsxs("label", {
          style: {
            gridColumn: "1 / -1"
          },
          children: ["Nova senha", l.jsx("input", {
            type: "password",
            value: oe.nova_senha,
            onChange: d => Z(j => ({
              ...j,
              nova_senha: d.target.value
            })),
            required: !0
          })]
        }), l.jsxs("label", {
          style: {
            gridColumn: "1 / -1"
          },
          children: ["Confirmar nova senha", l.jsx("input", {
            type: "password",
            value: oe.confirma_senha,
            onChange: d => Z(j => ({
              ...j,
              confirma_senha: d.target.value
            })),
            required: !0
          })]
        }), k && l.jsx("div", {
          className: "form-error",
          style: {
            gridColumn: "1 / -1"
          },
          children: k
        }), K && l.jsx("div", {
          className: "form-success",
          style: {
            gridColumn: "1 / -1"
          },
          children: K
        }), l.jsxs("div", {
          className: "modal-actions",
          style: {
            gridColumn: "1 / -1"
          },
          children: [l.jsx("button", {
            className: "btn btn-primary",
            type: "submit",
            children: "Alterar senha"
          }), l.jsx("button", {
            className: "btn btn-ghost",
            type: "button",
            onClick: Ye,
            children: "Cancelar"
          })]
        })]
      })
    }) : m === "new-sale" ? l.jsx("div", {
      className: "modal-section",
      children: l.jsxs("form", {
        className: "form-grid",
        onSubmit: d => {
          d.preventDefault(), Gl();
        },
        children: [l.jsxs("label", {
          style: {
            gridColumn: "1 / -1"
          },
          children: ["Cliente", l.jsx(rv, {
            value: he.customer_name_snapshot,
            onSelect: (d, j) => W(u => ({
              ...u,
              customer_id: d,
              customer_name_snapshot: j
            })),
            placeholder: "Buscar por nome ou CPF/CNPJ"
          })]
        }), l.jsxs("label", {
          children: ["Data da venda", l.jsx("input", {
            type: "date",
            value: he.sale_date,
            onChange: d => W(j => ({
              ...j,
              sale_date: d.target.value
            })),
            required: !0
          })]
        }), l.jsxs("label", {
          children: ["Previsao de entrega", l.jsx("input", {
            type: "date",
            value: he.due_date,
            onChange: d => W(j => ({
              ...j,
              due_date: d.target.value
            }))
          })]
        }), l.jsxs("label", {
          children: ["Valor", l.jsx("input", {
            type: "number",
            min: "0",
            step: "0.01",
            value: he.total,
            onChange: d => W(j => ({
              ...j,
              total: d.target.value
            })),
            required: !0
          })]
        }), l.jsxs("label", {
          children: ["Processo", l.jsx("select", {
            value: he.type,
            onChange: d => W(j => ({
              ...j,
              type: d.target.value,
              material_type: "",
              material_color: "",
              weight_grams: ""
            })),
            children: r.map(d => l.jsx("option", {
              value: d,
              children: d === "RESINA" ? "Resina" : "FDM"
            }, d))
          })]
        }), l.jsxs("label", {
          children: ["Tipo", l.jsxs(l.Fragment, {
            children: [l.jsx("input", {
              type: "text",
              list: `func-sale-type-${he.type}`,
              value: he.material_type || "",
              onChange: d => W(j => ({
                ...j,
                material_type: d.target.value
              }))
            }), l.jsx("datalist", {
              id: `func-sale-type-${he.type}`,
              children: mr(saleMaterials.filter(d => d.process === he.type).map(d => d.type)).map(d => l.jsx("option", {
                value: d
              }, d))
            })]
          })]
        }), l.jsxs("label", {
          children: ["Cor", l.jsxs(l.Fragment, {
            children: [l.jsx("input", {
              type: "text",
              list: `func-sale-color-${he.type}`,
              value: he.material_color || "",
              onChange: d => W(j => ({
                ...j,
                material_color: d.target.value
              }))
            }), l.jsx("datalist", {
              id: `func-sale-color-${he.type}`,
              children: mr(saleMaterials.filter(d => d.process === he.type).map(d => d.color)).map(d => l.jsx("option", {
                value: d
              }, d))
            })]
          })]
        }), l.jsxs("label", {
          children: [he.type === "FDM" ? "Peso (em gramas)" : "Peso (em ml)", l.jsx("input", {
            type: "number",
            min: "0",
            step: "0.01",
            value: he.weight_grams || "",
            onChange: d => W(j => ({
              ...j,
              weight_grams: d.target.value
            }))
          })]
        }), l.jsxs("label", {
          children: ["Status do pedido", l.jsx("select", {
            value: he.status,
            onChange: d => W(j => ({
              ...j,
              status: d.target.value
            })),
            children: Dc.map(d => l.jsx("option", {
              value: d,
              children: Tr[d] || d
            }, d))
          })]
        }), l.jsxs("label", {
          children: ["Status do pagamento", l.jsx("select", {
            value: he.payment_status,
            onChange: d => W(j => ({
              ...j,
              payment_status: d.target.value
            })),
            children: Ac.map(d => l.jsx("option", {
              value: d,
              children: Ms[d] || d
            }, d))
          })]
        }), l.jsxs("label", {
          children: ["Forma de pagamento", l.jsxs("select", {
            value: he.payment_method,
            onChange: d => W(j => ({
              ...j,
              payment_method: d.target.value
            })),
            children: [l.jsx("option", {
              value: "",
              children: "Nao informado"
            }), Oc.map(d => l.jsx("option", {
              value: d,
              children: $a[d] || d
            }, d))]
          })]
        }), l.jsxs("label", {
          style: {
            gridColumn: "1 / -1"
          },
          children: ["Observacoes", l.jsx("textarea", {
            rows: "2",
            value: he.notes,
            onChange: d => W(j => ({
              ...j,
              notes: d.target.value
            }))
          })]
        }), k && l.jsx("div", {
          className: "form-error",
          style: {
            gridColumn: "1 / -1"
          },
          children: k
        }), l.jsxs("div", {
          className: "modal-actions",
          style: {
            gridColumn: "1 / -1"
          },
          children: [l.jsx("button", {
            className: "btn btn-primary",
            type: "submit",
            children: "Salvar venda"
          }), l.jsx("button", {
            className: "btn btn-ghost",
            type: "button",
            onClick: Ye,
            children: "Cancelar"
          })]
        })]
      })
    }) : m === "customers" ? l.jsxs("div", {
      className: "modal-section",
      children: [l.jsxs("div", {
        className: "modal-top-bar",
        children: [l.jsx("input", {
          className: "search-input",
          type: "text",
          placeholder: "Buscar por nome, CPF ou CNPJ",
          value: lt,
          onChange: d => ea(d.target.value)
        }), l.jsx("button", {
          className: "btn btn-primary",
          type: "button",
          onClick: () => ue("new-customer"),
          children: "+ Novo cliente"
        })]
      }), E.length === 0 ? l.jsx("p", {
        className: "muted",
        children: "Nenhum cliente encontrado."
      }) : l.jsxs("table", {
        className: "data-table",
        children: [l.jsx("thead", {
          children: l.jsxs("tr", {
            children: [l.jsx("th", {
              children: "Nome"
            }), l.jsx("th", {
              children: "Tipo"
            }), l.jsx("th", {
              children: "Documento"
            }), l.jsx("th", {
              children: "Telefone"
            }), l.jsx("th", {
              children: "Email"
            })]
          })
        }), l.jsx("tbody", {
          children: E.map(d => l.jsxs("tr", {
            className: "row-clickable",
            onClick: () => Xe(d, "customers"),
            children: [l.jsx("td", {
              children: l.jsx("strong", {
                children: d.name
              })
            }), l.jsx("td", {
              children: l.jsx("span", {
                className: "pill",
                children: d.type
              })
            }), l.jsx("td", {
              children: d.document || "-"
            }), l.jsx("td", {
              children: d.phone
            }), l.jsx("td", {
              children: d.email || "-"
            })]
          }, d.id))
        })]
      })]
    }) : m === "customer-detail" ? l.jsxs("div", {
      className: "modal-section",
      children: [l.jsxs("div", {
        className: "detail-header",
        children: [l.jsx("p", {
          children: l.jsx("strong", {
            children: q == null ? void 0 : q.name
          })
        }), l.jsxs("p", {
          className: "muted",
          children: [(q == null ? void 0 : q.document) || "-", " | ", q == null ? void 0 : q.phone]
        }), l.jsx("p", {
          className: "muted",
          children: (q == null ? void 0 : q.email) || "-"
        })]
      }), l.jsxs("div", {
        className: "modal-actions",
        children: [l.jsx("button", {
          className: "btn btn-primary",
          type: "button",
          onClick: _t,
          children: "Editar cliente"
        }), l.jsx("button", {
          className: "btn btn-ghost",
          type: "button",
          onClick: Ve,
          children: "Voltar"
        })]
      }), l.jsx("h4", {
        children: "Pedidos do cliente"
      }), at.length === 0 ? l.jsx("p", {
        className: "muted",
        children: "Nenhum pedido para este cliente."
      }) : l.jsxs("table", {
        className: "data-table",
        children: [l.jsx("thead", {
          children: l.jsxs("tr", {
            children: [l.jsx("th", {
              children: "Data"
            }), l.jsx("th", {
              children: "Arquivo"
            }), l.jsx("th", {
              children: "Total"
            }), l.jsx("th", {
              children: "Status"
            }), l.jsx("th", {
              children: "Pagamento"
            })]
          })
        }), l.jsx("tbody", {
          children: at.map(d => {
            var j;
            return l.jsxs("tr", {
              className: "row-clickable",
              onClick: () => qt(d.id, "customer-detail"),
              children: [l.jsx("td", {
                children: Fn(d.sale_date)
              }), l.jsx("td", {
                children: d.file_name || "-"
              }), l.jsx("td", {
                children: mn(d.total)
              }), l.jsx("td", {
                children: l.jsx("span", {
                  className: "pill pill--status",
                  children: Tr[d.status] || d.status
                })
              }), l.jsx("td", {
                children: l.jsx("span", {
                  className: `pill pill--pay pill--pay-${(j = d.payment_status) == null ? void 0 : j.toLowerCase()}`,
                  children: Ms[d.payment_status] || d.payment_status
                })
              })]
            }, d.id);
          })
        })]
      })]
    }) : m === "new-customer" ? l.jsx("div", {
      className: "modal-section",
      children: l.jsxs("form", {
        className: "form-grid",
        onSubmit: d => {
          d.preventDefault(), Yl();
        },
        children: [l.jsxs("label", {
          children: ["Nome", l.jsx("input", {
            type: "text",
            value: we.name,
            onChange: d => D(j => ({
              ...j,
              name: d.target.value
            })),
            required: !0
          })]
        }), l.jsxs("label", {
          children: ["Tipo", l.jsxs("select", {
            value: we.type,
            onChange: d => D(j => ({
              ...j,
              type: d.target.value
            })),
            children: [l.jsx("option", {
              value: "PF",
              children: "Pessoa Fisica"
            }), l.jsx("option", {
              value: "PJ",
              children: "Pessoa Juridica"
            })]
          })]
        }), l.jsxs("label", {
          children: ["Telefone", l.jsx("input", {
            type: "text",
            value: we.phone,
            onChange: d => D(j => ({
              ...j,
              phone: d.target.value
            }))
          })]
        }), l.jsxs("label", {
          children: ["CPF/CNPJ", l.jsx("input", {
            type: "text",
            value: we.document,
            onChange: d => D(j => ({
              ...j,
              document: d.target.value
            }))
          })]
        }), l.jsxs("label", {
          children: ["Email", l.jsx("input", {
            type: "email",
            value: we.email,
            onChange: d => D(j => ({
              ...j,
              email: d.target.value
            }))
          })]
        }), l.jsxs("label", {
          children: ["Observacoes", l.jsx("input", {
            type: "text",
            value: we.notes,
            onChange: d => D(j => ({
              ...j,
              notes: d.target.value
            }))
          })]
        }), k && l.jsx("div", {
          className: "form-error",
          style: {
            gridColumn: "1 / -1"
          },
          children: k
        }), l.jsxs("div", {
          className: "modal-actions",
          style: {
            gridColumn: "1 / -1"
          },
          children: [l.jsx("button", {
            className: "btn btn-primary",
            type: "submit",
            children: "Salvar"
          }), l.jsx("button", {
            className: "btn btn-ghost",
            type: "button",
            onClick: () => ue("customers"),
            children: "Voltar"
          })]
        })]
      })
    }) : m === "edit-customer" ? l.jsx("div", {
      className: "modal-section",
      children: l.jsxs("form", {
        className: "form-grid",
        onSubmit: d => {
          d.preventDefault(), Xl();
        },
        children: [l.jsxs("label", {
          children: ["Nome", l.jsx("input", {
            type: "text",
            value: (ee == null ? void 0 : ee.name) || "",
            onChange: d => J(j => ({
              ...j,
              name: d.target.value
            })),
            required: !0
          })]
        }), l.jsxs("label", {
          children: ["Tipo", l.jsxs("select", {
            value: (ee == null ? void 0 : ee.type) || "PF",
            onChange: d => J(j => ({
              ...j,
              type: d.target.value
            })),
            children: [l.jsx("option", {
              value: "PF",
              children: "Pessoa Fisica"
            }), l.jsx("option", {
              value: "PJ",
              children: "Pessoa Juridica"
            })]
          })]
        }), l.jsxs("label", {
          children: ["Telefone", l.jsx("input", {
            type: "text",
            value: (ee == null ? void 0 : ee.phone) || "",
            onChange: d => J(j => ({
              ...j,
              phone: d.target.value
            }))
          })]
        }), l.jsxs("label", {
          children: ["CPF/CNPJ", l.jsx("input", {
            type: "text",
            value: (ee == null ? void 0 : ee.document) || "",
            onChange: d => J(j => ({
              ...j,
              document: d.target.value
            }))
          })]
        }), l.jsxs("label", {
          children: ["Email", l.jsx("input", {
            type: "email",
            value: (ee == null ? void 0 : ee.email) || "",
            onChange: d => J(j => ({
              ...j,
              email: d.target.value
            }))
          })]
        }), l.jsxs("label", {
          children: ["Observacoes", l.jsx("input", {
            type: "text",
            value: (ee == null ? void 0 : ee.notes) || "",
            onChange: d => J(j => ({
              ...j,
              notes: d.target.value
            }))
          })]
        }), k && l.jsx("div", {
          className: "form-error",
          style: {
            gridColumn: "1 / -1"
          },
          children: k
        }), l.jsxs("div", {
          className: "modal-actions",
          style: {
            gridColumn: "1 / -1"
          },
          children: [l.jsx("button", {
            className: "btn btn-primary",
            type: "submit",
            children: "Salvar"
          }), l.jsx("button", {
            className: "btn btn-ghost",
            type: "button",
            onClick: Ve,
            children: "Voltar"
          })]
        })]
      })
    }) : m === "inventory" ? l.jsxs("div", {
      className: "modal-section",
      children: [l.jsx("div", {
        className: "modal-actions",
        children: l.jsx("button", {
          className: "btn btn-primary",
          type: "button",
          onClick: () => ue("new-item"),
          children: "+ Estoque"
        })
      }), N.length === 0 ? l.jsx("p", {
        className: "muted",
        children: "Nenhum produto em estoque."
      }) : l.jsxs("table", {
        className: "data-table",
        children: [l.jsx("thead", {
          children: l.jsxs("tr", {
            children: [l.jsx("th", {
              children: "Produto"
            }), l.jsx("th", {
              children: "Marca"
            }), l.jsx("th", {
              children: "Tipo"
            }), l.jsx("th", {
              children: "Categoria"
            }), l.jsx("th", {
              children: "Qtd atual"
            }), l.jsx("th", {
              children: "Qtd minima"
            })]
          })
        }), l.jsx("tbody", {
          children: N.map(d => l.jsxs("tr", {
            className: "row-clickable",
            onClick: () => kt(d),
            children: [l.jsx("td", {
              children: l.jsx("strong", {
                children: d.name
              })
            }), l.jsx("td", {
              children: d.brand || "-"
            }), l.jsx("td", {
              children: l.jsx("span", {
                className: "pill",
                children: d.type === "FDM" ? "FDM" : "Resina"
              })
            }), l.jsx("td", {
              children: d.category === "RAW_MATERIAL" ? "Materia-prima" : "Consumivel"
            }), l.jsxs("td", {
              children: [Number(d.current_qty), " ", d.unit]
            }), l.jsxs("td", {
              children: [Number(d.min_qty), " ", d.unit]
            })]
          }, d.id))
        })]
      })]
    }) : m === "new-item" ? l.jsx("div", {
      className: "modal-section",
      children: l.jsxs("form", {
        className: "form-grid",
        onSubmit: d => {
          d.preventDefault(), De();
        },
        children: [l.jsxs("label", {
          children: ["Nome", l.jsx("input", {
            type: "text",
            value: M.name,
            onChange: d => F(j => ({
              ...j,
              name: d.target.value
            })),
            required: !0
          })]
        }), l.jsxs("label", {
          children: ["Marca", l.jsx("input", {
            type: "text",
            value: M.brand,
            onChange: d => F(j => ({
              ...j,
              brand: d.target.value
            }))
          })]
        }), l.jsxs("label", {
          children: ["Tipo", l.jsxs("select", {
            value: M.type,
            onChange: d => F(j => ({
              ...j,
              type: d.target.value
            })),
            children: [l.jsx("option", {
              value: "RESINA",
              children: "Resina"
            }), l.jsx("option", {
              value: "FDM",
              children: "FDM"
            })]
          })]
        }), l.jsxs("label", {
          children: ["Categoria", l.jsxs("select", {
            value: M.category,
            onChange: d => F(j => ({
              ...j,
              category: d.target.value
            })),
            children: [l.jsx("option", {
              value: "RAW_MATERIAL",
              children: "Materia-prima"
            }), l.jsx("option", {
              value: "CONSUMABLE",
              children: "Consumivel"
            })]
          })]
        }), l.jsxs("label", {
          children: ["Medida", l.jsx("select", {
            value: M.unit,
            onChange: d => F(j => ({
              ...j,
              unit: d.target.value
            })),
            children: Lc.map(d => l.jsx("option", {
              value: d,
              children: d
            }, d))
          })]
        }), l.jsxs("label", {
          children: ["Qtd atual", l.jsx("input", {
            type: "number",
            min: "0",
            step: "0.001",
            value: M.current_qty,
            onChange: d => F(j => ({
              ...j,
              current_qty: d.target.value
            })),
            required: !0
          })]
        }), l.jsxs("label", {
          children: ["Qtd minima", l.jsx("input", {
            type: "number",
            min: "0",
            step: "0.001",
            value: M.min_qty,
            onChange: d => F(j => ({
              ...j,
              min_qty: d.target.value
            })),
            required: !0
          })]
        }), k && l.jsx("div", {
          className: "form-error",
          style: {
            gridColumn: "1 / -1"
          },
          children: k
        }), l.jsxs("div", {
          className: "modal-actions",
          style: {
            gridColumn: "1 / -1"
          },
          children: [l.jsx("button", {
            className: "btn btn-primary",
            type: "submit",
            children: "Salvar produto"
          }), l.jsx("button", {
            className: "btn btn-ghost",
            type: "button",
            onClick: () => ue("inventory"),
            children: "Voltar"
          })]
        })]
      })
    }) : m === "edit-item" ? l.jsx("div", {
      className: "modal-section",
      children: l.jsxs("form", {
        className: "form-grid",
        onSubmit: d => {
          d.preventDefault(), Zl();
        },
        children: [l.jsxs("label", {
          children: ["Nome", l.jsx("input", {
            type: "text",
            value: (b == null ? void 0 : b.name) || "",
            onChange: d => U(j => ({
              ...j,
              name: d.target.value
            })),
            required: !0
          })]
        }), l.jsxs("label", {
          children: ["Marca", l.jsx("input", {
            type: "text",
            value: (b == null ? void 0 : b.brand) || "",
            onChange: d => U(j => ({
              ...j,
              brand: d.target.value
            }))
          })]
        }), l.jsxs("label", {
          children: ["Tipo", l.jsxs("select", {
            value: (b == null ? void 0 : b.type) || "RESINA",
            onChange: d => U(j => ({
              ...j,
              type: d.target.value
            })),
            children: [l.jsx("option", {
              value: "RESINA",
              children: "Resina"
            }), l.jsx("option", {
              value: "FDM",
              children: "FDM"
            })]
          })]
        }), l.jsxs("label", {
          children: ["Categoria", l.jsxs("select", {
            value: (b == null ? void 0 : b.category) || "RAW_MATERIAL",
            onChange: d => U(j => ({
              ...j,
              category: d.target.value
            })),
            children: [l.jsx("option", {
              value: "RAW_MATERIAL",
              children: "Materia-prima"
            }), l.jsx("option", {
              value: "CONSUMABLE",
              children: "Consumivel"
            })]
          })]
        }), l.jsxs("label", {
          children: ["Medida", l.jsx("select", {
            value: (b == null ? void 0 : b.unit) || "Unidade",
            onChange: d => U(j => ({
              ...j,
              unit: d.target.value
            })),
            children: Lc.map(d => l.jsx("option", {
              value: d,
              children: d
            }, d))
          })]
        }), l.jsxs("label", {
          children: ["Qtd atual", l.jsx("input", {
            type: "number",
            min: "0",
            step: "0.001",
            value: (b == null ? void 0 : b.current_qty) || "",
            onChange: d => U(j => ({
              ...j,
              current_qty: d.target.value
            })),
            required: !0
          })]
        }), l.jsxs("label", {
          children: ["Qtd minima", l.jsx("input", {
            type: "number",
            min: "0",
            step: "0.001",
            value: (b == null ? void 0 : b.min_qty) || "",
            onChange: d => U(j => ({
              ...j,
              min_qty: d.target.value
            })),
            required: !0
          })]
        }), k && l.jsx("div", {
          className: "form-error",
          style: {
            gridColumn: "1 / -1"
          },
          children: k
        }), l.jsxs("div", {
          className: "modal-actions",
          style: {
            gridColumn: "1 / -1"
          },
          children: [l.jsx("button", {
            className: "btn btn-primary",
            type: "submit",
            children: "Atualizar quantidade"
          }), l.jsx("button", {
            className: "btn btn-ghost",
            type: "button",
            onClick: Ve,
            children: "Voltar"
          })]
        })]
      })
    }) : m === "all-sales" ? l.jsx("div", {
      className: "modal-section",
      children: x.length === 0 ? l.jsx("p", {
        className: "muted",
        children: "Nenhum pedido encontrado."
      }) : l.jsxs("table", {
        className: "data-table",
        children: [l.jsx("thead", {
          children: l.jsxs("tr", {
            children: [l.jsx("th", {
              children: "Data"
            }), l.jsx("th", {
              children: "Cliente"
            }), l.jsx("th", {
              children: "Tipo"
            }), l.jsx("th", {
              children: "Total"
            }), l.jsx("th", {
              children: "Entrega"
            }), l.jsx("th", {
              children: "Status"
            }), l.jsx("th", {
              children: "Pagamento"
            })]
          })
        }), l.jsx("tbody", {
          children: x.map(d => {
            var j;
            return l.jsxs("tr", {
              className: "row-clickable",
              onClick: () => qt(d.id, "all-sales"),
              children: [l.jsx("td", {
                children: Fn(d.sale_date)
              }), l.jsx("td", {
                children: l.jsx("strong", {
                  children: d.customer_name_snapshot
                })
              }), l.jsx("td", {
                children: l.jsx("span", {
                  className: "pill",
                  children: d.type === "FDM" ? "FDM" : "Resina"
                })
              }), l.jsx("td", {
                children: mn(d.total)
              }), l.jsx("td", {
                children: Fn(d.due_date)
              }), l.jsx("td", {
                children: l.jsx("span", {
                  className: "pill pill--status",
                  children: Tr[d.status] || d.status
                })
              }), l.jsx("td", {
                children: l.jsx("span", {
                  className: `pill pill--pay pill--pay-${(j = d.payment_status) == null ? void 0 : j.toLowerCase()}`,
                  children: Ms[d.payment_status] || d.payment_status
                })
              })]
            }, d.id);
          })
        })]
      })
    }) : m === "edit-sale" ? l.jsx("div", {
      className: "modal-section",
      children: l.jsxs("form", {
        className: "form-grid",
        onSubmit: d => {
          d.preventDefault(), na();
        },
        children: [l.jsxs("label", {
          style: {
            gridColumn: "1 / -1"
          },
          children: ["Cliente", l.jsx(rv, {
            value: (G == null ? void 0 : G.customer_name_snapshot) || "",
            onSelect: (d, j) => X(u => ({
              ...u,
              customer_id: d,
              customer_name_snapshot: j
            })),
            placeholder: "Buscar por nome ou CPF/CNPJ",
            onChange: d => X(j => ({
              ...j,
              customer_name_snapshot: d.target.value
            })),
            required: !0
          })]
        }), l.jsxs("label", {
          children: ["Data da venda", l.jsx("input", {
            type: "date",
            value: (G == null ? void 0 : G.sale_date) || "",
            onChange: d => X(j => ({
              ...j,
              sale_date: d.target.value
            })),
            required: !0
          })]
        }), l.jsxs("label", {
          children: ["Previsao de entrega", l.jsx("input", {
            type: "date",
            value: (G == null ? void 0 : G.due_date) || "",
            onChange: d => X(j => ({
              ...j,
              due_date: d.target.value
            }))
          })]
        }), l.jsxs("label", {
          children: ["Valor", l.jsx("input", {
            type: "number",
            min: "0",
            step: "0.01",
            value: (G == null ? void 0 : G.total) || "",
            onChange: d => X(j => ({
              ...j,
              total: d.target.value
            })),
            required: !0
          })]
        }), l.jsxs("label", {
          children: ["Processo", l.jsx("select", {
            value: (G == null ? void 0 : G.type) || s,
            onChange: d => X(j => ({
              ...j,
              type: d.target.value,
              material_type: "",
              material_color: "",
              weight_grams: ""
            })),
            children: r.map(d => l.jsx("option", {
              value: d,
              children: d === "RESINA" ? "Resina" : "FDM"
            }, d))
          })]
        }), l.jsxs("label", {
          children: ["Tipo", l.jsxs(l.Fragment, {
            children: [l.jsx("input", {
              type: "text",
              list: `func-edit-sale-type-${(G == null ? void 0 : G.type) || s}`,
              value: (G == null ? void 0 : G.material_type) || "",
              onChange: d => X(j => ({
                ...j,
                material_type: d.target.value
              }))
            }), l.jsx("datalist", {
              id: `func-edit-sale-type-${(G == null ? void 0 : G.type) || s}`,
              children: mr(saleMaterials.filter(d => d.process === ((G == null ? void 0 : G.type) || s)).map(d => d.type)).map(d => l.jsx("option", {
                value: d
              }, d))
            })]
          })]
        }), l.jsxs("label", {
          children: ["Cor", l.jsxs(l.Fragment, {
            children: [l.jsx("input", {
              type: "text",
              list: `func-edit-sale-color-${(G == null ? void 0 : G.type) || s}`,
              value: (G == null ? void 0 : G.material_color) || "",
              onChange: d => X(j => ({
                ...j,
                material_color: d.target.value
              }))
            }), l.jsx("datalist", {
              id: `func-edit-sale-color-${(G == null ? void 0 : G.type) || s}`,
              children: mr(saleMaterials.filter(d => d.process === ((G == null ? void 0 : G.type) || s)).map(d => d.color)).map(d => l.jsx("option", {
                value: d
              }, d))
            })]
          })]
        }), l.jsxs("label", {
          children: [((G == null ? void 0 : G.type) || s) === "FDM" ? "Peso (em gramas)" : "Volume (em ml)", l.jsx("input", {
            type: "number",
            min: "0",
            step: "0.01",
            value: (G == null ? void 0 : G.weight_grams) || "",
            onChange: d => X(j => ({
              ...j,
              weight_grams: d.target.value
            }))
          })]
        }), l.jsxs("label", {
          children: ["Status do pedido", l.jsx("select", {
            value: (G == null ? void 0 : G.status) || "BUDGET",
            onChange: d => X(j => ({
              ...j,
              status: d.target.value
            })),
            children: Dc.map(d => l.jsx("option", {
              value: d,
              children: Tr[d] || d
            }, d))
          })]
        }), l.jsxs("label", {
          children: ["Status do pagamento", l.jsx("select", {
            value: (G == null ? void 0 : G.payment_status) || "PENDING",
            onChange: d => X(j => ({
              ...j,
              payment_status: d.target.value
            })),
            children: Ac.map(d => l.jsx("option", {
              value: d,
              children: Ms[d] || d
            }, d))
          })]
        }), l.jsxs("label", {
          children: ["Forma de pagamento", l.jsxs("select", {
            value: (G == null ? void 0 : G.payment_method) || "",
            onChange: d => X(j => ({
              ...j,
              payment_method: d.target.value
            })),
            children: [l.jsx("option", {
              value: "",
              children: "Nao informado"
            }), Oc.map(d => l.jsx("option", {
              value: d,
              children: $a[d] || d
            }, d))]
          })]
        }), l.jsxs("label", {
          style: {
            gridColumn: "1 / -1"
          },
          children: ["Observacoes", l.jsx("textarea", {
            rows: 3,
            value: (G == null ? void 0 : G.notes) || "",
            onChange: d => X(j => ({
              ...j,
              notes: d.target.value
            }))
          })]
        }), k && l.jsx("div", {
          className: "form-error",
          style: {
            gridColumn: "1 / -1"
          },
          children: k
        }), l.jsxs("div", {
          className: "modal-actions",
          style: {
            gridColumn: "1 / -1"
          },
          children: [l.jsx("button", {
            className: "btn btn-primary",
            type: "submit",
            children: "Salvar pedido"
          }), l.jsx("button", {
            className: "btn btn-ghost",
            type: "button",
            onClick: Ve,
            children: "Voltar"
          })]
        })]
      })
    }) : m === "sale-detail" ? l.jsx("div", {
      className: "modal-section",
      children: z ? l.jsxs(l.Fragment, {
        children: [l.jsxs("div", {
          className: "detail-header",
          children: [l.jsx("p", {
            children: l.jsxs("strong", {
              children: ["Pedido de ", z.customer_name_snapshot]
            })
          }), l.jsxs("p", {
            className: "muted",
            children: ["Venda: ", Fn(z.sale_date), " | Entrega: ", Fn(z.due_date)]
          }), l.jsxs("p", {
            className: "muted",
            children: ["Total: ", mn(z.total)]
          }), l.jsxs("p", {
            className: "muted",
            children: ["Tipo: ", z.type === "FDM" ? "FDM" : "Resina"]
          }), l.jsxs("p", {
            className: "muted",
            children: ["Cor: ", z.material_color || "-"]
          }), l.jsxs("p", {
            className: "muted",
            children: [z.type === "FDM" ? "Peso (g): " : "Volume (ml): ", z.weight_grams != null ? z.weight_grams : "-"]
          }), l.jsxs("p", {
            className: "muted",
            children: ["Observacoes: ", z.notes || "-"]
          }), l.jsx("div", {
            className: "modal-actions",
            style: {
              marginTop: "10px"
            },
            children: l.jsx("button", {
              className: "btn btn-primary",
              type: "button",
              onClick: Ln,
              children: "Alterar pedido"
            })
          })]
        }), l.jsxs("form", {
          className: "form-grid",
          onSubmit: d => {
            d.preventDefault(), ta();
          },
          children: [l.jsxs("label", {
            children: ["Status do pedido", l.jsx("select", {
              value: Fe.status,
              onChange: d => fn(j => ({
                ...j,
                status: d.target.value
              })),
              children: Dc.map(d => l.jsx("option", {
                value: d,
                children: Tr[d] || d
              }, d))
            })]
          }), l.jsxs("label", {
            children: ["Status do pagamento", l.jsx("select", {
              value: Fe.payment_status,
              onChange: d => fn(j => ({
                ...j,
                payment_status: d.target.value
              })),
              children: Ac.map(d => l.jsx("option", {
                value: d,
                children: Ms[d] || d
              }, d))
            })]
          }), l.jsxs("label", {
            children: ["Forma de pagamento", l.jsxs("select", {
              value: Fe.payment_method,
              onChange: d => fn(j => ({
                ...j,
                payment_method: d.target.value
              })),
              children: [l.jsx("option", {
                value: "",
                children: "Nao informado"
              }), Oc.map(d => l.jsx("option", {
                value: d,
                children: $a[d] || d
              }, d))]
            })]
          }), k && l.jsx("div", {
            className: "form-error",
            style: {
              gridColumn: "1 / -1"
            },
            children: k
          }), l.jsxs("div", {
            className: "modal-actions",
            style: {
              gridColumn: "1 / -1"
            },
            children: [l.jsx("button", {
              className: "btn btn-primary",
              type: "submit",
              children: "Salvar alteracoes"
            }), l.jsx("button", {
              className: "btn btn-ghost",
              type: "button",
              onClick: Ve,
              children: "Voltar"
            })]
          })]
        }), l.jsx("div", {
          className: "modal-actions",
          style: {
            marginTop: "8px"
          },
          children: l.jsx("button", {
            className: "btn btn-ghost",
            type: "button",
            onClick: () => {
              C(""), _e(""), setShowDeleteConfirm(true);
            },
            children: "Excluir pedido"
          })
        }), l.jsxs("div", {
          className: "detail-header",
          children: [l.jsx("p", {
            children: l.jsx("strong", {
              children: "Historico de status"
            })
          }), Array.isArray(z.status_history) && z.status_history.length > 0 ? z.status_history.map((d, j) => l.jsxs("p", {
            className: "muted",
            children: d.kind === "PAYMENT" ? ["Pagamento alterado para ", Ms[d.payment_status] || d.payment_status, " por ", d.username, " em ", Is(d.created_at)] : ["Alterado para ", Tr[d.status] || d.status, " por ", d.username, " em ", Is(d.created_at)]
          }, `${d.created_at}-status-${j}`)) : l.jsx("p", {
            className: "muted",
            children: "Sem historico registrado."
          })]
        })]
      }) : l.jsx("p", {
        className: "muted",
        children: "Pedido nao encontrado."
      })
    }) : null,
    la = {
      "change-password": "Alterar Senha",
      "new-sale": "+ Vendas",
      customers: "Clientes",
      "new-customer": "Novo cliente",
      "edit-customer": "Editar cliente",
      "customer-detail": "Detalhes do cliente",
      inventory: "Estoque",
      "new-item": "Cadastrar em estoque",
      "edit-item": "Atualizar estoque",
      "all-sales": "Todos os pedidos",
      "edit-sale": "Alterar pedido",
      "sale-detail": "Detalhes do pedido"
    },
    aa = {
      RESINA: "Resina",
      FDM: "FDM"
    },
    oa = s === "RESINA" ? "var(--raft-green)" : s === "FDM" ? "var(--raft-magenta)" : "var(--text-muted)";
  const processTheme = isDrawingSection ? 'DRAWING' : s;
  if (pg === 'sales') return T.createElement(SalesPage, { onBack: () => setPg(null), defaultType: s, processType: processTheme, availableTypes: r.length ? r : ['RESINA', 'FDM'] });
  if (pg === 'customers') return T.createElement(CustomersPage, { onBack: () => setPg(null), processType: processTheme });
  if (pg === 'inventory') return T.createElement(InventoryPage, { onBack: () => setPg(null), defaultType: s, processType: processTheme, availableTypes: r.length ? r : ['RESINA', 'FDM'], onOpenMaterials: () => setPg('materials') });
  if (pg === 'materials') return T.createElement(MaterialsPage, { onBack: () => setPg('inventory'), defaultType: s, processType: processTheme, availableTypes: r.length ? r : ['RESINA', 'FDM'] });
  return l.jsxs("div", {
    className: `funcionario-dashboard process-theme ${isDrawingSection ? "process-theme--drawing" : s === "FDM" ? "process-theme--fdm" : "process-theme--resina"}`,
    children: [l.jsxs("header", {
      className: "func-header",
      children: [l.jsxs("div", {
        className: "func-header-info",
        children: [l.jsxs("p", {
          className: "eyebrow",
          children: ["RAFT 3D - ", t || "usuario"]
        }), l.jsxs("h1", {
          children: [isDrawingSection ? "Desenho" : "Producao", !isDrawingSection && l.jsxs("span", {
            style: {
              fontSize: "15px",
              fontWeight: 700,
              color: oa,
              fontFamily: "var(--font-ui)",
              verticalAlign: "middle",
              marginLeft: "8px"
            },
            children: ["— ", s === "RESINA" ? "Resina" : s === "FDM" ? "FDM" : "-"]
          })]
        }), l.jsxs("div", {
          className: "func-header-stats",
          children: [l.jsxs("span", {
            className: "func-stat",
            children: [l.jsx("strong", {
              children: sa
            }), " pedidos ativos"]
          }), vr > 0 && l.jsxs("span", {
            className: "func-stat func-stat--urgent",
            children: [l.jsx("span", {
              className: "sla-dot sla-dot--red"
            }), " ", vr, " urgente", vr > 1 ? "s" : ""]
          }), hasVerResumo && monthlySummary && l.jsxs("span", {
            className: "func-stat",
            children: ["Pedido no mes: ", l.jsx("strong", { children: mn(monthlySummary.active_sales_month) })]
          }), hasVerResumo && monthlySummary && l.jsxs("span", {
            className: "func-stat",
            children: ["Recebido no mes: ", l.jsx("strong", { children: mn(monthlySummary.paid_sales_month) })]
          }), hasVerResumo && l.jsx("button", {
            type: "button",
            className: "btn btn-ghost",
            style: { fontSize: "12px", padding: "2px 8px" },
            onClick: openHistory,
            children: "+ Ver meses anteriores"
          })]
        })]
      }), l.jsxs("div", {
        className: "func-header-actions",
        children: [l.jsx("button", {
          className: "btn btn-outline",
          type: "button",
          onClick: () => {
            if (isDrawingSection) {
              setDrawingCreateSignal(d => d + 1);
              return;
            }
            ue("new-sale");
          },
          children: isDrawingSection ? "+ Orçamento" : "+ Vendas"
        }), l.jsx("button", {
          className: "btn btn-outline",
          type: "button",
          onClick: () => setPg("customers"),
          children: "Clientes"
        }), l.jsx("button", {
          className: "btn btn-outline",
          type: "button",
          onClick: () => setPg("inventory"),
          children: "Estoque"
        }), l.jsx("button", {
          className: "btn btn-outline",
          type: "button",
          onClick: () => setPg("sales"),
          children: "Todos os pedidos"
        }), canOpenDrawings && l.jsx("button", {
          className: "btn btn-outline",
          type: "button",
          onClick: () => {
            setPg(null);
            setActiveSection('drawing');
          },
          children: "Desenho"
        }), l.jsxs("div", {
          className: "user-menu",
          ref: c,
          children: [l.jsx("button", {
            className: "btn btn-ghost user-menu-trigger",
            type: "button",
            onClick: () => i(d => !d),
            children: "⚙"
          }), o && l.jsxs("div", {
            className: "user-menu-dropdown",
            children: [l.jsx("button", {
              className: "user-menu-item",
              type: "button",
              onClick: () => {
                i(!1), ue("change-password");
              },
              children: "Alterar Senha"
            }), l.jsx("button", {
              className: "user-menu-item user-menu-item--danger",
              type: "button",
              onClick: n,
              children: "Sair"
            })]
          })]
        })]
      })]
    }), l.jsxs("div", {
      className: "func-layout",
      children: [l.jsx(FuncionarioTypeSidebar, {
        availableTypes: r,
        activeType: s,
        onSelectType: a,
        typeLabel: aa,
        showDrawing: canOpenDrawings,
        activeSection,
        onSelectSection: d => {
          setActiveSection(d === 'drawing' ? 'drawing' : 'production');
          setPg(null);
        }
      }), l.jsx("div", {
        className: "func-content",
        children: isDrawingSection ? l.jsx(DrawingsPage, {
          embedded: true,
          permissions: e,
          createSignal: drawingCreateSignal
        }) : l.jsx("div", {
          className: "kanban-board",
          children: tv.map(d => {
            const j = ra(d);
            return l.jsxs("div", {
              className: `kanban-column${Me === d.key ? " kanban-column--over" : ""}`,
              onDragOver: u => Ql(u, d.key),
              onDragLeave: () => Ce(null),
              onDrop: u => Kl(u, d.key),
              children: [l.jsxs("div", {
                className: "kanban-column-header",
                children: [l.jsx("h3", {
                  children: d.label
                }), l.jsx("span", {
                  className: "kanban-count",
                  children: j.length
                })]
              }), l.jsxs("div", {
                className: "kanban-cards",
                children: [j.length === 0 && l.jsx("p", {
                  className: "kanban-empty muted",
                  children: "Nenhum pedido"
                }), j.map(u => {
                  const g = Tc(u.due_date, u.status);
                  return l.jsxs("div", {
                    className: `kanban-card kanban-card--${g}${V === u.id ? " kanban-card--dragging" : ""}`,
                    draggable: !0,
                    onDragStart: L => Wl(L, u.id),
                    children: [l.jsxs("div", {
                      className: "kanban-card-top",
                      children: [l.jsx("span", {
                        className: "kanban-card-client",
                        children: u.customer_name_snapshot
                      }), l.jsx("span", {
                        className: `sla-badge sla-badge--${g}`,
                        children: ev[g]
                      })]
                    }), u.payment_status === "PAID" && l.jsx("span", {
                      className: "pill pill--pay pill--pay-paid",
                      style: {
                        width: "fit-content"
                      },
                      children: "Pago"
                    }), u.file_name && l.jsx("div", {
                      className: "kanban-card-file",
                      children: u.file_name
                    }), l.jsxs("div", {
                      className: "kanban-card-meta",
                      children: [l.jsx("span", {
                        className: "kanban-card-value",
                        children: mn(u.total)
                      }), l.jsxs("span", {
                        className: "kanban-card-date",
                        children: ["Entrega: ", Fn(u.due_date)]
                      })]
                    }), l.jsx("div", {
                      className: "kanban-card-footer",
                      children: l.jsx("button", {
                        className: "btn btn-ghost btn-card-detail",
                        type: "button",
                        onClick: () => qt(u.id),
                        children: "Ver detalhes"
                      })
                    })]
                  }, u.id);
                })]
              })]
            }, d.key);
          })
        })
      })]
    }), showHistory && l.jsx(Yf, {
      title: "Historico mensal",
      onClose: () => setShowHistory(false),
      children: l.jsx("div", {
        className: "modal-section",
        children: historyLoading ? l.jsx("p", { className: "muted", children: "Carregando..." }) :
          monthlyHistory.length === 0 ? l.jsx("p", { className: "muted", children: "Nenhum dado encontrado." }) :
          l.jsx("table", {
            className: "data-table",
            children: l.jsxs(T.Fragment, {
              children: [
                l.jsx("thead", {
                  children: l.jsxs("tr", {
                    children: [
                      l.jsx("th", { children: "Mes" }),
                      l.jsx("th", { children: "Pedido no mes" }),
                      l.jsx("th", { children: "Recebido no mes" }),
                    ]
                  })
                }),
                l.jsx("tbody", {
                  children: monthlyHistory.map(row => l.jsxs("tr", {
                    children: [
                      l.jsx("td", { children: row.month }),
                      l.jsx("td", { children: mn(row.active_sales) }),
                      l.jsx("td", { children: mn(row.paid_sales) }),
                    ]
                  }, row.month))
                })
              ]
            })
          })
      })
    }), m && l.jsx(Yf, {
      title: la[m] || "",
      onClose: Ye,
      children: xr()
    }), showDeleteConfirm && l.jsx(Yf, {
      title: "Excluir pedido",
      onClose: () => {
        setShowDeleteConfirm(false), _e("");
      },
      children: l.jsx("form", {
        className: "modal-section",
        onSubmit: Jl,
        children: l.jsxs(T.Fragment, {
          children: [l.jsx("p", {
          className: "muted",
          children: "Tem certeza?"
        }), l.jsxs("div", {
          className: "form-grid",
          children: [l.jsxs("label", {
            style: {
              gridColumn: "1 / -1"
            },
            children: ["Digite sua senha", l.jsx("input", {
              type: "password",
              value: On,
              onChange: d => _e(d.target.value),
              placeholder: "Sua senha"
            })]
          }), k && l.jsx("div", {
            className: "form-error",
            style: {
              gridColumn: "1 / -1"
            },
            children: k
          })]
        }), l.jsxs("div", {
          className: "modal-actions",
          children: [l.jsx("button", {
            className: "btn btn-primary",
            type: "submit",
            disabled: !On.trim(),
            children: "Sim"
          }), l.jsx("button", {
            className: "btn btn-ghost",
            type: "button",
            onClick: () => {
              setShowDeleteConfirm(false), _e("");
            },
            children: "Cancelar"
          })]
        })]
        })
      })
    })]
  });
}

function mr(values) {
  return Array.from(new Set((values || []).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
}

export default sv;
